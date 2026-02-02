using FastReport.Utils;
using KSIKernel_Core;
using KSIKernel_Core.Database;
using KSIKernel_Core.Report;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Sinon_Factory.App_Libs;
using System.Collections;
using System.Data;
using System.Text;
using System.Web;

namespace Sinon_Factory.Controllers.SYS
{
    [Route("api/[controller]")]
    [ApiController]
    public class apiSYSNEWS020Controller : MasterApiController, IApiController.M
    {
        private IHttpContextAccessor _httpContextAccessor;
        public apiSYSNEWS020Controller(IHttpContextAccessor httpContextAccessor) : base(httpContextAccessor)
        {
            _httpContextAccessor = httpContextAccessor;
        }

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
            return doInitResult();
        }

        void l_Master_Initialing(object sender, EventArgs e)
        {
            MasterClass l_Master = (MasterClass)sender;
        }
        /// <summary>
        /// ----查詢doSearch ----------------------------------------------
        /// Post: /api/api程式名稱/Search
        /// </summary>
        /// <returns>return TransDataClass</returns>
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
            Posting += l_Master_Posting;
            return doPostResult(enStatus.Delete, a_dr);
        }


        public override MasterClass getMaster(IHttpContextAccessor httpContextAccessor)
        {
            //SQL必須加入1=1條件
            StringBuilder l_SQL = new StringBuilder();
            l_SQL.Append(@"SELECT mi.news_no
,isNull(ti.isread,'') as isread
      ,mi.news_date
      ,mi.news_bdate
      ,mi.news_edate
      ,mi.news_title
      ,mi.news_content
      ,mi.news_isover
      ,mi.news_weight
      ,mi.crt_user
    ,pa.pass_na crt_userna
  FROM SYSNEWSMI mi
  Left Join SYSNEWSTI ti on (ti.news_no = mi.news_no and ti.pass_no = @PASS_NO) 
Left Join SYSPASMI pa on (pa.pass_no = mi.crt_user)
  where 1=1 
  and mi.news_isover = '0'
  and (MI.NEWS_BDATE is null or MI.NEWS_BDATE <= GETDATE())
  and (MI.NEWS_EDATE is null or MI.NEWS_EDATE >= GETDATE())
order by mi.news_date desc,mi.news_weight desc ");
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
                searchData = new SearchClass() { ISREAD = "0" },//查詢條件預設值
            };
        }


        //定義查詢欄位內容（欄位請一律用大寫）
        //定義查詢欄位內容（欄位請一律用大寫）
        public class SearchClass : ISearchClass
        {
            public string ISREAD { get; set; }
        }

        //查詢事件，組SQL
        void l_Master_Searching(object sender, SearchingEventArgs e)
        {
            SearchClass l_Search = (SearchClass)e.SearchData;
            string l_SQL = "";
            e.ht.Add("@PASS_NO", new StructureSQLParameter(UserInfo.getUserInfo(_httpContextAccessor.HttpContext.Request.Headers.Authorization).PNO, SqlDbType.VarChar));
            if (General.nvl(l_Search.ISREAD, "").ToString() != "")
            {
                l_SQL = "  and isNull(ti.isread,'0') = @ISREAD /*'1'已讀 '0'未讀*/";
                e.ht.Add("@ISREAD", new StructureSQLParameter(l_Search.ISREAD, SqlDbType.VarChar));
            }

            e.MasterSQL = e.MasterSQL.Replace("1=1", "1=1 " + l_SQL);
        }

        [HttpPost]
        [Route("QuOther")]
        public IActionResult QuOther([FromBody] DeltaQuOther a_delta)
        {
            if (a_delta.name.ToUpper() == "READED")
            {
                DBController l_dbc = new DBController();
                StringBuilder l_SQL = new StringBuilder();

                string strNewsNo = a_delta.oldRow["NEWS_NO"].ToString();
                string strIsRead = a_delta.oldRow["ISREAD"].ToString();
                string strPass_no = UserInfo.getUserInfo(_httpContextAccessor.HttpContext.Request.Headers.Authorization).PNO;
                string strNowDateTime = DateTime.Now.Year - 1911 + DateTime.Now.ToString("MMdd") + DateTime.Now.ToString("HHmmss");

                if (strIsRead == "")
                {
                    l_SQL.Append("  INSERT INTO [SYSNEWSTI] ([NEWS_NO],[PASS_NO],[ISREAD],[UPD_NO],[UPD_DATE],[CRT_NO],[CRT_DATE]) VALUES (@NEWS_NO, @PASS_NO, '1', @PASS_NO, @NOW_DATETIME, @PASS_NO, @NOW_DATETIME) ");
                }
                else if (strIsRead == "0")
                {
                    l_SQL.Append(" UPDATE [SYSNEWSTI] SET ISREAD = '1' , UPD_DATE = @NOW_DATETIME, UPD_NO = @PASS_NO WHERE NEWS_NO = @NEWS_NO AND PASS_NO = @PASS_NO ");
                }

                Hashtable l_ht = new Hashtable();
                l_ht.Clear();
                l_ht.Add("@NEWS_NO", new StructureSQLParameter(strNewsNo, SqlDbType.VarChar));
                l_ht.Add("@PASS_NO", new StructureSQLParameter(strPass_no, SqlDbType.NVarChar));
                l_ht.Add("@NOW_DATETIME", new StructureSQLParameter(strNowDateTime, SqlDbType.VarChar));

                l_dbc.DbExecuteNonQuery(l_SQL.ToString(), l_ht);

                Dictionary<string, object> a_dr = new Dictionary<string, object>();
                a_dr.Add("no", strNewsNo);
                //回傳DataSet
                return new OkObjectResult(a_dr);
            }

            //回傳DataSet
            return doQuOther();
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

            }
            if (e.status == enStatus.Edit)
            {
            }

            if (e.status == enStatus.Delete)
            {
            }

        }
    }
}
