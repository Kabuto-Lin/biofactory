export const BASEURL = import.meta.env.VITE_BASEURL;
import Swal from 'sweetalert2';

export const getToken = async (loginData) => {
  const authorization = import.meta.env.VITE_TOKEN_AUTH;
  // const url = `${BASEURL}Auth/Login`;
  const url = `${BASEURL}api/Auth/Login`;
  

  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${authorization}`,
    },
    body: JSON.stringify(loginData),
  };

  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const responseData = await response.json();
    return responseData.Result;
  } catch (error) {
    throw new Error(`Failed to fetch data: ${error.message}`);
  }
};

const logoutAndRedirect = async () => {
  try {
    Swal.fire({
      text: '連線異常，請重新登入。',
      icon: 'info',
      timer: 2000,
      showConfirmButton: false,
    }).then(async () => {
      await logout(); // 調用登出API
    });
  } catch (error) {
    console.error('Logout failed', error);
  } finally {
    localStorage.removeItem('userData');
    window.location.assign('/login');
  }
};

export const fetchData = async (endpoint, method = 'POST', data = {}, NewHeaders = null) => {
  const url = `${BASEURL}${endpoint}`;
  const userData = localStorage.getItem('userData');
  const token = userData
    ? JSON.parse(userData).accessToken
    : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJQTk8iOiJrc2kiLCJQTkEiOiLlnIvoiIjmuKzoqaYiLCJEUERfTk8iOiIwMDEiLCJJc1N1cFVzZXIiOiJUcnVlIiwibmJmIjoxNzY1MzM2Njk1LCJleHAiOjE4MjUzMzY2MzUsImlhdCI6MTc2NTMzNjY5NSwiaXNzIjoiaHR0cHM6Ly9sb2NhbGhvc3Q6NDQzMjQvIiwiYXVkIjoiaHR0cHM6Ly9sb2NhbGhvc3Q6NDQzMjQvIn0.HZt3PHMzMDOCssmjygALl1fXVOx85iTgHTs2gzzW3qM';
  const defaultHeaders = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `${token}` }),
  };

  const headers = NewHeaders ? { ...defaultHeaders, ...NewHeaders } : defaultHeaders;

  const options = {
    method,
    headers,
    ...(method !== 'GET' && { body: JSON.stringify(data) }),
  };

  try {
    const response = await fetch(url, options);

    if (!response.ok) {
      if (response.status === 401) {
        // 如果是 401，直接登出並跳轉到登錄頁
        await logoutAndRedirect();

        // 拋出錯誤以阻止後續處理
        throw new Error('授權失敗，請重新登入');
      }

      // 嘗試解析錯誤訊息
      const errorResponse = await response.text(); // 獲取錯誤訊息
      console.error('errorResponse', errorResponse);
      throw new Error(errorResponse); // 拋出完整的錯誤資料到外部 `catch`
    }

    // 解析JSON，如果格式錯誤則回傳錯誤
    const responseData = await response.json().catch(() => {
      return response;
    });

    return responseData;
  } catch (error) {
    // 檢查錯誤訊息是否包含 "主鍵值不可重覆"
    if (error.message.includes('主鍵值不可重覆')) {
      throw {
        error: true,
        message: '資料重複，請檢查後再存檔',
      };
    }

    throw error;
  }
};

export const logout = async () => {
  const url = `${BASEURL}Auth/Logout`;
  const userData = localStorage.getItem('userData');
  let options = {
    method: 'GET',
    headers: {},
  };

  // 只有當 userData 存在時才添加 token
  if (userData) {
    const token = JSON.parse(userData).accessToken;
    options.headers = {
      Authorization: `Bearer ${token}`,
    };
  }

  try {
    const response = await fetch(url, options);
    // 確保response不是undefined
    if (!response?.ok) {
      const status = response?.status ?? 'unknown';
      throw new Error(`HTTP error! status: ${status}`);
    }
    const responseData = await response.json();
    return responseData;
  } catch (error) {
    throw new Error(`Failed to fetch data: ${error.message}`);
  }
};

// ===== snb001Q 監控牆 API =====

/**
 * 取得區域下拉選單資料
 * @returns {Promise} 返回區域列表
 */
export const getCamLocations = async () => {
  return await fetchData('api/snb001Q/init', 'GET');
};

/**
 * 查詢監控牆攝影機資訊
 * @param {Object} params - 查詢參數
 * @param {string} params.camlocation - 監視器區域（預設空字串）
 * @param {string} params.alert - 異常篩選（空字串=全部，"無異常"=僅顯示異常）
 * @returns {Promise} 返回攝影機列表
 */
export const getCamInfo = async (params = { camlocation: '', alert: '' }) => {
  return await fetchData('api/snb001Q/caminfo', 'POST', params);
};

/**
 * 修改事件狀態
 * @param {string} alertno - 事件編號
 * @returns {Promise} 返回修改結果
 */
export const updateAlertStatus = async (alertno) => {
  return await fetchData('api/snb001Q/alertstatusedit', 'POST', { alertno });
};

/**
 * 取得本月事件種類統計
 * @returns {Promise} 返回各類型事件統計
 */
export const getAlertTypeCount = async () => {
  return await fetchData('api/snb001Q/alerttypecount', 'GET');
};

/**
 * 取得本月事件通報數量
 * @returns {Promise} 返回各狀態事件統計
 */
export const getAlertCount = async () => {
  return await fetchData('api/snb001Q/alertcount', 'GET');
};

/**
 * 取得本月事件通報列表
 * @returns {Promise} 返回事件列表
 */
export const getAlertList = async () => {
  return await fetchData('api/snb001Q/alertlist', 'GET');
};

/**
 * 檢查是否需要更新畫面
 * @returns {Promise} 返回 refreshpageYN 狀態
 */
export const checkRefreshFlag = async () => {
  return await fetchData('api/snb001Q/refreshpageYN', 'GET');
};

/**
 * 重置更新標記
 * @param {Object} params - { refreshpageYN: 'N' }
 * @returns {Promise} 返回修改結果
 */
export const resetRefreshFlag = async (params = { refreshpageYN: 'N' }) => {
  return await fetchData('api/snb001Q/flagchange', 'POST', params);
};

// ===== snb002Q 數據分析 API =====

/**
 * 取得下拉選單
 * @returns {Promise}
 */
export const getInitData = async () => {
  return await fetchData('api/snb002Q/init', 'GET');
};

/**
 * 各項異常次數統計
 * @param {Object} params - { time_range, alerttype, camlocation }
 * @returns {Promise}
 */
export const getEventCount = async (params) => {
  return await fetchData('api/snb002Q/eventcount', 'POST', params);
};

/**
 * 各區域異常發生次數
 * @param {Object} params - { time_range, alerttype, camlocation }
 * @returns {Promise}
 */
export const getCamLocationCount = async (params) => {
  return await fetchData('api/snb002Q/camlocationcount', 'POST', params);
};

/**
 * 各異常於不同區域次數（堆疊圖）
 * @param {Object} params - { time_range, alerttype, camlocation }
 * @returns {Promise}
 */
export const getCamLocationEventCount = async (params) => {
  return await fetchData('api/snb002Q/camlocationeventcount', 'POST', params);
};

/**
 * 異常趨勢分析
 * Endpoint: /api/snb002Q/timeline
 * @param {Object} params - { alerttype, camlocation, startDate, endDate }
 * @returns {Promise} 返回 Timeline 數據（包含 locations 和 Typecount）
 */
export const getTimeline = async (params) => {
  return await fetchData('api/snb002Q/timeline', 'POST', params);
};

/**
 * 區域警示統計列表
 * Endpoint: /api/snb002Q/timelinelist
 * @param {Object} params - { alerttype, camlocation, startDate, endDate }
 * @returns {Promise} 返回區域警示統計列表
 */
export const getTimelineList = async (params) => {
  return await fetchData('api/snb002Q/timelinelist', 'POST', params);
};
