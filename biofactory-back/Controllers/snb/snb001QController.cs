using KSIKernel_Core.Database;
using KSIKernel_Core;
using Microsoft.AspNetCore.Mvc;
using System.Data;
using System.Text;
using Sinon_Factory.App_Libs;
using Newtonsoft.Json;
using System.Collections;
using Sinon_Factory.Models.ViewModel;

namespace Sinon_Factory.Controllers.snb
{
    [Route("api/[controller]")]
    [ApiController]
    public class snb001QController : MasterApiController, IApiController.Q
    {
        private IHttpContextAccessor _httpContextAccessor;
        public snb001QController(IHttpContextAccessor httpContextAccessor) : base(httpContextAccessor)
        {
            _httpContextAccessor = httpContextAccessor;
        }

        [HttpGet]
        [Route("Init")]
        public IActionResult Init()
        {
            Initialing += l_Master_Initialing; //加入下拉元件
            return doInitResult();
        }

        void l_Master_Initialing(object sender, EventArgs e)
        {
            this.addOpData("camlocationQL", "SELECT DISTINCT CAMLOCATION AS [KEY] ,CAMLOCATION AS [DESC] FROM CAMINFO WHERE DISPLAYYN='Y'");
        }

        //定義查詢欄位內容（欄位請一律用大寫）
        public class SearchClass : ISearchClass
        {
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
            e.MasterSQL = e.MasterSQL.Replace("1=1", l_SQL);
        }

        public override MasterClass getMaster(IHttpContextAccessor httpContextAccessor)
        {
            StringBuilder l_SQL = new StringBuilder();
            //SQL語法
            string sql = @" select * from CAMINFO
                            where 1=1
                            order by CAMAREA";//查詢未審核以後每一張表單SQL
            l_SQL.Append(sql);

            //流程主檔
            return new MasterClass()
            {
                tableName = "CAMINFO",
                isNoDataFirstLoad = false,
                sQL = l_SQL.ToString().ToUpper(),
                keyField = new string[] { "CAMAREA", "CAMID" },
                keyField_C = new string[] { "", "" },
                notNullField = new string[2] { "CAMAREA", "CAMID" },
                noEditButInsertField = null,
                noEditField = null,
                searchData = new SearchClass() { },
                rptNa = "監控牆"
            };
        }

        #region 其他api
        /// <summary>
        /// ----更新查詢 ----------------------------------------------
        /// Get: /api/api程式名稱/refreshpageYN
        /// </summary>
        /// <returns>return application/json</returns>
        [HttpGet]
        [Route("refreshpageYN")]
        public IActionResult refreshpageYN()
        {
            DataTable dt = new DataTable();
            DBController dbc = new DBController();
            Hashtable ht = new Hashtable();

            try
            {
                string sql = @" SELECT refreshpageYN
                                  FROM refreshpagecheck
                                ";

                dt = dbc.FillDataTable(sql, ht);

                return Content(
                    JsonConvert.SerializeObject(ApiReturnView.Success(dt, "查詢成功")),
                    "application/json"
                );
            }
            catch (Exception ex)
            {
                return Content(
                    JsonConvert.SerializeObject(ApiReturnView.Error("API發生錯誤: " + ex.Message)),
                    "application/json"
                );
            }
        }

        /// <summary>
        /// ----回押flag ----------------------------------------------
        /// Post: /api/api程式名稱/flagchange
        /// </summary>
        /// <returns>return application/json</returns>
        [HttpPost]
        [Route("flagchange")]
        public IActionResult flagchange([FromBody] Dictionary<string, object> data)
        {
            DataTable dt = new DataTable();
            DBController dbc = new DBController();
            Hashtable ht = new Hashtable();

            try
            {
                string sql = @" UPDATE [dbo].[refreshpagecheck]
                                   SET [refreshpageYN] = @refreshpageYN
                                ";
                ht.Add("@refreshpageYN", new StructureSQLParameter(data["refreshpageYN"].ToString(), SqlDbType.NVarChar));

                dt = dbc.FillDataTable(sql, ht);

                return Content(
                    JsonConvert.SerializeObject(ApiReturnView.Success(dt, "修改成功")),
                    "application/json"
                );
            }
            catch (Exception ex)
            {
                return Content(
                    JsonConvert.SerializeObject(ApiReturnView.Error("API發生錯誤: " + ex.Message)),
                    "application/json"
                );
            }
        }

