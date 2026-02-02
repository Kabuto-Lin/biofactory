/* 依第一個key排序陣列 */
export const sortValues = (data) => {
  return JSON.parse(JSON.stringify(data)).sort((a, b) => {
    const firstKeyA = Object.keys(a)[0];
    const firstKeyB = Object.keys(b)[0];
    if (a[firstKeyA] < b[firstKeyB]) return -1;
    if (a[firstKeyA] > b[firstKeyB]) return 1;
    return 0;
  });
};
/** 全域搜尋
 *@param {Array} data 陣列
 *@param {String} filterText 陣列
 */
export const globalFilter = (data, filterText) => {
  return data?.filter((item) => {
    return Object.values(item).some((value) =>
      value?.toString().toLowerCase().includes(filterText.toLowerCase()),
    );
  });
};

/* 建立id */
export const createId = () => {
  let id = '';
  let chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 5; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
};

// 產生一個function來判斷object是否為空物件
export function isEmptyObject(obj) {
  if (obj === undefined || obj === null || obj === '') {
    return true;
  }
  if (typeof obj === 'object' && Object.keys(obj).length === 0) {
    return true;
  }
  return false;
}

/**
 * 添加 checked 屬性到資料結構
 * @param {Object} data - 原始資料結構
 * @returns {Object} - 添加 checked 屬性後的資料結構
 */
export function addCheckedProperty(data) {
  // 深拷貝輸入的資料
  const newData = JSON.parse(JSON.stringify(data));

  // 遍歷物件的每個鍵值對
  for (const key in newData) {
    if (Array.isArray(newData[key])) {
      // 遍歷陣列中的每個項目
      newData[key].forEach((item) => {
        // 在與 ID 同層級添加 checked 屬性，默認值為 false
        item.checked = false;
      });
    }
  }
  return newData;
}

/*篩選出有勾選checkbox的資料 - 組成API 要用的combinedData*/
export function filterBeCheckedData(checkedData, allData) {
  // Step 1: Extract keys where `isChecked` is true
  const checkedKeys = checkedData
    .map((item, index) => (item.isChecked ? item.ROWSEQ_O : null))
    .filter((index) => index !== null);

  // Step 2: Filter `allData` based on `ROWSEQ_O` being in `checkedKeys`
  const filteredData = allData
    .filter((item) => checkedKeys.includes(item.ROWSEQ_O))
    .map((selectedItem) => {
      return {
        oldRow: selectedItem,
        newRow: null,
      };
    });

  return filteredData;
}

/*組API資料用的函數*/
export function buildCombineData(
  data, // 僅'Del' 可不填
  initData, // 僅'Del' 可不填
  actionType = 'Edit', // 必填，新增暫時也用'Edit'，另還有 'Del' 或 'Search'可用
  oldDataRowID, // 'Edit'時必填
  newDetailData = [], // 'Edit'時必填
  selectedRows = [], // 'Del'時必填
  isTabs = false, // 是否有多個tab
) {
  let masterRow = {
    oldRow: null,
    newRow: {
      ...initData.emptyRow,
      ...(data?.editedMData || data),
    },
  };

  switch (actionType) {
    case 'Edit':
      masterRow.oldRow = {
        // ...initData.emptyRow,
        ...data.masterData[oldDataRowID],
      };
      break;

    case 'Del':
      masterRow = selectedRows[0]; // 刪除選中的第一行 masterRow，目前只有刪單筆的功能
      break;

    case 'Search':
      masterRow = {
        oldRow: {
          ...initData?.emptyRow,
          ...(data?.editedMData || data),
        },
        newRow: null, // 查詢時 newRow 設為 null
      };
      break;

    default:
      break;
  }

  return {
    searchData: initData.searchData,
    prog_No: '',
    prog_Id: '',
    userId: '',
    type: actionType === 'Del' ? 'DEL_D_ALL' : '',
    masterRow: masterRow,
    masterRows: [],
    details: isTabs
      ? newDetailData
      : actionType === 'Del' || actionType === 'Search'
        ? []
        : [{ id: '0', rows: newDetailData }],
  };
}

