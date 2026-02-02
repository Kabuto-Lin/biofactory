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
    public class apiSYSPAS010Q2Controller : MasterApiController, IApiController.Q
    {
        private IHttpContextAccessor _httpContextAccessor;
        public apiSYSPAS010Q2Controller(IHttpContextAccessor httpContextAccessor) : base(httpContextAccessor)
        {
            _httpContextAccessor = httpContextAccessor;
        }
        /// <summary>
        /// ----初始化 initializing ----------------------------------------------
        /// GET: /api/api程式名稱/Init
        /// </summary>
        /// <returns>Return MasterClass</returns>
        [HttpGet]
        [Route("Init")]
        public IActionResult Init()
        {
            Searching += l_Master_Searching; //加入查詢條件
            Initialing += l_Master_Initialing; //加入下拉元件
            // (l_Master.searchData as SearchClass).COMM_NA = myMvcObj.PosLib(System.Web.HttpContext.Current.HttpContext.Session).MK_NO;
            return doInitResult();
        }

        void l_Master_Initialing(object sender, EventArgs e)
        {
            MasterClass l_Master = (MasterClass)sender;
            //加入來自SQL的下拉，命名為STR_NO

            StringBuilder l_SQL = new StringBuilder();
            l_SQL.Append(@"  select '' [KEY], '全部' [DESC]
union all
select dpd_no[KEY], dpd_na[DESC]
from
SYSDPDMI
where dpd_level = 0
order by[KEY]  ");
            addOpData("OpLevel1", l_SQL.ToString());

            StringBuilder l_SQL2 = new StringBuilder();
            l_SQL2.Append(@" select '' [GROUP],'' [KEY], '全部' [DESC]
union all
select dpd_sn[GROUP], dpd_no[KEY], dpd_na[DESC]
from
SYSDPDMI
where dpd_level = 1
order by[KEY] ");
            addOpData("OpLevel2", l_SQL2.ToString());
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
        /// ----主檔批次儲存BatchSave ----------------------------------------------
        /// Post: /api/api程式名稱/BatchSave
        /// </summary>
        /// <returns>return DataTable</returns>
        [HttpPost]
        [Route("BatchSave")]
        public IActionResult BatchSave([FromBody] DeltaMD a_dr)
        {
            return doPostResult(enStatus.BatchSave, a_dr);
        }

        public override MasterClass getMaster(IHttpContextAccessor httpContextAccessor)
        {
            //SQL必須加入1=1條件
            StringBuilder l_SQL = new StringBuilder();
            l_SQL.Append("Select up3.prog_na up3_Prog_Na, up2.prog_na up2_Prog_Na, up.prog_na  up_Prog_NA, ");
            l_SQL.Append("       M.Prog_NO, M.Id, M.PROG_NA,");
            l_SQL.Append("       M.SYS_ID, cast(M.sys_id as nvarchar) + ' ' + com.Code_Txt AS SYS_ID_C ");
            l_SQL.Append(" from SYSMNUMI M ");
            l_SQL.Append("  Left Outer Join SYSMNUMI up On M.ParentId = up.Id ");
            l_SQL.Append("  Left Outer Join SYSMNUMI up2 On up.ParentId = up2.Id ");
            l_SQL.Append("  Left Outer Join SYSMNUMI up3 On up2.ParentId = up3.Id ");
            l_SQL.Append("  Left Outer Join SYSCOMMI com On com.Comm_No = 'SYS_ID' And M.sys_id = com.CODE_NO ");
            l_SQL.Append(" where 1=1 ");
            l_SQL.Append("  and M.MNU_TYPE='P' ");
            l_SQL.Append(" order by up2.ParentId,up.ParentId, M.ParentId, M.Prog_NO ");
            //回傳Master Object 
            return new MasterClass()
            {
                tableName = "SYSMNUMI",
                isNoDataFirstLoad = true, //程式第一次載入時是否有資料
                sQL = l_SQL.ToString().ToUpper(),
                keyField = new string[1] { "PROG_NO" },
                notNullField = null,//new string[2] { "COMM_NO", "COMM_NA" },//不可空白欄位
                noEditButInsertField = null,//new string[1] { "COMM_NO" },//不可編輯,但可新增欄位
                noEditField = null,//new string[3] { "UPD_NO", "CRT_NO", "CRT_DATE" }, //不可編輯欄位 
                noCopyField = null,//不複製欄位
                searchData = new SearchClass() { PROG_NOA = "", MNU_TYPE = "" }//查詢條件預設值
            };
        }


        //定義查詢欄位內容（欄位請一律用大寫）
        public class SearchClass : ISearchClass
        {
            //程式ID
            public string ID { get; set; }
            //程式代碼
            public string PROG_NOA { get; set; }
            //程式名稱
            public string PROG_NA { get; set; }
            //系統代碼
            public string SYS_ID { get; set; }
            //程式/目錄
            public string MNU_TYPE { get; set; }
        }

        //查詢事件，組SQL
        void l_Master_Searching(object sender, SearchingEventArgs e)
        {
            SearchClass l_Search = (SearchClass)e.SearchData;
            string l_SQL = "";

            //程式ID
            if (!string.IsNullOrEmpty(l_Search.ID) && l_Search.ID != "0")
            {
                l_SQL = l_SQL + " AND m.ID = @ID ";
                e.ht.Add("@ID", new StructureSQLParameter(l_Search.ID, SqlDbType.Int));
            }
            //程式代碼
            if (!string.IsNullOrEmpty(l_Search.PROG_NOA))
            {
                l_SQL = l_SQL + " AND (IsNull(m.PROG_NO,'') like '%'+@PROG_NO+'%')";
                e.ht.Add("@PROG_NO", new StructureSQLParameter(l_Search.PROG_NOA, SqlDbType.NVarChar));
            }
            //名稱名稱
            if (!string.IsNullOrEmpty(l_Search.PROG_NA))
            {
                l_SQL = l_SQL + " AND (IsNull(m.PROG_NA,'') like '%'+@PROG_NA+'%'  )";
                e.ht.Add("@PROG_NA", new StructureSQLParameter(l_Search.PROG_NA, SqlDbType.NVarChar));
            }
            //系統代碼
            if (!string.IsNullOrEmpty(l_Search.SYS_ID))
            {
                l_SQL = l_SQL + " AND (IsNull(m.SYS_ID,'') = @SYS_ID )";
                e.ht.Add("@SYS_ID", new StructureSQLParameter(l_Search.SYS_ID, SqlDbType.NVarChar));
            }
            ////程式或目錄
            //if (!string.IsNullOrEmpty(l_Search.MNU_TYPE))
            //{
            //    l_SQL = l_SQL + " AND (m.MNU_TYPE = @MNU_TYPE )";
            //    e.ht.Add("@MNU_TYPE", new StructureSQLParameter(l_Search.MNU_TYPE, SqlDbType.NVarChar));
            //}
            e.MasterSQL = e.MasterSQL.Replace("1=1", "1=1 " + l_SQL);
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
            return doExpXlsResult(a_Search, l_cols);
        }

        //以下為Excel分頁範例, 使用時必須將名稱改為ExpXls  -----------------------------
        [HttpPost]
        [Route("ExpXls2")]
        public IActionResult ExpXls2([FromBody] SearchClass a_Search)
        {
            Searching += l_Master_Searching; //加入查詢條件
            //加入Detail 1 欄位定義
            List<XlsColumn> l_cols_D1 = new List<XlsColumn>();
            l_cols_D1.Add(new XlsColumn("COMM_NO", "類別代碼"));
            l_cols_D1.Add(new XlsColumn("COMM_NA", "類別中文"));
            l_cols_D1.Add(new XlsColumn("SYS_ID", "系統代碼"));
            l_cols_D1.Add(new XlsColumn("SYS_ID_C", "系統中文"));
            l_cols_D1.Add(new XlsColumn("CODE_LEN", "Code長度", XlsColumnType.Int));//設定型別範例
            l_cols_D1.Add(new XlsColumn("TEXT_LEN", "Text長度"));
            l_cols_D1.Add(new XlsColumn("MEMO", "備註"));
            l_cols_D1.Add(new XlsColumn("UPD_NO", "異動者代碼"));
            l_cols_D1.Add(new XlsColumn("UPD_DATE", "異動日期", XlsColumnType.Date));
            l_cols_D1.Add(new XlsColumn("CRT_NO", "建檔者代碼"));
            l_cols_D1.Add(new XlsColumn("CRT_DATE", "建檔日期", XlsColumnType.DateTime, null, "yyyy/mm/dd hh:MM")); //設定型別及格式範例
            //2個分頁
            List<XlsColumn>[] l_detailCols = new List<XlsColumn>[2] { l_cols_D1, l_cols_D1 };

            masterClass.searchData = a_Search;
            masterClass.isPaging = false; //使不分頁
            fillMasterData();
            DataSet l_ds = new DataSet();
            //第1頁資料
            DataTable l_dt1 = masterClass.masterData.Clone(); //複製schema
            l_ds.Tables.Add(l_dt1);
            l_dt1.TableName = "第1頁";
            //複製過濾後第1頁資料 (條件COMM_NO <= '30')
            foreach (DataRow l_row in masterClass.masterData.Select("COMM_NO <= '30'"))
            {
                l_dt1.ImportRow(l_row);
            }
            //第2頁資料
            DataTable l_dt2 = masterClass.masterData.Clone(); //複製schema
            l_ds.Tables.Add(l_dt2);
            l_dt2.TableName = "第2頁";
            //複製過濾後第2頁資料 (條件COMM_NO > '30')
            foreach (DataRow l_row in masterClass.masterData.Select("COMM_NO > '30'"))
            {
                l_dt2.ImportRow(l_row);
            }
            return doExpDetailXlsResult(l_ds, l_detailCols);
        }

        //列印
        [HttpPost]
        [Route("Print")]
        public IActionResult Print([FromBody] SearchClass a_Search)
        {
            throw new NotImplementedException();
        }
    }
}
