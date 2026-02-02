using System;
using Sinon_Factory.App_Libs;
using KSIKernel_Core;
using KSIKernel_Core.Database;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Collections;
using System.Data;
using System.Text;

namespace Sinon_Factory.Controllers.SNA
{
    /// 程式名稱: SNA001F - 通報人員設定作業
    /// 系統代號: SNA
    /// GET : /api/apiSNA001F/Init
    /// POST: /api/apiSNA001F/Search
    [Route("api/[controller]")]
    [ApiController]
    public class apiSNA001FController : MasterApiController, IApiController.MD
    {
        private readonly IHttpContextAccessor _httpContextAccessor;

        public apiSNA001FController(IHttpContextAccessor httpContextAccessor)
            : base(httpContextAccessor)
        {
            _httpContextAccessor = httpContextAccessor;
        }

        /// <summary>
        /// 初始化：載入下拉 +資料
        /// GET: /api/apiSNA001F/Init
        /// </summary>
        [HttpGet]
        [Route("Init")]
        public IActionResult Init()
        {
            // 掛初始化事件（下拉）
            this.Initialing += l_Master_Initialing;

            // 這支程式進畫面就要有資料 
            // 直接交給 Master 做 Init + Search
            return this.doInitResult();
        }

        /// <summary>
        /// 查詢：依通報事件篩選
        /// POST: /api/apiSNA001F/Search
        /// </summary>
        [HttpPost]
        [Route("Search")]
        public IActionResult Search([FromBody] SearchClass a_Search)
        {
            // 把前端查詢條件丟進 masterClass
            this.masterClass.searchData = a_Search;

            // 掛查詢事件（組 where）
            this.Searching += l_Master_Searching;
            this.Searched += l_Master_Searched;

            return this.doSearchResult(a_Search);
        }

        #region 不支援的動作 (直接回錯誤訊息)

        [HttpPost("Insert")]
        public IActionResult Insert([FromBody] DeltaMD a_dr)
        {
            return BadRequest(new { message = "SNA001F 目前僅提供查詢功能，未開放新增。" });
        }

        [HttpPost("Edit")]
        public IActionResult Edit([FromBody] DeltaMD a_dr)
        {
            return BadRequest(new { message = "SNA001F 目前僅提供查詢功能，未開放修改。" });
        }

        [HttpPost("Delete")]
        public IActionResult Delete([FromBody] DeltaMD a_dr)
        {
            return BadRequest(new { message = "SNA001F 目前僅提供查詢功能，未開放刪除。" });
        }

        [HttpPost("Detail")]
        public IActionResult Detail([FromBody] DeltaMD a_dr)
        {
            return doGetDetailResult(a_dr);
        }

        #endregion

        /// 取得 Master 定義
        public override MasterClass getMaster(IHttpContextAccessor httpContextAccessor)
        {
            // 一定要保留 WHERE 1=1，給 Searching 去 Replace
            StringBuilder l_SQL = new StringBuilder();
            l_SQL.Append(@"
SELECT
    A.ALERTTYPE,
    A.ALERTTYPENAME,
    STUFF((
        SELECT DISTINCT ',' + C2.PASS_NA
        FROM ALERTNOTIFYSET B2
        JOIN SYSPASMI C2
          ON B2.ALERTPASSTYPE = C2.PASS_TYPE
         AND B2.ALERTPASSNO   = C2.PASS_NO
        WHERE B2.ALERTTYPE = A.ALERTTYPE
        FOR XML PATH(''), TYPE
    ).value('.', 'nvarchar(max)'), 1, 1, '') AS ALERTPASSNO_LIST
FROM ALERTTYPE A
WHERE 1=1
  AND EXISTS (
        SELECT 1
        FROM ALERTNOTIFYSET B
        WHERE B.ALERTTYPE = A.ALERTTYPE
  )
ORDER BY A.ALERTTYPE
");

            return new MasterClass()
            {
                tableName = "ALERT_NOTIFY_VIEW",
                // 進畫面就要出現資料 → 設為 false
                isNoDataFirstLoad = false,
                sQL = l_SQL.ToString(),
                keyField = new string[1] { "ALERTTYPE" },
                keyField_C = new string[1] { "通報事件" },
                notNullField = new string[0] { },
                noEditButInsertField = new string[0] { },
                noEditField = new string[0] { },
                noCopyField = null,
                searchData = new SearchClass(),
                rptNa = "通報人員設定"
            };
        }

        /// <summary>查詢條件物件（查詢視窗用）</summary>
        public class SearchClass : ISearchClass
        {
            public string ALERTTYPE { get; set; }   // 通報事件
        }

        /// 查詢事件：組 SQL where 條件

        void l_Master_Searching(object sender, SearchingEventArgs e)
        {
            SearchClass l_Search = (SearchClass)e.SearchData;
            string l_SQL = "";

            if (!string.IsNullOrEmpty(l_Search.ALERTTYPE))
            {
                l_SQL += " AND A.ALERTTYPE = @ALERTTYPE ";
                e.ht.Add("@ALERTTYPE",
                    new StructureSQLParameter(l_Search.ALERTTYPE, SqlDbType.VarChar));
            }

            // 把 where 串回 MasterSQL
            e.MasterSQL = e.MasterSQL.Replace("WHERE 1=1", "WHERE 1=1 " + l_SQL);
        }

        /// <summary>查詢完成事件（目前不用）</summary>
        void l_Master_Searched(object sender, SearchedEventArgs e)
        {
        }

        /// 初始化事件：建立查詢視窗下拉資料

        void l_Master_Initialing(object sender, EventArgs e)
        {
            MasterClass l_Master = (MasterClass)sender;

            DBController dbc = new DBController();
            StringBuilder sql = new StringBuilder();
            sql.Append(@"
SELECT ALERTTYPE AS [KEY],
       ALERTTYPENAME AS [DESC]
FROM ALERTTYPE
ORDER BY ALERTTYPENAME
");

            DataTable dtAlertType = dbc.FillDataTable(sql.ToString(), new Hashtable());
            dtAlertType.TableName = "alerttype_Q1";

            l_Master.opData.Tables.Add(dtAlertType);
        }

        /// <summary>目前沒有明細</summary>
        public DetailClass[] getDetails()
        {
            return new DetailClass[0];
        }
    }
}
