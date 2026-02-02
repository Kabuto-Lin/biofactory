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
    public class apiSYSPAS010Q1Controller : MasterApiController, IApiController.Q
    {
        private IHttpContextAccessor _httpContextAccessor;
        public apiSYSPAS010Q1Controller(IHttpContextAccessor httpContextAccessor) : base(httpContextAccessor)
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
            //加入來自SYSCOMMI COMM_NO='SYS_ID'的下拉，命名為COMSYS_ID
            addOpDataWithCom("COMSYS_ID", "SYS_ID");
            //加入來自SQL的下拉，命名為BUYER
            //   this.addOpData("BUYER", "Select BUY_NO as [KEY], BUY_NA as [DESC] from SYSBUYMI M order by M.BUY_NO ");//命名為COMSYS_ID
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
            l_SQL.Append(" select dpd_sn,dpd_no,dpd_na  ");
            l_SQL.Append("   from SYSDPDMI  m");
            l_SQL.Append(" where 1=1  AND m.dpd_no <>'' ");
            l_SQL.Append(" order by m.dpd_sn ,m.dpd_no  ");
            //回傳Master Object 
            return new MasterClass()
            {
                tableName = "SYSDPDMI",
                isNoDataFirstLoad = true, //程式第一次載入時是否有資料
                sQL = l_SQL.ToString().ToUpper(),
                keyField = new string[0] { },
                notNullField = new string[0] { },//不可空白欄位
                noEditButInsertField = new string[0] { },//不可編輯,但可新增欄位
                noEditField = new string[0] { }, //不可編輯欄位 
                noCopyField = null,//不複製欄位
                searchData = new SearchClass() { },//查詢條件預設值
                rptNa = ""
            };
        }


        //定義查詢欄位內容（欄位請一律用大寫）
        public class SearchClass : ISearchClass
        {
            //代碼
            public string DEPTNO { get; set; }

        }

        //查詢事件，組SQL
        void l_Master_Searching(object sender, SearchingEventArgs e)
        {
            SearchClass l_Search = (SearchClass)e.SearchData;
            string l_SQL = "";

            //代碼
            if (!string.IsNullOrEmpty(l_Search.DEPTNO))
            {
                l_SQL = l_SQL + "  and (m.dpd_sn = @DEPTNO or m.dpd_no = @DEPTNO )  ";
                e.ht.Add("@DEPTNO", new StructureSQLParameter(l_Search.DEPTNO, SqlDbType.NVarChar));
            }

            e.MasterSQL = e.MasterSQL.Replace("1=1", "1=1 " + l_SQL);
        }

        [HttpPost]
        [Route("RefreshOpData")]
        public IActionResult RefreshOpData(string[] a_opNames)
        {
            foreach (var l_opName in a_opNames)
            {
                if (l_opName == "COMSYS_ID")
                    //加入來自SYSCOMMI COMM_NO='SYS_ID'的下拉，命名為COMSYS_ID
                    addOpDataWithCom("COMSYS_ID", "SYS_ID");
                //if (l_opName == "BUYER")
                //加入來自SQL的下拉，命名為BUYER
                //    l_Master.addOpData("BUYER", "Select BUY_NO as [KEY], BUY_NA as [DESC] from SYSBUYMI M order by M.BUY_NO ");//命名為COMSYS_ID
                if (l_opName == "MNU_NO")
                    //加入來自SQL的下拉，命名為BUYER
                    addOpData("MNU_NO", "Select distinct prog_no as [KEY],prog_no +' '+ prog_na as [DESC] from SYSMNUMI where mnu_type='M' order by prog_no   ");//命名為COMSYS_ID

            }
            return doRefreshOpData();
        }
    }
}
