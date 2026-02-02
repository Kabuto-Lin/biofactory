using Microsoft.IdentityModel.Tokens;
using System.Security.Claims;
using System.Text;
using System.Security.Cryptography;
using KSIKernel_Core.Database;
using System.Collections;
using KSIKernel_Core;
using System.IdentityModel.Tokens.Jwt;
using Sinon_Factory.App_Libs;
using Sinon_Factory.Models.Jwt;
using Sinon_Factory.Models;

namespace Sinon_Factory.Services
{
    public class AuthService
    {
        public AuthenticateResponseModel Login(AuthenticateRequestModel model)
        {
            MyLogger myUserlogger = new MyLogger(LoggerType.USER, "AuthService");
            myUserlogger.userId = model.PNO;
            AuthenticateResponseModel Result = new AuthenticateResponseModel();
            string l_Msg = "";
            UserInfo l_user = new UserInfo(model.PNO, model.PWD, ref l_Msg);

            //通過
            if (string.IsNullOrEmpty(l_Msg))
            {
                myUserlogger.WriteLog(LogType.Info, "[Login Success]");
                DBController dbc = new DBController();
                Hashtable ht = new Hashtable();

                // ================== [新增開始] 查詢中文姓名 ==================
                // 1. 準備參數 (避免 SQL Injection)
                ht.Add("@LOGIN_PNO", new StructureSQLParameter(model.PNO, System.Data.SqlDbType.NVarChar));

                // 2. 執行查詢 (從 SYSPASMI 取得 pass_na)
                // 使用 General.nvl 避免查無資料時報錯
                string strName = General.nvl(dbc.DbExecuteScalar_Str("SELECT pass_na FROM SYSPASMI WHERE pass_no = @LOGIN_PNO", ht), "").ToString();

                // 3. 重要：清空 Hashtable，因為下面 Update 還要重複使用 ht
                ht.Clear();
                // ================== [新增結束] ==================


                string accessToken = GenerateAccessToken(l_user.CLAIMS);
                string refreshToken = GenerateRefreshToken();
                Result.accessToken = accessToken;
                Result.refreshToken = refreshToken;
                Result.userId = model.PNO;
                Result.userName = strName; // [新增] 將查到的姓名塞入回傳物件
                //西元民國測試用
                if (model.PNO == "tw")
                {
                    Result.dateType = "tw";
                }
                else if (model.PNO == "ad")
                {
                    Result.dateType = "ad";
                }
                else
                {
                    Result.dateType = General.nvl(dbc.DbExecuteScalar_Str("SELECT TOP(1) PARA_CHR1 FROM SYSCOMMI WHERE COMM_NO = 'DATE_TYPE'", ht), "ad").ToString();
                }
                var principal = GetPrincipalFromExpiredToken(accessToken);
                var exp = long.Parse(principal.Claims.FirstOrDefault(c => c.Type == JwtRegisteredClaimNames.Exp).Value);
                // 將 Unix 時間戳轉為 UTC 時間
                var utcExpireDate = DateTimeOffset.FromUnixTimeSeconds(exp).UtcDateTime;
                // 將 UTC 時間轉為台灣時間
                var taiwanTimeZone = TimeZoneInfo.FindSystemTimeZoneById("Taipei Standard Time");
                var taiwanExpireDate = TimeZoneInfo.ConvertTimeFromUtc(utcExpireDate, taiwanTimeZone);
                
                string upd_str = "UPDATE SYSPASMI SET REFRESH_TOKEN = @REFRESH_TOKEN, REFRESH_TOKEN_EXPIRYTIME = @REFRESH_TOKEN_EXPIRYTIME WHERE PASS_NO = @PASS_NO";
                ht.Add("@REFRESH_TOKEN", new StructureSQLParameter(refreshToken, System.Data.SqlDbType.VarChar));
                ht.Add("@REFRESH_TOKEN_EXPIRYTIME", new StructureSQLParameter(DateTime.Now.AddMinutes(120), System.Data.SqlDbType.DateTime));
                ht.Add("@PASS_NO", new StructureSQLParameter(model.PNO, System.Data.SqlDbType.NVarChar));
                dbc.DbExecuteNonQuery(upd_str, ht);

                return Result;
            }
            else
            {
                myUserlogger.WriteLog(LogType.Info, "[Login Error] " + l_Msg);
                return null;
            }
        }

        public string GenerateAccessToken(IEnumerable<Claim> claims)
        {
            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(ShareModel.GetAppsettingValue("JWTSettings", "Key")));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);
            int timeout = Convert.ToInt32(General.nvl(ShareModel.GetAppsettingValue("JWTSettings", "ExpiryMinutes"), 10));
            //var token = new JwtSecurityToken(
            //    ShareModel.GetAppsettingValue("JWTSettings", "Issuer"),
            //    ShareModel.GetAppsettingValue("JWTSettings", "Audience"),
            //    claims,
            //    expires: DateTime.Now.AddMinutes(timeout),
            //    signingCredentials: credentials);

            //var accessToken = new JwtSecurityTokenHandler().WriteToken(token);
            //return accessToken;

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.UtcNow.AddMinutes(timeout),
                NotBefore = DateTime.UtcNow,
                IssuedAt = DateTime.UtcNow,
                Issuer = ShareModel.GetAppsettingValue("JWTSettings", "Issuer"),
                Audience = ShareModel.GetAppsettingValue("JWTSettings", "Audience"),
                SigningCredentials = credentials
            };

            var tokenHandler = new JwtSecurityTokenHandler();
            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }

        public string GenerateRefreshToken()
        {
            var randomNumber = new byte[32];
            using (var rng = RandomNumberGenerator.Create())
            {
                rng.GetBytes(randomNumber);
                return Convert.ToBase64String(randomNumber);
            }
        }

        /// <summary>
        /// 從過期的token中取得用戶主體
        /// </summary>
        /// <param name="token"></param>
        /// <returns></returns>
        public ClaimsPrincipal GetPrincipalFromExpiredToken(string token)
        {
            string issuer = ShareModel.GetAppsettingValue("JWTSettings", "Issuer").Trim();
            string audience = ShareModel.GetAppsettingValue("JWTSettings", "Audience")?.Trim();
            byte[] secret = Encoding.UTF8.GetBytes(ShareModel.GetAppsettingValue("JWTSettings", "Key"));

            var tokenValidationParameters = new TokenValidationParameters()
            {
                ValidateAudience = !string.IsNullOrWhiteSpace(audience),
                ValidAudience = audience,
                ValidateIssuer = true,
                ValidIssuer = issuer,
                ValidateLifetime = false, // 重要：因為要處理過期的 token
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(secret),
                ClockSkew = TimeSpan.Zero,
                RequireExpirationTime = false,
                RequireSignedTokens = true
            };

            var tokenHandler = new JwtSecurityTokenHandler();
            SecurityToken securityToken;
            var principal = tokenHandler.ValidateToken(token, tokenValidationParameters, out securityToken);

            var jwtSecurityToken = securityToken as JwtSecurityToken;
            if (jwtSecurityToken == null
                || !jwtSecurityToken.Header.Alg.Equals(SecurityAlgorithms.HmacSha256, StringComparison.InvariantCultureIgnoreCase))
            {
                throw new SecurityTokenException("Invalid token");
            }

            return principal;
        }
    }
}