/*組API資料用的函數*/
export function buildDetailData(data, initData, oldDetailValue = [], isEdit = false) {
  const newDetailData = data.editedDetail.map((item) => {
    const oldRowItem = isEdit
      ? [...oldDetailValue].filter((x) => x.ROWSEQ_O === item.ROWSEQ_O)
      : [];

    return {
      oldRow: isEdit && oldRowItem.length ? oldRowItem[0] : null,
      newRow: {
        ...initData.details[0].emptyRow,
        ...item,
      },
    };
  });

  if (isEdit) {
    oldDetailValue.forEach((oldData) => {
      if (!data.editedDetail.some((item) => item.ROWSEQ_O === oldData.ROWSEQ_O)) {
        newDetailData.push({ oldRow: oldData, newRow: null });
      }
    });
  }

  return newDetailData;
}

// 組合所有Tab Detail資料
export function buildTabsDetailData(data, ...params) {
  const details = data?.details;

  // 檢查 details 是否存在，且為正確格式（Object 且非 Array）
  if (!details || typeof details !== 'object' || Array.isArray(details)) {
    throw new Error(
      `❌ data.details 格式錯誤：應為 Object (key 為 tab index；value 格式為 array)，實際為 ${
        details === null ? 'null' : Array.isArray(details) ? 'Array' : typeof details
      }`,
    );
  }

  // ...params 可以保證 params 是 Array，所以就不驗證格式了

  const detailsKeys = Object.keys(details);
  const detailsLength = detailsKeys.length;

  if (detailsLength !== params.length) {
    console.warn(
      `⚠️ data.details 長度（${detailsLength}）與 params 長度（${params.length}）不一致`,
    );
  }

  const length = detailsLength || params.length;
  const result = [];

  for (let i = 0; i < length; i++) {
    const detail = [];

    const oldDataItems = details?.[i] || [];
    let newDataItems = params[i];

    // 若 newDataItems 為 null/undefined，視為空陣列
    if (newDataItems == null) {
      newDataItems = [];
    } else if (!Array.isArray(newDataItems)) {// 🛠 若 newDataItems 是非陣列（物件），自動轉為單一陣列
      newDataItems = [newDataItems];
    }

    // 🧩 若兩者皆有資料，進行比對
    if (newDataItems?.length > 0) {
      if (oldDataItems.length > 0) {
        // 處理舊資料
        oldDataItems.forEach((oldDataItem) => {
          // 使用ROWSEQ_O比對資料
          const match = newDataItems.find(
            (newDataItem) => newDataItem.ROWSEQ_O === oldDataItem.ROWSEQ_O,
          );

          if (match) {
            // 找到匹配，保留兩者
            detail.push({
              oldRow: oldDataItem,
              newRow: match,
            });
          } else if (oldDataItem.ROWSEQ_O) {
            // 未找到匹配，視為刪除
            detail.push({
              oldRow: oldDataItem,
              newRow: null,
            });
          }
        });

        // 處理新資料（未在舊資料中出現的項目）
        newDataItems.forEach((newDataItem) => {
          // 使用ROWSEQ_O比對
          const match = oldDataItems.find(
            (oldDataItem) => oldDataItem.ROWSEQ_O === newDataItem.ROWSEQ_O,
          );
          if (!match) {
            // 沒有對應的舊資料，視為新增
            detail.push({
              oldRow: null,
              newRow: newDataItem,
            });
          }
        });
      } else {
        // 只有新資料，全部視為新增
        newDataItems.forEach((newDataItem) => {
          detail.push({
            oldRow: null,
            newRow: newDataItem,
          });
        });
      }
    } else if (oldDataItems.length > 0) {
      // ❌ 僅舊資料，無新資料，視為刪除
      oldDataItems.forEach((oldDataItem) => {
        detail.push({
          oldRow: oldDataItem,
          newRow: null,
        });
      });
    }
    // else {
    //   // 📭 無新也無舊，但仍需輸出空結果
    //   detail.push({
    //     oldRow: null,
    //     newRow: null,
    //   });
    // }

    result.push({
      id: i.toString(),
      rows: detail,
    });
  }

  return result;
}

