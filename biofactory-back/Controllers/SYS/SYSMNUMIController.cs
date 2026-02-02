using KSIKernel_Core;
using KSIKernel_Core.Database;
using Microsoft.AspNetCore.Mvc;
using Sinon_Factory.App_Libs;
using System.Data;
using System.Text;

namespace Sinon_Factory.Controllers.SYS
{
    [Route("api/[controller]")]
    [ApiController]
    public class apiSYSMNUMIController : MasterApiController, IApiController.MD
    {
        private IHttpContextAccessor _httpContextAccessor;
        public apiSYSMNUMIController(IHttpContextAccessor httpContextAccessor) : base(httpContextAccessor)
        {
            _httpContextAccessor = httpContextAccessor;
        }

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
            //加入來自MKFCOMMI COMM_NO='SYS_ID'的下拉，命名為COMSYS_ID
            addOpDataWithCom("COMSYS_ID", "SYS_ID");
            //加入來自SQL的下拉，命名為BUYER
            addOpData("BUYER", "select code_no as [KEY], code_txt as [DESC] from SYSCOMMI com where com.Comm_No like 'SYS_ID' ");//命名為COMSYS_ID
            addOpData("PARENTID", @" select  * from(
Select 0 [KEY], ' 根目錄' [DESC]
Union all
Select id as [KEY],prog_no +' '+ prog_na as [DESC] from SYSMNUMI where mnu_type='M'
)T order by [DESC] ");//命名為COMSYS_ID

            addOpData("Culture", "SELECT 1 as [KEY], 'zh-TW' as [DESC] UNION SELECT 2 as [KEY], 'zh-CN' as [DESC] UNION SELECT 3 as [KEY], 'en-US' as [DESC]");

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
            return doPostResult(enStatus.Insert, a_dr);
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


        public override MasterClass getMaster(IHttpContextAccessor httpContextAccessor)
        {
            //SQL必須加入1=1條件
            StringBuilder l_SQL = new StringBuilder();
            l_SQL.Append("Select M.*,case when M.ParentId = 0 then '根目錄' else udps.prog_na end up_dpsna,cast(M.sys_id as nvarchar) + ' ' + com.Code_Txt AS SYS_ID_C ");
            l_SQL.Append("from SYSMNUMI M   ");
            l_SQL.Append("  Left Outer Join SYSMNUMI udps On M.ParentId = udps.Id ");
            l_SQL.Append("  Left Outer Join SYSCOMMI com On com.Comm_No = 'SYS_ID' And M.sys_id = com.CODE_NO ");
            l_SQL.Append(" where 1=1 ");
            l_SQL.Append("order by prog_no ");
            //回傳Master Object 
            return new MasterClass()
            {
                tableName = "SYSMNUMI",
                isNoDataFirstLoad = true, //程式第一次載入時是否有資料
                sQL = l_SQL.ToString().ToUpper(),
                keyField = new string[1] { "ID" },
                notNullField = new string[] { "PROG_NO", "PROG_NA", "PROG_ID" },//不可空白欄位
                //noEditButInsertField = new string[1] { "PROG_NO" },//不可編輯,但可新增欄位
                noEditField = new string[4] { "UPD_NO", "CRT_NO", "CRT_DATE", "UPD_DATE" }, //不可編輯欄位 
                noCopyField = null,//不複製欄位
                searchData = new SearchClass() { CLT_OK = "", MNU_TYPE = "" },//查詢條件預設值
                rptNa = "系統選單報表"
            };
        }

