using JWT;
using JWT.Algorithms;
using JWT.Serializers;
using Microsoft.IdentityModel.Tokens;
using Newtonsoft.Json;
using System.Security.Cryptography;
using System.Text;

namespace Sinon_Factory.App_Libs
{
    public class JWTFunc
    {
        public static string Encode<T>(string HashKey, T Payload)
        {
            // 使用 SHA256 取代 MD5
            using (SHA256 sha256 = SHA256.Create())
            {
                byte[] strbt = Encoding.UTF8.GetBytes(HashKey);
                //對位元組進行 SHA256 加密
                byte[] result = sha256.ComputeHash(strbt);
                string HashKeySHA256 = BitConverter.ToString(result);
                HashKeySHA256 = HashKeySHA256.Replace("-", "").ToLower(); //轉換為小寫的十六進位字串

                // 处理 JWT 编码
                IJsonSerializer serializer = new JsonNetSerializer();
                IBase64UrlEncoder urlEncoder = new JwtBase64UrlEncoder();
                IJwtAlgorithm algorithm = new HMACSHA256Algorithm(); // symmetric
                IJwtEncoder encoder = new JwtEncoder(algorithm, serializer, urlEncoder);

                //使用 SHA256 產生的雜湊鍵加密 payload
                var encodeResult = encoder.Encode(Payload, HashKeySHA256);
                return encodeResult;
            }
        }

        public static T Decode<T>(string HashKey, string Token)
        {
            if (string.IsNullOrEmpty(Token))
                throw new Exception("尚有資料未確實填寫\n1:請求資料不可為空");

            using (SHA256 sha256 = SHA256.Create())
            {
                byte[] strbt = Encoding.UTF8.GetBytes(HashKey);
                // 使用 SHA256 對字節數組進行哈希計算
                byte[] result = sha256.ComputeHash(strbt);
                string HashKeySHA256 = BitConverter.ToString(result);
                HashKeySHA256 = HashKeySHA256.Replace("-", "").ToLower(); // 將結果轉換為小寫的十六進制字符串

                // 配置 JWT 解碼器
                IJsonSerializer serializer = new JsonNetSerializer();
                IDateTimeProvider provider = new UtcDateTimeProvider();
                IJwtValidator validator = new JwtValidator(serializer, provider);
                IBase64UrlEncoder urlEncoder = new JwtBase64UrlEncoder();
                IJwtAlgorithm algorithm = new HMACSHA256Algorithm(); // 使用 HMAC-SHA256 作為算法
                IJwtDecoder decoder = new JwtDecoder(serializer, validator, urlEncoder, algorithm);

                // 解碼 JWT Token
                var decodeResult = decoder.Decode(Token, HashKeySHA256, verify: true);

                // 將解碼結果反序列化為指定的對象類型
                var request_model = JsonConvert.DeserializeObject<T>(decodeResult);
                return request_model;
            }
        }
    }
}
