using System.ComponentModel.DataAnnotations;
using System.ComponentModel;

namespace Sinon_Factory.Models.Jwt
{
    public class AuthenticateRequestModel
    {
        [Required(ErrorMessage = " [帳號] 為必填欄位 ")]
        [DisplayName("帳號")]
        [StringLength(20, ErrorMessage = " [帳號] 不能超過20字元 ")]
        public string PNO { get; set; }

        [Required(ErrorMessage = " [密碼] 為必填欄位 ")]
        [DisplayName("密碼")]
        [StringLength(20, ErrorMessage = " [密碼] 不能超過20字元 ")]
        public string PWD { get; set; }

        [Required(ErrorMessage = " [驗證碼] 為必填欄位 ")]
        [DisplayName("驗證碼")]
        [StringLength(6, ErrorMessage = " [驗證碼] 不能超過6字元 ")]
        public string CODE { get; set; }

        public string sessionId { get; set; }
    }
}
