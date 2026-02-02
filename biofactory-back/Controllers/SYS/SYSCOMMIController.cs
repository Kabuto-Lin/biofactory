using KSIKernel_Core;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Text;
using KSIKernel_Core.Database;
using System.Data;
using Sinon_Factory.App_Libs;

namespace Sinon_Factory.Controllers.SYS
{
    [Route("api/[controller]")]
    [ApiController]
    public class apiSYSCOMMIController : MasterApiController, IApiController.MD
    {
        private IHttpContextAccessor _httpContextAccessor;
        public apiSYSCOMMIController(IHttpContextAccessor httpContextAccessor) : base(httpContextAccessor)
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
            //加入來自SYSCOMMI COMM_NO='SYS_ID'的下拉，命名為COMSYS_ID
            addOpDataWithCom("COMSYS_ID", "SYS_ID");
            addOpDataWithCom("COMPARA_CODE", "SYSPARA_CODE");
        }
        public override MasterClass getMaster(IHttpContextAccessor httpContextAccessor)
        {
            //SQL必須加入1=1條件
            StringBuilder l_SQL = new StringBuilder();
            l_SQL.Append("select m.* , d.CODE_TXT as sys_id_c ");
            l_SQL.Append("from SYSCOM01 m  ");
            l_SQL.Append("  left outer join SYSCOMMI d on d.CODE_NO=m.SYS_ID and d.COMM_NO='SYS_ID' ");
            l_SQL.Append(" where 1=1 ");
            l_SQL.Append("order by COMM_NO ");
            //回傳Master Object 
            return new MasterClass()
            {
                tableName = "SYSCOM01",
                isNoDataFirstLoad = false, //程式第一次載入時是否有資料
                sQL = l_SQL.ToString().ToUpper(),
                keyField = new string[1] { "COMM_NO" },
                notNullField = new string[2] { "COMM_NO", "COMM_NA" },//不可空白欄位
                noEditButInsertField = new string[1] { "COMM_NO" },//不可編輯,但可新增欄位
                noEditField = new string[4] { "UPD_NO", "UPD_DATE", "CRT_NO", "CRT_DATE" }, //不可編輯欄位 
                noCopyField = null,//不複製欄位
                searchData = new SearchClass() { },//查詢條件預設值
                rptNa = "共通資料維護報表"
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
            return doPostResult(enStatus.Insert, a_dr);
        }
        void l_Master_Posting(object sender, CancelMsgEventArgs e)
        {
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
            //類別代碼
            public string COMM_NO { get; set; }
            //類別中文
            public string COMM_NA { get; set; }
            //系統代碼
            public string SYS_ID { get; set; }

        }

        //查詢事件，組SQL
        void l_Master_Searching(object sender, SearchingEventArgs e)
        {
            SearchClass l_Search = (SearchClass)e.SearchData;
            string l_SQL = "";
            //類別代碼
            if (!string.IsNullOrEmpty(l_Search.COMM_NO))
            {
                l_SQL = l_SQL + " AND (IsNull(m.COMM_NO,'') like '%'+@COMM_NO+'%')";
                e.ht.Add("@COMM_NO", new StructureSQLParameter(l_Search.COMM_NO, SqlDbType.NVarChar));
            }
            //類別中文
            if (!string.IsNullOrEmpty(l_Search.COMM_NA))
            {
                l_SQL = l_SQL + " AND (IsNull(m.COMM_NA,'') like '%'+@COMM_NA+'%'  )";
                e.ht.Add("@COMM_NA", new StructureSQLParameter(l_Search.COMM_NA, SqlDbType.NVarChar));
            }
            //系統代碼
            if (!string.IsNullOrEmpty(l_Search.SYS_ID))
            {
                l_SQL = l_SQL + " AND (IsNull(m.SYS_ID,'') = @SYS_ID )";
                e.ht.Add("@SYS_ID", new StructureSQLParameter(l_Search.SYS_ID, SqlDbType.NVarChar));
            }
            e.MasterSQL = e.MasterSQL.Replace("1=1", "1=1 " + l_SQL);
        }

        //回傳Details的定義
        public DetailClass[] getDetails()
        {
            //Detail SQL
            StringBuilder l_SQL_D = new StringBuilder();
            l_SQL_D.Append(" SELECT * ");
            l_SQL_D.Append("   FROM SYSCOMMI M ");
            l_SQL_D.Append("  WHERE 1=1 ");
            l_SQL_D.Append("    AND COMM_NO = @COMM_NO ");
            l_SQL_D.Append("  ORDER BY CODE_NO ");

            //回傳Detail Object
            return new DetailClass[1]
            {
                //Detail 1
                new DetailClass()
                {
                tableName = "SYSCOMMI",
                sQL = l_SQL_D.ToString(),
                keyField = new string[2] { "COMM_NO", "CODE_NO"},
                linkKey_M = new string[1] { "COMM_NO" },
                linkKey = new string[1] { "COMM_NO"},
                notNullField = new string[1] { "CODE_NO" },//不可空白欄位
                noEditButInsertField = new string[1] { "CODE_NO" },//不可編輯,但可新增欄位
                noEditField = new string[4] { "UPD_NO","UPD_DATE", "CRT_NO", "CRT_DATE" },//不可編輯欄位
                noCopyField = null,//不可複製欄位
                }
            };
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
                    //加入來自SYSCOMMI COMM_NO='SYS_ID'的下拉，命名為COMSYS_ID
                    addOpDataWithCom("COMSYS_ID", "SYS_ID");
            }
            return doRefreshOpData();
        }

        //匯出Excel
        [HttpPost]
        [Route("ExpXls")]
        public IActionResult ExpXls([FromBody] SearchClass a_Search)
        {
            Searching += l_Master_Searching; //加入查詢條件
            //加入欄位定義
            List<XlsColumn> l_cols = new List<XlsColumn>();
            l_cols.Add(new XlsColumn("COMM_NO", "類別代碼"));
            l_cols.Add(new XlsColumn("CODE_NO", "代號名稱"));
            l_cols.Add(new XlsColumn("CODE_TXT", "代號內容"));
            l_cols.Add(new XlsColumn("PARA_CODE", "參數屬性"));
            l_cols.Add(new XlsColumn("PARA_CHR1", "文字參數1"));
            l_cols.Add(new XlsColumn("PARA_CHR2", "文字參數2"));
            l_cols.Add(new XlsColumn("PARA_CHR3", "文字參數3"));
            l_cols.Add(new XlsColumn("PARA_NUM1", "數字參數1"));
            l_cols.Add(new XlsColumn("PARA_NUM2", "數字參數2"));
            l_cols.Add(new XlsColumn("PARA_NUM3", "數字參數3"));
            l_cols.Add(new XlsColumn("PARA_DATE1", "日期參數1"));
            l_cols.Add(new XlsColumn("PARA_DATE2", "日期參數2"));
            l_cols.Add(new XlsColumn("PARA_DATE3", "日期參數3"));
            l_cols.Add(new XlsColumn("DEL_YN", "刪除碼"));
            l_cols.Add(new XlsColumn("MEMO", "備註"));
            l_cols.Add(new XlsColumn("UPD_NO", "異動人員"));
            l_cols.Add(new XlsColumn("UPD_DATE", "異動日期"));
            l_cols.Add(new XlsColumn("CRT_NO", "建檔人員"));
            l_cols.Add(new XlsColumn("CRT_DATE", "建檔日期"));
            return doExpXlsResult(a_Search, l_cols);
        }
    }
}