        /// <summary>
        /// ----監控牆查詢 ----------------------------------------------
        /// Post: /api/api程式名稱/camcount
        /// </summary>
        /// <returns>return application/json</returns>
        [HttpPost]
        [Route("camcount")]
        public IActionResult camcount([FromBody] Dictionary<string, object> data)
        {
            DataTable dt = new DataTable();
            DBController dbc = new DBController();
            Hashtable ht = new Hashtable();

            try
            {
                string sql = @" SELECT COUNT(camid) AS CAMCOUNT
                                FROM CAMINFO
                                WHERE DISPLAYYN = 'Y'
                                  AND (@camarea IS NULL OR @camarea = '' OR camarea = @camarea)
                                  AND (
                                      (@alert = '' OR @alert IS NULL)  
                                      OR 
                                      (@alert = '無異常' AND EXISTS ( 
                                          SELECT 1 
                                          FROM [Sinon_Factory].[dbo].[eventalert] e
                                          WHERE e.camarea = CAMINFO.camarea 
                                            AND e.camid = CAMINFO.camid
                                            AND e.alertstatus != '03'
                                      ))
                                  )";
                ht.Add("@camarea", new StructureSQLParameter(data["@camarea"].ToString(), SqlDbType.NVarChar));
                ht.Add("@alert", new StructureSQLParameter(data["alert"].ToString(), SqlDbType.NVarChar));

                dt = dbc.FillDataTable(sql, ht);

                return Content(
                    JsonConvert.SerializeObject(ApiReturnView.Success(dt, "查詢成功")),
                    "application/json"
                );
            }
            catch (Exception ex)
            {
                return Content(
                    JsonConvert.SerializeObject(ApiReturnView.Error("API發生錯誤: " + ex.Message)),
                    "application/json"
                );
            }
        }

        /// <summary>
        /// ----監控牆查詢 ----------------------------------------------
        /// Post: /api/api程式名稱/caminfo
        /// </summary>
        /// <returns>return application/json</returns>
        [HttpPost]
        [Route("caminfo")]
        public IActionResult caminfo([FromBody] Dictionary<string, object> data)
        {
            DataTable dt = new DataTable();
            DBController dbc = new DBController();
            Hashtable ht = new Hashtable();

            try
            {
                string sql = @" select camlocation,camid,camname,alert,alertno,case when alert='無異常'then '#00FF00' else '#FF0000' end textcolor ,imageurl, videourl, rtspurl
                                from (
		                                SELECT camlocation,a.camid,camname,isnull(convert(nvarchar,b.alertno),'') alertno,
		                                case when b.alerttitle is not null then b.alerttitle else '無異常' end alert,
		                                isnull(imageurl,'') imageurl,isnull(videourl,'') videourl,isnull(rtspurl,'') rtspurl
		                                FROM caminfo a
		                                left join eventalert b on a.camarea=b.camarea and  a.camid=b.camid and alertstatus !='03'
		                                where (camlocation=@camlocation or @camlocation='')
		                                and displayyn='y'
                                )m
                                where (alert!=@alert or @alert ='')
                                order by camlocation";
                ht.Add("@camlocation", new StructureSQLParameter(data["camlocation"].ToString(), SqlDbType.NVarChar));
                ht.Add("@alert", new StructureSQLParameter(data["alert"].ToString(), SqlDbType.NVarChar));

                dt = dbc.FillDataTable(sql, ht);

                return Content(
                    JsonConvert.SerializeObject(ApiReturnView.Success(dt, "查詢成功")),
                    "application/json"
                );
            }
            catch (Exception ex)
            {
                return Content(
                    JsonConvert.SerializeObject(ApiReturnView.Error("API發生錯誤: " + ex.Message)),
                    "application/json"
                );
            }
        }

