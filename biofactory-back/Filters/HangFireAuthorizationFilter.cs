using Hangfire.Dashboard;
using Microsoft.AspNetCore.Authorization;
using Sinon_Factory.App_Libs;
using System.Diagnostics.CodeAnalysis;

namespace Sinon_Factory.Filters
{
    public sealed class HangFireAuthorizationFilter : IDashboardAuthorizationFilter
    {
        public bool Authorize([NotNull] DashboardContext context)
        {
            var httpContext = context.GetHttpContext();
            bool isAuthorized = httpContext.Session.GetObject<UserInfoData>("_USERINFO") != null;
            if (!isAuthorized)
            {
                httpContext.Response.Redirect("/Home/Login");
            }
            return isAuthorized;
        }
    }
}
