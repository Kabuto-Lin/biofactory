using KSIKernel_Core;
using KSIKernel_Core.Database;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json.Linq;
using Sinon_Factory.App_Libs;
using System.Collections;
using System.ComponentModel;
using System.Data;
using System.Text;

namespace Sinon_Factory.Controllers.SYS
{
    [Route("api/[controller]")]
    [ApiController]
    public class apiSYSBPT010Controller : MasterApiController, IApiController.MD
    {
        private IHttpContextAccessor _httpContextAccessor;
        public apiSYSBPT010Controller(IHttpContextAccessor httpContextAccessor) : base(httpContextAccessor)
        {
            _httpContextAccessor = httpContextAccessor;
        }

        /// <summary>
        /// ----初始化 initializing ----------------------------------------------
        /// GET: /api/api程式名稱/Init
        /// </summary>
        /// <returns>Return MasterClass</returns>
        [HttpGet]
        [Route("Init")]
        public IActionResult Init()
        {
            Searching += l_Master_Searching; //加入查詢條件
            Searched += l_Master_Searched; //加入查詢條件
            Initialing += l_Master_Initialing; //加入下拉元件
            return doInitResult();
        }

        void l_Master_Initialing(object sender, EventArgs e)
        {
            MasterClass l_Master = (MasterClass)sender;
            //l_Master.opData.Tables.Add(new PRClass().getYearOption());

            #region 建立月份下拉
            DataTable dtMONTH = new DataTable("MONTH");
            dtMONTH.Columns.Add("KEY", typeof(string));
            dtMONTH.Columns.Add("DESC", typeof(string));
            for (int i = 1; i <= 12; i++)
            {
                DataRow dr = dtMONTH.NewRow();
                dr.ItemArray = new string[] { i.ToString("D2"), i.ToString("D2") };
                dtMONTH.Rows.Add(dr);
            }
            l_Master.opData.Tables.Add(dtMONTH);
            #endregion
        }

        public override MasterClass getMaster(IHttpContextAccessor httpContextAccessor)
        {
            //SQL必須加入1=1條件
            StringBuilder l_SQL = new StringBuilder();
            l_SQL.Append(@"select m.* ");
            l_SQL.Append("from fnxacontmi m  ");
            l_SQL.Append(" where 1=1 ");
            l_SQL.Append("order by acontmi_no desc");
            //回傳Master Object 
            return new MasterClass()
            {
                tableName = "fnxacontmi",
                isNoDataFirstLoad = false, //程式第一次載入時是否有資料
                sQL = l_SQL.ToString().ToUpper(),
                keyField = new string[1] { "ACONTMI_NO" },
                keyField_C = new string[1] { "編號" },//主鍵值欄位中文
                notNullField = new string[1] { "ACONTMI_NAME" },//不可空白欄位
                noEditButInsertField = new string[0] { },//不可編輯,但可新增欄位
                noEditField = new string[5] { "ACONTMI_NO", "MOD_USER", "MOD_DTE", "CRT_USER", "CRT_DTE" }, //不可編輯欄位
                noCopyField = null,//不複製欄位
                searchData = new SearchClass() { },//查詢條件預設值
                rptNa = "報表"
            };
        }

        /// <summary>
        /// ----查詢doSearch ----------------------------------------------
        /// Post: /api/api程式名稱/Search
        /// </summary>
        /// <returns>return TransDataClass</returns>
        [HttpPost]
        [Route("Search")]
        public IActionResult Search([FromBody] SearchClass a_Search)
        {
            Searching += l_Master_Searching; //加入查詢條件
            Searched += l_Master_Searched;
            return doSearchResult(a_Search);
        }

        /// <summary>
        /// ----新增Insert ----------------------------------------------
        /// Post: /api/api程式名稱/Insert
        /// </summary>
        /// <returns>return TransDataClass</returns>
        [HttpPost]
        [Route("Insert")]
        public IActionResult Insert([FromBody] DeltaMD a_dr)
        {
            Posting += l_Master_Posting;
            //l_Master.RefreshMasterData += l_Master_RefreshMasterData;
            return doPostResult(enStatus.Insert, a_dr);
        }

