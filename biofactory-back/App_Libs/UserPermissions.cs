using KSIKernel_Core;
using KSIKernel_Core.Database;
using System.Collections;
using System.Data;
using System.Text;

namespace Sinon_Factory.App_Libs
{
    #region 使用者權限定義 (注意︰非static)-------------------------------------------
    /// <summary>
    /// 目前User在某程式權限的Class
    /// </summary>
    [Serializable]
    public class UserPermissions
    {
        private IConfiguration _config;

        public UserPermissions(IConfiguration config)
        {
            _config = config;
        }
        private HashSet<UserActions> FE_UsrPri = new HashSet<UserActions>();

        public string Id { get; set; }

        public string _Prog_No { get; set; }
        public string Prog_No
        {
            get { return _Prog_No; }
        }
        public string _Prog_Id { get; set; }
        public string Prog_Id
        {
            get { return _Prog_Id; }
        }
        public string _Prog_Na { get; set; }
        public string Prog_Na
        {
            get { return _Prog_Na; }
        }
        //new a Set
        public UserPermissions()
        {
        }

        public UserPermissions(string a_Pass_No, string id, bool a_IsSuperUser)
        {
            Id = id;
            if (a_IsSuperUser)
            {
                _CanUse = true;
                _IsAvailable = true;
                FE_UsrPri.Add(UserActions.Insert);
                FE_UsrPri.Add(UserActions.Edit);
                FE_UsrPri.Add(UserActions.Delete);
                FE_UsrPri.Add(UserActions.Query);
                FE_UsrPri.Add(UserActions.Print);
                FE_UsrPri.Add(UserActions.SaveAs);
                FE_UsrPri.Add(UserActions.Display);
                FE_UsrPri.Add(UserActions.Other);
            }
            else
            {
                StringBuilder l_SQL = new StringBuilder();
                l_SQL.Append("SELECT M.Id,M.PROG_NO, D.Prog_Na, D.run_day, D.run_wday, D.run_time_b, D.run_time_e ,  ");
                l_SQL.Append("                 SUM(CASE INS WHEN 'Y' THEN 1 ELSE 0 END) INS,     ");
                l_SQL.Append("                 SUM(CASE UPD WHEN 'Y' THEN 1 ELSE 0 END) UPD,     ");
                l_SQL.Append("                 SUM(CASE DEL WHEN 'Y' THEN 1 ELSE 0 END) DEL,     ");
                l_SQL.Append("                 SUM(CASE QUR WHEN 'Y' THEN 1 ELSE 0 END) QUR,     ");
                l_SQL.Append("                 SUM(CASE PRT WHEN 'Y' THEN 1 ELSE 0 END) PRT,     ");
                l_SQL.Append("                 SUM(CASE SAVEAS WHEN 'Y' THEN 1 ELSE 0 END) SAVEAS,      ");
                l_SQL.Append("                 SUM(CASE DISPLAY WHEN 'Y' THEN 1 ELSE 0 END) DISPLAY,               ");
                l_SQL.Append("                 SUM(CASE OTHER WHEN 'Y' THEN 1 ELSE 0 END) OTHER               ");
                l_SQL.Append("            FROM SYSPASMV M ");
                l_SQL.Append("			 left outer join SYSMNUMI D on D.ID = M.ID ");
                l_SQL.Append("           WHERE 1=1 ");
                l_SQL.Append("		     AND ( M.PASS_NO = @PASS_NO)  ");
                l_SQL.Append("             AND ( M.ID  = @ID) ");
                l_SQL.Append("             AND ( ISNULL(M.CAN_USE,'N') <> 'N' )  ");
                l_SQL.Append("           GROUP BY M.ID,M.PROG_NO, D.Prog_Na, D.run_day, D.run_wday, D.run_time_b, D.run_time_e     ");
                DataTable l_dt = null;
                DBController l_dbc = new DBController();
                Hashtable l_ht = new Hashtable();
                l_ht.Add("@PASS_NO", new StructureSQLParameter(a_Pass_No, SqlDbType.NVarChar));
                l_ht.Add("@ID", new StructureSQLParameter(Id, SqlDbType.NVarChar));
                l_dt = l_dbc.FillDataTable(l_SQL.ToString(), l_ht);
                if (l_dt.Rows.Count == 0)
                {
                    _CanUse = false;
                }
                else
                {
                    _CanUse = true;
                    if (Convert.ToInt16(l_dt.Rows[0]["INS"]) > 0)
                        FE_UsrPri.Add(UserActions.Insert);
                    if (Convert.ToInt16(l_dt.Rows[0]["UPD"]) > 0)
                        FE_UsrPri.Add(UserActions.Edit);
                    if (Convert.ToInt16(l_dt.Rows[0]["DEL"]) > 0)
                        FE_UsrPri.Add(UserActions.Delete);
                    if (Convert.ToInt16(l_dt.Rows[0]["QUR"]) > 0)
                        FE_UsrPri.Add(UserActions.Query);
                    if (Convert.ToInt16(l_dt.Rows[0]["PRT"]) > 0)
                        FE_UsrPri.Add(UserActions.Print);
                    if (Convert.ToInt16(l_dt.Rows[0]["SAVEAS"]) > 0)
                        FE_UsrPri.Add(UserActions.SaveAs);
                    if (Convert.ToInt16(l_dt.Rows[0]["DISPLAY"]) > 0)
                        FE_UsrPri.Add(UserActions.Display);
                    if (Convert.ToInt16(l_dt.Rows[0]["OTHER"]) > 0)
                        FE_UsrPri.Add(UserActions.Other);
                    _Prog_No = l_dt.Rows[0]["Prog_No"].ToString();
                    _Run_day = l_dt.Rows[0]["Run_day"].ToString();
                    _Prog_Na = l_dt.Rows[0]["Prog_Na"].ToString();
                    _Run_day = l_dt.Rows[0]["Run_day"].ToString();
                    _Run_wday = l_dt.Rows[0]["Run_wday"].ToString();
                    _Run_time_b = l_dt.Rows[0]["Run_time_b"].ToString();
                    _Run_time_e = l_dt.Rows[0]["Run_time_e"].ToString();
                    _IsAvailable = ckIsAvailable(l_dt.Rows[0]["run_day"].ToString(), l_dt.Rows[0]["run_wday"].ToString(), l_dt.Rows[0]["run_time_b"].ToString(), l_dt.Rows[0]["run_time_e"].ToString());
                }
            }

        }

