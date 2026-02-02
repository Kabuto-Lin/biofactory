using System;
using System.Collections;
using System.Collections.Generic;
using System.Data;
using System.Text;
using KSIKernel_Core.Database;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers.SNA
{   // 通報人員明細 model用
    public class SNA002FPersonDto
    {
        
        public string ALERTPASSTYPE { get; set; }

        // 通報人員代碼（對應 SYSPASMI.PASS_NO）
        public string ALERTPASSNO { get; set; }
    }

    // 新增用：主檔 + 明細 DTO
    public class SNA002FInsertRequest
    {
        // 事件代碼（alerttype）
        public string ALERTTYPE { get; set; }

        // 事件名稱（alerttypename）
        public string ALERTTYPENAME { get; set; }

        // 是否顯示（displayyn），'Y' / 'N'
        public string DISPLAYYN { get; set; }

        // 通報人員明細清單
        public List<SNA002FPersonDto> ALERT_PERSONS { get; set; } = new List<SNA002FPersonDto>();
    }

    /// <summary>
    /// 程式名稱: SNA002F - 溫室區域設定
    /// 功能：讀取 ALERTTYPE 主檔 + ALERTNOTIFYSET 明細 + SYSPASMI 通報人員清單
    /// </summary>
    [Route("api/[controller]")]
    [ApiController]
    public class apiSNA002FController : ControllerBase
    {
        private readonly IHttpContextAccessor _httpContextAccessor;

        public apiSNA002FController(IHttpContextAccessor httpContextAccessor)
        {
            _httpContextAccessor = httpContextAccessor;
        }

        //共用：把 DataTable 轉成 List<Dictionary<string, object>>
        private List<Dictionary<string, object>> ToList(DataTable dt)
        {
            var list = new List<Dictionary<string, object>>();

            if (dt == null || dt.Rows.Count == 0)
                return list;

            foreach (DataRow row in dt.Rows)
            {
                var dict = new Dictionary<string, object>();
                foreach (DataColumn col in dt.Columns)
                {
                    var val = row[col];
                    dict[col.ColumnName] = val == DBNull.Value ? null : val;
                }
                list.Add(dict);
            }

            return list;
        }
     

        /// <summary>
        /// 初始化：載入主檔 + 明細 + 通報人員清單
        /// alerttype 有值 = 編輯模式
        /// </summary>
        [HttpGet("Init")]
        public IActionResult Init([FromQuery] string alerttype = null)
        {
            try
            {
                DBController dbc = new DBController();
                Hashtable ht = new Hashtable();

                // 1. 主檔：ALERTTYPE
                DataTable dtMain = null;
                if (!string.IsNullOrEmpty(alerttype))
                {
                    ht.Add("@ALERTTYPE", new StructureSQLParameter(alerttype, SqlDbType.VarChar));

                    StringBuilder sqlMain = new StringBuilder();
                    sqlMain.Append(@"
SELECT
    alerttype     AS ALERTTYPE,
    alerttypename AS ALERTTYPENAME,
    displayyn     AS DISPLAYYN,
    upd_no        AS UPD_NO,
    upd_date      AS UPD_DATE,
    upd_ip        AS UPD_IP,
    crt_no        AS CRT_NO,
    crt_date      AS CRT_DATE,
    crt_ip        AS CRT_IP
FROM ALERTTYPE
WHERE alerttype = @ALERTTYPE
");
                    dtMain = dbc.FillDataTable(sqlMain.ToString(), ht);
                    dtMain.TableName = "main";
                }

                // 2. 明細：ALERTNOTIFYSET + SYSPASMI（這個事件已設定的通報人員）
                DataTable dtDetail = null;
                if (!string.IsNullOrEmpty(alerttype))
                {
                    StringBuilder sqlDetail = new StringBuilder();
                    sqlDetail.Append(@"
SELECT
    B.alerttype      AS ALERTTYPE,
    B.alertpasstype  AS ALERTPASSTYPE,
    B.alertpassno    AS ALERTPASSNO,
    C.PASS_NA        AS PASS_NA,
    B.upd_no         AS UPD_NO,
    B.upd_date       AS UPD_DATE,
    B.upd_ip         AS UPD_IP,
    B.crt_no         AS CRT_NO,
    B.crt_date       AS CRT_DATE,
    B.crt_ip         AS CRT_IP
FROM ALERTNOTIFYSET B
JOIN SYSPASMI C
  ON B.alertpasstype = C.PASS_TYPE
 AND B.alertpassno   = C.PASS_NO
WHERE B.alerttype = @ALERTTYPE
ORDER BY B.alertpasstype, C.PASS_NA
");
                    dtDetail = dbc.FillDataTable(sqlDetail.ToString(), ht);
                    dtDetail.TableName = "detail";
                }

                // 3. 所有通報人員清單：SYSPASMI
                StringBuilder sqlPerson = new StringBuilder();
                sqlPerson.Append(@"
SELECT
    PASS_TYPE,
    PASS_NO,
    PASS_NA
FROM SYSPASMI
ORDER BY PASS_TYPE, PASS_NA
");
                DataTable dtPersons = dbc.FillDataTable(sqlPerson.ToString(), new Hashtable());
                dtPersons.TableName = "personList";

                // 4. 轉成一般 List 再回傳
                var result = new
                {
                    main = ToList(dtMain),
                    detail = ToList(dtDetail),
                    personList = ToList(dtPersons),
                    success = true,
                    message = "資料載入成功"
                };

                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    success = false,
                    message = ex.Message,
                    stackTrace = ex.StackTrace,
                    innerException = ex.InnerException?.Message
                });
            }
        }

        /// <summary>
        /// 取得尚未被此事件使用的通報人員清單
        /// GET: /api/apiSNA002F/GetAvailablePersons?alerttype=e_fence
        /// </summary>
        [HttpGet("GetAvailablePersons")]
        public IActionResult GetAvailablePersons([FromQuery] string alerttype = null)
        {
            try
            {
                DBController dbc = new DBController();
                Hashtable ht = new Hashtable();
                StringBuilder sql = new StringBuilder();

                if (string.IsNullOrEmpty(alerttype))
                {
                    // 新增模式：沒有 alerttype，就回傳全部通報人員
                    sql.Append(@"
SELECT
    b.code_txt AS CODE_TXT,
    a.pass_type AS PASS_TYPE,
    a.pass_na   AS PASS_NA,
    a.pass_no   AS PASS_NO
FROM SYSPASMI a
JOIN SYSCOMMI b
  ON b.comm_no = 'pass_type'
 AND a.pass_type = b.code_no
ORDER BY a.pass_type, a.pass_na
");
                }
                else
                {
                    // 編輯模式：排除已在 ALERTNOTIFYSET 中的通報人員
                    ht.Add("@ALERTTYPE", new StructureSQLParameter(alerttype, SqlDbType.VarChar));

                    sql.Append(@"
SELECT
    b.code_txt AS CODE_TXT,
    a.pass_type AS PASS_TYPE,
    a.pass_na   AS PASS_NA,
    a.pass_no   AS PASS_NO
FROM SYSPASMI a
JOIN SYSCOMMI b
  ON b.comm_no = 'pass_type'
 AND a.pass_type = b.code_no
WHERE a.pass_no NOT IN (
    SELECT alertpassno
    FROM ALERTNOTIFYSET
    WHERE alerttype = @ALERTTYPE
)
ORDER BY a.pass_type, a.pass_na
");
                }

                DataTable dt = dbc.FillDataTable(sql.ToString(), ht);
                var list = ToList(dt);   // 轉成 List<Dictionary<string, object>>

                // 這裡前端是期待陣列，所以直接回傳 list
                return Ok(list);
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    success = false,
                    message = ex.Message,
                    stackTrace = ex.StackTrace,
                    innerException = ex.InnerException?.Message
                });
            }
        }

        /// <summary>
        /// 新增 / 儲存
        /// POST: /api/apiSNA002F/Insert
        /// </summary>
        [HttpPost("Insert")]
        public IActionResult Insert([FromBody] SNA002FInsertRequest req)
        {
            try
            {
                if (req == null)
                {
                    return BadRequest(new
                    {
                        success = false,
                        message = "Request 內容為空。"
                    });
                }

                if (string.IsNullOrWhiteSpace(req.ALERTTYPE))
                {
                    return BadRequest(new
                    {
                        success = false,
                        message = "事件代碼( ALERETYPE ) 為必填。"
                    });
                }

                if (string.IsNullOrWhiteSpace(req.ALERTTYPENAME))
                {
                    return BadRequest(new
                    {
                        success = false,
                        message = "事件名稱( ALERTTYPENAME ) 為必填。"
                    });
                }

                // 預設 DISPLAYYN = 'Y'
                if (string.IsNullOrWhiteSpace(req.DISPLAYYN))
                {
                    req.DISPLAYYN = "Y";
                }

                DBController dbc = new DBController();

                // 1. 檢查事件代碼是否已存在
                Hashtable htCheck = new Hashtable();
                htCheck.Add("@ALERTTYPE", new StructureSQLParameter(req.ALERTTYPE, SqlDbType.VarChar));

                string checkSql = @"
SELECT COUNT(1)
FROM ALERTTYPE
WHERE alerttype = @ALERTTYPE
";
                string cntStr = dbc.DbExecuteScalar_Str(checkSql, htCheck);
                int cnt = 0;
                int.TryParse(cntStr, out cnt);

                if (cnt > 0)
                {
                    return BadRequest(new
                    {
                        success = false,
                        message = $"事件代碼「{req.ALERTTYPE}」已存在，無法新增。"
                    });
                }

                // ★ 這裡再抓 client IP 給明細用
                var clientIp = HttpContext.Connection?.RemoteIpAddress?.ToString() ?? "";

                // 2. Insert 主檔 ALERTTYPE（完整欄位）
                Hashtable htMain = new Hashtable();
                htMain.Add("@ALERTTYPE", new StructureSQLParameter(req.ALERTTYPE, SqlDbType.NVarChar));
                htMain.Add("@ALERTTYPENAME", new StructureSQLParameter(req.ALERTTYPENAME, SqlDbType.NVarChar));
                htMain.Add("@SORT", new StructureSQLParameter(DBNull.Value, SqlDbType.Int));
                htMain.Add("@DISPLAYYN", new StructureSQLParameter(string.IsNullOrEmpty(req.DISPLAYYN) ? "Y" : req.DISPLAYYN, SqlDbType.NVarChar));
                htMain.Add("@CRT_NO", new StructureSQLParameter(DBNull.Value, SqlDbType.NVarChar));
                htMain.Add("@CRT_DATE", new StructureSQLParameter(DBNull.Value, SqlDbType.DateTime));
                htMain.Add("@CRT_IP", new StructureSQLParameter(DBNull.Value, SqlDbType.NVarChar));
                htMain.Add("@UPD_NO", new StructureSQLParameter(DBNull.Value, SqlDbType.NVarChar));
                htMain.Add("@UPD_DATE", new StructureSQLParameter(DBNull.Value, SqlDbType.DateTime));
                htMain.Add("@UPD_IP", new StructureSQLParameter(DBNull.Value, SqlDbType.NVarChar));

                StringBuilder sqlMain = new StringBuilder();
                sqlMain.Append(@"
INSERT INTO ALERTTYPE
    (alerttype, alerttypename, sort, displayyn, crt_no, crt_date, crt_ip, upd_no, upd_date, upd_ip)
VALUES
    (@ALERTTYPE, @ALERTTYPENAME, @SORT, @DISPLAYYN, @CRT_NO, @CRT_DATE, @CRT_IP, @UPD_NO, @UPD_DATE, @UPD_IP);

SELECT 1 AS RESULT;
");

                dbc.FillDataTable(sqlMain.ToString(), htMain);

                // 3. 寫入明細 ALERTNOTIFYSET
                if (req.ALERT_PERSONS != null && req.ALERT_PERSONS.Count > 0)
                {
                    foreach (var p in req.ALERT_PERSONS)
                    {
                        if (string.IsNullOrWhiteSpace(p.ALERTPASSTYPE) ||
                            string.IsNullOrWhiteSpace(p.ALERTPASSNO))
                        {
                            continue;
                        }

                        Hashtable htD = new Hashtable();
                        htD.Add("@ALERTTYPE", new StructureSQLParameter(req.ALERTTYPE, SqlDbType.VarChar));
                        htD.Add("@ALERTPASSTYPE", new StructureSQLParameter(p.ALERTPASSTYPE, SqlDbType.VarChar));
                        htD.Add("@ALERTPASSNO", new StructureSQLParameter(p.ALERTPASSNO, SqlDbType.VarChar));

                        // crt_no / crt_ip / upd_no / upd_ip
                        htD.Add("@CRT_NO", new StructureSQLParameter("", SqlDbType.VarChar));
                        htD.Add("@CRT_IP", new StructureSQLParameter(clientIp, SqlDbType.VarChar));
                        htD.Add("@UPD_NO", new StructureSQLParameter("", SqlDbType.VarChar));
                        htD.Add("@UPD_IP", new StructureSQLParameter(clientIp, SqlDbType.VarChar));

                        StringBuilder sqlDetail = new StringBuilder();
                        sqlDetail.Append(@"
INSERT INTO ALERTNOTIFYSET
    (alerttype, alertpasstype, alertpassno,
     upd_no, upd_date, upd_ip,
     crt_no, crt_date, crt_ip)
VALUES
    (@ALERTTYPE, @ALERTPASSTYPE, @ALERTPASSNO,
     @UPD_NO, GETDATE(), @UPD_IP,
     @CRT_NO, GETDATE(), @CRT_IP);

SELECT 1 AS RESULT;
");
                        dbc.FillDataTable(sqlDetail.ToString(), htD);
                    }
                }

                return Ok(new
                {
                    success = true,
                    message = "新增成功。",
                    alerttype = req.ALERTTYPE
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    success = false,
                    message = ex.Message,
                    stackTrace = ex.StackTrace,
                    innerException = ex.InnerException?.Message
                });
            }
        }

        // 修改 Edit API：加在 Insert 的下面
        [HttpPost("Edit")]
        public IActionResult Edit([FromBody] SNA002FInsertRequest req)
        {
            try
            {
                if (req == null)
                    return BadRequest(new { success = false, message = "Request 內容為空" });

                if (string.IsNullOrWhiteSpace(req.ALERTTYPE))
                    return BadRequest(new { success = false, message = "事件代碼為必填" });

                DBController dbc = new DBController();

                // 1. Update 主檔
                Hashtable htMain = new Hashtable();
                htMain.Add("@ALERTTYPE", new StructureSQLParameter(req.ALERTTYPE, SqlDbType.VarChar));
                htMain.Add("@ALERTTYPENAME", new StructureSQLParameter(req.ALERTTYPENAME, SqlDbType.NVarChar));
                htMain.Add("@DISPLAYYN", new StructureSQLParameter(req.DISPLAYYN, SqlDbType.VarChar));

                string sqlMain = @"
UPDATE ALERTTYPE
SET alerttypename = @ALERTTYPENAME,
    displayyn = @DISPLAYYN,
    upd_no = '',
    upd_ip = '',
    upd_date = GETDATE()
WHERE alerttype = @ALERTTYPE;

SELECT 1 AS RESULT;
";
                dbc.FillDataTable(sqlMain, htMain);

                // 2. 清掉舊的明細
                Hashtable htDel = new Hashtable();
                htDel.Add("@ALERTTYPE", new StructureSQLParameter(req.ALERTTYPE, SqlDbType.VarChar));

                dbc.FillDataTable("DELETE FROM ALERTNOTIFYSET WHERE alerttype=@ALERTTYPE", htDel);

                // 3. 新增新的明細
                var clientIp = HttpContext.Connection?.RemoteIpAddress?.ToString() ?? "";

                if (req.ALERT_PERSONS != null)
                {
                    foreach (var p in req.ALERT_PERSONS)
                    {
                        if (string.IsNullOrWhiteSpace(p.ALERTPASSNO)) continue;

                        Hashtable htD = new Hashtable();
                        htD.Add("@ALERTTYPE", new StructureSQLParameter(req.ALERTTYPE, SqlDbType.VarChar));
                        htD.Add("@ALERTPASSTYPE", new StructureSQLParameter(p.ALERTPASSTYPE, SqlDbType.VarChar));
                        htD.Add("@ALERTPASSNO", new StructureSQLParameter(p.ALERTPASSNO, SqlDbType.VarChar));
                        htD.Add("@CRT_NO", new StructureSQLParameter("", SqlDbType.VarChar));
                        htD.Add("@CRT_IP", new StructureSQLParameter(clientIp, SqlDbType.VarChar));
                        htD.Add("@UPD_NO", new StructureSQLParameter("", SqlDbType.VarChar));
                        htD.Add("@UPD_IP", new StructureSQLParameter(clientIp, SqlDbType.VarChar));

                        StringBuilder sqlDetail = new StringBuilder();
                        sqlDetail.Append(@"
INSERT INTO ALERTNOTIFYSET
(alerttype, alertpasstype, alertpassno,
 upd_no, upd_date, upd_ip,
 crt_no, crt_date, crt_ip)
VALUES
(@ALERTTYPE, @ALERTPASSTYPE, @ALERTPASSNO,
 @UPD_NO, GETDATE(), @UPD_IP,
 @CRT_NO, GETDATE(), @CRT_IP);

SELECT 1 AS RESULT;
");
                        dbc.FillDataTable(sqlDetail.ToString(), htD);
                    }
                }

                return Ok(new { success = true, message = "修改成功。" });
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    success = false,
                    message = ex.Message,
                    stackTrace = ex.StackTrace
                });
            }
        }
    }
}
