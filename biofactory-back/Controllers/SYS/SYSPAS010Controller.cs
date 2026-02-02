using KSIKernel_Core.CryptoHelper;
using KSIKernel_Core.Database;
using KSIKernel_Core;
using System.Collections;
using System.Data;
using System.Text.RegularExpressions;
using System.Text;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using KSIKernel_Core.Report;
using Sinon_Factory.App_Libs;
using Sinon_Factory.Models;

namespace Sinon_Factory.Controllers.SYS
{
    [Route("api/[controller]")]
    [ApiController]
    public class apiSYSPAS010Controller : MasterApiController, IApiController.MD
    {
        private IHttpContextAccessor _httpContextAccessor;
        public apiSYSPAS010Controller(IHttpContextAccessor httpContextAccessor) : base(httpContextAccessor)
        {
            _httpContextAccessor = httpContextAccessor;
        }

        /// <summary>
        /// ----初始化 initializing ----------------------------------------------
        /// GET: /api/apiSYSPAS010/Init
        /// </summary>
        /// <returns>Return MasterClass</returns>
        [HttpGet]
        [Route("Init")]
        public IActionResult Init()
        {
            Searching += l_Master_Searching; //加入查詢條件
            Initialing += l_Master_Initialing; //加入下拉元件
            return doInitResult();
        }

        void l_Master_Initialing(object sender, EventArgs e)
        {
            //加入來自SQL的下拉，命名為GPASS_NO
            addOpData("GPASS_NO", "select M.PASS_NO as [KEY], M.PASS_NO+'-'+M.PASS_NA as  [DESC] from SYSPASMI M  where M.PASS_CODE ='1'  order by [KEY] ");
            //加入來自SQL的下拉，命名為PASS_TYPE
            addOpDataWithCom("COMPASS_TYPE", "PASS_TYPE");
            //加入來自SQL的下拉，命名為SPE_CODE
            addOpDataWithCom("COMSPE_CODE", "SPE_CODE");
            //加入來自SQL的下拉，命名為DPD_NO
            addOpData("DPD_NO", " select dpd_no [KEY], dpd_na [DESC] from SYSDPDMI order by dpd_no  ");

            addOpData("USER_NO", "SELECT  pass_no [KEY] ,pass_na [DESC] FROM SYSPASMI where pass_code = 0 ");
        }