        /// <summary>
        /// ----修改Edit ----------------------------------------------
        /// Post: /api/api程式名稱/Edit
        /// </summary>
        /// <returns>return TransDataClass</returns>
        [HttpPost]
        [Route("Edit")]
        public IActionResult Edit([FromBody] DeltaMD a_dr)
        {
            Posting += l_Master_Posting;
            //l_Master.RefreshMasterData += l_Master_RefreshMasterData;
            return doPostResult(enStatus.Edit, a_dr);
        }


        /// <summary>
        /// ----刪除 Delete ----------------------------------------------
        /// Post: /api/api程式名稱/Delete
        /// </summary>
        /// <returns>return TransDataClass</returns>
        [HttpPost]
        [Route("Delete")]
        public IActionResult Delete([FromBody] DeltaMD a_dr)
        {
            Posting += l_Master_Posting;
            return doPostResult(enStatus.Delete, a_dr);
        }

        /// <summary>
        /// ----明細 Detail ----------------------------------------------
        /// Post: /api/api程式名稱/Detail
        /// </summary>
        /// <returns>return DataSet</returns>
        [HttpPost]
        [Route("Detail")]
        public IActionResult Detail([FromBody] DeltaMD a_dr)
        {
            return doGetDetailResult(a_dr);
        }

        //回傳Details的定義
        public DetailClass[] getDetails()
        {
            //請購科目明細
            string l_SQL_D1 = @" select * from fnxacontti where 1=1 
and  acontmi_no = @ACONTMI_NO
order by acontti_no ";

            //回傳Detail Object
            return new DetailClass[1]
            {
					//請購科目明細
					new DetailClass()
                    {
                        tableName = "FNXACONTTI",
                        sQL = l_SQL_D1.ToString(),
                        keyField = new string[2] { "ACONTMI_NO", "ACONTTI_NO"},
                        linkKey_M = new string[1] {"ACONTMI_NO" },
                        linkKey = new string[1] { "ACONTMI_NO" },
                        notNullField = new string[0] {},//不可空白欄位
						noEditButInsertField = new string[0] {},//不可編輯,但可新增欄位
						noEditField = new string[1] {  "ACONTMI_NO" },//不可編輯欄位
						noCopyField = new string[1] { "ACONTTI_NO"},//不可複製欄位
						rptNa = "明細",
                    }
            };
        }

        //定義查詢欄位內容（欄位請一律用大寫）
        //定義查詢欄位內容（欄位請一律用大寫）
        public class SearchClass : ISearchClass
        {
            //查詢-使用者
            public string ACONTMI_USER { get; set; }
            //查詢-批次名稱
            public string ACONTMI_NAME { get; set; }

            //列印-批次編號
            public int PACONTMI_NO { get; set; }
            //列印-批次名稱
            public string PACONTMI_NAME { get; set; }
            //1:列印項目 2:列印目錄
            public string PRINTTYPE { get; set; }
            //目錄類型 1:直式 2:橫式
            public string CONTENT_TYPE { get; set; }
            //列印時附加目錄:  0:不附加 1:附加
            public string APPEND_TYPE { get; set; }
        }

        //查詢事件，組SQL
        void l_Master_Searching(object sender, SearchingEventArgs e)
        {
            SearchClass l_Search = (SearchClass)e.SearchData;
            string l_SQL = "";

            var Session = HttpContext.Session;
            //l_SQL = l_SQL + " AND M.ACONTMI_USER = @ACONTMI_USER ";
            //e.ht.Add("@ACONTMI_USER", new StructureSQLParameter(UtilityBase.PASS_NO(Session), SqlDbType.NVarChar));

            if (!string.IsNullOrEmpty(l_Search.ACONTMI_NAME))
            {
                l_SQL = l_SQL + " AND (IsNull(m.ACONTMI_NAME,'') like '%'+@ACONTMI_NAME+'%')";
                e.ht.Add("@ACONTMI_NAME", new StructureSQLParameter(l_Search.ACONTMI_NAME, SqlDbType.NVarChar));
            }

            e.MasterSQL = e.MasterSQL.Replace("1=1", "1=1 " + l_SQL);
        }

        //查詢事件，組SQL
        void l_Master_Searched(object sender, SearchedEventArgs e)
        {

        }

