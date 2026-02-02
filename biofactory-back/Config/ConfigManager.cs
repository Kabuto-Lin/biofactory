namespace Sinon_Factory.Config;

public class ConfigManager
{
    /// <summary>
    /// 連線訊息
    /// </summary>
    public static ConnectionStrings ConnectionStrings { get; set; }
    /// <summary>
    /// 訊息JWT加密金鑰
    /// </summary>
    public static string JwtHashKey { get; set; }
    /// <summary>
    /// 登入JWT相關設定
    /// </summary>
    public static JWTSettings JWT { get; set; }

    /// <summary>
    /// 網站連結
    /// </summary>
    public static WebUrl WebUrl { get; set; }

    /// <summary>
    /// 網站連結
    /// </summary>
    public static AppSettings AppSettings { get; set; }
}

/// <summary>
/// 連線設定
/// </summary>
public class ConnectionStrings
{
    /// <summary>
    /// MsSQL資料庫連線資訊
    /// </summary>
    public string CString1 { get; set; }
    /// <summary>
    /// Log4Net資料庫連線資訊
    /// </summary>
    public string Log4net { get; set; }
}

/// <summary>
/// JWT相關設定
/// </summary>
public class JWTSettings
{
    /// <summary>
    /// AuthKey
    /// </summary>
    public string AuthKey { get; set; }

    /// <summary>
    /// JwtHashKey
    /// </summary>
    public string JwtHashKey { get; set; }

    /// <summary>
    /// Key
    /// </summary>
    public string Key { get; set; }

    /// <summary>
    /// Issuer
    /// </summary>
    public string Issuer { get; set; }

    /// <summary>
    /// Audience
    /// </summary>
    public string Audience { get; set; }

    /// <summary>
    /// ExpiryMinutes
    /// </summary>
    public int ExpiryMinutes { get; set; }
}

/// <summary>
/// 網站連結
/// </summary>
public class WebUrl
{
    /// <summary>
    /// Front
    /// </summary>
    public string Front { get; set; }

    /// <summary>
    /// Backend
    /// </summary>
    public string Backend { get; set; }
}

/// <summary>
/// 系統設定
/// </summary>
public class AppSettings
{
    /// <summary>
    /// 系統名稱
    /// </summary>
    public string AppName { get; set; }

    /// <summary>
    /// 使用資料庫名稱
    /// </summary>
    public string UseDB { get; set; }

    /// <summary>
    /// 使用資料庫種類
    /// </summary>
    public string DBType { get; set; }

    /// <summary>
    /// 是否開啟排程
    /// </summary>
    public bool EnabledSchedule { get; set; }

    /// <summary>
    /// 忘記密碼時效
    /// </summary>
    public int ResetPasswordExpiryMinutes { get; set; }

    /// <summary>
    /// 事件回報管理者Mail(如有多位時可用,分隔)
    /// </summary>
    public string ManagerMail { get; set; }
}