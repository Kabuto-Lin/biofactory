using KSIKernel_Core;
using KSIKernel_Core.CryptoHelper;
using KSIKernel_Core.Database;
using Microsoft.AspNetCore.Mvc.Controllers;
using Microsoft.AspNetCore.Mvc.Filters;
using System.Collections;
using System.Net;

namespace Sinon_Factory.App_Libs
{
    public class CheckUserPermissionAttribute : ActionFilterAttribute
    {
        private static readonly string[] _crudActionName = { "Insert", "Edit", "Delete", "Search" };
        private IConfiguration _config;
        private string _token;

        public CheckUserPermissionAttribute()
        {
            _config = new ConfigurationBuilder().AddJsonFile("appsettings.json").Build();
        }

        public override void OnActionExecuting(ActionExecutingContext actionContext)
        {
            base.OnActionExecuting(actionContext);

            var descriptor = actionContext.ActionDescriptor as ControllerActionDescriptor;
            string actionName = descriptor.ActionName;
            _token = General.nvl(actionContext.HttpContext.Request.Headers.Authorization, "").ToString().Replace("Bearer ", "");
            #region 使用者CRUD權限判斷
            if (_crudActionName.Contains(actionName))
            {
                var userInfo = UserInfo.getUserInfo(_token);

                if (userInfo == null)
                {
                    throw new Exception("尚未登入");
                }

                string mnuId = "-1";
                var encryptedMnuIdToken = actionContext.HttpContext.Request.Headers["MnuIdToken"];

                if (!string.IsNullOrEmpty(encryptedMnuIdToken.ToString()))
                {
                    string projectName = _config.GetValue<string>("appSettings:AppName");
                    var mnuIdToken = AesEncryptHelper.AesDecryptBase64(WebUtility.HtmlDecode(encryptedMnuIdToken.ToString()), projectName);

                    string[] tokens = mnuIdToken.Split(':');

                    if (tokens.Length == 2)
                    {
                        #region 檢查token中程式代碼與目標controller是否相符
                        string progNo = tokens[0];
                        var controllerName = descriptor.ControllerName;

                        if ($"api{progNo}" != controllerName)
                        {
                            throw new Exception("非法的要求");
                        }
                        #endregion

                        mnuId = tokens[1];
                    }
                }

                // 處理 FromQuModal 標頭
                bool isQuModal = false;
                if (actionContext.HttpContext.Request.Headers.TryGetValue("FromQuModal", out var headerValues))
                {
                    var fromQuModal = headerValues;
                    if (fromQuModal.Any())
                    {
                        isQuModal = bool.TryParse(fromQuModal.First(), out var result) && result;
                    }
                }

                string apiControllerName = descriptor.ControllerName;
                if (!isQuModal && apiControllerName != "apiIndex")
                {
                    string _sql = "select ID from syspasmv where PASS_NO = @PASS_NO and PROG_NO = @PROG_NO";
                    DBController dbc = new DBController();
                    Hashtable ht = new Hashtable();
                    ht.Add("@PASS_NO", new StructureSQLParameter(userInfo.PNO, System.Data.SqlDbType.NVarChar));
                    ht.Add("@PROG_NO", new StructureSQLParameter(apiControllerName.Replace("api", ""), System.Data.SqlDbType.NVarChar));
                    mnuId = dbc.DbExecuteScalar_Dec(_sql, ht) == 0 ? "-1" : dbc.DbExecuteScalar_Dec(_sql, ht).ToString();
                }

                UserPermissions userPermissions = new UserPermissions(userInfo.PNO, mnuId, userInfo.IsSupUser);

                //當mnuId為-1時，代表為子視窗查詢
                if (mnuId != "-1")
                {
                    switch (actionName)
                    {
                        case "Insert":
                            if (!userPermissions.CanInsert)
                            {
                                throw new Exception("沒有新增權限");
                            }
                            break;
                        case "Edit":
                            if (!userPermissions.CanEdit)
                            {
                                throw new Exception("沒有修改權限");
                            }
                            break;
                        case "Delete":
                            if (!userPermissions.CanDelete)
                            {
                                throw new Exception("沒有刪除權限");
                            }
                            break;
                        case "Search":
                            if (!userPermissions.CanQuery)
                            {
                                throw new Exception("沒有查詢權限");
                            }
                            break;
                    }
                }
                else
                {
                    if (!isQuModal && mnuId == "-1" && apiControllerName != "apiIndex")
                    {
                        switch (actionName)
                        {
                            case "Insert":
                                if (!userPermissions.CanInsert)
                                {
                                    throw new Exception("沒有新增權限");
                                }
                                break;
                            case "Edit":
                                if (!userPermissions.CanEdit)
                                {
                                    throw new Exception("沒有修改權限");
                                }
                                break;
                            case "Delete":
                                if (!userPermissions.CanDelete)
                                {
                                    throw new Exception("沒有刪除權限");
                                }
                                break;
                            case "Search":
                                if (!userPermissions.CanQuery)
                                {
                                    throw new Exception("沒有查詢權限");
                                }
                                break;
                        }
                    }
                }
            }
            #endregion
        }

        public void OnActionExecuted(ActionExecutedContext context)
        {
            // our code after action executes
        }

    }
}
