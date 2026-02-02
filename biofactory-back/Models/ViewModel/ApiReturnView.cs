using System.Data;

namespace Sinon_Factory.Models.ViewModel
{
    public class ApiReturnView
    {
        public int res_code { get; set; }
        public string res_msg { get; set; }
        public DataTable data { get; set; }

        // 成功回傳
        public static ApiReturnView Success(DataTable dt, string msg = "成功")
        {
            return new ApiReturnView
            {
                res_code = 200,
                res_msg = msg,
                data = dt
            };
        }

        // 失敗回傳
        public static ApiReturnView Error(string msg, int code = 500)
        {
            return new ApiReturnView
            {
                res_code = code,
                res_msg = msg,
                data = new DataTable()
            };
        }
    }
}