        bool ckIsAvailable(string as_Days, string as_WDays, string as_Time_B, string as_Time_E)
        {
            bool l_isAva = true;
            //每月可執行日
            if (!string.IsNullOrEmpty(as_Days))
            {
                l_isAva = false;
                string l_dd = DateTime.Now.Day.ToString();
                string[] l_days = as_Days.Split(';');
                foreach (string l_d in l_days)
                {
                    if (l_d == l_dd)
                    {
                        l_isAva = true;
                        break;
                    }
                }
                if (!l_isAva) return false;
            }
            //每週可執行日
            if (!string.IsNullOrEmpty(as_WDays))
            {
                l_isAva = false;
                int li_dd = DateTime.Now.DayOfWeek == 0 ? 7 : (int)DateTime.Now.DayOfWeek;
                string l_dd = li_dd.ToString();
                string[] l_days = as_WDays.Split(';');
                foreach (string l_d in l_days)
                {
                    if (l_d == l_dd)
                    {
                        l_isAva = true;
                        break;
                    }
                }
                if (!l_isAva) return false;
            }
            //時間起訖
            if (!string.IsNullOrEmpty(as_Time_B) && !string.IsNullOrEmpty(as_Time_E))
            {
                l_isAva = false;
                string l_HHMM = DateTime.Now.Hour.ToString().PadLeft(2, '0') + DateTime.Now.Minute.ToString().PadLeft(2, '0');
                if (Convert.ToInt16(l_HHMM) >= Convert.ToInt16(as_Time_B) && Convert.ToInt16(l_HHMM) <= Convert.ToInt16(as_Time_E))
                {
                    l_isAva = true;
                }
                if (!l_isAva) return false;
            }
            return true;
        }
        //加入權限
        public void AddUsrPri(UserActions a_enum_UsrPri)
        {
            FE_UsrPri.Add(a_enum_UsrPri);
        }
        //移除權限
        public void ReMoveUsrPri(UserActions a_enum_UsrPri)
        {
            FE_UsrPri.Remove(a_enum_UsrPri);
        }
        //Set權限
        public void SetUsrPri(UserActions a_enum_UsrPri, bool a_YN)
        {
            if (a_YN)
            {
                if (!FE_UsrPri.Contains(a_enum_UsrPri))
                    FE_UsrPri.Add(a_enum_UsrPri);
            }
            else
                FE_UsrPri.Remove(a_enum_UsrPri);
        }

