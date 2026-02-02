using KSIKernel_Core;
using KSIKernel_Core.Database;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Sinon_Factory.App_Libs;
using System.Data;
using System.Text;
using System.Web;

namespace Sinon_Factory.Controllers.SYS
{
    [Route("api/[controller]")]
    [ApiController]
    public class apiSYSNEWS010Controller : MasterApiController, IApiController.M
    {
        private IHttpContextAccessor _httpContextAccessor;
        public apiSYSNEWS010Controller(IHttpContextAccessor httpContextAccessor) : base(httpContextAccessor)
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
            Searched += l_Master_Searched; //加入查詢條件
            Initialing += l_Master_Initialing; //加入下拉元件
            return doInitResult();
        }

        void l_Master_Initialing(object sender, EventArgs e)
        {
            MasterClass l_Master = (MasterClass)sender;
        }

        public override MasterClass getMaster(IHttpContextAccessor httpContextAccessor)
        {
            //SQL必須加入1=1條件
            StringBuilder l_SQL = new StringBuilder();
            l_SQL.Append(@" select m.[news_no]
      ,m.[news_date]
      ,convert(varchar,m.[news_bdate],120) news_bdate
      ,convert(varchar,m.[news_edate],120) news_edate
      ,m.[news_title]
      ,m.[news_content]
      ,m.[news_isover]
      ,m.[news_weight]
      ,m.[upd_no]
      ,m.[upd_date]
      ,m.[crt_no]
      ,m.[crt_date] ");
            l_SQL.Append("from SYSNEWSMI m  ");
            l_SQL.Append(" where 1=1 ");
            l_SQL.Append("order by news_no desc");
            //回傳Master Object 
            return new MasterClass()
            {
                tableName = "SYSNEWSMI",
                isNoDataFirstLoad = false, //程式第一次載入時是否有資料
                sQL = l_SQL.ToString().ToUpper(),
                keyField = new string[1] { "NEWS_NO" },
                keyField_C = new string[1] { "編號" },//主鍵值欄位中文
                notNullField = new string[2] { "NEWS_BDATE", "NEWS_EDATE" },//不可空白欄位
                noEditButInsertField = new string[0] { },//不可編輯,但可新增欄位
                noEditField = new string[5] { "NEWS_NO", "UPD_NO", "UPD_DATE", "CRT_NO", "CRT_DATE" }, //不可編輯欄位
                noCopyField = null,//不複製欄位
                searchData = new SearchClass() { },//查詢條件預設值
                rptNa = "報表"
            };
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
            Posted += l_Master_Posted;
            //l_Master.RefreshMasterData += l_Master_RefreshMasterData;
            return doPostResult(enStatus.Insert, a_dr);
        }

        /// <summary>
        /// Posting事件
        /// </summary>
        /// <param name="sender"></param>
        /// <param name="e"></param>
        void l_Master_Posting(object sender, CancelMsgEventArgs e)
        {
            if (e.status == enStatus.Insert)
            {
                DBController l_dbc = new DBController();
                string strSQL = @"/*[SYSNEWS010].Posting 取單號*/
                    SELECT ISNULL(MAX(M.NEWS_NO),0)+1
                    FROM SYSNEWSMI M";
                string decNo = l_dbc.DbExecuteScalar_Str(strSQL, null);

                e.newRow["NEWS_NO"] = decNo;
                e.newRow["NEWS_DATE"] = UtilityBase.date2Str_YYYMMDD(DateTime.Now);

                e.newRow["NEWS_CONTENT"] = HttpUtility.HtmlEncode(e.newRow["NEWS_CONTENT"].ToString());
                if (e.newRow["NEWS_EDATE"] != null && (string)e.newRow["NEWS_EDATE"] == "")
                    e.newRow["NEWS_EDATE"] = null;
                if (e.newRow["NEWS_BDATE"] != null && (string)e.newRow["NEWS_BDATE"] == "")
                    e.newRow["NEWS_BDATE"] = null;
            }
            if (e.status == enStatus.Edit)
            {

                e.newRow["NEWS_CONTENT"] = HttpUtility.HtmlEncode(e.newRow["NEWS_CONTENT"].ToString());

                if (e.newRow["NEWS_EDATE"] != null && (string)e.newRow["NEWS_EDATE"] == "")
                    e.newRow["NEWS_EDATE"] = null;
                if (e.newRow["NEWS_BDATE"] != null && (string)e.newRow["NEWS_BDATE"] == "")
                    e.newRow["NEWS_BDATE"] = null;

            }

            if (e.status == enStatus.Delete)
            {
            }

        }

        /// <summary>
        /// Posted事件
        /// </summary>
        /// <param name="sender"></param>
        /// <param name="e"></param>
        void l_Master_Posted(object sender, PostedMsgEventArgs e)
        {
            if (e.status == enStatus.Insert)
            {

            }
            if (e.status == enStatus.Edit)
            {
            }

            if (e.status == enStatus.Delete)
            {
            }

            e.newRow["NEWS_CONTENT"] = HttpUtility.HtmlDecode(e.newRow["NEWS_CONTENT"].ToString());
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
            Posted += l_Master_Posted;
            //l_Master.RefreshMasterData += l_Master_RefreshMasterData;
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
            Posting += l_Master_Posting;
            return doPostResult(enStatus.Delete, a_dr);
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
            Searched += l_Master_Searched;
            return doSearchResult(a_Search);
        }

        //定義查詢欄位內容（欄位請一律用大寫）
        //定義查詢欄位內容（欄位請一律用大寫）
        public class SearchClass : ISearchClass
        {
            ////類別代碼
            //public string COMM_NO { get; set; }
            ////類別名稱
            //public string COMM_NA { get; set; }
            ////系統別 
            //public string SYS_ID { get; set; }
        }

        //查詢事件，組SQL
        void l_Master_Searching(object sender, SearchingEventArgs e)
        {
            SearchClass l_Search = (SearchClass)e.SearchData;
            string l_SQL = "";
            //類別代碼
            //if (!string.IsNullOrEmpty(l_Search.COMM_NO))
            //{
            //    l_SQL = l_SQL + " AND (IsNull(m.COMM_NO,'') like '%'+@COMM_NO+'%')";
            //    e.ht.Add("@COMM_NO", new StructureSQLParameter(l_Search.COMM_NO, SqlDbType.NVarChar));
            //}
            ////類別中文
            //if (!string.IsNullOrEmpty(l_Search.COMM_NA))
            //{
            //    l_SQL = l_SQL + " AND (IsNull(m.COMM_NA,'') like '%'+@COMM_NA+'%'  )";
            //    e.ht.Add("@COMM_NA", new StructureSQLParameter(l_Search.COMM_NA, SqlDbType.NVarChar));
            //}
            ////系統代碼
            //if (!string.IsNullOrEmpty(l_Search.SYS_ID))
            //{
            //    l_SQL = l_SQL + " AND (IsNull(m.SYS_ID,'') = @SYS_ID )";
            //    e.ht.Add("@SYS_ID", new StructureSQLParameter(l_Search.SYS_ID, SqlDbType.NVarChar));
            //}

            e.MasterSQL = e.MasterSQL.Replace("1=1", "1=1 " + l_SQL);
        }

        //查詢事件，組SQL
        void l_Master_Searched(object sender, SearchedEventArgs e)
        {
            e.masterData.Columns["NEWS_CONTENT"].ReadOnly = false;
            foreach (DataRow dtRow in e.masterData.Rows)
            {
                dtRow["NEWS_CONTENT"] = HttpUtility.HtmlDecode(dtRow["NEWS_CONTENT"].ToString());
            }
        }

        void l_Master_RefreshMasterData(object sender, RefreshMasterDataEventArgs e)
        {
            string l_SQL = @"
                AND NEWS_NO = @NEWS_NO ";

            e.ht.Add("@SYS_ID", new StructureSQLParameter(e.newRow["NEWS_NO"].ToString(), SqlDbType.NVarChar));
            e.MasterSQL = e.MasterSQL.Replace("1=1", "1=1 " + l_SQL);
        }
    }
}
