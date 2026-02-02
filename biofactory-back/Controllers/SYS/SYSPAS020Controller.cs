using KSIKernel_Core;
using KSIKernel_Core.CryptoHelper;
using KSIKernel_Core.Database;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using Sinon_Factory.App_Libs;
using System.Collections;
using System.Data;
using System.Text;
using System.Text.RegularExpressions;

namespace Sinon_Factory.Controllers.SYS
{
    [Route("api/[controller]")]
    [ApiController]
    public class apiSYSPAS020Controller : MasterApiController, IApiController.T
    {
        private IHttpContextAccessor _httpContextAccessor;
        public apiSYSPAS020Controller(IHttpContextAccessor httpContextAccessor) : base(httpContextAccessor)
        {
            _httpContextAccessor = httpContextAccessor;
        }

        /// <summary>
        /// ----初始化 initializing ----------------------------------------------
        /// GET: /api/api程式名稱/Init
        /// </summary>
        /// <returns>Return MasterClass</returns>
        [HttpGet("Init")]
        public IActionResult Init()
        {
            Initialing += l_Master_Initialing; //加入下拉元件
            //查詢欄位預設值
            ((SearchClass)masterClass.searchData).PASS_NO = UserInfo.getUserInfo(_httpContextAccessor.HttpContext.Request.Headers.Authorization).PNO;
            ((SearchClass)masterClass.searchData).PASS_NA = UserInfo.getUserInfo(_httpContextAccessor.HttpContext.Request.Headers.Authorization).PNA;
            //((SearchClass)this.masterClass.searchData).PASS_WD = UserInfo.getUserInfo(_httpContextAccessor.HttpContext.Request.Headers.Authorization).PASS_WD;
            return doInitResult();
        }

        void l_Master_Initialing(object sender, EventArgs e)
        {
            MasterClass l_Master = (MasterClass)sender;
            //加入來自MKFCOMMI COMM_NO='SYS_ID'的下拉，命名為COMSYS_ID
            //l_Master.addOpDataWithCom("COMSYS_ID", "SYS_ID");
            //加入來自SQL的下拉，命名為BUYER
            //l_Master.addOpData("BUYER", "Select BUY_NO as [KEY], BUY_NA as [DESC] from MKFBUYMI M order by M.BUY_NO ");//命名為COMSYS_ID
        }
        /// <summary>
        /// ----批次處理BatchOK ----------------------------------------------
        /// Post: /api/api程式名稱/BatchOK
        /// </summary>
        /// <returns>return</returns>
        [HttpGet]
        [Route("BatchOK")]
        public IActionResult BatchOK(SearchClass a_Search)
        {
            bool l_Succ = false; string l_Msg = "";
            //參數取值
            SearchClass l_Search = a_Search;
            Dictionary<string, object> l_dic = new Dictionary<string, object>();
            l_Succ = true;
            l_Msg = "密碼已修改！";
            return doBatchOKResult(l_Succ, l_Msg, l_dic);
        }


        public override MasterClass getMaster(IHttpContextAccessor httpContextAccessor)
        {
            //SQL必須加入1=1條件
            StringBuilder l_SQL = new StringBuilder();
            l_SQL.Append("select m.* ");
            l_SQL.Append("from SYSPASMI m  ");
            l_SQL.Append(" where 1=1 ");
            l_SQL.Append("   and 1=2 "); //T及R類型的程式請傳回無資料
            l_SQL.Append("order by m.pass_no ");
            //回傳Master Object 
            return new MasterClass()
            {
                tableName = "SYSPASMI",
                isNoDataFirstLoad = true, //程式第一次載入時是否有資料
                sQL = l_SQL.ToString().ToUpper(),
                keyField = new string[1] { "pas_no" },
                notNullField = null,//不可空白欄位
                noEditButInsertField = null,//不可編輯,但可新增欄位
                noEditField = null, //不可編輯欄位 
                noCopyField = null,//不複製欄位
                searchData = new SearchClass() { },//查詢條件預設值
                rptNa = "共通資料查詢報表"
            };
        }


