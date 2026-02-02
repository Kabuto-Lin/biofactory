using FastReport.Export.Dbf;
using KSIKernel_Core;
using KSIKernel_Core.Database;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using Newtonsoft.Json;
using Sinon_Factory.App_Libs;
using System.Collections;
using System.Data;
using System.Text.Json.Nodes;

namespace Sinon_Factory.Controllers.SYS
{
    [Route("api/[controller]")]
    [ApiController]
    public class apiIndexController : ControllerBase
    {
        private IHttpContextAccessor _httpContextAccessor;
        public apiIndexController(IHttpContextAccessor httpContextAccessor) 
        {
            _httpContextAccessor = httpContextAccessor;
        }

        [Authorize]
        [HttpGet]
        [Route("LoadMenu")]
        public IActionResult LoadMenu()
        {
            string l_SQL = @"";
            if (UserInfo.getUserInfo(_httpContextAccessor.HttpContext.Request.Headers.Authorization).IsSupUser)
            {
                l_SQL = @" WITH A    ( LEVEL,ID,parentId,PROG_NA ,PROG_NO, PROG_ID, ITEM_NO, MNU_TYPE, url_path, clt_ok )   
                AS( SELECT  1,ID,parentId,PROG_NA ,PROG_NO, PROG_ID, SORTNO, MNU_TYPE , url_path, clt_ok    
                FROM SYSMNUMI           
                WHERE ParentId = 0    
                UNION ALL            
                SELECT  A.LEVEL + 1,M.ID,M.parentId,M.PROG_NA ,M.PROG_NO,       
                M.PROG_ID, M.SORTNO, M.MNU_TYPE , M.url_path , M.clt_ok         
                FROM SYSMNUMI M INNER JOIN A ON  A.ID = M.parentId  
                )

                select A.ID,A.parentId, A.prog_no,  case when L.name is null then A.prog_na else L.name end as text,   A.prog_id,    
                case when A.mnu_type = 'P' then case when A.clt_ok ='Y' then A.mnu_type else 'N' end else A.mnu_type end as type,    
                A.url_path   from A   left join sysmnulng L on ( A.ID = L.mnuId and @CULTURE_ID <> -1 and @CULTURE_ID = L.ID )   
                where 1=1   ORDER BY A.parentId, A.ITEM_NO  ";
            }
            else
            {
                l_SQL = @" WITH A ( LEVEL,ID,parentId,PROG_NA ,PROG_NO, PROG_ID, ITEM_NO, MNU_TYPE, url_path, clt_ok )   
                 AS (SELECT 1, 
            	 M.id,
            	 M.parentId,
                            M.PROG_NA, 
                            M.PROG_NO, 
                            M.PROG_ID, 
                            M.SORTNO, 
                            M.MNU_TYPE, 
                            M.url_path, 
                            M.clt_ok
                     FROM SYSMNUMI M
                          INNER JOIN SYSPASMV P ON P.PASS_NO = @PASS_NO
                                                   AND (ISNULL(P.CAN_USE, 'N') <> 'N')
                                                   AND P.ID = M.ID
                                                   AND p.Display = 'Y'
                UNION ALL            
                SELECT  A.LEVEL + 1,M.ID,M.parentId,M.PROG_NA ,M.PROG_NO,       
                M.PROG_ID, M.SORTNO, M.MNU_TYPE , M.url_path , M.clt_ok         
                FROM SYSMNUMI M INNER JOIN A ON  A.parentId = M.ID )

                select distinct A.ID,A.parentId, A.prog_no,  case when L.name is null then A.prog_na else L.name end as text,   A.prog_id,    
                case when A.mnu_type = 'P' then case when A.clt_ok ='Y' then A.mnu_type else 'N' end else A.mnu_type end as type,    
                A.url_path,A.ITEM_NO   from A   left join sysmnulng L on ( A.ID = L.mnuId and @CULTURE_ID <> -1 and @CULTURE_ID = L.ID )   
                where 1=1   order by A.parentId,A.ITEM_NO ";
            }

            DBController dbc = new DBController();
            Hashtable ht = new Hashtable();

            int cultureCode = -1;
            //cultureCode = (int)CultureHelper.getCurrentLanguage();
            ht.Add("@CULTURE_ID", new StructureSQLParameter(cultureCode, SqlDbType.Decimal));
            
            var token = General.nvl(_httpContextAccessor.HttpContext?.Request.Headers.Authorization, "").ToString().Replace("Bearer ", "");
            string pass_no = UserInfo.getUserInfo(token).PNO;
            ht.Add("@PASS_NO", new StructureSQLParameter(pass_no, SqlDbType.VarChar));
            List<Record> records = dbc.FillToList<Record>(l_SQL, ht);

            // 樹狀結構
            List<TreeNode> tree = BuildTree(records, 0);

            return new OkObjectResult(JsonConvert.SerializeObject(tree));
        }

        private List<TreeNode> BuildTree(List<Record> data, int parentID)
        {
            var result = new List<TreeNode>();

            foreach (var item in data)
            {
                if (item.PARENTID == parentID)
                {
                    var children = BuildTree(data, item.ID);
                    var child = new TreeNode
                    {
                        id = item.ID,
                        label = item.TEXT,
                        url_path = item.URL_PATH,
                        url = item.PROG_NO,
                        children = children.Count() == 0 ? null : children
                    };
                    result.Add(child);
                }
            }

            return result;
        }

        // menu
        private class Record
        {
            public int ID { get; set; }
            public int PARENTID { get; set; }
            public string PROG_NO { get; set; }
            public string TEXT { get; set; }
            public string TYPE { get; set; }
            public string URL_PATH { get; set; }
        }

        // tree
        private class TreeNode
        {
            public int id { get; set; }
            public string label { get; set; }
            public string url_path { get; set; }
            public string url { get; set; }
            public List<TreeNode> children { get; set; }
        }
    }
}