        //定義查詢欄位內容（欄位請一律用大寫）
        public class SearchClass : ISearchClass
        {
            //不可空白欄位
            public string[] notNullField
            {
                get { return new string[1] { "PROG_NO" }; }
            }
            //類別代碼
            public string PROG_NO { get; set; }
            //類別中文
            public string PROG_NA { get; set; }
            //階層代碼
            public string SYS_ID { get; set; }
            //程式狀態
            public string CLT_OK { get; set; }
            public string MNU_TYPE { get; set; }

        }
        void l_Master_Searching(object sender, SearchingEventArgs e)
        {
            SearchClass l_Search = (SearchClass)e.SearchData;
            string l_SQL = "";
            //類別代碼
            if (!string.IsNullOrEmpty(l_Search.PROG_NO))
            {
                l_SQL = l_SQL + " AND (IsNull(m.PROG_NO,'') like '%'+@PROG_NO+'%')";
                e.ht.Add("@PROG_NO", new StructureSQLParameter(l_Search.PROG_NO, SqlDbType.NVarChar));
            }
            //類別中文
            if (!string.IsNullOrEmpty(l_Search.PROG_NA))
            {
                l_SQL = l_SQL + " AND (IsNull(m.PROG_NA,'') like '%'+@PROG_NA+'%'  )";
                e.ht.Add("@PROG_NA", new StructureSQLParameter(l_Search.PROG_NA, SqlDbType.NVarChar));
            }
            //階層代碼
            if (!string.IsNullOrEmpty(l_Search.SYS_ID))
            {
                l_SQL = l_SQL + " AND (m.SYS_ID = @SYS_ID )";
                e.ht.Add("@SYS_ID", new StructureSQLParameter(l_Search.SYS_ID, SqlDbType.NVarChar));
            }
            //程式狀態 
            if (!string.IsNullOrEmpty(l_Search.CLT_OK))
            {
                l_SQL = l_SQL + " AND (IsNull(m.CLT_OK,'N') = @CLT_OK )";
                e.ht.Add("@CLT_OK", new StructureSQLParameter(l_Search.CLT_OK, SqlDbType.NVarChar));
            }
            //程式或目錄

            if (!string.IsNullOrEmpty(l_Search.MNU_TYPE))
            {
                l_SQL = l_SQL + " AND (m.MNU_TYPE = @MNU_TYPE )";
                e.ht.Add("@MNU_TYPE", new StructureSQLParameter(l_Search.MNU_TYPE, SqlDbType.NVarChar));
            }
            e.MasterSQL = e.MasterSQL.Replace("1=1", "1=1 " + l_SQL);
        }

        [HttpPost]
        [Route("Detail")]
        public IActionResult Detail([FromBody] DeltaMD a_dr)
        {
            return doGetDetailResult(a_dr);
        }

        //回傳Details的定義
        public DetailClass[] getDetails()
        {
            //請購科目明細
            string l_SQL_D1 = @" select D.* from SYSMNULNG D where 1=1 and  D.MNUID = @MNUID order by D.ID ";
            //回傳Detail Object
            return new DetailClass[1]
            {
					//請購科目明細
					new DetailClass()
                    {
                        tableName = "SYSMNULNG",
                        sQL = l_SQL_D1.ToString(),
                        keyField = new string[] { "MNUID","ID"},
                        linkKey_M = new string[] {"ID" },
                        linkKey = new string[] { "MNUID" },
                        notNullField = new string[2] {"ID","NAME"},//不可空白欄位
						noEditButInsertField = new string[0] {},//不可編輯,但可新增欄位
						noEditField = new string[0] {   },//不可編輯欄位
						noCopyField = new string[1] {"ID"},//不可複製欄位
						rptNa = "語系檔",
                    }
            };
        }



        //匯出Excel
        [HttpPost]
        [Route("ExpXls")]
        public IActionResult ExpXls([FromBody] SearchClass a_Search)
        {
            Searching += l_Master_Searching; //加入查詢條件
            //加入欄位定義
            List<XlsColumn> l_cols = new List<XlsColumn>();
            l_cols.Add(new XlsColumn("UP_DPSNA", "中文"));
            l_cols.Add(new XlsColumn("SORTNO", "排序編號"));
            l_cols.Add(new XlsColumn("PROG_NO", "程式名稱"));
            l_cols.Add(new XlsColumn("PROG_ID", "使用區分"));
            l_cols.Add(new XlsColumn("PROG_NA", "中文名稱"));
            l_cols.Add(new XlsColumn("SYS_ID", "系統別"));
            l_cols.Add(new XlsColumn("MNU_TYPE", "目錄或程式"));
            l_cols.Add(new XlsColumn("CLT_OK", "是否彙整完成"));
            l_cols.Add(new XlsColumn("URL_PATH", "程式路徑"));

            return doExpXlsResult(a_Search, l_cols);
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
                if (l_opName == "COMSYS_ID")
                    //加入來自MKFCOMMI COMM_NO='SYS_ID'的下拉，命名為COMSYS_ID
                    addOpDataWithCom("COMSYS_ID", "SYS_ID");
                //if (l_opName == "BUYER")
                //加入來自SQL的下拉，命名為BUYER
                //    l_Master.addOpData("BUYER", "Select BUY_NO as [KEY], BUY_NA as [DESC] from MKFBUYMI M order by M.BUY_NO ");//命名為COMSYS_ID
                if (l_opName == "PARENTID")
                    //加入來自SQL的下拉，命名為BUYER
                    addOpData("PARENTID", @" select  * from(
Select 0 [KEY], ' 根目錄' [DESC]
Union all
Select id as [KEY],prog_no +' '+ prog_na as [DESC] from SYSMNUMI where mnu_type='M'
)T order by [DESC] ");//命名為COMSYS_ID

            }
            return doRefreshOpData();
        }
    }
}