        /// <summary>
        /// ----修改事件狀態 (舊版簡易) ----------------------------------------------
        /// Post: /api/api程式名稱/alertstatusedit
        /// </summary>
        /// <returns>return application/json</returns>
        [HttpPost]
        [Route("alertstatusedit")]
        public IActionResult alertstatusedit([FromBody] Dictionary<string, object> data)
        {
            DataTable dt = new DataTable();
            DBController dbc = new DBController();
            Hashtable ht = new Hashtable();

            try
            {
                string sql = @" UPDATE [dbo].[eventalert]
                                   SET alertstatus='02'
                                 WHERE  alertno=@alertno
                                ";
                ht.Add("@alertno", new StructureSQLParameter(data["alertno"].ToString(), SqlDbType.NVarChar));

                dt = dbc.FillDataTable(sql, ht);

                return Content(
                    JsonConvert.SerializeObject(ApiReturnView.Success(dt, "修改成功")),
                    "application/json"
                );
            }
            catch (Exception ex)
            {
                return Content(
                    JsonConvert.SerializeObject(ApiReturnView.Error("API發生錯誤: " + ex.Message)),
                    "application/json"
                );
            }
        }

        /// <summary>
        /// ----本月事件種類統計 ----------------------------------------------
        /// Get: /api/api程式名稱/alerttypecount
        /// </summary>
        /// <returns>return application/json</returns>
        [HttpGet]
        [Route("alerttypecount")]
        public IActionResult alerttypecount()
        {
            DataTable dt = new DataTable();
            DBController dbc = new DBController();
            Hashtable ht = new Hashtable();

            try
            {
                string sql = @" SELECT alerttypename,count(b.alerttype)　alertcount,alerttypecolor
                                  FROM alerttype a
                                  left join eventalert b on a.alerttype=b.alerttype
                                  and YEAR(b.alerttime)=YEAR(GETDATE())　and month(b.alerttime)=MONTH(GETDATE())
                                  group by alerttypename,alerttypecolor
                                ";

                dt = dbc.FillDataTable(sql, ht);

                return Content(
                    JsonConvert.SerializeObject(ApiReturnView.Success(dt, "查詢成功")),
                    "application/json"
                );
            }
            catch (Exception ex)
            {
                return Content(
                    JsonConvert.SerializeObject(ApiReturnView.Error("API發生錯誤: " + ex.Message)),
                    "application/json"
                );
            }
        }

        /// <summary>
        /// ----本月事件通報 ----------------------------------------------
        /// Get: /api/api程式名稱/alertcount
        /// </summary>
        /// <returns>return application/json</returns>
        [HttpGet]
        [Route("alertcount")]
        public IActionResult alertcount()
        {
            DataTable dt = new DataTable();
            DBController dbc = new DBController();
            Hashtable ht = new Hashtable();

            try
            {
                string sql = @" select alertstatus, count_num
                                from (
                                SELECT '總通報' alertstatus,count(*) count_num,'00' code_no
                                  FROM eventalert a 
                                  where YEAR(a.alerttime)=YEAR(GETDATE())　and month(a.alerttime)=MONTH(GETDATE())
                                 union 
                                SELECT b.code_txt alertstatus,count(*) count_num,code_no
                                  FROM eventalert a
                                  join SYSCOMMI b on b.comm_no='alert_status' and a.alertstatus=b.code_no
                                  where YEAR(a.alerttime)=YEAR(GETDATE())　and month(a.alerttime)=MONTH(GETDATE())
                                  group by b.code_txt,code_no
                                  union 
                                SELECT '過去未結案' alertstatus,count(*) count_num,'04' code_no
                                  FROM eventalert a
                                  join SYSCOMMI b on b.comm_no='alert_status' and a.alertstatus=b.code_no
                                  where YEAR(a.alerttime)+month(a.alerttime)!=YEAR(GETDATE())+MONTH(GETDATE())
                                  and b.code_no!='03'
                                  group by b.code_txt,code_no
                                  )m
                                  order by code_no
                                ";

                dt = dbc.FillDataTable(sql, ht);

                return Content(
                    JsonConvert.SerializeObject(ApiReturnView.Success(dt, "查詢成功")),
                    "application/json"
                );
            }
            catch (Exception ex)
            {
                return Content(
                    JsonConvert.SerializeObject(ApiReturnView.Error("API發生錯誤: " + ex.Message)),
                    "application/json"
                );
            }
        }

