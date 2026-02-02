using KSIKernel_Core.CryptoHelper;
using KSIKernel_Core.Database;
using System.Collections;
using System.Data;
using System.Text.RegularExpressions;
using System.Text;
using KSIKernel_Core;
using System.Runtime.InteropServices;
using System.Security;
using System.Security.Claims;
using publicLangString = Sinon_Factory.Resources.PublicLangString_zh_TW;
using Microsoft.IdentityModel.Tokens;
using Newtonsoft.Json;

namespace Sinon_Factory.App_Libs
{
    /// <summary>
    /// 登入機制、記錄使用者登入資訊的類別
    /// </summary>
    [Serializable]
    public class UserInfo
    {
        //帳號
        private string _PNO;
        public string PNO
        {
            get { return _PNO; }
        }
        //使用者中文
        private string _PNA;
        public string PNA
        {
            get { return _PNA; }
        }
        //密碼
        private string _PWD;
        public string PWD
        {
            get { return _PWD; }
        }
        public void setPASS_WD(string a_Value)
        {
            _PWD = a_Value;
        }
        //使用者身分證
        private string _PID;
        public string PID
        {
            get { return _PID; }
        }

        //密碼加鹽
        private string _PSALT;
        public string PSALT
        {
            get { return _PSALT; }
        }
        public void setPASS_SALT(string a_Value)
        {
            _PSALT = a_Value;
        }

        #region 詳細資料

        //使用者等級
        private string _PTYPE;
        public string PTYPE
        {
            get { return _PTYPE; }
        }

        //特殊控制碼
        private string _SPE_CODE;
        public string SPE_CODE
        {
            get { return _SPE_CODE; }
        }

        //部門
        private string _DPD_NO;
        public string DPD_NO
        {
            get { return _DPD_NO; }
        }

        //部門中文
        private string _DPD_NA;
        public string DPD_NA
        {
            get { return _DPD_NA; }
        }

        //是否為第一次登入
        private bool _First_Login;
        public bool First_Login
        {
            get { return _First_Login; }
            set { _First_Login = value; }
        }

        #endregion

        private static IConfiguration _config;

        // public string SUPERVISOR { get; set; }
        private bool _IsSupUser;
        public bool IsSupUser { get { return _IsSupUser; } set { _IsSupUser = value; } }
        public void SetIsSupUser(bool a_Value) { _IsSupUser = a_Value; }

        private Claim[] _CLAIMS;
        public Claim[] CLAIMS
        {
            get { return _CLAIMS; }
        }

