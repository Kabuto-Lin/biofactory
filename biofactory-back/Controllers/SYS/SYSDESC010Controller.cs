using KSIKernel_Core;
using KSIKernel_Core.Database;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Sinon_Factory.App_Libs;
using System.Data;
using System.Text;

namespace Sinon_Factory.Controllers.SYS
{
    [Route("api/[controller]")]
    [ApiController]
    public class apiSYSDESC010Controller : MasterApiController, IApiController.MD
    {
        private IHttpContextAccessor _httpContextAccessor;
        public apiSYSDESC010Controller(IHttpContextAccessor httpContextAccessor) : base(httpContextAccessor)
        {
            _httpContextAccessor = httpContextAccessor;
        }

        [HttpGet]
        [Route("Init")]
        public IActionResult Init()
        {
            Initialing += ApiSYSDESC010Controller_Initialing;
            return doInitResult();
        }

        private void ApiSYSDESC010Controller_Initialing(object sender, EventArgs e)
        {
            addOpData("PARENTID", @" SELECT  * FROM(
SELECT 0 [KEY], ' 根目錄' [DESC]
UNION ALL
SELECT ID AS [KEY],TITLE AS [DESC] FROM [SYSDESCMI] WHERE TYPE=0
)T ORDER BY [DESC] ");

            addOpData("MENU", @" SELECT ID AS [KEY], PROG_NA AS [DESC] FROM SYSMNUMI WHERE MNU_TYPE = 'P' ORDER BY PARENTID,SORTNO ");
        }

        [HttpPost]
        [Route("Insert")]
        public IActionResult Insert([FromBody] DeltaMD a_dr)
        {
            RefreshMasterData += l_Master_RefreshMasterData;
            return doPostResult(enStatus.Insert, a_dr);
        }

        [HttpPost]
        [Route("Delete")]
        public IActionResult Delete([FromBody] DeltaMD a_dr)
        {
            return doPostResult(enStatus.Delete, a_dr);
        }

        [HttpPost]
        [Route("Edit")]
        public IActionResult Edit([FromBody] DeltaMD a_dr)
        {
            RefreshMasterData += l_Master_RefreshMasterData;
            return doPostResult(enStatus.Edit, a_dr);
        }

        public override MasterClass getMaster(IHttpContextAccessor httpContextAccessor)
        {
            //SQL必須加入1=1條件
            StringBuilder l_SQL = new StringBuilder();
            l_SQL.Append(@" Select M.* From SYSDESCMI M Where 1=1 order by m.ParentId,m.Sort,m.Id ");
            return new MasterClass()
            {
                tableName = "SYSDESCMI",
                isNoDataFirstLoad = false, //程式第一次載入時是否有資料
                sQL = l_SQL.ToString().ToUpper(),
                keyField = new string[] { "ID" },
                notNullField = new string[] { "PARENTID", "TYPE", "TITLE" },//不可空白欄位
                noEditButInsertField = new string[] { "TYPE" },//不可編輯,但可新增欄位
                noEditField = new string[] { "ID" }, //不可編輯欄位 
                searchData = new SearchClass() { TITLE = "", PARENTID = -1, TYPE = "" }//查詢條件預設值
            };
        }

        public class SearchClass : ISearchClass
        {
            public string TITLE { get; set; }
            public int PARENTID { get; set; }
            public string TYPE { get; set; }
        }

        [HttpPost]
        [Route("Search")]
        public IActionResult Search([FromBody] SearchClass a_Search)
        {
            Searching += l_Master_Searching;
            return doSearchResult(a_Search);
        }

        void l_Master_Searching(object sender, SearchingEventArgs e)
        {
            SearchClass l_Search = (SearchClass)e.SearchData;
            string l_SQL = "";
            //標題
            if (!string.IsNullOrEmpty(l_Search.TITLE))
            {
                l_SQL = l_SQL + " AND (IsNull(m.TITLE,'') like '%'+@TITLE+'%')";
                e.ht.Add("@TITLE", new StructureSQLParameter(l_Search.TITLE, SqlDbType.NVarChar));
            }
            //目錄
            if (l_Search.PARENTID != -1)
            {
                l_SQL = l_SQL + " AND m.PARENTID = @PARENTID ";
                e.ht.Add("@PARENTID", new StructureSQLParameter(l_Search.PARENTID, SqlDbType.Int));
            }
            //類型 0:目錄 1:說明
            if (!string.IsNullOrEmpty(l_Search.TYPE))
            {
                l_SQL = l_SQL + " AND m.TYPE = @TYPE ";
                e.ht.Add("@TYPE", new StructureSQLParameter(l_Search.TYPE, SqlDbType.NVarChar));
            }
            e.MasterSQL = e.MasterSQL.Replace("1=1", "1=1 " + l_SQL);
        }

        void l_Master_RefreshMasterData(object sender, RefreshMasterDataEventArgs e)
        {
            string l_SQL = @" AND M.ID = @ID ";
            e.ht.Add("@ID", new StructureSQLParameter(e.newRow["ID"].ToString(), SqlDbType.Int));
            e.MasterSQL = e.MasterSQL.Replace("1=1", "1=1 " + l_SQL);
        }

        public DetailClass[] getDetails()
        {
            //請購科目明細
            string l_SQL_D1 = @" SELECT MP.ID,MP.MNUID,MNU.PROG_NA FROM SYSDESCMP MP
  JOIN SYSMNUMI MNU ON MP.MNUID = MNU.ID
  WHERE 1=1 AND MP.ID = @ID
  ORDER BY MP.ID,MP.MNUID ";
            //回傳Detail Object
            return new DetailClass[1]
            {
					//請購科目明細
					new DetailClass()
                    {
                        tableName = "SYSDESCMP",
                        sQL = l_SQL_D1.ToString(),
                        keyField = new string[2] { "ID", "MNUID"},
                        linkKey_M = new string[1] {"ID" },
                        linkKey = new string[1] { "ID" },
                        notNullField = new string[] { "MNUID" },//不可空白欄位
						noEditButInsertField = new string[0] {},//不可編輯,但可新增欄位
						noEditField = new string[0] {   },//不可編輯欄位
						noCopyField = new string[0] { },//不可複製欄位
						rptNa = "明細",
                    }
            };
        }

        [HttpPost]
        [Route("Detail")]
        public IActionResult Detail([FromBody] DeltaMD a_dr)
        {
            return doGetDetailResult(a_dr);
        }
    }
}