        public override MasterClass getMaster(IHttpContextAccessor httpContextAccessor)
        {
            var pass_no = UserInfo.getUserInfo(httpContextAccessor.HttpContext.Request.Headers.Authorization).PNO;
            //SQL必須加入1=1條件
            StringBuilder l_SQL = new StringBuilder();
            l_SQL.Append(@"SELECT [PASS_NO],[PASS_NA],[PASS_ENG],'&=ORIGINAL=&' as PASS_WD,'&=ORIGINAL=&' as PASS_SALT,[PASS_CODE],[PASS_ID],M.[DPD_NO],[ROS_NO],[ROB_NO],[EMP_NO],[PASS_TYPE],[SPE_CODE],[E_MAIL],[STR_NO],
convert(varchar, START_DATE, 120) [START_DATE],
convert(varchar, END_DATE, 120) [END_DATE],
M.[CRT_NO],
convert(varchar, M.CRT_DATE, 120) [CRT_DATE],
convert(varchar, PWD_RESET_DATE, 120) [PWD_RESET_DATE],
convert(varchar, PWD_CHG_DATE, 120) [PWD_CHG_DATE],
[ROL_NO],[TEL_M],[F_CNT],[DEL_CD],
convert(varchar, LDATE, 120) [LDATE],
convert(varchar, FDATE, 120) [FDATE],
convert(varchar, M.UPD_NO, 120) [UPD_NO],
convert(varchar, M.UPD_DATE, 120) [UPD_DATE], LINE_NOTIFY_TOKEN, UDPD_NO, UPASS_NO, 
UUDPD_NO, UUPASS_NO, M_FLAG, LINE_USER_ID, LINE_LOGIN_TOKEN, EMAIL_FLAG, EMAIL_SYS, 
ACCESS_TOKEN, ACCESS_TOKEN_EXPIRYTIME, REFRESH_TOKEN, REFRESH_TOKEN_EXPIRYTIME,");
            l_SQL.Append("       C.CODE_TXT PASS_TYPE_C, ");
            l_SQL.Append("       C2.CODE_TXT SPE_CODE_C, ");
            l_SQL.Append("       DPD.DPD_NA ");
            l_SQL.Append("  FROM SYSPASMI M ");
            l_SQL.Append("  LEFT OUTER JOIN SYSCOMMI C ON  C.CODE_NO=M.PASS_TYPE AND C.COMM_NO='PASS_TYPE' ");
            l_SQL.Append("  LEFT OUTER JOIN SYSCOMMI C2 ON C2.CODE_NO=M.SPE_CODE AND C2.COMM_NO='SPE_CODE' ");
            l_SQL.Append("  LEFT OUTER JOIN SYSDPDMI DPD ON M.DPD_NO = DPD.DPD_NO ");
            l_SQL.Append(" where 1=1 ");
            l_SQL.Append("ORDER BY PASS_NO ");

            StringBuilder l_UpdateSQL = new StringBuilder();
            l_UpdateSQL.Append(@" SELECT M.[PASS_NO]
              ,M.[PASS_NA]
              ,M.[PASS_ENG]
              ,M.[PASS_CODE]
              ,M.[PASS_ID]
              ,M.[DPD_NO]
              ,M.[ROS_NO]
              ,M.[ROB_NO]
              ,M.[EMP_NO]
              ,M.[PASS_TYPE]
              ,M.[SPE_CODE]
              ,M.[E_MAIL]
              ,M.[STR_NO]
              ,M.[START_DATE]
              ,M.[END_DATE]
              ,M.[CRT_NO]
              ,M.[CRT_DATE]
              ,M.[PWD_RESET_DATE]
              ,M.[PWD_CHG_DATE]
              ,M.[ROL_NO]
              ,M.[TEL_M]
              ,M.[F_CNT]
              ,M.[DEL_CD]
              ,M.[LDATE]
              ,M.[FDATE]
              ,M.[UPD_NO]
              ,M.[UPD_DATE] from SYSPASMI M Where 1=2");

            //回傳Master Object 
            return new MasterClass()
            {
                tableName = "SYSPASMI",
                isNoDataFirstLoad = false, //程式第一次載入時是否有資料
                sQL = l_SQL.ToString().ToUpper(),
                keyField = new string[] { "PASS_NO" },
                notNullField = new string[] { "PASS_NO", "PASS_WD", "PASS_NA" },//不可空白欄位
                noEditButInsertField = new string[] { "PASS_NO", "PASS_CODE" },//不可編輯,但可新增欄位
                noEditField = new string[] { "DIS_LM_POS", "DIS_LM_ORD", "LM_AMT_ORD", "UPD_NO", "UPD_DATE", "CRT_NO", "CRT_DATE", "PWD_CHG_DATE", "PWD_RESET_DATE" }, //不可編輯欄位 
                noCopyField = null,//不複製欄位
                searchData = new SearchClass() { PASS_NO = "", PASS_CODE = "" },//查詢條件預設值
                updateSQL = l_UpdateSQL.ToString()
            };
        }

        /// <summary>
        /// ----查詢doSearch ----------------------------------------------
        /// Post: /api/api程式名稱/Search
        /// </summary>
        /// <returns>return DataTable</returns>
        [HttpPost]
        [Route("Search")]
        public IActionResult Search([FromBody] SearchClass a_Search)
        {
            Searching += l_Master_Searching; //加入查詢條件
            return doSearchResult(a_Search);
        }

        /// <summary>
        /// ----新增Insert ----------------------------------------------
        /// Post: /api/api程式名稱/Insert
        /// </summary>
        /// <returns>return TransDataClass</returns>
        [HttpPost]
        [Route("Insert")]
        public IActionResult Insert([FromBody] DeltaMD a_dr)
        {
            Posting += l_Master_Posting;
            RefreshMasterData += l_Master_RefreshMasterData;
            return doPostResult(enStatus.Insert, a_dr);
        }

        void l_Master_Posting(object sender, CancelMsgEventArgs e)
        {
            DBController l_dbc = new DBController("UseDB");
            Hashtable l_ht = new Hashtable();
            string token = General.nvl(Request.Headers.Authorization, "").ToString().Replace("Bearer ", "");

            if (e.status == enStatus.Insert)
            {
                //當區分為"使用者",且密碼不符合規定則回傳錯誤
                string _salt = Guid.NewGuid().ToString("N");
                string sha256_PassWd = SHACryptoHelper.EncryptSHA256(_salt + e.newRow["PASS_WD"].ToString());
                e.newRow["PASS_SALT"] = _salt;
                e.newRow["PASS_WD"] = sha256_PassWd;
                e.newRow["PWD_CHG_DATE"] = DateTime.Now;
                e.newRow["PWD_RESET_DATE"] = DateTime.Now.AddMonths(3);
                //預設updateSQL的欄位缺少Pass_wd跟Pass_salt 新增時必須使用全部欄位
                ((MasterClass)sender).updateSQL = @" select * from syspasmi where 1=2 ";
            }
            else if (e.status == enStatus.Edit)
            {
                if (e.newRow["PASS_WD"].ToString() != "&=ORIGINAL=&")
                {
                    //當區分為"使用者",且密碼不符合規定則回傳錯誤
                    Regex regex = new Regex(@"^.*(?=.{8,})(?=.*\d)(?=.*[a-zA-Z]).*$");
                    if (!regex.IsMatch(e.newRow["PASS_WD"].ToString()))
                    {
                        e.cancel = true;
                        e.message = "密碼之長度至少8位(含)以上、且為英、數字混合";
                        return;
                    }

                    if (e.newRow["PASS_WD"].ToString().Length < 8 ||
                        e.newRow["PASS_WD"].ToString().Length > 16)
                    {
                        e.cancel = true;
                        e.message = "新的密碼長度必須介於8~16字";
                        return;
                    }

                    #region 檢查是否跟歷史密碼相同
                    string _sql = @"SELECT * FROM SYSPASHISTORY WHERE PASS_NO = @PASS_NO";
                    l_ht.Add("@PASS_NO", new StructureSQLParameter(UserInfo.getUserInfo(token).PNO, SqlDbType.NVarChar));
                    DataTable history_dt = l_dbc.FillDataTable(_sql, l_ht);
                    if (history_dt.Rows.Count > 0)
                    {
                        string pwd_history1 = SHACryptoHelper.EncryptSHA256(General.nvl(history_dt.Rows[0]["pwd_salt_history1"], "").ToString() + e.newRow["PASS_WD"].ToString());
                        string pwd_history2 = SHACryptoHelper.EncryptSHA256(General.nvl(history_dt.Rows[0]["pwd_salt_history2"], "").ToString() + e.newRow["PASS_WD"].ToString());
                        string pwd_history3 = SHACryptoHelper.EncryptSHA256(General.nvl(history_dt.Rows[0]["pwd_salt_history3"], "").ToString() + e.newRow["PASS_WD"].ToString());

                        if (pwd_history1 == General.nvl(history_dt.Rows[0]["pwd_history1"], "").ToString() || pwd_history2 == General.nvl(history_dt.Rows[0]["pwd_history2"], "").ToString() || pwd_history3 == General.nvl(history_dt.Rows[0]["pwd_history3"], "").ToString())
                        {
                            e.cancel = true;
                            e.message = "新的密碼不可與前三次密碼相同";
                            return;
                        }
                    }
                    #endregion

                    DateTime nextTime = Convert.ToDateTime(DateTime.Now.ToString("D").ToString()).AddMonths(3);

                    string l_UpdateSQL = "Update SYSPASMI " +
                        " set PASS_WD = @PASS_WD ," +
                        "PWD_RESET_DATE = @RESET_DATE, " +
                        "PWD_CHG_DATE =getdate(), " +
                        "PASS_SALT = @PASS_SALT " +
                        "WHERE PASS_NO = @PASS_NO ";

                    string _salt = Guid.NewGuid().ToString("N");
                    string sha256_PassWd = SHACryptoHelper.EncryptSHA256(_salt + e.newRow["PASS_WD"].ToString());

                    l_ht.Clear();
                    l_ht.Add("@PASS_WD", new StructureSQLParameter(sha256_PassWd, SqlDbType.VarChar));
                    l_ht.Add("@PASS_SALT", new StructureSQLParameter(_salt, SqlDbType.VarChar));
                    l_ht.Add("@PASS_NO", new StructureSQLParameter(e.oldRow["PASS_NO"], SqlDbType.NVarChar));
                    l_ht.Add("@RESET_DATE", new StructureSQLParameter(nextTime, SqlDbType.DateTime));
                    l_dbc.DbExecuteNonQuery(l_UpdateSQL, l_ht, e.dbConnection, e.dbTransaction);

                    #region 更新歷史密碼
                    string update_sql = @"UPDATE SYSPASHISTORY SET PWD_HISTORY3 = PWD_HISTORY2, PWD_SALT_HISTORY3 = PWD_SALT_HISTORY2, 
                                        PWD_HISTORY2 = PWD_HISTORY1, PWD_SALT_HISTORY2 = PWD_SALT_HISTORY1, PWD_HISTORY1 = @PASS_WD, 
                                        PWD_SALT_HISTORY1 = @PASS_SALT, UPD_NO = @PASS_NO, UPD_DATE = getdate() WHERE UPPER(PASS_NO) = UPPER(@PASS_NO)";

                    l_dbc.DbExecuteNonQuery(update_sql, l_ht, e.dbConnection, e.dbTransaction);
                    #endregion
                }
            }


        }

        /// <summary>
        /// ----修改Edit ----------------------------------------------
        /// Post: /api/api程式名稱/Edit
        /// </summary>
        /// <returns>return TransDataClass</returns>
        [HttpPost]
        [Route("Edit")]
        public IActionResult Edit([FromBody] DeltaMD a_dr)
        {
            Posting += l_Master_Posting;
            RefreshMasterData += l_Master_RefreshMasterData;
            return doPostResult(enStatus.Edit, a_dr);
        }


        /// <summary>
        /// ----刪除 Delete ----------------------------------------------
        /// Post: /api/api程式名稱/Delete
        /// </summary>
        /// <returns>return TransDataClass</returns>
        [HttpPost]
        [Route("Delete")]
        public IActionResult Delete([FromBody] DeltaMD a_dr)
        {
            return doPostResult(enStatus.Delete, a_dr);
        }

        /// <summary>
        /// ----明細 Detail ----------------------------------------------
        /// Post: /api/api程式名稱/Detail
        /// </summary>
        /// <returns>return DataSet</returns>
        [HttpPost]
        [Route("Detail")]
        public IActionResult Detail([FromBody] DeltaMD a_dr)
        {
            return doGetDetailResult(a_dr);
        }

        //定義查詢欄位內容（欄位請一律用大寫）
        public class SearchClass : ISearchClass
        {
            //使用者代碼
            public string PASS_NO { get; set; }
            //使用者姓名
            public string PASS_NA { get; set; }
            //使用者區分
            public string PASS_CODE { get; set; }
            //部門
            public string DPD_NO { get; set; }
        }

        //查詢事件，組SQL
        void l_Master_Searching(object sender, SearchingEventArgs e)
        {
            SearchClass l_Search = (SearchClass)e.SearchData;
            string l_SQL = "";
            //使用者代碼
            if (!string.IsNullOrEmpty(l_Search.PASS_NO))
            {
                l_SQL = l_SQL + "  AND (IsNull(m.PASS_NO,'') like '%'+@PASS_NO+'%')";
                e.ht.Add("@PASS_NO", new StructureSQLParameter(l_Search.PASS_NO, SqlDbType.NVarChar));
            }
            //使用者姓名
            if (!string.IsNullOrEmpty(l_Search.PASS_NA))
            {
                l_SQL = l_SQL + "  AND (IsNull(m.PASS_NA,'') like '%'+@PASS_NA+'%')"; //like '%'+@PASS_NA+'%')";
                e.ht.Add("@PASS_NA", new StructureSQLParameter(l_Search.PASS_NA, SqlDbType.NVarChar));
            }
            //使用者區分
            if (!string.IsNullOrEmpty(l_Search.PASS_CODE))
            {
                l_SQL = l_SQL + "  AND (IsNull(m.PASS_CODE,'') like '%'+@PASS_CODE+'%')"; //like '%'+@PASS_CODE+'%')";
                e.ht.Add("@PASS_CODE", new StructureSQLParameter(l_Search.PASS_CODE, SqlDbType.Char));
            }
            e.MasterSQL = e.MasterSQL.Replace("1=1", "1=1 " + l_SQL);
            //部門
            if (!string.IsNullOrEmpty(l_Search.DPD_NO))
            {
                l_SQL = l_SQL + " AND (IsNull(m.DPD_NO,'') = @DPD_NO )";
                e.ht.Add("@DPD_NO", new StructureSQLParameter(l_Search.DPD_NO, SqlDbType.NVarChar));
            }
            e.MasterSQL = e.MasterSQL.Replace("1=1", "1=1 " + l_SQL);
        }

        void l_Master_RefreshMasterData(object sender, RefreshMasterDataEventArgs e)
        {
            string l_SQL = @"
                AND M.PASS_NO = @PASS_NO ";
            e.ht.Add("@PASS_NO", new StructureSQLParameter(e.newRow["PASS_NO"].ToString(), SqlDbType.NVarChar));
            e.MasterSQL = e.MasterSQL.Replace("1=1", "1=1 " + l_SQL);
        }

        //回傳Details的定義
        public DetailClass[] getDetails()
        {
            //Detail1 SQL
            StringBuilder l_SQL_D = new StringBuilder();
            l_SQL_D.Append(" SELECT M.*,D.PROG_NO,D.PROG_NA ");
            l_SQL_D.Append("  FROM SYSDTPMI M ");
            l_SQL_D.Append("  LEFT OUTER JOIN SYSMNUMI D ON  D.ID = M.MNUID ");
            l_SQL_D.Append("  WHERE 1=1 ");
            l_SQL_D.Append("   AND M.PASS_NO = @PASS_NO ");
            l_SQL_D.Append("  ORDER BY M.MNUID ");

            //Detail2 SQL
            StringBuilder l_SQL_D2 = new StringBuilder();
            l_SQL_D2.Append(" SELECT M.*,P.PASS_NA, P.DPD_NO ");
            l_SQL_D2.Append("  FROM SYSPTGMI M ");
            l_SQL_D2.Append("  LEFT OUTER JOIN SYSPASMI P ON   P.PASS_NO = M.GPASS_NO ");
            l_SQL_D2.Append("   AND P.PASS_CODE = '1' ");
            l_SQL_D2.Append("  WHERE 1=1 ");
            l_SQL_D2.Append("   AND M.PASS_NO = @PASS_NO ");
            l_SQL_D2.Append("  ORDER BY M.PASS_NO ");

            //回傳Detail Object
            return new DetailClass[2]
            {
		            //Detail 1
		            new DetailClass()
                    {
                        tableName = "SYSDTPMI",
                        sQL = l_SQL_D.ToString(),
                        keyField = new string[] { "PASS_NO","MNUID"},
                        linkKey_M = new string[1] { "PASS_NO" },
                        linkKey = new string[1] { "PASS_NO"},
                        notNullField = new string[] { "MNUID","PASS_CODE" },//不可空白欄位
			            noEditButInsertField = null,//不可編輯,但可新增欄位
			            noEditField = new string[4] { "UPD_NO","UPD_DATE", "CRT_NO", "CRT_DATE" },//不可編輯欄位
			            noCopyField = null,//不可複製欄位
		            },
                    //Detail 2
		            new DetailClass()
                    {
                        tableName = "SYSPTGMI",
                        sQL = l_SQL_D2.ToString(),
                        keyField = new string[2] { "PASS_NO","GPASS_NO"},
                        linkKey_M = new string[1] { "PASS_NO" },
                        linkKey = new string[1] { "PASS_NO"},
                        notNullField = new string[1] { "GPASS_NO" },//不可空白欄位
			            noEditButInsertField = null,//不可編輯,但可新增欄位
			            noEditField = new string[4] { "UPD_NO","UPD_DATE", "CRT_NO", "CRT_DATE" },//不可編輯欄位
			            noCopyField = null,//不可複製欄位
		            }
            };
        }

        /// <summary>
        /// ----列印  Print----------------------------------------------
        /// Post: /api/api程式名稱/Print
        /// </summary>
        /// <returns>return Dictionary<string, object></returns>
        [HttpPost]
        [Route("Print")]
        public IActionResult Print([FromBody] SearchClass a_Search)
        {
            DBController dbc = new DBController();

            string l_UseDB = ShareModel.GetAppsettingValue("appSettings", "UseDB");
            string connectionString = ShareModel.GetAppsettingValue("ConnectionStrings", l_UseDB);

            string passNo = UserInfo.getUserInfo(_httpContextAccessor.HttpContext.Request.Headers.Authorization).PNO;

            //設定報表
            List <FastReportContent> fastReportContents = new List<FastReportContent>
            {
                //報表名稱,參數,起始頁碼,資料
                new FastReportContent("TEST.frx", "Table", new Dictionary<string, string>{ { "PASS_NO", passNo } }, 0, connectionString)
            };

            FastReportTool fastReportTool = new FastReportTool(fastReportContents, "fastReportDEMO");
            return DoPrintResult(fastReportTool, a_Search.reportKind);
        }

        /// <summary>
        /// ----刷新下拉OpData資料 ----------------------------------------------
        /// Post: /api/api程式名稱/RefreshOpData
        /// </summary>
        /// <returns>return MasterClass</returns>
        [HttpPost]
        [Route("RefreshOpData")]
        public IActionResult RefreshOpData(string[] a_opNames)
        {
            foreach (var l_opName in a_opNames)
            {

                if (l_opName == "STR_NO")
                    //加入來自SQL的下拉，命名為STR_NO
                    //l_Master.addOpData("STR_NO", SqlHelper.STR_NO);
                    //if (l_opName == "ROL_NO")
                    //加入來自SQL的下拉，命名為ROL_NO
                    // l_Master.addOpData("ROL_NO", SqlHelper.ROL_NO);
                    if (l_opName == "GPASS_NO")
                        //加入來自SQL的下拉，命名為GPASS_NO
                        addOpData("GPASS_NO", "select M.PASS_NO as [KEY], M.PASS_NA as  [DESC] from SYSPASMI M  where M.PASS_CODE ='1'  order by [KEY] ");
                if (l_opName == "ROL_NO_D")
                    //加入來自SQL的下拉，命名為ROL_NO_D
                    addOpData("ROL_NO_D", "select org_no as [KEY], org_na as  [DESC], org_type+org_type_c as [group] from MKVORGMI  ");
            }
            return doRefreshOpData();
        }

        /// <summary>
        /// ----查詢特定資料 ----------------------------------------------
        /// Post: /api/api程式名稱/QuOther
        /// </summary>
        /// <returns>return DataSet</returns>
        [HttpPost]
        [Route("QuOther")]
        public IActionResult QuOther([FromBody] DeltaQuOther a_delta)
        {
            MasterClass l_Master = getMaster(_httpContextAccessor);
            //檢查參數
            string l_err = UtilityBase.ckDelta(a_delta);
            if (!string.IsNullOrEmpty(l_err))
            {
                return StatusCode(StatusCodes.Status500InternalServerError, l_err);
            }

            StringBuilder l_sb = new StringBuilder();
            Hashtable l_ht = new Hashtable();
            Dictionary<string, object> l_oldRow = a_delta.oldRow;
            string l_name = a_delta.name.ToUpper();
            //欲查詢的資料
            if (l_name == "SYSDTPMI".ToUpper())
            {
                l_sb.Append("Select M.ID MNUID,M.PROG_NO, M.PROG_NA ");
                l_sb.Append(" from SYSMNUMI M ");
                l_sb.Append(" where 1=1 ");
                //加入條件及參數值
                if (!General.isEmpty(l_oldRow, "MNUID"))
                {
                    l_sb.Append("  and M.ID=@MNUID");
                    l_ht.Add("@MNUID", new StructureSQLParameter(l_oldRow["MNUID"], SqlDbType.NVarChar));
                }
                l_sb.Append(" order by M.ID");
                addOpData(l_name, l_sb.ToString(), l_ht);
            }

            //回傳DataSet
            return doQuOther();
        }

        //匯出Excel
        [HttpPost]
        [Route("ExpXls")]
        public IActionResult ExpXls([FromBody] SearchClass a_Search)
        {
            Searching += l_Master_Searching; //加入查詢條件
            //加入欄位定義
            List<XlsColumn> l_cols = new List<XlsColumn>();
            l_cols.Add(new XlsColumn("PASS_NO", "使用者代碼"));
            l_cols.Add(new XlsColumn("PASS_NA", "使用者姓名"));
            l_cols.Add(new XlsColumn("PASS_ENG", "英文名稱"));
            l_cols.Add(new XlsColumn("PASS_WD", "使用者密碼"));
            l_cols.Add(new XlsColumn("PASS_CODE", "使用者區分"));
            l_cols.Add(new XlsColumn("DPD_NO", "部門代碼"));
            l_cols.Add(new XlsColumn("ROS_NO", "店別群組代碼"));
            l_cols.Add(new XlsColumn("ROB_NO", "採購群組代碼"));
            l_cols.Add(new XlsColumn("EMP_NO", "員工代碼"));
            l_cols.Add(new XlsColumn("PASS_TYPE", "使用者等級"));
            l_cols.Add(new XlsColumn("SPE_CODE", "特殊控制碼"));
            l_cols.Add(new XlsColumn("E_MAIL", "E_MAIL"));
            l_cols.Add(new XlsColumn("START_DATE", "生效日期"));
            l_cols.Add(new XlsColumn("END_DATE", "停用日期"));
            l_cols.Add(new XlsColumn("UPD_NO", "異動者代碼"));
            l_cols.Add(new XlsColumn("UPD_DATE", "異動日期"));
            l_cols.Add(new XlsColumn("CRT_NO", "建檔者代碼"));
            l_cols.Add(new XlsColumn("CRT_DATE", "建檔日期"));
            l_cols.Add(new XlsColumn("PWD_RESET_DATE", "密碼重置日"));
            l_cols.Add(new XlsColumn("PWD_CHG_DATE", "密碼修改日"));
            l_cols.Add(new XlsColumn("DPD_NA", "部門"));
            l_cols.Add(new XlsColumn("TEL_M", "手機號碼"));
            return doExpXlsResult(a_Search, l_cols);
        }
    }
}
