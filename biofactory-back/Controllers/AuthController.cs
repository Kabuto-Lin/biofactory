using Sinon_Factory.Models.ViewModel;
using KSIKernel_Core;
using Microsoft.AspNetCore.Mvc;
using KSIKernel_Core.Database;
using System.Collections;
using System.Drawing;
using System.Drawing.Imaging;
using System.Data;
using Microsoft.AspNetCore.Authorization;
using Sinon_Factory.Services;
using Sinon_Factory.Models.Jwt;
using Sinon_Factory.App_Libs;
using Sinon_Factory.Models;

namespace Sinon_Factory.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly AuthService _service;
        //private readonly IDatabase _redisDatabase;

        public AuthController(AuthService AuthService)
        {
            _service = AuthService;
            //_redisDatabase = redis.GetDatabase();
        }

        // 登入功能
        [HttpPost]
        [Route("Login")]
        public async Task<IActionResult> Login([FromBody] AuthenticateRequestModel model)
        {
            MyLogger myUserlogger = new MyLogger(LoggerType.USER, "apiLoginController");
            myUserlogger.userId = model.PNO;
            try
            {
                //string message = "";
                string authorizationHeader = General.nvl(Request.Headers.Authorization, "").ToString();

                if (authorizationHeader.Contains("Basic"))
                {
                    if (authorizationHeader.Split(' ')[1] != ShareModel.GetAppsettingValue("JWTSettings", "AuthKey"))
                    {
                        return BadRequest(new ResultViewModel<AuthenticateResponseModel>
                        {
                            isSuccess = false,
                            message = "登入失敗",
                            Result = null,
                        });
                    }
                }
                else
                {
                    return BadRequest(new ResultViewModel<AuthenticateResponseModel>
                    {
                        isSuccess = false,
                        message = "登入失敗",
                        Result = null,
                    });
                }
                //驗證圖形驗證碼
                DBController dbc = new DBController();
                string _sql = "SELECT * FROM SYSCAPTCHA WHERE ID = @ID AND EXPIRE_DATE >= DATEADD(MINUTE, -5, GETDATE())";
                DataTable dt = dbc.FillDataTable(_sql, new Hashtable
                {
                    { "@ID", new StructureSQLParameter(Guid.Parse(model.sessionId), SqlDbType.UniqueIdentifier) }
                });

                if (dt.Rows.Count == 0)
                {
                    myUserlogger.WriteLog(LogType.Info, "[Login Error] 驗證碼失效");
                    return BadRequest(new ResultViewModel<AuthenticateResponseModel>
                    {
                        isSuccess = false,
                        message = "登入失敗",
                        Result = null,
                    });
                }

                if (dt.Rows[0]["CODE"].ToString() != model.CODE)
                {
                    myUserlogger.WriteLog(LogType.Info, "[Login Error] 驗證碼錯誤");
                    return BadRequest(new ResultViewModel<AuthenticateResponseModel>
                    {
                        isSuccess = false,
                        message = "登入失敗",
                        Result = null,
                    });
                }

                AuthenticateResponseModel Result = _service.Login(model);

                if (Result == null)
                {
                    return BadRequest(new ResultViewModel<AuthenticateResponseModel>
                    {
                        isSuccess = false,
                        message = "登入失敗",
                        Result = null,
                    });
                }

                return Ok(new ResultViewModel<AuthenticateResponseModel>
                {
                    isSuccess = true,
                    message = "登入成功",
                    Result = Result,
                });
            }
            catch (Exception ex)
            {
                myUserlogger.WriteLog(LogType.Error, "[Login Error]：" + ex.Message);
                return BadRequest(new ResultViewModel<AuthenticateResponseModel>
                {
                    isSuccess = false,
                    message = ex.Message,
                    Result = null,
                });
            }
        }

        /// <summary>
        /// Logout登出功能
        /// </summary>
        [Authorize]
        [HttpGet]
        [Route("Logout")]
        public IActionResult Logout()
        {
            MyLogger myUserlogger = new MyLogger(LoggerType.USER, "apiLoginController");
            string authorizationHeader = General.nvl(Request.Headers.Authorization, "").ToString().Replace("Bearer ", "").ToString();
            myUserlogger.userId = UserInfo.getUserInfo(authorizationHeader).PNO;

            try
            {
                myUserlogger.WriteLog(LogType.Info, "[Logout]");

                return Ok(new ResultViewModel<AuthenticateResponseModel>
                {
                    isSuccess = true,
                    message = "登出成功",
                    Result = null,
                });
            }
            catch (Exception ex)
            {
                myUserlogger.WriteLog(LogType.Error, "[Logout Error]：" + ex.Message);
                return BadRequest(new ResultViewModel<AuthenticateResponseModel>
                {
                    isSuccess = false,
                    message = "登出失敗" + ex.Message,
                    Result = null,
                });
            }
        }

        /// <summary>
        /// refresh token
        /// </summary>
        [Authorize]
        [HttpPost]
        [Route("Refresh")]
        public IActionResult Refresh([FromBody] TokenApiModel tokenApiModel)
        {
            if (tokenApiModel == null)
            {
                return BadRequest(new ResultViewModel<AuthenticateResponseModel>
                {
                    isSuccess = false,
                    message = "Invalid client request",
                    Result = null
                });
            }

            string accessToken = tokenApiModel.accessToken;
            string refreshToken = tokenApiModel.refreshToken;

            AuthService _service = new AuthService();

            var principal = _service.GetPrincipalFromExpiredToken(accessToken); //由原本的accessToken 取得user
            var username = principal.Claims.FirstOrDefault(c => c.Type == "PNO").Value;

            DBController dbc = new DBController();
            Hashtable ht = new Hashtable();
            string _sql = "SELECT * FROM SYSPASMI WHERE PASS_NO = @PASS_NO";
            ht.Add("@PASS_NO", new StructureSQLParameter(username, SqlDbType.NVarChar));
            var user = dbc.FillDataTable(_sql, ht);

            if (user.Rows.Count == 0 || user.Rows[0]["REFRESH_TOKEN"].ToString() != refreshToken || Convert.ToDateTime(General.nvl(user.Rows[0]["REFRESH_TOKEN_EXPIRYTIME"], "1911-01-01 00:00:00.000")) <= DateTime.Now)
            {
                return BadRequest(new ResultViewModel<AuthenticateResponseModel>
                {
                    isSuccess = false,
                    message = "延長失敗, RefreshToken失效",
                    Result = null
                });
            }

            // 定義需要保留的 Claim 名稱
            var propertyNames = typeof(UserInfoData).GetProperties().Select(p => p.Name);
            // 過濾並保留指定的 Claim
            var selectedClaims = principal.Claims
                .Where(c => propertyNames.Contains(c.Type));

            var newAccessToken = _service.GenerateAccessToken(principal.Claims);
            var newRefreshToken = _service.GenerateRefreshToken();

            string upd_str = "UPDATE SYSPASMI SET REFRESH_TOKEN = @REFRESH_TOKEN, REFRESH_TOKEN_EXPIRYTIME = @REFRESH_TOKEN_EXPIRYTIME WHERE PASS_NO = @PASS_NO";
            ht.Clear();
            ht.Add("@REFRESH_TOKEN", new StructureSQLParameter(newRefreshToken, SqlDbType.VarChar));
            ht.Add("@REFRESH_TOKEN_EXPIRYTIME", new StructureSQLParameter(DateTime.Now.AddMinutes(120), SqlDbType.DateTime));
            ht.Add("@PASS_NO", new StructureSQLParameter(username, SqlDbType.NVarChar));
            dbc.DbExecuteNonQuery(upd_str, ht);

            AuthenticateResponseModel Result = new AuthenticateResponseModel();
            Result.accessToken = newAccessToken;
            Result.refreshToken = newRefreshToken;
            Result.userId = username;

            return Ok(new ResultViewModel<AuthenticateResponseModel>
            {
                isSuccess = true,
                message = "延長成功",
                Result = Result,
            });
        }

        /// <summary>
        /// create captcha
        /// </summary>
        [HttpGet("GetCaptcha")]
        public async Task<IActionResult> GenerateCaptchaImage()
        {
            // 生成6位數的驗證碼
            var captcha = GenerateRandomCode(6);

            // 使用 GUID 來標識 session
            var sessionId = Guid.NewGuid();

            // 將驗證碼存入 Redis 並設置過期時間
            //await _redisDatabase.StringSetAsync(sessionId, captcha, TimeSpan.FromMinutes(5));

            // 存進DB
            DBController dbc = new DBController();
            Hashtable ht = new Hashtable();
            DateTime now = DateTime.UtcNow.AddHours(8);
            string _insSql = @"INSERT INTO SYSCAPTCHA (ID, CODE, CRT_DATE, EXPIRE_DATE) VALUES (@ID, @CODE, @CRT_DATE, @EXPIRE_DATE)";
            ht.Clear();
            ht.Add("@ID", new StructureSQLParameter(sessionId, SqlDbType.UniqueIdentifier));
            ht.Add("@CODE", new StructureSQLParameter(captcha, SqlDbType.NVarChar));
            ht.Add("@CRT_DATE", new StructureSQLParameter(now, SqlDbType.DateTime));
            ht.Add("@EXPIRE_DATE", new StructureSQLParameter(now.AddMinutes(5), SqlDbType.DateTime));
            dbc.DbExecuteNonQuery(_insSql, ht);

            // 生成圖形驗證碼
            var image = GenerateCaptchaImage(captcha);

            // 將圖像轉換為字節流並回傳
            using (var ms = new MemoryStream())
            {
                image.Save(ms, ImageFormat.Png);
                return File(ms.ToArray(), "image/png", sessionId.ToString()); // 返回圖片和sessionId
            }
        }
        // 簡單的隨機驗證碼生成器
        private string GenerateRandomCode(int length)
        {
            const string chars = "0123456789";
            var random = new Random();
            var result = new char[length];

            for (int i = 0; i < length; i++)
            {
                result[i] = chars[random.Next(chars.Length)];
            }
            return new string(result);
        }

        // 生成圖形驗證碼
        private Bitmap GenerateCaptchaImage(string captcha)
        {
            int width = 150;
            int height = 50;

            var bitmap = new Bitmap(width, height);
            var graphics = Graphics.FromImage(bitmap);

            // 設定背景顏色
            graphics.Clear(Color.White);

            // 隨機生成字體和顏色
            var fonts = new[] { "Arial", "Verdana", "Tahoma", "Georgia" };
            var rand = new Random();
            for (int i = 0; i < captcha.Length; i++)
            {
                // 隨機字體和顏色
                var font = new Font(fonts[rand.Next(fonts.Length)], 24, FontStyle.Bold);
                // 隨機生成紅色調的顏色（主要為紅色，其他通道值較低）
                int red = rand.Next(100, 256);  // 紅色值偏高
                int green = rand.Next(0, 100);  // 綠色值偏低
                int blue = rand.Next(0, 100);   // 藍色值偏低
                var brush = new SolidBrush(Color.FromArgb(red, green, blue));

                // 隨機位置和旋轉角度
                float x = i * 24 + rand.Next(5);
                float y = rand.Next(3);
                float angle = rand.Next(-15, 15);

                // 旋轉文字
                graphics.TranslateTransform(x, y);
                graphics.RotateTransform(angle);
                graphics.DrawString(captcha[i].ToString(), font, brush, 0, 0);
                graphics.ResetTransform();
            }

            // 添加干擾線條
            for (int i = 0; i < 10; i++)
            {
                var pen = new Pen(Color.FromArgb(rand.Next(256), rand.Next(256), rand.Next(256)));
                graphics.DrawLine(pen, rand.Next(width), rand.Next(height), rand.Next(width), rand.Next(height));
            }

            return bitmap;
        }
    }
}
