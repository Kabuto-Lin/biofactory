using System.Collections.Generic;

namespace Sinon_Factory.Models.Jwt
{
    public class AuthenticateResponseModel
    {
        public string userId { get; set; }
        public string userName { get; set; }
        public List<IDictionary<string, string>> userRole { get; set; }
        
        /// <summary>
        /// access token
        /// </summary>
        public string accessToken { get; set; }

        /// <summary>
        /// refresh token
        /// </summary>
        public string refreshToken { get; set; }
        public string dateType { get; set; }
    }
}
