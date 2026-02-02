using KSIKernel_Core.Report;
using KSIKernel_Core;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using Microsoft.AspNetCore.Authorization;
using Newtonsoft.Json.Linq;
using Sinon_Factory.Resources;
using Microsoft.AspNetCore.Http;
using Sinon_Factory.Models;
using Sinon_Factory.Models.ViewModel;
using Microsoft.Reporting.Map.WebForms.BingMaps;
using Sinon_Factory.Models.Jwt;
using static System.Runtime.InteropServices.JavaScript.JSType;
using Sinon_Factory.App_Libs;

namespace Sinon_Factory.App_Libs
{
    //[Authorize(Policy = "ValidToken")]
    //[Authorize]
    //[CheckUserPermission]
    public abstract class MasterApiController : MasterApiControllerBase
    {
        protected MyLogger apiLogger = new MyLogger(LoggerType.SYSTEM, "MasterApiController");
        private string _token;
        private IHttpContextAccessor _httpContextAccessor;
        public MasterApiController(IHttpContextAccessor httpContextAccessor) : base(httpContextAccessor) 
        {
            apiLogger = new MyLogger(LoggerType.SYSTEM, "MasterApiController");
            _httpContextAccessor = httpContextAccessor;
            _token = General.nvl(_httpContextAccessor.HttpContext?.Request.Headers.Authorization, "").ToString().Replace("Bearer ", "");
        }

        /// <summary>
        /// 覆寫查詢記錄log
        /// </summary>
        /// <returns></returns>
        protected override IActionResult doSearchResult(object a_Search)
        {
            apiLogger.userId = UserInfo.getUserInfo(_token).PNO;
            apiLogger.WriteLog(LogType.Info, RecordLogString_zh_TW.Search + JsonConvert.SerializeObject(a_Search));
            return base.doSearchResult(a_Search);
            //OkObjectResult baseResult = (OkObjectResult)base.doSearchResult(a_Search);
            //string _jwtHashKey = ShareModel.GetAppsettingValue("JWTSettings", "JwtHashKey");
            //var jwt_expire_time = ((DateTimeOffset)DateTime.UtcNow.AddSeconds(60)).ToUnixTimeSeconds();
            //var model = new TokenViewModel<OkObjectResult> { exp = jwt_expire_time, data = baseResult, expire = 100 };
            //var result = JWTFunc.Encode(_jwtHashKey, model);
            //var decodeResult = JWTFunc.Decode<OkObjectResult>(_jwtHashKey, result);

            //return Ok(new ResultViewModel<string>
            //{
            //    isSuccess = true,
            //    message = "查詢成功",
            //    Result = result,
            //});
        }

        /// <summary>
        /// 覆寫新增、修改、刪除記錄log
        /// </summary>
        /// <returns></returns>
        protected override IActionResult doPostResult(enStatus a_status, DeltaMD a_delta)
        {
            string message = "";
            apiLogger.userId = UserInfo.getUserInfo(_token).PNO;
            switch (a_status)
            {
                case enStatus.Insert:
                    message = RecordLogString_zh_TW.Insert + JsonConvert.SerializeObject(a_delta.masterRow.newRow);
                    apiLogger.WriteLog(LogType.Info, message);
                    break;
                case enStatus.Edit:
                    message = RecordLogString_zh_TW.Update + JsonConvert.SerializeObject(a_delta.masterRow.newRow);
                    apiLogger.WriteLog(LogType.Info, message);
                    break;
                case enStatus.Delete:
                    message = RecordLogString_zh_TW.Delete + JsonConvert.SerializeObject(a_delta.masterRow.oldRow);
                    apiLogger.WriteLog(LogType.Info, message);
                    break;
                case enStatus.BatchSave:
                    message = RecordLogString_zh_TW.BatchSave + JsonConvert.SerializeObject(a_delta.masterRow.newRow);
                    apiLogger.WriteLog(LogType.Info, RecordLogString_zh_TW.BatchSave);
                    break;
            }
            return base.doPostResult(a_status, a_delta);
        }

        /// <summary>
        /// 覆寫批次處理log
        /// </summary>
        /// <returns></returns>
        protected override IActionResult doBatchOKResult(bool Succ, string Msg, Dictionary<string, object> dic)
        {
            apiLogger.userId = UserInfo.getUserInfo(_token).PNO;
            apiLogger.WriteLog(LogType.Info, RecordLogString_zh_TW.BatchOK + JsonConvert.SerializeObject(dic));
            return base.doBatchOKResult(Succ, Msg, dic);
        }

        /// <summary>
        /// 覆寫列印事件log
        /// </summary>
        /// <returns></returns>
        protected override IActionResult DoPrintResult(FastReportTool reportTool, ReportKind reportKind = ReportKind.PDF)
        {
            string message = "";
            apiLogger.userId = UserInfo.getUserInfo(_token).PNO;

            if (reportKind == ReportKind.PDF || reportKind == ReportKind.PREVIEW)
            {
                if (reportTool._TaskPackage.ReportContents.Count() == 1)
                {
                    message = RecordLogString_zh_TW.ExpPdf + JsonConvert.SerializeObject(reportTool._TaskPackage.ReportContents[0].Parameters);
                }
                else
                {
                    message = RecordLogString_zh_TW.ExpPdf;
                    foreach (var content in reportTool._TaskPackage.ReportContents)
                    {
                        message += JsonConvert.SerializeObject(content.Parameters);
                    }
                }
                apiLogger.WriteLog(LogType.Info, message);
            }
            if (reportKind == ReportKind.DOC)
            {
                if (reportTool._TaskPackage.ReportContents.Count() == 1)
                {
                    message = RecordLogString_zh_TW.ExpDoc + JsonConvert.SerializeObject(reportTool._TaskPackage.ReportContents[0].Parameters);
                }
                else
                {
                    message = RecordLogString_zh_TW.ExpDoc;
                    foreach (var content in reportTool._TaskPackage.ReportContents)
                    {
                        message += JsonConvert.SerializeObject(content.Parameters);
                    }
                }
                apiLogger.WriteLog(LogType.Info, message);
            }
            return base.DoPrintResult(reportTool, reportKind);
        }

        /// <summary>
        /// 覆寫匯出excl、ods事件log
        /// </summary>
        /// <returns></returns>
        protected override IActionResult doExpXlsResult(XlsTool l_xlsTool, ReportKind reportKind)
        {
            string message = "";
            apiLogger.userId = UserInfo.getUserInfo(_token).PNO;
            var parameterDescriptor = ControllerContext.ActionDescriptor.Parameters.Where(t => t.Name.Equals("a_Search")).FirstOrDefault();
            var parameter = Activator.CreateInstance(parameterDescriptor.ParameterType);
            string jsonStr = JsonConvert.SerializeObject(parameter);
            if (reportKind == ReportKind.XLS)
            {
                message = RecordLogString_zh_TW.ExpXls + jsonStr;
                apiLogger.WriteLog(LogType.Info, message);
            }
            if (reportKind == ReportKind.ODS)
            {
                message = RecordLogString_zh_TW.ExpOds + jsonStr;
                apiLogger.WriteLog(LogType.Info, message);
            }
            return base.doExpXlsResult(l_xlsTool, reportKind);
        }
    }
}