        /// <summary>
        /// ----本月事件通報列表 ----------------------------------------------
        /// Get: /api/api程式名稱/alertlist
        /// </summary>
        /// <returns>return application/json</returns>
        [HttpGet]
        [Route("alertlist")]
        public IActionResult alertlist()
        {
            DataTable dt = new DataTable();
            DBController dbc = new DBController();
            Hashtable ht = new Hashtable();

            try
            {
                string sql = @" SELECT alertno,alerttitle,b.camname,a.camid,imageurl,videourl,rtspurl
                                ,convert(varchar(16), alerttime, 120) alerttime,a.alerttype,d.alerttypename,alertitem,pass_na,alertstatus,c.code_txt alertstatusname
                                ,ISNULL(a.memo, '') AS memo  
                                ,isnull(convert(varchar(16), a.upd_date, 120) ,'')close_time
                                  FROM eventalert a
                                  join caminfo b on a.camarea=b.camarea and a.camid=b.camid
                                  join alerttype d on a.alerttype=d.alerttype
                                  join SYSCOMMI c on c.comm_no='alert_status' and a.alertstatus=c.code_no
                                  where YEAR(a.alerttime)=YEAR(GETDATE())　and month(a.alerttime)=MONTH(GETDATE())
                                  or (YEAR(a.alerttime)+month(a.alerttime)!=YEAR(GETDATE())+MONTH(GETDATE())
                                  and a.alertstatus!='03')
                                ";

                dt = dbc.FillDataTable(sql, ht);

                return Content(
                    JsonConvert.SerializeObject(ApiReturnView.Success(dt, "查詢成功")),
                    "application/json"
                );
            }
            catch (Exception ex)
            {
                return Content(
                    JsonConvert.SerializeObject(ApiReturnView.Error("API發生錯誤: " + ex.Message)),
                    "application/json"
                );
            }
        }

        // --- 新增的 UpdateAlertRequest 類別 ---
        public class UpdateAlertRequest
        {
            public string ALERTNO { get; set; }       // 異常編號
            public string ALERTSTATUS { get; set; }   // 狀態代碼
            public string PASS_NA { get; set; }       // 通報人員
            public string MEMO { get; set; }          // 備註
        }

        /// <summary>
        /// ---- 後台維護更新 (狀態/人員/備註) --------------------------
        /// Post: /api/snb001Q/UpdateAlert
        /// </summary>
        [HttpPost]
        [Route("UpdateAlert")]
        public IActionResult UpdateAlert([FromBody] UpdateAlertRequest req)
        {
            DataTable dt = new DataTable();
            DBController dbc = new DBController();
            Hashtable ht = new Hashtable();

            try
            {
                if (req == null || string.IsNullOrEmpty(req.ALERTNO))
                {
                    return Content(JsonConvert.SerializeObject(ApiReturnView.Error("缺少異常編號 (ALERTNO)")), "application/json");
                }

                ht.Add("@ALERTNO", new StructureSQLParameter(req.ALERTNO, SqlDbType.VarChar));

                string status = string.IsNullOrEmpty(req.ALERTSTATUS) ? "01" : req.ALERTSTATUS;
                ht.Add("@ALERTSTATUS", new StructureSQLParameter(status, SqlDbType.VarChar));

                ht.Add("@PASS_NA", new StructureSQLParameter(req.PASS_NA ?? "", SqlDbType.NVarChar));
                ht.Add("@MEMO", new StructureSQLParameter(req.MEMO ?? "", SqlDbType.NVarChar));

                string clientIp = _httpContextAccessor.HttpContext?.Connection?.RemoteIpAddress?.ToString() ?? "";
                ht.Add("@UPD_IP", new StructureSQLParameter(clientIp, SqlDbType.VarChar));

                StringBuilder sql = new StringBuilder();
                sql.Append(@"
                    UPDATE eventalert
                    SET alertstatus     = @ALERTSTATUS,
                        pass_na         = @PASS_NA,
                        memo            = @MEMO,
                        upd_date        = GETDATE(),
                        upd_ip          = @UPD_IP
                    WHERE alertno = @ALERTNO;
                    
                    SELECT 1; 
                ");

                dbc.FillDataTable(sql.ToString(), ht);

                return Content(JsonConvert.SerializeObject(ApiReturnView.Success(null, "更新成功")), "application/json");
            }
            catch (Exception ex)
            {
                return Content(JsonConvert.SerializeObject(ApiReturnView.Error("API發生錯誤: " + ex.Message)), "application/json");
            }
        }

        #endregion
    }
}