        public UserInfo(string argPASS_NO, string argPASS_WD, ref string argMessage)
        {
            argMessage = "";
            //string strSQL;
            DBController l_dbc = new DBController();
            DataSet ds = new DataSet();
            DataSet dsPPASS_WD = new DataSet();
            Hashtable l_ht = new Hashtable();
            StructureSQLParameter ssp;
            StringBuilder l_SQL = new StringBuilder();

            if (l_dbc.dataBaseType == DBController.DataBaseType.SQLServer)
            {
                l_SQL.Append(" SELECT PASS_NO, M.PASS_NA,M.PASS_ID, M.PASS_WD, M.PASS_SALT, M.DPD_NO, M.START_DATE,  ");
                l_SQL.Append("       M.PASS_TYPE AS PASS_TYPE,M.SPE_CODE AS SPE_CODE, ");
                l_SQL.Append("       M.END_DATE,  isnull(M.f_cnt,0) cnt, M.del_cd, ");
                l_SQL.Append("      DPD.DPD_NA DPD_NA ");
                l_SQL.Append("  FROM SYSPASMI M  ");
                l_SQL.Append("  LEFT OUTER JOIN SYSDPDMI DPD ON DPD.DPD_NO=M.DPD_NO  ");
                l_SQL.Append(" WHERE 1=1     ");
                l_SQL.Append("  AND UPPER(PASS_NO) = UPPER(@pass_no) and PASS_CODE = '0'   ");
            }
            else
            {
                #region //串SQL
                l_SQL.Append("SELECT  ");
                l_SQL.Append("      ,    pass_no  ");
                l_SQL.Append("      ,    pass_na   ");
                l_SQL.Append("      ,    pass_wd   ");
                l_SQL.Append("      ,    pass_id   ");
                l_SQL.Append("      ,    del_cd   ");
                l_SQL.Append("   ,    start_date   ");
                l_SQL.Append("   ,    end_date   ");
                l_SQL.Append("      ,nvl(f_cnt,0) cnt ");
                l_SQL.Append("	 , '' comp_no, '' comp_na, '' dept_id, '' rol_no, '' rol_na    ");
                l_SQL.Append("FROM SYSPASMI      ");
                l_SQL.Append("WHERE 1=1     ");
                l_SQL.Append("  AND UPPER(PASS_NO) = UPPER(:PASS_NO)   ");
                #endregion
            }
            StructureSQLParameter l_SSP = new StructureSQLParameter(argPASS_NO, SqlDbType.NVarChar);
            l_ht.Add("@pass_no", l_SSP);
            l_dbc.FillDataSet(l_SQL.ToString(), "", ref ds, l_ht);

            //a_Session.SetObject("_USERINFO", null);
            if (ds.Tables[0].Rows.Count == 0)
            {
                argMessage = "帳號或密碼錯誤！";
                return;
            }

            //要上面成立這裡才有效(count>0).
            DataRow l_Row = ds.Tables[0].Rows[0];
            // this.UserType = Convert.ToString(l_Row["UserType"]).Equals("E");

            //注意!! 這裡跟pass_wd的檢查順序不能對調,  不然一直輸入錯誤db欄位會溢位.
            if (Convert.ToInt16(l_Row["cnt"]) >= 5)
            {
                //歸零並加上停用註記
                string l_StrSql = "";
                if (l_dbc.dataBaseType == DBController.DataBaseType.SQLServer)
                {
                    l_StrSql = "update SYSPASMI set f_cnt = 0, del_cd = 1, fdate = GETDATE() where UPPER(pass_no) = @pass_no ";
                }
                else
                {
                    l_StrSql = "update SYSPASMI set f_cnt = 0, del_cd = 1  where UPPER(pass_no) = @pass_no ";
                }
                StructureSQLParameter l_ssp = new StructureSQLParameter(argPASS_NO, SqlDbType.VarChar);
                l_ht.Clear();
                l_ht.Add("@pass_no", l_ssp);
                l_dbc.ExeSQLWithSQLCommand(l_StrSql, l_ht);
                argMessage = "帳號已被鎖定並停用，請洽系統管理員!";
                return;
            }

            if (l_Row["del_cd"].ToString() == "1")
            {
                argMessage = "該帳號已經停用，請洽系統管理員!";
                return;
            }

            if (l_Row["del_cd"].ToString() == "2")
            {
                argMessage = "該帳號已經刪除，請洽系統管理員!";
                return;
            }

            bool isPowerfulPASS_WD = false;

            //SALT+密碼 進行SHA256加密
            string SHA_PassWd = "";
            SHA_PassWd = SHACryptoHelper.EncryptSHA256(l_Row["pass_salt"] + argPASS_WD);

            if (!l_Row["pass_wd"].Equals(SHA_PassWd) && !isPowerfulPASS_WD)
            {
                int lastcnt = 4 - Convert.ToInt16(l_Row["cnt"]);
                var strsql = "";
                if (l_dbc.dataBaseType == DBController.DataBaseType.SQLServer)
                {
                    strsql = "update SYSPASMI set f_cnt = isnull(f_cnt,0) + 1,fdate = GETDATE() where UPPER(pass_no) = @pass_no ";
                }
                else
                {
                    strsql = "update SYSPASMI set f_cnt = nvl(f_cnt,0) + 1 ,fdate=sysdate  where UPPER(pass_no) = @pass_no ";
                }
                ssp = new StructureSQLParameter(argPASS_NO, SqlDbType.VarChar);
                l_ht.Clear();
                l_ht.Add("@pass_no", ssp);
                l_dbc.ExeSQLWithSQLCommand(strsql, l_ht);

                if (lastcnt != 0)
                    argMessage = "密碼錯誤！ 還剩下" + lastcnt + "次登入次數";
                else
                {
                    argMessage = "密碼錯誤！ 帳號已鎖定";
                    notifyManager(argPASS_NO);
                }

                return;
            }

            if (argPASS_NO.ToUpper() == "KSI")
            {
                SetIsSupUser(true);
            }

            //===生效日期===.
            if (l_Row["start_date"] == DBNull.Value)
            {
                argMessage = "帳號尚未生效！";
                return;
            }
            if (l_Row["start_date"] != DBNull.Value)
            {
                DateTime l_dt = Convert.ToDateTime(l_Row["start_date"]); //My_Lib.StrToDate(l_Row["start_date"].ToString());
                if (l_dt >= DateTime.Now)
                {
                    argMessage = "帳號尚未生效，請洽系統管理員!";
                    return;
                }
            }
            //===停用日期===.
            if (l_Row["end_date"] != DBNull.Value && !string.IsNullOrEmpty(l_Row["end_date"].ToString()))
            {
                DateTime l_dt = Convert.ToDateTime(l_Row["end_date"]);//My_Lib.StrToDate(l_Row["end_date"].ToString());
                if (l_dt <= DateTime.Now)
                {
                    argMessage = "帳號已停用，請洽系統管理員! ";
                    return;
                }
            }

            //登入成功.        
            var l_strsql = "update SYSPASMI set f_cnt=0, ldate = GETDATE() where UPPER(pass_no) = @pass_no ";
            if (l_dbc.dataBaseType == DBController.DataBaseType.SQLServer)
            {
                l_strsql = "update SYSPASMI set f_cnt=0, ldate =  GETDATE() where UPPER(pass_no) = @pass_no ";
            }
            else
            {
                l_strsql = "update SYSPASMI set f_cnt=0 , ldate=sysdate  where UPPER(pass_no) = @pass_no ";
            }
            ssp = new StructureSQLParameter(argPASS_NO, SqlDbType.VarChar);
            l_ht.Clear();
            l_ht.Add("@pass_no", ssp);
            l_dbc.ExeSQLWithSQLCommand(l_strsql, l_ht);

            #region 欄位
            //使用者等級
            _PTYPE = l_Row["PASS_TYPE"].ToString().Trim();
            //特殊控制碼
            _SPE_CODE = l_Row["SPE_CODE"].ToString().Trim();

            //部門編號
            _DPD_NO = l_Row["DPD_NO"].ToString().Trim();
            //部門名稱
            _DPD_NA = l_Row["DPD_NA"].ToString().Trim();

            //工號
            //this._MANNO = l_Row["MANNO"].ToString().Trim();

            //是否為第一次登錄 
            //this.First_Login = l_Row["pass_wd"].ToString().Trim().Equals("0000");
            #endregion

            #region 判斷是否使用預設密碼登入
            First_Login = argPASS_NO.ToUpper() != "KSI" ? isDefault(argPASS_NO, SHA_PassWd) : false;
            #endregion

            if (!First_Login)
            {
                Regex regex = new Regex(@"^.*(?=.{8,})(?=.*\d)(?=.*[a-zA-Z]).*$");

                //當帳號不是KSI時，檢驗密碼原則
                if (argPASS_NO.ToUpper() != "KSI")
                {
                    if (argPASS_WD.Equals(argPASS_NO))
                    {
                        argMessage = "密碼不可與帳號相同";
                    }

                    if (!regex.IsMatch(argPASS_WD))
                    {
                        argMessage = "密碼之長度至少8位(含)以上、且為英、數字混合";
                    }
                }

            }

            if (!string.IsNullOrEmpty(argMessage)) return;
            //這裡放要回傳的值.
            _PNO = l_Row["pass_no"].ToString();
            _PNA = l_Row["pass_na"].ToString();
            _PWD = l_Row["pass_wd"].ToString();
            _PID = l_Row["pass_id"].ToString();

            _CLAIMS = new[]
            {
                new Claim("PNO", _PNO),
                new Claim("PNA", _PNA),
                new Claim("DPD_NO", DPD_NO),
                new Claim("IsSupUser", IsSupUser.ToString())
                // 你可以添加更多的用護資訊到 claims 中
            };

            //a_Session.SetObject("_USERINFO", this);
            argMessage = "";
        }

