using Hangfire;
using KSIKernel_Core.Database;
using KSIKernel_Core;
using System.Collections;
using Sinon_Factory.Services;

namespace Sinon_Factory.App_Libs
{
    public class HangfireStartupScheduling
    {
        private static IConfiguration _config;
        public static void Run()
        {
            _config = new ConfigurationBuilder().AddJsonFile("appsettings.json").Build();
            bool isEnabled = _config.GetValue<bool>("appSettings:EnabledSchedule");
            if (isEnabled)
            {
                //加入欲執行排程
                RecurringJob.AddOrUpdate("CheckCaptchaTask", () => CheckCaptchaTask(), "*/5 * * * *");
                RecurringJob.AddOrUpdate("AccountIdleTask", () => AccountIdleTask(), Cron.Daily);
            }
        }

        public static Task SampleTask()
        {
            MyLogger myLogger = new MyLogger(LoggerType.SYSTEM, "SampleTask");
            try
            {
                myLogger.WriteLog(LogType.Info, "啟動排程:SampleTask");
            }
            catch (Exception ex)
            {
                myLogger.WriteLog(LogType.Error, "SampleTask發生錯誤：" + ex.Message);
            }
            return Task.CompletedTask;
        }

        public static Task FileWatchTask()
        {
            MyLogger myLogger = new MyLogger(LoggerType.SYSTEM, "FileWatchTask");
            try
            {
                myLogger.WriteLog(LogType.Info, "啟動排程:FileWatchTask");
                FileWatchService fileWatchService = new FileWatchService();
                fileWatchService.Run();
            }
            catch (Exception ex)
            {
                myLogger.WriteLog(LogType.Error, "FileWatchTask發生錯誤：" + ex.Message);
            }
            return Task.CompletedTask;
        }

        public static Task AccountIdleTask()
        {
            MyLogger myLogger = new MyLogger(LoggerType.SYSTEM, "AccountIdleTask");
            try
            {
                myLogger.WriteLog(LogType.Info, "啟動排程:AccountIdleTask");
                DBController dbc = new DBController();
                Hashtable ht = new Hashtable();
                string sql = @"UPDATE SYSPASMI
			                    SET DEL_CD = '1', END_DATE = GETDATE() 
			                    WHERE DEL_CD = '0'
                                AND PASS_CODE = '0'
                                AND GETDATE() > DATEADD(MONTH, 6, LDATE ) ";
                int updateCount = dbc.DbExecuteNonQuery(sql, ht);
                myLogger.WriteLog(LogType.Info, "系統自動停用閒置帳號:共" + updateCount + "筆 資料");
            }
            catch (Exception ex)
            {
                myLogger.WriteLog(LogType.Error, "AccountIdleTask發生錯誤：" + ex.Message);
            }
            return Task.CompletedTask;
        }

        public static Task CheckCaptchaTask()
        {
            try
            {
                DBController dbc = new DBController();
                Hashtable ht = new Hashtable();
                string sql = @"DELETE SYSCAPTCHA WHERE EXPIRE_DATE < GETDATE() ";
                dbc.DbExecuteNonQuery(sql, ht);
            }
            catch (Exception ex)
            {

            }
            return Task.CompletedTask;
        }
    }
}
