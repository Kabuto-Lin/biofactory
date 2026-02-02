using KSIKernel_Core.Database;
using KSIKernel_Core;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using System.Collections;
using System.Data;
using System.IO;
using System;
using Sinon_Factory.App_Libs;

namespace Sinon_Factory.Models
{
    public class ShareModel
    {
        private static IHttpContextAccessor _httpContextAccessor;

        public static void Initialize(IServiceCollection services)
        {
            // 在程式啟動時呼叫這個方法來設置 accessor
            services.AddHttpContextAccessor();
            var serviceProvider = services.BuildServiceProvider();
            _httpContextAccessor = serviceProvider.GetService<IHttpContextAccessor>();
        }

        public static HttpContext Current
        {
            get
            {
                return _httpContextAccessor?.HttpContext;
            }
        }

        #region GetHttpContextIP 取得IP位址
        public static string GetHttpContextIP()
        {
            string userIP = "";
            try
            {
                userIP = General.GetIPAddress();
            }
            catch (Exception ex) { }
            return userIP;
        }
        #endregion

        #region GetHttpContextID 取得使用者ID
        public static string GetHttpContextID()
        {
            string userID = "";
            try
            {
                // 檢查 HttpContext 是否為 null，以防止空引用異常
                if (Current != null)
                {
                    userID = UserInfo.getUserInfo(Current.Request.Headers.Authorization).PNO;
                }

            }
            catch (Exception ex) { }
            return userID;
        }
        #endregion

        //日期共通寫法 start
        #region GET_DATE 回傳特定日期格式,可自行新增新的格式 type
        /// <summary>
        /// 回傳時間格式 yyy:系統年 yyyMMdd:系統當日 yyy/MM/dd 要傳入yyyMMdd
        /// </summary>
        /// <param name="type">型態</param>
        /// <param name="value">日期</param>
        /// <returns></returns>
        public static string GET_DATE(string type, string value = "")
        {
            string yy = DateTime.Now.ToString("yyyy");
            string mm = DateTime.Now.ToString("MM");
            string dd = DateTime.Now.ToString("dd");

            switch (type)
            {

                case "yyy": //民國年
                    string now_year = (Convert.ToInt32(yy) - 1911).ToString();
                    return now_year;
                case "yyyMMdd"://民國日期
                    string yyyMMdd = Convert.ToInt32(yy) - 1911 + mm + dd;
                    return yyyMMdd;
                case "yyyMM"://民國年月
                    string yyyMM = Convert.ToInt32(yy) - 1911 + mm;
                    return yyyMM;
                case "yyy/MM/dd"://將民國日期改成/格式
                    value = value == "" ? Convert.ToInt32(yy) - 1911 + mm + dd : value;
                    string value2 = value.Substring(0, 3) + "/" + value.Substring(3, 2) + "/" + value.Substring(5, 2);
                    return value2;
                case "yyyy-MM-dd"://將民國日期改成西元年格式
                    string value3 = Convert.ToDateTime(Convert.ToInt32(value.Substring(0, 3)) + 1911 + "-" + value.Substring(3, 2) + "-" + value.Substring(5, 2)).ToString("yyyy-MM-dd");
                    return value3;
                case "MM"://月份
                    string MM = mm;
                    return MM;
                case "MMdd"://日期
                    string MMdd = mm + dd;
                    return MMdd;
                default:
                    return "";
            }
        }
        #endregion

        #region GetDomainName 取得網域名稱
        public static string GetDomainName()
        {
            var scheme = Current.Request.Scheme;
            var host = Current.Request.Host.Value;

            return $"{scheme}://{host}";
        }
        #endregion

        #region GetAppsetting 取得config設定
        public static string GetAppsettingValue(string type, string key)
        {
            IConfiguration _config = new ConfigurationBuilder().AddJsonFile("appsettings.json").Build();
            string value = _config.GetValue<string>(type + ":" + key);
            return value;
        }
        #endregion

        #region GetMapPath 取得路徑
        public static string GetMapPath(string path)
        {
            return Path.Combine(Directory.GetCurrentDirectory(), path);
        }
        #endregion

    }
}