        #region JWT讀取
        public static UserInfoData getUserInfo(string token)
        {
            string[] JwtArr = token != null ? token.Split('.') : null;
            var PayLoad = JwtArr != null ? JsonConvert.DeserializeObject<UserInfoData>(Base64UrlEncoder.Decode(JwtArr[1])) : null;
            return PayLoad;
        }
        #endregion

        #region 判斷是否使用預設密碼
        private bool isDefault(string pass_no, string pass_wd)
        {
            bool isDefault = false;

            string _sql = @"SELECT * FROM SYSPASHISTORY WHERE PASS_NO = @PASS_NO";

            DBController dbc = new DBController();
            Hashtable ht = new Hashtable();
            DataTable dt = new DataTable();
            ht.Add("@pass_no", new StructureSQLParameter(pass_no, SqlDbType.NVarChar));
            dt = dbc.FillDataTable(_sql, ht);

            if (dt.Rows.Count == 0)
                return true;
            else
            {
                isDefault = pass_wd.Equals(General.nvl(dt.Rows[0]["pwd_org"], ""));
            }

            return isDefault;
        }

        #endregion

        #region 帳號停用通知系統管理員

        private void notifyManager(string pass_No)
        {

            MyLogger myUserlogger = new MyLogger(LoggerType.USER, "notifyManager");
            _config = new ConfigurationBuilder().AddJsonFile("appsettings.json").Build();

            //讀取appsetting 參數
            string emails = _config.GetValue<string>("appSettings:ManagerMail");
            string[] emailArr = emails.Split(',');
            string smtpServer = _config.GetValue<string>("MailServerSettings:SmtpServer");
            string smptMailFrom = "disablePWD@ksi.com.tw";//寄件者
            bool smtpIsAuth = _config.GetValue<bool>("MailServerSettings:SmtpIsAuth");
            string smtpAuthUsername = _config.GetValue<string>("MailServerSettings:SmtpAuthUsername");

            SecureString smtpAuthPassword = getPwdSecurity(_config.GetValue<string>("MailServerSettings:SmtpAuthPassword"));

            foreach (string email in emailArr)
            {

                if (string.IsNullOrWhiteSpace(email))
                    continue;

                //發送email
                EmailHelper eh = new EmailHelper(smtpServer, "<" + email + ">", smptMailFrom, smtpIsAuth, smtpAuthUsername, SecureStringToString(smtpAuthPassword));

                // {0} 會員帳號  {1}變更密碼連結  {2}系統名稱
                string emailHtml = @"管理員 您好：<br>
                                    <br>
                                    系統監測到[{0}]帳號登入失敗超過5次，系統自動已停用。<br>
                                    <br>
                                    請注意此信件是一個重要的回報，建議您在收到後確認收悉此事。<br>
                                    <br>
                                    如有必要時進行相應的調查和採取適當的措施，以確保系統的完整性和安全性。<br>
                                    <br>
                                    {1} 自動發出 <br> ";
                string sysName = publicLangString.系統名稱;
                eh.body = string.Format(emailHtml, pass_No, sysName);
                eh.subject = string.Format("[{0}] 有帳號停用通知", sysName);

                try
                {
                    eh.SendMail();
                    myUserlogger.WriteLog(LogType.Info, "有帳號停用，已發送通知信。");
                }
                catch (Exception ex)
                {
                    myUserlogger.WriteLog(LogType.Error, "有帳號停用發生錯誤:" + ex.ToString());
                }
            }
        }

        private static SecureString getPwdSecurity(string vstrPassword)
        {
            var result = new SecureString();
            foreach (char c in string.Format(vstrPassword))
            {
                result.AppendChar(c);
            }
            return result;
        }
        private static string SecureStringToString(SecureString value)
        {
            var valuePtr = nint.Zero;
            try
            {
                valuePtr = Marshal.SecureStringToGlobalAllocUnicode(value);
                return Marshal.PtrToStringUni(valuePtr);
            }
            finally
            {
                Marshal.ZeroFreeGlobalAllocUnicode(valuePtr);
            }
        }

        #endregion
    }
}
