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
    public class snb002QController : MasterApiController, IApiController.Q
    {
        private IHttpContextAccessor _httpContextAccessor;
        public snb002QController(IHttpContextAccessor httpContextAccessor) : base(httpContextAccessor)
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
            this.addOpData("timeQL", "SELECT code_no AS [KEY],code_txt AS [desc] FROM SYSCOMMI where comm_no='time_range' order by para_code");
            this.addOpData("alerttypeQL", "SELECT alerttype AS [KEY],alerttypename AS [desc] FROM alerttype WHERE DISPLAYYN='Y'");
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
            //流程主檔SQL語法
            string sql = @" select * 
                            from CAMINFO
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
                rptNa = "數據分析"
            };
        }

        #region 其他api
        /// <summary>
        /// ----各項異常次數 ----------------------------------------------
        /// Post: /api/api程式名稱/eventcount
        /// </summary>
        /// <returns>return application/json</returns>
        [HttpPost]
        [Route("eventcount")]
        public IActionResult eventcount([FromBody] AlertAreaInfo data)
        {
            DataTable dt = new DataTable();
            DBController dbc = new DBController();
            Hashtable ht = new Hashtable();

            try
            {
                string sql = @" SELECT a.alerttypename,COUNT(b.alerttype) AS alertcount,alerttypecolor
                                FROM alerttype a
                                LEFT JOIN eventalert b  ON a.alerttype = b.alerttype
                                AND (ISNULL(LTRIM(RTRIM(@time_range)), '') = ''    -- @time_range 空字串：不限制時間
                                OR b.alerttime >= DATEADD(HOUR,-TRY_CONVERT(int, @time_range), GETDATE())) --有值轉int 
                                left join caminfo c on b.camarea=c.camarea and c.camid=b.camid 
                                where (a.alerttype=@alerttype or @alerttype is null or @alerttype='')
                                and (c.camlocation=@camlocation or @camlocation is null or @camlocation='')
                                GROUP BY alerttypename,alerttypecolor
                                ";
                ht.Add("@time_range", new StructureSQLParameter(data.time_range.ToString(), SqlDbType.NVarChar));
                ht.Add("@alerttype", new StructureSQLParameter(data.alerttype.ToString(), SqlDbType.NVarChar));
                ht.Add("@camlocation", new StructureSQLParameter(data.camlocation.ToString(), SqlDbType.NVarChar));

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
        /// ----各區域異常發生次數 ----------------------------------------------
        /// Post: /api/api程式名稱/camlocationcount
        /// </summary>
        /// <returns>return application/json</returns>
        [HttpPost]
        [Route("camlocationcount")]
        public IActionResult camlocationcount([FromBody] AlertAreaInfo data)
        {
            DataTable dt = new DataTable();
            DBController dbc = new DBController();
            Hashtable ht = new Hashtable();

            try
            {
                string sql = @" SELECT  a.camlocation,COUNT(b.alerttype) AS alertcount,color
                                FROM caminfo a
                                LEFT JOIN eventalert b  
                                    ON a.camarea = b.camarea and a.camid=b.camid
                                   AND (ISNULL(LTRIM(RTRIM(@time_range)), '') = ''   -- @time_range 空字串：不限制時間
                                OR b.alerttime >= DATEADD(HOUR,TRY_CONVERT(int, @time_range), GETDATE()))-- 有值轉 int

                                left join alerttype c on b.alerttype=c.alerttype
                                where (c.alerttype=@alerttype or @alerttype is null or @alerttype='')
                                and (a.camlocation=@camlocation or @camlocation is null or @camlocation='')
                                GROUP BY 
                                    a.camlocation,color";
                ht.Add("@time_range", new StructureSQLParameter(data.time_range.ToString(), SqlDbType.NVarChar));
                ht.Add("@alerttype", new StructureSQLParameter(data.alerttype.ToString(), SqlDbType.NVarChar));
                ht.Add("@camlocation", new StructureSQLParameter(data.camlocation.ToString(), SqlDbType.NVarChar));

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
        /// ----各異常於不同區域次數（堆疊） ----------------------------------------------
        /// Post: /api/api程式名稱/camlocationeventcount
        /// </summary>
        /// <returns>return application/json</returns>
        [HttpPost]
        [Route("camlocationeventcount")]
        public IActionResult camlocationeventcount([FromBody] AlertAreaInfo data)
        {
            DataTable dt = new DataTable();
            DBController dbc = new DBController();
            Hashtable ht = new Hashtable();

            try
            {
                string sql = @" SELECT (
                                    SELECT A.CAMLOCATION,
                                           DETAIL.ALERTTYPENAME,
                                           ALERTTYPECOLOR,
                                           COUNT(D.ALERTTYPE) AS ALERTCOUNT,
                                           DETAIL.SORT
                                    FROM caminfo a
                                    JOIN cameventalertset b ON a.camno = b.camno
                                    LEFT JOIN alerttype DETAIL ON b.alerttype = detail.alerttype
                                    LEFT JOIN eventalert d  
                                        ON detail.alerttype = d.alerttype 
                                       AND a.camarea = d.camarea 
                                       AND a.camid   = d.camid
                                       AND (
                                            ISNULL(LTRIM(RTRIM(@time_range)), '') = '' 
                                            OR d.alerttime >= DATEADD(HOUR, -TRY_CONVERT(int, @time_range), GETDATE())
                                           )
                                    WHERE (detail.alerttype = @alerttype OR @alerttype IS NULL OR @alerttype = '')
                                      AND (a.camlocation = @camlocation OR @camlocation IS NULL OR @camlocation = '')
                                    GROUP BY a.camlocation, detail.alerttypename, alerttypecolor, detail.sort
                                    ORDER BY a.camlocation, detail.sort
                                    FOR JSON AUTO
                                ) AS AlertResultJson;";
                ht.Add("@time_range", new StructureSQLParameter(data.time_range.ToString(), SqlDbType.NVarChar));
                ht.Add("@alerttype", new StructureSQLParameter(data.alerttype.ToString(), SqlDbType.NVarChar));
                ht.Add("@camlocation", new StructureSQLParameter(data.camlocation.ToString(), SqlDbType.NVarChar));

                dt = dbc.FillDataTable(sql, ht);

                var result = new 
                {
                    res_code = 200,
                    res_msg = "查詢成功",
                    data = JsonConvert.DeserializeObject(dt.Rows[0]["AlertResultJson"].ToString())
            };

                return Content(
                    JsonConvert.SerializeObject(result),
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
        /// ----異常趨勢分析 ----------------------------------------------
        /// Post: /api/api程式名稱/timeline
        /// </summary>
        /// <returns>return application/json</returns>
        [HttpPost]
        [Route("timeline")]
        public IActionResult timeline([FromBody] AlertAreaInfo data)
        {
            DataTable dt = new DataTable();
            DBController dbc = new DBController();
            Hashtable ht = new Hashtable();

            try
            {
                string sql = @" -- 轉成時間範圍：從起始日 00:00 到 結束日翌日 00:00（不含）
                                DECLARE @startDateTime datetime = CAST(@startDate AS datetime);
                                DECLARE @endDateTime   datetime = DATEADD(DAY, 1, CAST(@endDate AS datetime));

                                ;WITH Days AS (
                                    SELECT @startDateTime AS ALERT_DAY
                                    UNION ALL
                                    SELECT DATEADD(DAY, 1, alert_day)
                                    FROM Days WHERE DATEADD(DAY, 1, alert_day) < @endDateTime
                                ),
                                Cams AS (
                                    SELECT DISTINCT CAMAREA, CAMID, CAMLOCATION,COLOR
                                    FROM caminfo
                                    WHERE (@camlocation IS NULL OR @camlocation='' OR camlocation=@camlocation)
                                ),
                                BaseEvents AS (
                                    SELECT E.ALERTTIME, E.ALERTTYPE,ALERTTYPECOLOR, C.CAMLOCATION, AT.ALERTTYPENAME
                                    FROM eventalert e
                                    JOIN caminfo c ON e.camarea = c.camarea AND e.camid = c.camid
                                    JOIN alerttype at ON e.alerttype = at.alerttype
                                    WHERE e.alerttime >= @startDateTime AND e.alerttime < @endDateTime
                                      AND (@alerttype IS NULL OR @alerttype='' OR e.alerttype=@alerttype)
                                      AND (@camlocation IS NULL OR @camlocation='' OR c.camlocation=@camlocation)
                                ),
                                Summary AS (
                                    SELECT CAMLOCATION, ALERTTYPE, ALERTTYPECOLOR, ALERTTYPENAME, COUNT(*) AS ALERTCOUNT
                                    FROM BaseEvents GROUP BY camlocation, alerttype, alerttypename, alerttypecolor
                                ),
                                Ranked AS (
                                    SELECT CAMLOCATION, ALERTTYPE, ALERTTYPECOLOR, ALERTTYPENAME, ALERTCOUNT,
                                           ROW_NUMBER() OVER(PARTITION BY CAMLOCATION ORDER BY alertcount DESC) AS rn
                                    FROM Summary
                                ),
                                AlertTypeStats AS (
                                    SELECT CAMLOCATION, ALERTTYPE, ALERTTYPECOLOR COLOR, ALERTTYPENAME, ALERTCOUNT,
                                           SUM(alertcount) OVER(PARTITION BY CAMLOCATION) as total_alerts
                                    FROM Summary
                                )
								select(
                                SELECT
                                    -- 1) 每日各區域警示趨勢（含0筆）
                                    (SELECT FORMAT(d.alert_day, 'yyyy-MM-dd') AS ALERT_DAY,
                                            (SELECT c.CAMLOCATION, c.COLOR,
                                                    ISNULL(b.alerttypename,'') ALERTTYPENAME,
                                                    ISNULL(COUNT(b.alerttype), 0) AS ALERTCOUNT
                                             FROM Cams c
                                             LEFT JOIN BaseEvents b ON b.camlocation = c.camlocation
                                                                   AND b.alerttime >= d.alert_day
                                                                   AND b.alerttime < DATEADD(DAY, 1, d.alert_day)
                                             GROUP BY c.camlocation, c.color, b.alerttype, b.alerttypename
                                             FOR JSON PATH)  AS LOCATIONS,
			                                  (SELECT CAMLOCATION,COLOR, ALERTTYPENAME, ALERTCOUNT
                                     FROM AlertTypeStats
                                     ORDER BY camlocation, alertcount DESC FOR JSON PATH) AS TYPECOUNT
                                     FROM Days d ORDER BY d.alert_day FOR JSON PATH) AS TIMELINE
                                FOR JSON PATH, WITHOUT_ARRAY_WRAPPER
                                ) AS AlertResultJson
								OPTION (MAXRECURSION 0)";
                ht.Add("@alerttype", new StructureSQLParameter(data.alerttype.ToString(), SqlDbType.NVarChar));
                ht.Add("@camlocation", new StructureSQLParameter(data.camlocation.ToString(), SqlDbType.NVarChar));
                ht.Add("@startDate", new StructureSQLParameter(data.startDate.ToString(), SqlDbType.NVarChar));
                ht.Add("@endDate", new StructureSQLParameter(data.endDate.ToString(), SqlDbType.NVarChar));

                dt = dbc.FillDataTable(sql, ht);

                var result = new
                {
                    res_code = 200,
                    res_msg = "查詢成功",
                    data = JsonConvert.DeserializeObject(dt.Rows[0]["AlertResultJson"].ToString())
                };

                return Content(
                    JsonConvert.SerializeObject(result),
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
        /// ----區域警示統計 ----------------------------------------------
        /// Post: /api/api程式名稱/timelinelist
        /// </summary>
        /// <returns>return application/json</returns>
        [HttpPost]
        [Route("timelinelist")]
        public IActionResult timelinelist([FromBody] AlertAreaInfo data)
        {
            DataTable dt = new DataTable();
            DBController dbc = new DBController();
            Hashtable ht = new Hashtable();

            try
            {
                string sql = @" SELECT camlocation,alerttypename,alerttypecolor,alertcount
                                from
                                (SELECT a.camlocation,detail.alerttypename,alerttypecolor
                                   ,COUNT(d.alerttype) AS alertcount,detail.sort
                                FROM caminfo a
                                join cameventalertset b on a.camno=b.camno
                                LEFT JOIN alerttype detail on b.alerttype=detail.alerttype
                                LEFT JOIN eventalert d  
                                    ON detail.alerttype = d.alerttype and a.camarea=d.camarea and a.camid=d.camid
                                   AND convert (varchar(10),d.alerttime,23)>=@startDate 
                                   AND convert (varchar(10),d.alerttime,23)<=@endDate 
                                where (detail.alerttype=@alerttype or @alerttype is null or @alerttype='')
                                and (a.camlocation=@camlocation or @camlocation is null or @camlocation='')
                                group by  a.camlocation,detail.alerttypename,alerttypecolor,detail.sort
                                )m
                                where alertcount>0
                                ";
                ht.Add("@alerttype", new StructureSQLParameter(data.alerttype.ToString(), SqlDbType.NVarChar));
                ht.Add("@camlocation", new StructureSQLParameter(data.camlocation.ToString(), SqlDbType.NVarChar));
                ht.Add("@startDate", new StructureSQLParameter(data.startDate.ToString(), SqlDbType.NVarChar));
                ht.Add("@endDate", new StructureSQLParameter(data.endDate.ToString(), SqlDbType.NVarChar));

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
        #endregion

        public class AlertAreaInfo
        {
            public string? time_range { get; set; } //時間區間
            public string alerttype { get; set; } //異常型態
            public string camlocation { get; set; } //區域
            public string? startDate { get; set; } //起始時間
            public string? endDate { get; set; } //結束時間
        }
    }
}
