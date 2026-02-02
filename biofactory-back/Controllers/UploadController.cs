using KSIKernel_Core;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Sinon_Factory.Controllers
{
    public class UploadController : ControllerBase
    {
        [Authorize]
        [HttpPost]
        public async Task<IActionResult> UploadFile([FromForm] List<IFormFile> files)
        {
            MyLogger myLogger = new MyLogger(LoggerType.SYSTEM, "Upload");

            // Check if the request contains multipart/form-data.
            if (!Request.HasFormContentType)
            {
                return StatusCode(StatusCodes.Status415UnsupportedMediaType);
            }

            string l_root = Path.Combine(Directory.GetCurrentDirectory(), "zTmpUp");
            List<string> l_result = new List<string>();

            try
            {
                foreach (var file in files)
                {
                    var tempFileName = Path.GetRandomFileName();
                    var filePath = Path.Combine(l_root, tempFileName);

                    using (var stream = System.IO.File.Create(filePath))
                    {
                        await file.CopyToAsync(stream);
                    }
                    myLogger.WriteLog(LogType.Info, string.Format("[UploadFile][原始名稱:{0}][存檔名稱:{1}]", file.FileName, tempFileName));
                    l_result.Add(tempFileName);
                }

                return Ok(l_result);
            }
            catch (Exception e)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, e.Message);
            }
        }
    }
}