        bool _CanUse;
        //是否有"執行"權限
        public bool CanUse
        {
            get { return _CanUse; }
        }

        bool _IsAvailable;
        //目前是否為"可執行時段"
        public bool IsAvailable
        {
            get { return _IsAvailable; }
        }

        //是否有"新增"權限
        public bool CanInsert
        {
            get { return FE_UsrPri.Contains(UserActions.Insert); }
            set { SetUsrPri(UserActions.Insert, value); }
        }
        //是否有"修改"權限
        public bool CanEdit
        {
            get { return FE_UsrPri.Contains(UserActions.Edit); }
            set { SetUsrPri(UserActions.Edit, value); }
        }
        //是否有"刪除"權限
        public bool CanDelete
        {
            get { return FE_UsrPri.Contains(UserActions.Delete); }
            set { SetUsrPri(UserActions.Delete, value); }
        }
        //是否有"查詢"權限
        public bool CanQuery
        {
            get { return FE_UsrPri.Contains(UserActions.Query); }
            set { SetUsrPri(UserActions.Query, value); }
        }
        //是否有"列印"權限
        public bool CanPrint
        {
            get { return FE_UsrPri.Contains(UserActions.Print); }
            set { SetUsrPri(UserActions.Print, value); }
        }
        //是否有"另存新檔"權限
        public bool CanSaveAs
        {
            get { return FE_UsrPri.Contains(UserActions.SaveAs); }
            set { SetUsrPri(UserActions.SaveAs, value); }
        }
        //程式是否顯示在MENU上
        public bool CanData_Cost
        {
            get { return FE_UsrPri.Contains(UserActions.Display); }
            set { SetUsrPri(UserActions.Display, value); }
        }
        //是否有"其他"資料權限
        public bool CanData_Price
        {
            get { return FE_UsrPri.Contains(UserActions.Other); }
            set { SetUsrPri(UserActions.Other, value); }
        }
        //是否有"密碼保護"
        //public bool IsPwdLock
        //{
        //    get { return FE_UsrPri.Contains(UserActions.PwdLock); }
        //    set { SetUsrPri(UserActions.PwdLock, value); }
        //}

        string _Run_day;
        public string Run_day
        {
            get { return _Run_day; }
        }
        string _Run_wday;
        public string Run_wday
        {
            get { return _Run_wday; }
        }
        string _Run_time_b;
        public string Run_time_b
        {
            get { return _Run_time_b; }
        }
        string _Run_time_e;
        public string Run_time_e
        {
            get { return _Run_time_e; }
        }



        //檢查User->使用程式權限
        public static bool CkUserPri(HttpRequest a_Request, ISession a_Session, ref string a_viewName)
        {
            string _token = General.nvl(a_Request.Headers.Authorization.ToString().Replace("Bearer ", ""), "").ToString();
            if (UserInfo.getUserInfo(_token) == null)
            {
                a_viewName = "/Home/Login";
                return false;
            }
            else
            {
                string l_PASS_NO = UserInfo.getUserInfo(_token).PNO;
                string l_Prog_No = a_Request.RouteValues["controller"].ToString();
                a_Request.Query.TryGetValue("Prog_Id", out var progId);
                string l_Prog_Id = progId.FirstOrDefault();
                //在此加入個別程式權限判斷
                a_viewName = "AccessDenied";
            }
            return true;
        }

