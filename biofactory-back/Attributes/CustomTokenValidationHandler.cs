using KSIKernel_Core;
using KSIKernel_Core.Database;
using Microsoft.AspNetCore.Authorization;
using System.Collections;
using System.IdentityModel.Claims;
using System.IdentityModel.Tokens.Jwt;
using System.Text.Json;

namespace Sinon_Factory.Attributes
{
    public class CustomTokenValidationHandler : AuthorizationHandler<TokenValidationRequirement>
    {
        private readonly IHttpContextAccessor _httpContextAccessor;

        public CustomTokenValidationHandler(IHttpContextAccessor httpContextAccessor)
        {
            _httpContextAccessor = httpContextAccessor;
        }

        protected override async Task HandleRequirementAsync(
            AuthorizationHandlerContext context,
            TokenValidationRequirement requirement)
        {
            var httpContext = _httpContextAccessor.HttpContext;

            // 從 Authorization Header 提取 Token
            var token = httpContext.Request.Headers["Authorization"]
                .FirstOrDefault()?.Split(" ").Last();

            if (token != null)
            {
                var tokenHandler = new JwtSecurityTokenHandler();
                var jsonToken = tokenHandler.ReadToken(token) as JwtSecurityToken;

                // 提取用戶 ID 和 Token ID
                var userIdClaim = jsonToken.Claims
                    .FirstOrDefault(c => c.Type == "PNO");

                if (userIdClaim != null)
                {
                    // 檢查 Token 是否有效
                    bool isValid = false;

                    // 檢查 Token 是否有效
                    DBController dbc = new DBController();
                    Hashtable ht = new Hashtable();
                    string _sql = @"SELECT ACCESS_TOKEN FROM SYSPASMI WHERE PASS_NO = @PASS_NO";
                    ht.Add("@PASS_NO", new StructureSQLParameter(userIdClaim.Value, System.Data.SqlDbType.NVarChar));
                    string accessToken = General.nvl(dbc.DbExecuteScalar_Str(_sql, ht), "").ToString();

                    if (accessToken == token)
                    {
                        context.Succeed(requirement);
                        return;
                    }
                }
            }

            // 直接設置 401 狀態碼
            httpContext.Response.StatusCode = StatusCodes.Status401Unauthorized;
            await httpContext.Response.WriteAsync(JsonSerializer.Serialize(new
            {
                message = "Token is invalid or has been revoked",
                errorCode = "TOKEN_INVALID"
            }));
            return;
        }
    }

    // 自定義 Requirement
    public class TokenValidationRequirement : IAuthorizationRequirement { }
}
