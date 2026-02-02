using Sinon_Factory.Config;
using Sinon_Factory.Filters;
using Hangfire;
using Hangfire.MemoryStorage;
using KSIKernel_Core.CryptoHelper;
using log4net;
using log4net.Config;
using log4net.Repository.Hierarchy;
using log4net.Appender;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.AspNetCore.Localization;
using Microsoft.Extensions.Options;
using Microsoft.Extensions.WebEncoders;
using Microsoft.IdentityModel.Tokens;
using System.Globalization;
using System.Text;
using System.Text.Encodings.Web;
using System.Text.Unicode;
using static System.Net.Mime.MediaTypeNames;
using Microsoft.AspNetCore.Authorization;
using Sinon_Factory.Services;
using Sinon_Factory.Attributes;
using Sinon_Factory.Models;
using Sinon_Factory.App_Libs;

var builder = WebApplication.CreateBuilder(args);

// 配置 Log4Net
builder.Logging.AddLog4Net("CfgFile/log4net.Config");

// 自訂義 Log4Net 配置
ConfigureLog4Net(builder.Configuration);

builder.Services.Configure<FormOptions>(options => { options.ValueCountLimit = 2048; });

var services = builder.Services;
var configuration = builder.Configuration;
configuration.Bind(new ConfigManager());

string[] corsOrigins = configuration.GetValue<string>("AllowedHosts").Split(',', StringSplitOptions.RemoveEmptyEntries);
services.AddCors(options =>
{
    options.AddDefaultPolicy(
        builder =>
        {
            if (corsOrigins.Contains("*"))
            {
                builder.SetIsOriginAllowed(_ => true);
            }
            else
            {
                builder.WithOrigins(corsOrigins);
            }
            builder.AllowAnyMethod();
            builder.AllowAnyHeader();
            builder.AllowCredentials();
            builder.WithExposedHeaders("Content-Disposition");
        }
    );
});
services.AddMvc();
services.AddHttpContextAccessor();
services.AddControllers(options =>
    {
        options.SuppressImplicitRequiredAttributeForNonNullableReferenceTypes = true;
    })
    .AddJsonOptions(options =>
        options.JsonSerializerOptions.PropertyNamingPolicy = null);
services.AddScoped<AuthService>();
ShareModel.Initialize(services);

// 註冊 Authorization Handler
services.AddSingleton<IAuthorizationHandler, CustomTokenValidationHandler>();

// 配置 Authorization Policy
services.AddAuthorization(options =>
{
    options.AddPolicy("ValidToken", policy =>
        policy.Requirements.Add(new TokenValidationRequirement()));
});
#region ------------------------ JWT ------------------------
// 設定 JWT 授權
services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = configuration.GetValue<string>("JWTSettings:Issuer"),
        ValidAudience = configuration.GetValue<string>("JWTSettings:Audience"),
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(configuration.GetValue<string>("JWTSettings:Key"))),
        ClockSkew = TimeSpan.Zero
    };
    options.Events = new JwtBearerEvents()
    {
        OnAuthenticationFailed = context =>
        {
            context.NoResult();
            context.Response.StatusCode = 401;
            context.Response.HttpContext.Features.Get<IHttpResponseFeature>().ReasonPhrase = context.Exception.Message;
            return Task.CompletedTask;
        },
        OnTokenValidated = context =>
        {
            return Task.CompletedTask;
        }
    };
});
#endregion

#region ------------------------ Radis ------------------------
//services.AddSingleton<IConnectionMultiplexer>(sp =>
//{
//    var configuration = builder.Configuration.GetConnectionString("Redis");
//    return ConnectionMultiplexer.Connect(configuration);
//});
#endregion

// Add Hangfire services.
services.AddHangfire(configuration => configuration
    .SetDataCompatibilityLevel(CompatibilityLevel.Version_170)
    .UseSimpleAssemblyNameTypeSerializer()
    .UseRecommendedSerializerSettings()
    .UseMemoryStorage());

// Add the processing server as IHostedService
services.AddHangfireServer();

services.Configure<RequestLocalizationOptions>(options =>
{
    var supportedCultures = new[]
    {
                    new CultureInfo("zh-TW"),
                    new CultureInfo("zh-CN"),
                    new CultureInfo("en-US")
                };
    //options.DefaultRequestCulture = new RequestCulture(culture: "zh-TW", uiCulture: "zh-TW");
    options.SupportedCultures = supportedCultures;
    options.SupportedUICultures = supportedCultures;

    options.RequestCultureProviders.Insert(0, new CustomRequestCultureProvider(context =>
    {
        //var currentLanguage = context.Request.Cookies["_culture"];
        var defaultLanguage = "zh-TW";

        return Task.FromResult(new ProviderCultureResult(defaultLanguage, defaultLanguage));
    }));
});

