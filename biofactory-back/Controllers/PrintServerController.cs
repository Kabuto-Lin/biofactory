using Sinon_Factory.App_Libs;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json.Linq;
using Newtonsoft.Json;
using System.Net;
using System.Text;
using Microsoft.AspNetCore.Authorization;
using KSIKernel_Core;
using System.Net.Mime;
using System.Collections.Specialized;
using System.ComponentModel;
using System.Text.RegularExpressions;
using System.Web;

namespace Sinon_Factory.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class PrintServerController : ControllerBase
    {
        private readonly IWebHostEnvironment _webHostEnvironment;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public PrintServerController(IWebHostEnvironment webHostEnvironment, IHttpContextAccessor httpContextAccessor)
        {
            _webHostEnvironment = webHostEnvironment;
            _httpContextAccessor = httpContextAccessor;
        }

        [HttpPost]
        [Route("ReportViewer")]
        public IActionResult ReportViewer(string RptTitle, string RptFileName)
        {
            string pdfFolderDisk = Path.Combine(_webHostEnvironment.ContentRootPath, "zTmp");

            string fileUrl = Path.Combine(pdfFolderDisk, RptFileName.Replace("/", "").Replace("..", ""));

            if (System.IO.File.Exists(fileUrl))
            {
                var fileStream = new FileStream(fileUrl, FileMode.Open, FileAccess.Read);
                return new FileStreamResult(fileStream, "application/pdf")
                {
                    FileDownloadName = RptTitle
                };
            }
            else
            {
                return NotFoundResult("找不到檔案 !!");
            }
        }

        [HttpGet]
        [Route("DownloadFile")]
        public IActionResult DownloadFile()
        {
            NameValueCollection l_col = HttpUtility.ParseQueryString(_httpContextAccessor.HttpContext.Request.QueryString.Value, Encoding.UTF8);
            string l_fileName = l_col["FileName"].Replace("/", "").Replace("..", "");
            string l_SaveName = l_col["SaveName"].Replace("/", "").Replace("..", ""); 
            var l_serverPath = Path.GetFullPath("zTmp/");
            string l_fileNameWithPath = Path.Combine(l_serverPath, l_fileName);
            var l_fileInfo = new FileInfo(l_fileNameWithPath);

            if (!l_fileInfo.FullName.Contains(l_serverPath))
            {
                return NotFound();
            }

            Regex regex = new Regex(@"^([a-zA-Z]:\\)?[^\/\:\*\?\""\<\>\|\,]*$");
            bool isCorrespond = regex.IsMatch(l_fileName);
            return !l_fileInfo.Exists || !isCorrespond
                ? NotFound()
                : new FileActionResult(l_fileInfo.FullName, l_SaveName);
        }

        private IActionResult PhysicalFile(string l_fileNameWithPath, string v, string l_SaveName)
        {
            throw new NotImplementedException();
        }

        private IActionResult NotFoundResult(string v)
        {
            throw new NotImplementedException();
        }

        public class PrintData
        {
            //public Dictionary<string, object> data { get; set; }
            public string progArea { get; set; }
            public string progApi { get; set; }
            public Dictionary<string, object> searchData { get; set; }
        }
    }
}