/* 取得 上、下一筆 最前、最後筆資料的index */
export const getDataIndex = (currentRowIndex, tempValueLength, where) => {
  switch (where) {
    case 'next':
      return currentRowIndex >= tempValueLength ? -1 : currentRowIndex + 1;
    case 'back':
      return currentRowIndex <= 0 ? 0 : currentRowIndex - 1;
    case 'first':
      return 0;
    case 'last':
      return -1;
    default:
      return currentRowIndex;
  }
};

//* 獲取上、下一筆 最前、最後筆資料 的數據內容
export const getNewData = (rowIndex, tempValue) => {
  const last = rowIndex === -1;
  const newData = last ? tempValue[tempValue.length - 1] : tempValue[rowIndex];
  // const newCOMM_NO = last ? tempValue.at(-1).COMM_NO : newData?.COMM_NO;
  // const newCOMM_NA = last ? tempValue.at(-1).COMM_NA : newData?.COMM_NA;

  return newData;
};

/*列印-預覽用*/
export const handlePreview = async (url) => {
  const token = getAccessToken();

  const options = {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const response = await fetch(url, options);

  if (!response.ok) {
    throw new Error('Network response was not ok');
  }

  const blob = await response.blob();
  const pdfUrl = URL.createObjectURL(blob);
  var myWindow = window.open(
    pdfUrl,
    '',
    'top=20,left=150,width=800,height=600,scrollbars=no,resizable=yes,menubar=no,status=no, location=no, addressbar=no',
  );
  myWindow.focus();
  const checkWindowClosed = setInterval(() => {
    if (myWindow.closed) {
      clearInterval(checkWindowClosed);
      URL.revokeObjectURL(pdfUrl); // 释放 URL
    }
  }, 1000);
};

/*列印-下載檔案用*/
export const handleDownloadFile = async (fileUrl, fileTitle, alert) => {
  const token = getAccessToken();

  try {
    const options = {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    const response = await fetch(fileUrl, options);

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileTitle; // 替換成你希望下載的檔案名稱
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error downloading the file:', error);
    alert && alert();
  }
};

/**
 * 篩選出符合條件的資料
 *
 * @param {Array} data 全部資料
 * @param {Object} conditions 篩選條件
 * @returns {Array} 符合條件的資料
 */
export function multiConditionSearch(data, conditions) {
  return data.filter((item) => {
    for (let key in conditions) {
      const conditionValue = conditions[key];
      const itemValue = item[key];
      if (conditionValue === null || conditionValue === '') {
        continue; // 跳過空值條件
      }
      if (typeof conditionValue === 'string' && typeof itemValue === 'string') {
        if (!itemValue.toLowerCase().includes(conditionValue.toLowerCase())) {
          return false;
        }
      } else {
        if (itemValue !== conditionValue) {
          return false;
        }
      }
    }
    return true;
  });
}

/* 比較值是否相等 */
export function compareValue(value, tempValue, notEqualCallback, equalCallback) {
  if (value && tempValue) {
    const sortValue = sortValues(value);
    const sortTempValue = sortValues(tempValue);
    if (JSON.stringify(sortValue) !== JSON.stringify(sortTempValue)) {
      notEqualCallback();
    } else if (JSON.stringify(sortValue) === JSON.stringify(sortTempValue)) {
      equalCallback();
    }
  }
}

/**日期格式轉換成 2024-11-06 17:17:21 */
export function formatDate(date) {
  const pad = (n) => (n < 10 ? '0' : '') + n;

  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

/** 取當前日期  格式為 "2024/11/18" */
export function getCurrentDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = (today.getMonth() + 1).toString().padStart(2, '0');
  const day = today.getDate().toString().padStart(2, '0');
  return `${year}/${month}/${day}`;
}

/** 取過去日期(距今{days}天) 格式為 "2024/11/18" */
export function getPastDate(days) {
  const pastDate = new Date();
  pastDate.setDate(pastDate.getDate() - days);
  const year = pastDate.getFullYear();
  const month = (pastDate.getMonth() + 1).toString().padStart(2, '0');
  const day = pastDate.getDate().toString().padStart(2, '0');
  return `${year}/${month}/${day}`;
}

/** 判斷是否為空或null, 並設置預設值 */
export function nvl(obj, a_newValue) {
  if (obj === undefined || obj === null || obj === '') {
    return a_newValue;
  }
  return obj;
}

/** 取得使用者資料 */
export function getUserData() {
  return JSON.parse(localStorage.getItem('userData'));
}

/** 取得AccessToken */
export function getAccessToken() {
  var userData = JSON.parse(localStorage.getItem('userData'));
  return userData?.accessToken;
}

/** 取得RefreshToken */
export function getRefreshToken() {
  var userData = JSON.parse(localStorage.getItem('userData'));
  return userData?.refreshToken;
}

/** 設定Insert資料的RowId */
export function setNewRowId(a_row, a_srcRows) {
  if (a_row == null) {
    return 0;
  }

  if (a_srcRows == null) {
    return 0;
  }
  var l_max = getMaxRowId(a_srcRows);
  return l_max + 1;
}

/** 取得目前資料的最大的RowId */
export function getMaxRowId(a_srcRows) {
  if (a_srcRows == null || a_srcRows.length == 0) return 0;
  var i = 0;
  for (var l_row in a_srcRows) {
    if (typeof a_srcRows[l_row]['ROWSEQ'] == 'undefined') {
      return -1;
    }
    if (a_srcRows[l_row]['ROWSEQ'] == null) {
      return -1;
    }
    if (a_srcRows[l_row]['ROWSEQ'] > i) i = a_srcRows[l_row]['ROWSEQ'];
  }
  return i;
}

/** 取得目前選取的資料列的上一筆RowId */
export function getNearRowId(a_row, a_srcRows) {
  // 取得當前刪除資料列的索引
  const index = a_srcRows.findIndex((row) => row.ROWSEQ === a_row.ROWSEQ);

  // 如果資料列不存在，回傳 null
  if (index === -1) {
    return null;
  }

  // 如果刪除的是第一筆，且還有其他資料，回傳下一筆的 ROWSEQ
  if (index === 0 && a_srcRows.length > 1) {
    return a_srcRows[index + 1].ROWSEQ;
  }

  // 其他情況，回傳上一筆的 ROWSEQ，如果是最後一筆也適用
  if (index > 0) {
    return a_srcRows[index - 1].ROWSEQ;
  }

  // 當資料列只有一筆時，回傳 null
  return null;
}

/**
 * 檢查資料是否異動，並且是否繼續動作
 * @param {Function} goFunction - 需要執行的函數
 * @param {boolean} notification - 是否有異動資料未儲存
 */
export const handleGoBack = (goFunction, notification) => {
  if (notification) {
    Swal.fire({
      title: '資料尚未儲存',
      text: '異動資料尚未儲存，確定要繼續嗎？',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: '確定',
      cancelButtonText: '取消',
      confirmButtonColor: '#3b82f6',
    }).then((result) => {
      if (result.isConfirmed) {
        // 執行返回邏輯
        goFunction();
      } else {
        return;
      }
    });
  } else {
    goFunction();
  }
};

/**
 * react-hook-form 的驗證規則函數
 *
 * @param {number|object} optionsOrMinLength - 第一個參數可以是數字（作為 minLength）或物件（作為 options）。
 * @param {number} [maxLength=Infinity] - 最大長度（僅當第一個參數是數字時有效）。
 * @param {boolean} [engAndNum=false] - 是否僅允許英文字母和數字。
 * @param {boolean} [IDpattern=false] - 是否驗證身分證格式（大寫字母開頭，後接 9 位數字）。
 * @param {boolean} [onlyNumbers=false] - 是否僅允許數字。
 * @param {boolean} [onlyEnglish=false] - 是否僅允許英文字母。
 * @param {boolean} [email=false] - 是否驗證 Email 格式。
 * @param {boolean} [required=false] - 是否為必填欄位。
 * @param {boolean} [AccAndPsw=false] - 是否驗證帳號或密碼格式（允許英文字母、數字和符號）。
 *
 * @returns {object} 驗證規則物件，包含 React Hook Form 支援的驗證屬性。
 *
 * @example
 * 推薦用法: 使用物件作為 options，只帶需要的參數 (新的用法)
 * const rules = validationRules({
 *   min: 5,
 *   max: 10,
 *   engNum: true,
 *   req: true,
 * });
 *
 * 使用數字作為 minLength，或者 同時有多個驗證規則，該寫法兼容舊的代碼(舊用法)。
 * const rules = validationRules(5, 10, true, false, false, false, false, true, false);
 *

 */
export function validationRules(
  optionsOrMinLength,
  maxLength = Infinity,
  engAndNum = false,
  IDpattern = false,
  onlyNumbers = false,
  onlyEnglish = false,
  email = false,
  required = false,
  AccAndPsw = false,
) {
  // 默認值
  let minLength = 0;

  // 判斷第一個參數的類型
  if (typeof optionsOrMinLength === 'number') {
    minLength = optionsOrMinLength; // 第一個參數是數字，視為 minLength
  } else if (typeof optionsOrMinLength === 'object') {
    const {
      min = 0,
      max = Infinity,
      engNum: engNum = false,
      id: id = false,
      num: num = false,
      eng: eng = false,
      mail: mail = false,
      req: req = false,
      psw: psw = false,
    } = optionsOrMinLength;

    minLength = min; // 使用 options 中的 變數名稱min
    maxLength = max;
    engAndNum = engNum;
    IDpattern = id;
    onlyNumbers = num;
    onlyEnglish = eng;
    email = mail;
    required = req;
    AccAndPsw = psw;
  }

  const rules = {};

  // 首先檢查是否必填
  if (required) {
    rules.required = {
      value: true,
      message: '此欄位為必填',
    };
  }

  if (IDpattern) {
    // 身分證格式
    rules.pattern = {
      value: /^[A-Z][0-9]{9}$/,
      message: '身分證必須以大寫英文字母開頭，後接9位數字',
    };
  } else if (email) {
    // Email 格式
    rules.pattern = {
      value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      message: '請輸入有效的 Email 格式',
    };
    rules.maxLength = {
      value: 30,
      message: 'Email 長度必須在 30 位以內',
    };
  } else if (onlyNumbers) {
    // 長度與格式合併為單一 pattern
    const lengthMessage =
      minLength > 0
        ? `長度必須在 ${minLength} 到 ${maxLength} 位之間`
        : `長度限制為 ${maxLength} 位`;

    rules.pattern = {
      value: new RegExp(
        minLength > 0 ? `^[0-9]{${minLength},${maxLength}}$` : `^([0-9]{1,${maxLength}}|)$`,
      ),
      message: `只能包含數字，且${lengthMessage}`,
    };
  } else if (onlyEnglish) {
    // 純英文字母
    rules.pattern = {
      value: /^[a-zA-Z]+$/,
      message: '只能包含英文字母',
    };
  } else if (engAndNum) {
    // 英文字母和數字
    rules.pattern = {
      value: /^[a-zA-Z0-9]+$/,
      message: '只能包含英文字母和數字',
    };
  } else if (AccAndPsw) {
    // 密碼字符
    rules.pattern = {
      value: /^[a-zA-Z0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]+$/,
      message: '只能包含英文、數字、半形符號',
    };
  }

  // 長度驗證 - 適用於非數字格式
  if (!onlyNumbers) {
    if (minLength > 0) {
      rules.minLength = {
        value: minLength,
        message: `長度必須至少為 ${minLength} 位`,
      };
    }
    if (maxLength !== Infinity) {
      // Email 已經有自己的 maxLength 規則，避免覆蓋
      if (!email) {
        rules.maxLength = {
          value: maxLength,
          message: `長度必須小於等於 ${maxLength} 位`,
        };
      }
    }
  }

  return rules;
}

/**
 * 獲取 localStorage 項目
 * @param {string} key 儲存的鍵名
 * @param {boolean} isJson 是否為JSON對象（需反序列化）
 * @param {any} defaultValue 如果獲取失敗時的默認值
 * @returns {any} 獲取的值或默認值
 */
export const getStorageItem = (key, isJson = true, defaultValue = null) => {
  try {
    const value = localStorage.getItem(key);
    if (value === null) return defaultValue;
    if (isJson) {
      try {
        return JSON.parse(value);
      } catch (parseError) {
        console.warn(`值無法解析為JSON [${key}]:`, parseError);
        return value; // 如果無法解析，返回原始字串
      }
    } else {
      return value;
    }
  } catch (error) {
    console.error(`獲取本地儲存項目失敗 [${key}]:`, error);
    return defaultValue;
  }
};