services.Configure<WebEncoderOptions>(options =>
{
    options.TextEncoderSettings = new TextEncoderSettings(UnicodeRanges.All);
});

services.AddAntiforgery(options => options.HeaderName = "RequestVerificationToken");
// Add services to the container.

var app = builder.Build();

app.UseForwardedHeaders(new ForwardedHeadersOptions
{
    ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto
});

// Configure the HTTP request pipeline.
app.UseDeveloperExceptionPage();
app.UseHsts();

app.Use(async (context, next) =>
{
    //if (!env.IsDevelopment())
    //{
    //    context.Response.Headers.Add("Content-Security-Policy", "default-src 'none'; script-src 'self' 'unsafe-eval' 'unsafe-inline' data:; img-src 'self' 'unsafe-eval' 'unsafe-inline' data:; frame-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-eval' 'unsafe-inline';  font-src 'self' 'unsafe-eval' 'unsafe-inline'; connect-src 'self'; media-src 'self'");
    //}

    context.Response.Headers.Add("X-Content-Type-Options", "nosniff");
    context.Response.Headers.Add("X-Xss-Protection", "1");
    context.Response.Headers.Add("X-Frame-Options", "SAMEORIGIN");
    await next();
});

app.UseHttpsRedirection();
//var UrlPath = new PathString($"/{string.Join("/", ConfigManager.WebUrl.Backend.Split("//")[1].Split("/").Skip(1))}");
//app.UsePathBase(UrlPath);
app.MapControllers();
app.UseCors();
FastReport.Utils.RegisteredObjects.AddConnection(typeof(MsSqlDataConnection));
app.UseFastReport();
app.UseStaticFiles(new StaticFileOptions
{
    OnPrepareResponse = ctx =>
    {
        ctx.Context.Response.Headers.Append(
             "Cache-Control", $"private, no-cache, no-store, max-age=0");
    }
});
app.UseRouting();
app.UseAuthentication();
app.UseAuthorization();

// 配置 Hangfire 儀表板的 DashboardOptions
app.UseHangfireDashboard("/hangfire", new DashboardOptions
{
    Authorization = new[] { new HangFireAuthorizationFilter() }, // 設定授權過濾器
    AppPath = "/home", // 點擊儀表板上的 "Back to site" 連結時的返回路徑
    StatsPollingInterval = 2000, // 儀表板的狀態輪詢間隔 (毫秒)
    IgnoreAntiforgeryToken = true, // 如果你不需要防篡改令牌檢查，可以設置為 true
    DisplayStorageConnectionString = false, // 禁止顯示儲存後端的連接字串
});

BackgroundJob.Enqueue(() => HangfireStartupScheduling.Run());

//加入此片段
var requestLocalizationOptions = app.Services.GetRequiredService<IOptions<RequestLocalizationOptions>>().Value;
app.UseRequestLocalization(requestLocalizationOptions);

app.UseCookiePolicy();
app.Run();

void ConfigureLog4Net(IConfiguration configuration)
{
    XmlConfigurator.ConfigureAndWatch(new FileInfo("CfgFile/log4net.Config"));
    var hierarchy = LogManager.GetRepository() as Hierarchy;

    if (hierarchy != null)
    {
        var adoNetAppenders = hierarchy.GetAppenders().OfType<AdoNetAppender>();
        foreach (var adoNetAppender in adoNetAppenders)
        {
            var connectionString = configuration["ConnectionStrings:Log4net"];
            string appName = configuration["appSettings:AppName"];
            adoNetAppender.ConnectionString = connectionString.Contains("Data Source") || connectionString.Contains("data source")
                ? connectionString
                : AesEncryptHelper.AesDecryptBase64(connectionString, appName);
            adoNetAppender.ActivateOptions();
        }
    }
}


public class MsSqlDataConnection : FastReport.Data.DataConnectionBase
{
    public override string QuoteIdentifier(string value, System.Data.Common.DbConnection connection)
    {
        return "\"" + value + "\"";
    }

    public override System.Type GetConnectionType()
    {
        return typeof(System.Data.SqlClient.SqlConnection);
    }

    public override System.Type GetParameterType()
    {
        return typeof(System.Data.SqlDbType);
    }

    public override System.Data.Common.DbDataAdapter GetAdapter(string selectCommand, System.Data.Common.DbConnection connection, FastReport.Data.CommandParameterCollection parameters)
    {
        System.Data.SqlClient.SqlDataAdapter adapter = new System.Data.SqlClient.SqlDataAdapter(selectCommand, connection as System.Data.SqlClient.SqlConnection);
        foreach (FastReport.Data.CommandParameter p in parameters)
        {
            System.Data.SqlClient.SqlParameter parameter = adapter.SelectCommand.Parameters.Add(p.Name, (System.Data.SqlDbType)p.DataType, p.Size);
            parameter.Value = p.Value;
        }
        return adapter;
    }
}