        /// <summary>
        /// 設定程式可以使用的按鈕
        /// </summary>
        /// <param name="insert">新增</param>
        /// <param name="delete">刪除</param>
        /// <param name="save">存檔</param>
        /// <param name="search">查詢</param>
        /// <param name="copy">複製</param>
        /// <param name="expXls">匯出xlsx</param>
        /// <param name="exportOds">匯出ods</param>
        /// <param name="expDetailXls">匯出明細xlsx</param>
        /// <param name="print">pdf</param>
        /// <param name="xls">報表程式另存xlsx</param>
        /// <param name="ods">報表程式另存ods</param>
        /// <param name="doc">報表程式另存doc</param>
        /// <param name="close">當為Modal時顯示關閉</param>
        /// <param name="batchPrintSetting">批次設定</param>
        /// <param name="manual">顯示程式說明</param>
        /// <param name="first">移至第一筆</param>
        /// <param name="prior">移至上一筆</param>
        /// <param name="next">移至下一筆</param>
        /// <param name="last">移至最後筆</param>
        /// <param name="goBack">返回</param>
        /// <returns></returns>
        public static HashSet<NavBtn> SetButtons(bool insert = false, bool delete = false, bool save = false, bool search = false, bool copy = false,
            bool expXls = false, bool exportOds = false, bool expDetailXls = false, bool print = false, bool xls = false, bool ods = false, bool doc = false, bool odt = false, bool close = false, bool batchPrintSetting = false, bool manual = false,
            bool first = true, bool prior = true, bool next = true, bool last = true, bool goBack = true)
        {
            HashSet<NavBtn> buttons = new HashSet<NavBtn>();
            if (insert == true)
            {
                buttons.Add(NavBtn.Ins);
            }
            if (delete == true)
            {
                buttons.Add(NavBtn.Del);
            }
            if (save == true)
            {
                buttons.Add(NavBtn.Save);
            }
            if (search == true)
            {
                buttons.Add(NavBtn.Search);
            }
            if (copy == true)
            {
                buttons.Add(NavBtn.Copy);
            }
            if (expXls == true)
            {
                buttons.Add(NavBtn.ExpXls);
            }
            if (exportOds == true)
            {
                buttons.Add(NavBtn.ExportOds);
            }
            if (expDetailXls == true)
            {
                buttons.Add(NavBtn.ExpDetailXls);
            }
            if (print == true)
            {
                buttons.Add(NavBtn.Print);
                buttons.Add(NavBtn.PreviewPdf);
            }
            if (xls == true)
            {
                buttons.Add(NavBtn.Xls);
            }
            if (ods == true)
            {
                buttons.Add(NavBtn.Ods);
            }
            if (doc == true)
            {
                buttons.Add(NavBtn.Doc);
            }
            if (odt == true)
            {
                buttons.Add(NavBtn.Odt);
            }
            if (close == true)
            {
                buttons.Add(NavBtn.Close);
            }
            if (batchPrintSetting == true)
            {
                buttons.Add(NavBtn.BatchPrintSetting);
            }
            if (manual == true)
            {
                buttons.Add(NavBtn.Manual);
            }
            if (first == true)
            {
                buttons.Add(NavBtn.First);
            }
            if (prior == true)
            {
                buttons.Add(NavBtn.Prior);
            }
            if (next == true)
            {
                buttons.Add(NavBtn.Next);
            }
            if (last == true)
            {
                buttons.Add(NavBtn.Last);
            }
            if (goBack == true)
            {
                buttons.Add(NavBtn.GoBack);
            }
            return buttons;
        }
    }
    #endregion
}