        //定義查詢欄位內容（欄位請一律用大寫）
        public class SearchClass : ISearchClass
        {
            //使用者名稱
            public string PASS_NO { get; set; }
            //使用者中文
            public string PASS_NA { get; set; }
            //原密碼
            public string PASS_WD { get; set; }
            //使用者輸入-新密碼
            public string NEWPASS_WD { get; set; }
        }

        /// <summary>
        /// ----更新特定資料 ----------------------------------------------
        /// Post: /api/api程式名稱/QuUpdate
        /// </summary>
        /// <returns>return string</returns>
        [HttpGet]
        [Route("QuUpdate")]
        public IActionResult QuUpdate([FromBody] DeltaQuOther a_delta)
        {
            IActionResult l_ret = null;
            //檢查參數
            string l_err = UtilityBase.ckDelta(a_delta);
            if (!string.IsNullOrEmpty(l_err))
            {
                return StatusCode(StatusCodes.Status500InternalServerError, l_err);
            }

            StringBuilder l_SQL = new StringBuilder();
            Hashtable l_ht = new Hashtable();
            Dictionary<string, object> l_oldRow = a_delta.oldRow;
            string l_name = a_delta.name.ToUpper();
            //欲更新的資料
            if (l_name == "SYSPASMI".ToUpper())
            {
                //檢查密碼
                DBController l_dbc = new DBController();
                Hashtable l_checkHt = new Hashtable();
                string l_checkSQL = @" /*[MCPAS020Controller].QuUpdate 檢查密碼*/
                 declare @hb varbinary(128), @h64 varchar(128), @salt varchar(50),@passWd varchar(128); 

				 select @salt = pass_salt from syspasmi where pass_no = @PASS_NO 
				 set @passWd = @salt + @PASS_WD 
				 set @hb = hashbytes('sha2_256', @passWd); " +

                     " set @h64 = cast('' as xml).value('xs:base64Binary(sql:variable(\"@hb\"))', 'varchar(128)'); " +

                     @" select count('') from syspasmi 
                where pass_no = @PASS_NO 
                 and pass_wd = @h64 ";
                l_checkHt.Add("@PASS_WD", new StructureSQLParameter(l_oldRow["OLDPASS_WD"], SqlDbType.VarChar));
                l_checkHt.Add("@PASS_NO", new StructureSQLParameter(UserInfo.getUserInfo(_httpContextAccessor.HttpContext.Request.Headers.Authorization).PNO, SqlDbType.NVarChar));

                string count = l_dbc.DbExecuteScalar_Str(l_checkSQL, l_checkHt);

                if (count != "1")
                {
                    return StatusCode(StatusCodes.Status500InternalServerError, "原始密碼輸入錯誤！");
                }

                Regex regex = new Regex(@"^.*(?=.{8,})(?=.*\d)(?=.*[a-zA-Z]).*$");

                //當帳號不是ksi時，檢驗密碼原則
                if (l_oldRow["PASS_NO"].ToString().ToUpper() != "KSI")
                {
                    if (l_oldRow["NEWPASS_WD"].ToString().ToUpper().Equals(l_oldRow["PASS_NO"].ToString().ToUpper()))
                    {
                        //return new ExceptionResult(new Exception("密碼不可與帳號相同！"), this);
                        return StatusCode(StatusCodes.Status500InternalServerError, "密碼不可與帳號相同！");
                    }

                    if (!regex.IsMatch(l_oldRow["NEWPASS_WD"].ToString()))
                    {
                        //return new ExceptionResult(new Exception("密碼之長度至少8位(含)以上、且為英、數字混合"), this);
                        return StatusCode(StatusCodes.Status500InternalServerError, "密碼之長度至少8位(含)以上、且為英、數字混合");
                    }
                }

                if (l_oldRow["NEWPASS_WD"].ToString().Length < 8 ||
                         l_oldRow["NEWPASS_WD"].ToString().Length > 16)
                {
                    //return new ExceptionResult(new Exception("新的密碼長度必須介於8~16字"), this);
                    return StatusCode(StatusCodes.Status500InternalServerError, "新的密碼長度必須介於8~16字");
                }

                string _salt = Guid.NewGuid().ToString("N");
                string sha256_PassWd = SHACryptoHelper.EncryptSHA256(_salt + l_oldRow["NEWPASS_WD"].ToString());

                #region 檢查是否跟歷史密碼相同
                string _sql = @"SELECT * FROM SYSPASHISTORY WHERE PASS_NO = @PASS_NO";
                l_ht.Add("@PASS_NO", new StructureSQLParameter(UserInfo.getUserInfo(_httpContextAccessor.HttpContext.Request.Headers.Authorization).PNO, SqlDbType.NVarChar));
                DataTable history_dt = l_dbc.FillDataTable(_sql, l_ht);
                if (history_dt.Rows.Count > 0)
                {
                    string pwd_history1 = SHACryptoHelper.EncryptSHA256(General.nvl(history_dt.Rows[0]["pwd_salt_history1"], "").ToString() + l_oldRow["NEWPASS_WD"].ToString());
                    string pwd_history2 = SHACryptoHelper.EncryptSHA256(General.nvl(history_dt.Rows[0]["pwd_salt_history2"], "").ToString() + l_oldRow["NEWPASS_WD"].ToString());
                    string pwd_history3 = SHACryptoHelper.EncryptSHA256(General.nvl(history_dt.Rows[0]["pwd_salt_history3"], "").ToString() + l_oldRow["NEWPASS_WD"].ToString());

                    if (pwd_history1 == General.nvl(history_dt.Rows[0]["pwd_history1"], "").ToString() || pwd_history2 == General.nvl(history_dt.Rows[0]["pwd_history2"], "").ToString() || pwd_history3 == General.nvl(history_dt.Rows[0]["pwd_history3"], "").ToString())
                    {
                        //return new ExceptionResult(new Exception("新的密碼不可與前三次密碼相同"), this);
                        return StatusCode(StatusCodes.Status500InternalServerError, "新的密碼不可與前三次密碼相同");
                    }
                }
                #endregion

                DateTime nextTime = Convert.ToDateTime(DateTime.Now.ToString("D").ToString()).AddMonths(3);

                l_SQL.Append(" UPDATE SYSPASMI SET PASS_WD = @PASS_WD, PWD_RESET_DATE = @RESET_DATE, PWD_CHG_DATE =getdate(), UPD_DATE =getdate() , UPD_NO =  @PASS_NO ,PASS_SALT = @PASS_SALT ");
                l_SQL.Append(" where 1=1 ");
                l_SQL.Append("  and UPPER(PASS_NO) = UPPER(@PASS_NO) ");
                //加入條件及參數值
                l_ht.Clear();
                l_ht.Add("@PASS_NO", new StructureSQLParameter(UserInfo.getUserInfo(_httpContextAccessor.HttpContext.Request.Headers.Authorization).PNO, SqlDbType.NVarChar));
                l_ht.Add("@PASS_WD", new StructureSQLParameter(sha256_PassWd, SqlDbType.VarChar));
                l_ht.Add("@PASS_SALT", new StructureSQLParameter(_salt, SqlDbType.VarChar));
                l_ht.Add("@RESET_DATE", new StructureSQLParameter(nextTime, SqlDbType.DateTime));

                //回傳
                l_ret = doQuUpdate(l_SQL.ToString(), l_ht);

                #region 更新歷史密碼
                string update_sql = @"UPDATE SYSPASHISTORY SET PWD_HISTORY3 = PWD_HISTORY2, PWD_SALT_HISTORY3 = PWD_SALT_HISTORY2, 
                                        PWD_HISTORY2 = PWD_HISTORY1, PWD_SALT_HISTORY2 = PWD_SALT_HISTORY1, PWD_HISTORY1 = @PASS_WD, 
                                        PWD_SALT_HISTORY1 = @PASS_SALT, UPD_NO = @PASS_NO, UPD_DATE = getdate() WHERE UPPER(PASS_NO) = UPPER(@PASS_NO)";

                l_ret = doQuUpdate(update_sql, l_ht);
                #endregion
                Dictionary<string, object> l_dic = new Dictionary<string, object>();
                //Update 成功，則Update
                //if (l_ret != null)
                //{
                //    UserInfoData l_userInfo = UserInfo.getUserInfo(HttpContext.Session);
                //    l_userInfo.PASS_WD = sha256_PassWd;
                //}
            }
            return l_ret;
        }
    }
}