        /// <summary>
        /// Posting事件
        /// </summary>
        /// <param name="sender"></param>
        /// <param name="e"></param>
        void l_Master_Posting(object sender, CancelMsgEventArgs e)
        {
            if (e.status == enStatus.Insert)
            {

                e.newRow["ACONTMI_NO"] = getNewAcomtmiNo();
                e.newRow["ACONTMI_DEPART"] = UserInfo.getUserInfo(_httpContextAccessor.HttpContext.Request.Headers.Authorization).DPD_NO;
                e.newRow["ACONTMI_USER"] = UserInfo.getUserInfo(_httpContextAccessor.HttpContext.Request.Headers.Authorization).PNO;

            }
            if (e.status == enStatus.Edit)
            {

            }

            if (e.status == enStatus.Delete)
            {
            }

        }

        #region 批次列印
        //列印事件
        [HttpPost]
        [Route("Print")]
        public IActionResult Print([FromBody] SearchClass a_Search)
        {
            SearchClass l_Search = a_Search;
            if (a_Search.PRINTTYPE == "2")
            {
                Dictionary<string, object> l_dic = new Dictionary<string, object>();
                return new OkObjectResult(l_dic);
            }
            else
            {
                //------批次列印開始------ ((不跑MasterClass))
                List<ReportResult> reportResultList = new List<ReportResult>();

                string acontmi_no = UtilityBase.nvl(l_Search.PACONTMI_NO, "0").ToString();

                DBController dbc = new DBController();
                StringBuilder sql = new StringBuilder();
                Hashtable ht = new Hashtable();

                //---查詢此批次目次
                sql.Append(@"/*[SYSBPT010].l_Master_Posting Insert取號*/
select * from fnxacontti where acontmi_no = @acontmi_no
order by acontti_no");

                ht.Add("@acontmi_no", new StructureSQLParameter(acontmi_no, SqlDbType.VarChar));

                DataTable dt = dbc.FillDataTable(sql.ToString(), ht);

                List<ReportContent> listReportContent = new List<ReportContent>();

                if (dt.Rows.Count > 0)
                {
                    foreach (DataRow dtRow in dt.Rows)
                    {
                        string dtRowAcontti_No = (string)UtilityBase.nvl(dtRow["ACONTTI_NO"], "");
                        string dtRowAcontti_Prgarea = (string)UtilityBase.nvl(dtRow["ACONTTI_PRGAREA"], "");
                        string dtRowAcontti_Prgno = (string)UtilityBase.nvl(dtRow["ACONTTI_PRGNO"], "");
                        string dtRowAcontti_Param_Str = (string)UtilityBase.nvl(dtRow["ACONTTI_PARAM_STR"], "");
                        int dtRowAcontti_Jump_page = (int)UtilityBase.nvl(dtRow["ACONTTI_JUMP_PAGE"], 0);
                        string dtRowAcontti_Print = (string)UtilityBase.nvl(dtRow["ACONTTI_PRINT"], "");

                        if (dtRowAcontti_Prgno != "" &&
                            dtRowAcontti_Param_Str != "" &&
                            dtRowAcontti_Print == "1")
                        {

                            JObject json = JObject.Parse(dtRowAcontti_Param_Str);

                            string rootNamespace = GetType().Namespace.Split('.')[0];
                            string classNamespace = "";

                            if (dtRowAcontti_Prgarea != "")
                            {
                                classNamespace = string.Format("{0}.Areas.{1}.Controllers.api{2}Controller", rootNamespace, dtRowAcontti_Prgarea, dtRowAcontti_Prgno);
                            }
                            else
                            {
                                classNamespace = string.Format("{0}.Controllers.api{1}Controller", rootNamespace, dtRowAcontti_Prgno);
                            }

                            #region 取得SearchClass

                            Type searchClassType = Type.GetType(classNamespace + "+SearchClass");

                            dynamic searchClass = Activator.CreateInstance(searchClassType);

                            foreach (var field in searchClassType.GetProperties())
                            {
                                Type filedType = Type.GetType(field.PropertyType.FullName);

                                if (filedType == null)
                                {
                                    if (field.PropertyType.IsEnum)
                                    {
                                        object enumValue = Enum.Parse(field.PropertyType, json[field.Name].ToString());
                                        field.SetValue(searchClass, enumValue);
                                    }
                                }
                                else
                                {
                                    var converter = TypeDescriptor.GetConverter(filedType);
                                    if (!(filedType == typeof(List<string>)))
                                    {
                                        var result = converter.ConvertFrom(json[field.Name].ToString());
                                        field.SetValue(searchClass, result);
                                    }
                                    else
                                    {
                                        var result = new List<string>(json[field.Name].ToString().Trim('[', ']').Split(new char[] { ',' }, StringSplitOptions.RemoveEmptyEntries).Length);
                                        field.SetValue(searchClass, result);
                                    }
                                }
                            }

                            foreach (var field in searchClassType.GetFields())
                            {
                                string typeName = field.FieldType.FullName;
                                if (typeName.IndexOf("KSIKernel_Core") != -1)
                                {
                                    typeName += ",KSIKernel_Core";
                                }

                                Type filedType = Type.GetType(typeName);
                                TypeConverter converter = new TypeConverter();
                                converter = TypeDescriptor.GetConverter(filedType);

                                if (json[field.Name].HasValues)
                                {
                                    var result = converter.ConvertFrom(json[field.Name].ToString());
                                    field.SetValue(searchClass, result);
                                }
                                else
                                {
                                    field.SetValue(searchClass, null);
                                }

                            }

                            #endregion

                            #region 取得ReportMultiContent

                            Type apiControllerType = Type.GetType(classNamespace);
                            dynamic apiController = Activator.CreateInstance(apiControllerType);
                            PrintCancelMsgEventArgs printEvent = new PrintCancelMsgEventArgs(searchClass);
                            List<ReportContent> rptContentList = apiController.getPrintReportContent(printEvent);

                            //放入批次目次參數
                            foreach (ReportContent rptContent in rptContentList)
                            {
                                if (!rptContent.reportParameter.ContainsKey("_BATCH_ACONTMINO"))
                                {
                                    rptContent.reportParameter.Add("_BATCH_ACONTMINO", acontmi_no);
                                }
                                else
                                {
                                    rptContent.reportParameter.Add("_BATCH_ACONTMINO", acontmi_no);
                                }

                                if (!rptContent.reportParameter.ContainsKey("_BATCH_ACONTTINO"))
                                {
                                    rptContent.reportParameter.Add("_BATCH_ACONTTINO", dtRowAcontti_No);
                                }
                                else
                                {
                                    rptContent.reportParameter.Add("_BATCH_ACONTTINO", dtRowAcontti_No);
                                }
                            }

                            //在第一個報表加入空白頁數
                            rptContentList[0].blankPageCount = dtRowAcontti_Jump_page;

                            ReportResult reportResult = new ReportResult();
                            reportResult.mergeType = printEvent.MergeType;
                            reportResult.ReportContent = rptContentList;
                            reportResultList.Add(reportResult);
                            #endregion
                        }
                    }

                    PDFMerger l_PDF = new PDFMerger();

                    int lastPages = 0;
                    foreach (ReportResult rpt in reportResultList)
                    {
                        ReportHelper reportHelper = new ReportHelper();
                        rpt.ReportContent[0].blankPageCount += lastPages;
                        lastPages = 0;
                        ReportResult result = reportHelper.getReport(rpt);
                        lastPages = result.printedPages;
                        l_PDF.AddFile(result.printedTempFilePath); //加入pdf合併
                    }

                    //取得檔名
                    var l_session = HttpContext.Session;
                    string l_PdfName = DateTime.Now.ToString("yyyyMMddHHmmssff");
                    if (l_session != null)
                    {
                        l_PdfName = DateTime.Now.ToString("yyyyMMddHHmmssff") + "_" + l_session.Id;
                    }
                    //string l_PdfFolder_Disk = Path.GetFullPath("~/zTmp").Replace("~\\", "");
                    string l_PdfFolder_Disk = Path.GetFullPath("zTmp");
                    if (l_PdfFolder_Disk[l_PdfFolder_Disk.Length - 1] != '\\')
                        l_PdfFolder_Disk = l_PdfFolder_Disk + "\\";
                    string l_PdfNameWithPath = l_PdfFolder_Disk + l_PdfName + "_f.pdf";
                    l_PDF.DestinationFile = l_PdfNameWithPath;
                    l_PDF.MergeType = PDFMerger.MergeDocType.Append;
                    l_PDF.Execute();

                    #region 更新頁碼
                    StringBuilder l_SQL = new StringBuilder();

                    l_SQL.Append(@"/*[SYSBPT010Controller].l_Master_PrintedEx UpdatePages*/
update fnxacontti 
SET acontti_page_start = @PAGESTART,
acontti_page_end = @PAGEEND
WHERE  acontmi_no = @ACONTMI_NO and acontti_no = @ACONTTI_NO");

                    int startPage = 0;
                    int endPage = 0;
                    foreach (ReportResult rptResult in reportResultList)
                    {
                        Dictionary<string, string> nvc = rptResult.ReportContent[0].reportParameter;
                        int blankPage = rptResult.ReportContent[0].blankPageCount;
                        startPage = endPage + blankPage + 1;
                        endPage = startPage + rptResult.printedPages - 1;
                        Hashtable l_ht = new Hashtable();
                        l_ht.Add("@PAGESTART", new StructureSQLParameter(startPage, SqlDbType.VarChar));
                        l_ht.Add("@PAGEEND", new StructureSQLParameter(endPage, SqlDbType.VarChar));
                        l_ht.Add("@ACONTMI_NO", new StructureSQLParameter(nvc["_BATCH_ACONTMINO"], SqlDbType.VarChar));
                        l_ht.Add("@ACONTTI_NO", new StructureSQLParameter(nvc["_BATCH_ACONTTINO"], SqlDbType.VarChar));
                        int Count = dbc.DbExecuteNonQuery(l_SQL.ToString(), l_ht);
                    }
                    #endregion

                    #region 是否附加目錄
                    if (l_Search.APPEND_TYPE == "1")
                    {
                        ReportResult contentReportResult = new ReportResult();
                        contentReportResult.mergeType = PDFMerger.MergeDocType.Append;

                        Dictionary<string, string> mValueCollention = new Dictionary<string, string>();
                        mValueCollention.Add("@ACONTMI_NO", l_Search.PACONTMI_NO.ToString());
                        mValueCollention.Add("TITLE", l_Search.PACONTMI_NAME);

                        string rptName = "SYSBPT010-1.rpt";
                        if (l_Search.CONTENT_TYPE == "2")
                        {
                            rptName = "SYSBPT010.rpt";
                        }

                        List<ReportContent> contentList = new List<ReportContent>();
                        contentList.Add(new ReportContent(rptName, mValueCollention, UtilityBase.getReportType(l_Search.reportKind.ToString())));
                        contentReportResult.ReportContent = contentList;

                        contentReportResult = new ReportHelper().getReport(contentReportResult);

                        l_PDF = new PDFMerger();
                        l_PDF.AddFile(contentReportResult.printedTempFilePath);
                        l_PDF.AddFile(l_PdfNameWithPath);
                        l_PdfName = "M" + l_PdfName;
                        string l_PdfNameWithPath2 = l_PdfFolder_Disk + l_PdfName + "_f.pdf";
                        l_PDF.DestinationFile = l_PdfNameWithPath2;
                        l_PDF.MergeType = PDFMerger.MergeDocType.Append;
                        l_PDF.Execute();
                    }
                    #endregion

                    Dictionary<string, object> l_dic = new Dictionary<string, object>();
                    string[] fileName = l_PdfNameWithPath.Split('.');
                    string reportTitle = "批次列印";
                    if (fileName.Length > 1)
                    {
                        string subFileName = fileName[fileName.Length - 1];
                        reportTitle += "." + subFileName;
                    }

                    l_dic.Add("RptTitle", reportTitle);
                    l_dic.Add("RptFileName", l_PdfName + "_f.pdf");
                    l_dic.Add("RptKind", a_Search.reportKind.ToString());

                    //return
                    return new OkObjectResult(l_dic);
                }
                else
                {
                    Dictionary<string, object> l_dic = new Dictionary<string, object>();
                    return new ObjectResult(l_dic);
                }
            }
        }
        #endregion


        public decimal getNewAcomtmiNo()
        {
            DBController dbc = new DBController();
            string sql = @"/*[SYSBPT010].l_Master_Posting Insert取號*/
select isNull(Max(acontmi_no),-1)+1
from fnxacontmi
";
            return dbc.DbExecuteScalar_Dec(sql, new Hashtable());
        }
    }
}
