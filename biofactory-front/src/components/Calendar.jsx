import { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';
import {
  faAngleLeft,
  faAngleRight,
  faXmark,
  faCalendarDays,
  faClock,
} from '@fortawesome/free-solid-svg-icons';
import { createPortal } from 'react-dom';
import { getStorageItem } from '../utils/func';
import Swal_ from 'sweetalert2';

const PRIMARY_COLOR = '#3b82f6'; // 注意要跟 tailwind.config.js 保持一致
const TERTIARY_COLOR = '#d1d5db'; // 注意要跟 tailwind.config.js 保持一致

const swal = Swal_.mixin({
  confirmButtonText: '確定',
  cancelButtonText: '取消',
  confirmButtonColor: PRIMARY_COLOR,
  cancelButtonColor: TERTIARY_COLOR,
  allowOutsideClick: false,
});

/**
 * 由storage取得年月日格式參數
 */
const defaultLocale = () => {
  try {
    const stored = getStorageItem('userData');
    if (stored) {
      return stored.dateType || '';
    }
  } catch (e) {
    console.error(e);
  }
  return '';
};

/**
 * 轉成指定format格式字串，locale = tw 轉成民國年
 * @param {String} format 格式
 * @param {String} locale 語言環境
 * @returns format格式字串
 */
Date.prototype.format = function (format, locale) {
  let date = this;
  let day = date.getDate();
  let month = date.getMonth() + 1;
  let year = date.getFullYear();
  format = format.replace('dd', day < 10 ? '0' + day : day);
  format = format.replace('mm', month < 10 ? '0' + month : month);
  format = format.replace('yyyy', locale === 'tw' ? year - 1911 : year);

  return format;
};

/**
 *
 * @param {String} v
 * @param {String} replaceStr
 * @param {String} toStr
 * @returns
 */
const SafeReplaceALL = (v, replaceStr, toStr) => {
  if (!v) {
    return '';
  }
  return v.replaceAll(replaceStr, toStr);
};

/**
 * Calendar常數
 */
const calendarSetting = Object.freeze({
  type: {
    //function判斷檢查哪種格式用
    value: '1',
    display: '2',
  },
  valueFormat: 'yyyy-mm-dd', //value格式
  displayFormat: 'yyyy/mm/dd', //顯示格式
  valueFormatSplitText: '-', //value格式 分割符號
  displayFormatSplitText: '/', //顯示格式 分割符號
  regexValue: /^\d{4}-\d{2}-\d{2}$/, // value格式 regex檢查format
  regexValueTW: /^\d{1,3}-\d{2}-\d{2}$/, // value格式 regex檢查format 民國年
  regexDisplay: /^\d{4}\/\d{2}\/\d{2}$/, // 顯示格式 regex檢查format
  regexDisplayTW: /^\d{1,3}\/\d{2}\/\d{2}$/, // 顯示格式 regex檢查format 民國年
  regexNosymbol: /^\d{8}$/, // 顯示格式 regex檢查format
  regexNosymbolTW: /^\d{6,7}$/, // 顯示格式 regex檢查format 民國年
  localeTW: 'tw', //民國年prop
  selectYearsRange: 20, //年份下拉一次顯示多少年份
  dateRangeSplitText: ' ~ ', // DateRange 顯示字串 分割符號
});

/**
 *
 * @param {String} dateString 日期字串 (locale = tw 要傳入民國年日期字串)
 * @param {String} type      1 => -符號隔開  2 => /格開
 * @param {String} locale  語言環境
 * @returns 錯誤日期回傳false 正確回傳Date物件(西元)
 */
const calendarIsValidDate = (dateString, type, locale) => {
  if (!dateString) {
    return false;
  }

  // 取得純數字字串
  let pureString = dateString
    .replaceAll(calendarSetting.displayFormatSplitText, '')
    .replaceAll(calendarSetting.valueFormatSplitText, '');

  if (pureString.length > 8) {
    pureString = pureString.slice(0, 8);
  }

  // 根據 locale 校驗長度
  // if (locale !== calendarSetting.localeTW) {
  //   if (pureString.length === 7) {
  //     return false; // 民國年必須是 7 位數
  //   }
  // }
  // else {
  //   if (pureString.length !== 8 && pureString.length !== 7) {
  //     return false; // 西元年必須是 8 位數
  //   }
  // }
  if (locale !== calendarSetting.localeTW) {
    if (pureString.length !== 8) {
      return false; // 民國年必須是 7 位數
    }
  }
  // else {
  //   if (pureString.length !== 8 && pureString.length !== 7) {
  //     return false; // 西元年必須是 8 位數
  //   }
  // }

  // 拆分純數字字串為年、月、日
  let year =
    pureString.length === 7
      ? parseInt(pureString.slice(0, 3), 10)
      : parseInt(pureString.slice(0, 4), 10); // 7碼取的前三位, 8碼取的前四位是年
  let month =
    pureString.length === 7
      ? parseInt(pureString.slice(3, 5), 10)
      : parseInt(pureString.slice(4, 6), 10); // 中間兩位是月
  let day =
    pureString.length === 7
      ? parseInt(pureString.slice(5, 7), 10)
      : parseInt(pureString.slice(6, 8), 10); // 最後兩位是日

  // 民國年轉換為西元年
  if (locale === calendarSetting.localeTW && pureString.length === 7) {
    year += 1911;
  }

  // 驗證月和日的範圍
  if (month < 1 || month > 12 || day < 1 || day > 31) {
    return false; // 月份或日期不合法
  }

  // 構造標準日期字串
  const formattedDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  // 使用 Date 解析
  const d = new Date(formattedDate);
  if (isNaN(d.getTime())) {
    return false; // 無效日期
  }

  // 確保 Date 物件的年月日與輸入一致
  if (d.getFullYear() !== year || d.getMonth() + 1 !== month || d.getDate() !== day) {
    return false;
  }

  return d; // 返回有效的 Date 物件
};

/**
 * 檢查是否在限制大小日期內
 * @param {String} _min  最小日期 (locale = tw 傳入民國年日期字串)
 * @param {String} _max  最大日期 (locale = tw 傳入民國年日期字串)
 * @param {String} _dateString 需比較之日期 (locale = tw 傳入民國年日期字串)
 * @param {String} locale  語言環境
 * @returns
 */
const calendarisEnableDate = (_min, _max, _dateString, locale) => {
  let minD = calendarIsValidDate(_min, calendarSetting.type.value, locale);
  let maxD = calendarIsValidDate(_max, calendarSetting.type.value, locale);
  if (minD && typeof minD.format === 'function' && _dateString < minD.format('yyyymmdd', locale))
    return false;
  if (maxD && typeof maxD.format === 'function' && _dateString > maxD.format('yyyymmdd', locale))
    return false;
  return true;
};

/**
 *
 * @param {*} value state
 * @param {*} setValue setstate
 * @param {*} min 最小值
 * @param {*} max 最大值
 * @param {*} placeholder
 * @param {*} onChange onChange事件
 * @param {*} locale  語言環境
 * @param {*} readonly 是否唯獨
 * @param {*} disabled 是否禁用
 * @returns
 */
const DatePicker = ({
  value,
  setValue,
  min,
  max,
  placeholder,
  onChange,
  locale = defaultLocale(),
  readonly = false,
  disabled = false,
}) => {
  const [hiddenValue, setHiddenValue] = useState(value);
  const [showCalendar, setShowCalendar] = useState(false);
  const inputRef = useRef(null);
  const calendarRef = useRef(null);
  const days = ['一', '二', '三', '四', '五', '六', '日'];
  const months = [
    '一月',
    '二月',
    '三月',
    '四月',
    '五月',
    '六月',
    '七月',
    '八月',
    '九月',
    '十月',
    '十一月',
    '十二月',
  ];

  //目前月曆時間Date type value, 固定存一號(避免閏年),切換行事曆年月用
  const [CalendarDate, setCalendarDate] = useState();
  //該月第一天 星期幾
  const [firstDayOfMonth, setFirstDayOfMonth] = useState();
  //該月有幾日
  const [daysInMonth, setDaysInMonth] = useState();

  /**
   * 觸發onChange 事件
   * @param {*} data 要丟出資料
   */
  const calendarTriggerOnChange = (data) => {
    if (onChange) {
      onChange(data);
    }
  };

  /**
   *  設置目前日期選單年月
   * @param {Date} DateObject
   */
  const setCalendar = (DateObject) => {
    setCalendarDate(new Date(DateObject.getFullYear(), DateObject.getMonth(), 1));
    setFirstDayOfMonth(getFirstDayOfMonth(DateObject));
    setDaysInMonth(getDaysInMonth(DateObject));
  };

  /**
   *
   * @returns 如果元件有傳入min prop ，回傳min日期+1 ，無則目前日期
   */
  const getMinDate = () => {
    let minDate = calendarIsValidDate(min, calendarSetting.type.value, locale);
    if (minDate) {
      minDate.setDate(minDate.getDate() + 1);
      minDate.setDate(1);
      return minDate;
    } else {
      return new Date();
    }
  };

  /**
   * 行事曆切換月份
   * @param {Number} shift +1 or -1
   */
  const handleMonthOnChange = (shift) => {
    CalendarDate.setMonth(CalendarDate.getMonth() + shift);
    setFirstDayOfMonth(getFirstDayOfMonth(CalendarDate));
    setDaysInMonth(getDaysInMonth(CalendarDate));
    setCalendarDate(new Date(CalendarDate));
  };

  /**
   * 處理年分下拉選單選擇後 調整目前日曆選單
   * @param {Number} value 年份(西元)
   */
  const handleYearOnChange = (value) => {
    CalendarDate.setFullYear(value);
    setFirstDayOfMonth(getFirstDayOfMonth(CalendarDate));
    setDaysInMonth(getDaysInMonth(CalendarDate));
    setCalendarDate(new Date(CalendarDate));
  };

  /**
   * 日曆點擊日期後setValue
   * @param {Date} date
   */
  const handleDateOnChange = (date) => {
    setShowCalendar(false);

    // 使用帶有分隔符的格式 (yyyy/mm/dd)
    let formattedValue = date.format(calendarSetting.displayFormat, locale);

    setValue(formattedValue);
    if (hiddenValue !== formattedValue) {
      calendarTriggerOnChange(formattedValue);
    }
    setHiddenValue(formattedValue);
  };

  // 新增 handleKeyDown 方法
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      // 確保輸入框的值是有效日期
      // 將斜線替換為 calendarSetting.valueFormatSplitText 以便正確驗證
      let inputValue = value;
      if (value.includes('/')) {
        inputValue = value.replace(/\//g, calendarSetting.valueFormatSplitText);
      }

      const validDate = calendarIsValidDate(inputValue, calendarSetting.type.value, locale);
      if (validDate) {
        handleDateOnChange(validDate); // 選取日期
        setShowCalendar(false); // 關閉日曆
      }
      e.preventDefault(); // 停止默認行為，避免影響到swal或其他事件
      return;
    } else if (e.key === 'Tab') {
      // 當按下 Tab 鍵時，檢查是否需要關閉日曆
      if (calendarRef.current && !calendarRef.current.contains(document.activeElement)) {
        setShowCalendar(false); // 關閉日曆
      }
    }
  };

  /**
   * 依照目前locale 取得年份
   * @param {Date} date
   * @returns Number
   */
  const handleLocaleYear = (date) => {
    return locale === calendarSetting.localeTW ? date.getFullYear() - 1911 : date.getFullYear();
  };

  /**
   * 依照傳入Date取得該月份的第一天星期幾
   * @param {Date} date
   * @returns
   */
  const getFirstDayOfMonth = (date) => {
    let firstDay = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    return firstDay === 0 ? 6 : firstDay - 1;
  };

  /**
   * 依照傳入Date取得該月份的天數
   * @param {Date} date
   * @returns
   */
  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  /**
   * focus 時 調整彈出位置 &  設定日曆選單顯示年月
   */
  const handleFocus = () => {
    let nowValue = calendarIsValidDate(value, calendarSetting.type.value, locale);
    const nowdate = nowValue ? nowValue : getMinDate();

    setCalendar(nowdate);
    setShowCalendar(true);

    setTimeout(() => {
      if (inputRef.current && calendarRef.current) {
        const inputRect = inputRef.current.getBoundingClientRect();
        const calendarHeight = calendarRef.current.offsetHeight;
        const calendarWidth = calendarRef.current.offsetWidth;
        const spaceBelow = window.innerHeight - inputRect.bottom;
        const spaceAbove = inputRect.top;
        const spaceRight = window.innerWidth - inputRect.left;
        const spaceLeft = inputRect.right;

        let top, bottom, left, right;

        // 判斷垂直
        if (spaceBelow >= calendarHeight) {
          // 向下
          top = `${inputRect.bottom}px`;
          bottom = 'auto';
        } else if (spaceAbove >= calendarHeight) {
          // 向上
          top = 'auto';
          bottom = `${window.innerHeight - inputRect.top}px`;
        } else {
          // Default
          top = `60px`;
          if (window.innerHeight - 60 - calendarHeight < 0) {
            top = '0px';
          }
          bottom = 'auto';
        }

        // 判斷水平
        if (spaceRight >= calendarWidth) {
          // 向右
          left = `${inputRect.left}px`;
          right = 'auto';
        } else if (spaceLeft >= calendarWidth) {
          // 向左
          left = 'auto';
          right = `${window.innerWidth - inputRect.right}px`;
        } else {
          // Default
          left = `${inputRect.left}px`;
          right = 'auto';
        }

        calendarRef.current.style.top = top;
        calendarRef.current.style.bottom = bottom;
        calendarRef.current.style.left = left;
        calendarRef.current.style.right = right;
        calendarRef.current.style.visibility = 'visible';
      }
    }, 0);
  };

  /**
   * 輸入框Change事件，若目前輸入的值是正確日期， 調整日曆顯示年月
   * @param {Event} e Event
   */
  const handleOnChange = (e) => {
    let inputText = e.target.value;

    // 允許用戶輸入斜線和數字
    // 只保留數字和斜線
    inputText = inputText.replace(/[^\d\/]/g, '');

    // 提取純數字部分
    const digits = inputText.replace(/\//g, '');

    // 限制長度
    let formattedValue = '';
    if (locale === calendarSetting.localeTW) {
      // 民國年格式 (xxx/xx/xx)
      const limitedDigits = digits.substring(0, Math.min(7, digits.length));

      if (limitedDigits.length > 0) {
        formattedValue += limitedDigits.substring(0, Math.min(3, limitedDigits.length));
      }
      if (limitedDigits.length > 3) {
        formattedValue += '/' + limitedDigits.substring(3, Math.min(5, limitedDigits.length));
      }
      if (limitedDigits.length > 5) {
        formattedValue += '/' + limitedDigits.substring(5, 7);
      }
    } else {
      // 西元年格式 (xxxx/xx/xx)
      const limitedDigits = digits.substring(0, Math.min(8, digits.length));

      if (limitedDigits.length > 0) {
        formattedValue += limitedDigits.substring(0, Math.min(4, limitedDigits.length));
      }
      if (limitedDigits.length > 4) {
        formattedValue += '/' + limitedDigits.substring(4, Math.min(6, limitedDigits.length));
      }
      if (limitedDigits.length > 6) {
        formattedValue += '/' + limitedDigits.substring(6, 8);
      }
    }

    // 更新輸入框顯示
    setValue(formattedValue);

    // 檢查是否需要驗證
    if (
      (locale === calendarSetting.localeTW && digits.length === 7) ||
      (locale !== calendarSetting.localeTW && digits.length === 8)
    ) {
      // 解析年月日
      let year, month, day;

      if (locale === calendarSetting.localeTW) {
        year = parseInt(digits.slice(0, 3)) + 1911;
        month = parseInt(digits.slice(3, 5));
        day = parseInt(digits.slice(5, 7));
      } else {
        year = parseInt(digits.slice(0, 4));
        month = parseInt(digits.slice(4, 6));
        day = parseInt(digits.slice(6, 8));
      }

      // 驗證月份和日期範圍
      if (month < 1 || month > 12 || day < 1 || day > 31) {
        swal.fire('輸入日期格式錯誤', '', 'error');
        return;
      }

      // 構造日期字串
      const formattedDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(
        2,
        '0',
      )}`;

      // 驗證日期是否有效
      const validDate = calendarIsValidDate(formattedDate, calendarSetting.type.value, locale);
      if (validDate) {
        // 若有效則更新日曆顯示
        setCalendar(validDate);
        setCalendarDate(validDate);
      }
    }
  };

  /**
   * 失去焦點事件，檢查是否日期正確，setValue & OnChange事件觸發
   */
  const handleOnBlur = () => {
    if (!value) {
      if (hiddenValue) {
        calendarTriggerOnChange('');
      }
      setHiddenValue('');
      return;
    }

    // 檢查日期格式是否正確
    let inputValue = value;
    // 如果輸入的值已經包含分隔符號，先進行標準化處理
    if (value.includes('/') || value.includes('-')) {
      inputValue = value.replace(/\//g, calendarSetting.valueFormatSplitText);
    }

    let inputDate = calendarIsValidDate(inputValue, calendarSetting.type.value, locale);

    if (
      inputDate &&
      locale !== calendarSetting.localeTW &&
      inputValue.replace(/\D/g, '').length !== 8
    ) {
      inputDate = false;
    }

    // 若日期格式錯誤，顯示錯誤提示
    if (!inputDate) {
      swal.fire('日期格式錯誤', '', 'error');
      setShowCalendar(false);
      setValue('');
      if (hiddenValue) {
        calendarTriggerOnChange('');
      }
      setHiddenValue('');
      return;
    }

    // 若日期不在允許範圍內，再分別判斷是否超過 max 或小於 min
    if (!calendarisEnableDate(min, max, inputDate.format('yyyymmdd', locale), locale)) {
      // 若有設定 max，且輸入日期大於 max，則顯示錯誤提示
      if (max) {
        let maxDate = calendarIsValidDate(max, calendarSetting.type.value, locale);
        if (maxDate && inputDate.format('yyyymmdd', locale) > maxDate.format('yyyymmdd', locale)) {
          swal.fire('日期不可以大於' + max, '', 'error');
        }
      }
      // 若有設定 min，且輸入日期小於 min，則顯示錯誤提示
      if (min) {
        let minDate = calendarIsValidDate(min, calendarSetting.type.value, locale);
        if (minDate && inputDate.format('yyyymmdd', locale) < minDate.format('yyyymmdd', locale)) {
          swal.fire('日期不可以小於' + min, '', 'error');
        }
      }
      setValue('');
      if (hiddenValue) {
        calendarTriggerOnChange('');
      }
      setHiddenValue('');
      return;
    } // 日期正確且在允許範圍內，更新狀態與觸發 onChange
    // 使用帶有分隔符的格式 (yyyy/mm/dd)
    let formattedValue = inputDate.format(calendarSetting.displayFormat, locale);

    setValue(formattedValue);
    if (hiddenValue !== formattedValue) {
      calendarTriggerOnChange(formattedValue);
    }
    setHiddenValue(formattedValue);
  };

  /**
   * 輸入框display 回傳display格式
   * @param {String} value 目前輸入框值
   * @returns  display格式
   */

  const inputDisPlayFormat = (value) => {
    // 1. 空值檢查
    if (!value) return '';

    // 如果值已經包含斜線，則認為已經是格式化過的
    if (value.includes('/')) {
      return value;
    }

    // 2. 移除非數字字元
    const pureNumber = value.replace(/\D/g, '');

    // 3. 檢查是否為8碼西元年格式
    if (pureNumber.length < 7) return value;
    if (locale === calendarSetting.localeTW && pureNumber.length === 7) {
      // 處理7碼民國年格式
      const year = pureNumber.substring(0, 3);
      const month = pureNumber.substring(3, 5);
      const day = pureNumber.substring(5, 7);
      return `${year}/${month}/${day}`;
    }
    if (pureNumber.length < 8) return value;
    // 4. 解析年月日
    const year = pureNumber.substring(0, 4);
    const month = pureNumber.substring(4, 6);
    const day = pureNumber.substring(6, 8);

    // 5. 根據locale轉換顯示格式
    if (locale === calendarSetting.localeTW) {
      // 轉換為民國年顯示
      const twYear = String(parseInt(year, 10) - 1911).padStart(3, '0');
      return `${twYear}/${month}/${day}`;
    }

    // 6. 西元年顯示
    return `${year}/${month}/${day}`;
  };
  /**
   * 關閉事件
   * @param {Event} event
   */
  const handleClickOutside = (event) => {
    if (
      calendarRef.current &&
      !calendarRef.current.contains(event.target) &&
      inputRef.current &&
      !inputRef.current.contains(event.target)
    ) {
      setShowCalendar(false);
    }
  };

  /**
   * render 年份下拉選項
   * @returns 年份選項
   */
  const renderSelectYears = () => {
    return Array(calendarSetting.selectYearsRange)
      .fill(null)
      .map((_, index) => {
        if (index < Math.floor(calendarSetting.selectYearsRange / 2)) {
          let year =
            CalendarDate.getFullYear() - (Math.floor(calendarSetting.selectYearsRange / 2) - index);
          let twYear =
            handleLocaleYear(CalendarDate) -
            (Math.floor(calendarSetting.selectYearsRange / 2) - index);
          return (
            <option key={index} value={year}>{`${
              locale === calendarSetting.localeTW ? '民國' : ''
            }${twYear}年`}</option>
          );
        } else {
          let year =
            CalendarDate.getFullYear() + (index - Math.floor(calendarSetting.selectYearsRange / 2));
          let twYear =
            handleLocaleYear(CalendarDate) +
            (index - Math.floor(calendarSetting.selectYearsRange / 2));
          return (
            <option key={index} value={year}>{`${
              locale === calendarSetting.localeTW ? '民國' : ''
            }${twYear}年`}</option>
          );
        }
      });
  };

  const isTodayCss = 'border-sky-300 border-[2px] border-solid';
  const isValueCss = 'bg-gray-400';
  /**
   * render 日曆日期dom
   * @returns
   */
  const renderDate = () => {
    let emptyDateDom = Array(firstDayOfMonth)
      .fill(null)
      .map((_, index) => (
        <div
          key={index}
          className="w-[calc(100%/7)] aspect-square p-[1px] flex justify-center items-center rounded-[50%] "
        ></div>
      ));

    let minT = SafeReplaceALL(
      SafeReplaceALL(min, calendarSetting.displayFormatSplitText, ''),
      calendarSetting.valueFormatSplitText,
      '',
    );
    let maxT = SafeReplaceALL(
      SafeReplaceALL(max, calendarSetting.displayFormatSplitText, ''),
      calendarSetting.valueFormatSplitText,
      '',
    );

    let validDateDom = Array(daysInMonth)
      .fill(null)
      .map((_, index) => {
        let _date = new Date(CalendarDate);
        _date.setDate(index + 1); // 將目前日期格式化為顯示格式進行比較
        let formattedDate = _date.format(calendarSetting.displayFormat, locale);
        let isValue = formattedDate === value;
        let isToday =
          _date.format(calendarSetting.valueFormat) ===
          new Date().format(calendarSetting.valueFormat);

        let isEnable = calendarisEnableDate(minT, maxT, _date.format('yyyymmdd', locale), locale);
        if (isEnable) {
          return (
            <div
              key={firstDayOfMonth + index}
              className={`w-[calc(100%/7)] aspect-square p-[1px] text-gray-700  flex justify-center items-center rounded-[50%] cursor-pointer 
                    hover:bg-gray-200 
                    ${isValue ? isValueCss : ''}   ${isToday ? isTodayCss : ''} `}
              onClick={() => {
                handleDateOnChange(_date);
              }}
            >
              {index + 1}
            </div>
          );
        } else {
          return (
            <div
              key={firstDayOfMonth + index}
              className={`w-[calc(100%/7)] aspect-square p-[1px] flex justify-center items-center rounded-[50%] text-gray-300 pointer-events-none 
                    ${isValue ? isValueCss : ''}  ${isToday ? isTodayCss : ''}  `}
            >
              {index + 1}
            </div>
          );
        }
      });

    return emptyDateDom.concat(validDateDom);
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className={`relative  inline-block w-full`} onClick={(e) => e.preventDefault()}>
      <div className={`relative inline-block w-full `}>
        <input
          type="text"
          ref={inputRef}
          onFocus={handleFocus}
          value={inputDisPlayFormat(value)}
          onChange={handleOnChange}
          onBlur={handleOnBlur}
          placeholder={placeholder}
          onKeyDown={handleKeyDown} // 新增鍵盤事件
          maxLength={10}
          readOnly={readonly}
          disabled={disabled}
          className={`w-full text-black bg-none bg-white   ${
            disabled ? 'cursor-not-allowed !bg-[#dddddd]' : ''
          }
                    rounded border-solid border-[1px] focus:border-[2px] border-[#999] focus:border-[#5d8ee5] focus:outline-none focus:bg-white focus:shadow-input-focus
                    block h-[36px] leading-[1.42857143] pl-[4px] shadow-input`}
        />
        {!value && !disabled && (
          <FontAwesomeIcon
            className={`text-gray-300 absolute right-2 top-1/2 transform -translate-y-1/2  ${
              disabled ? 'cursor-not-allowed' : 'cursor-pointer'
            }`}
            icon={faCalendarDays}
            onClick={() => {
              if (!showCalendar && !disabled) {
                inputRef.current.focus();
              }
            }}
          ></FontAwesomeIcon>
        )}
        {value && !disabled && (
          <FontAwesomeIcon
            className="text-gray-400 absolute right-2 top-1/2 transform -translate-y-1/2 cursor-pointer scale-75"
            icon={faXmark}
            onClick={() => {
              setValue('');
              if (hiddenValue) {
                calendarTriggerOnChange('');
              }
              setHiddenValue('');
            }}
          ></FontAwesomeIcon>
        )}
      </div>
      {createPortal(
        showCalendar && !disabled ? (
          <div
            ref={calendarRef}
            className={` z-50  p-2 flex flex-col fixed  bg-white  invisible
                rounded shadow-md  border-solid border-[1px] border-[#ebebeb]  aspect-square w-[300px] `}
          >
            <div className=" flex grow-[1] justify-between items-center  pb-2 border-b-[1px] border-solid border-gray-300">
              <button
                className="w-[2rem] h-[2rem] rounded-[50%] hover:bg-slate-200"
                onClick={() => {
                  handleMonthOnChange(-1);
                }}
              >
                <FontAwesomeIcon icon={faAngleLeft}></FontAwesomeIcon>
              </button>
              <div className="font-bold text-lg flex flex-nowrap gap-2">
                <select
                  value={CalendarDate.getFullYear()}
                  onChange={(e) => {
                    handleYearOnChange(e.target.value);
                  }}
                  className="bg-transparent"
                >
                  {renderSelectYears()}
                </select>
                {months[CalendarDate.getMonth()]}
              </div>
              <button
                className="w-[2rem] h-[2rem] rounded-[50%] hover:bg-slate-200"
                onClick={() => {
                  handleMonthOnChange(1);
                }}
              >
                <FontAwesomeIcon icon={faAngleRight}></FontAwesomeIcon>
              </button>
            </div>
            <div className="flex grow-[1] font-bold my-2 ">
              {days.map((day, index) => (
                <div
                  key={index}
                  className="w-[calc(100%/7)] flex justify-center items-center text-lg text-gray-800"
                >
                  {day}
                </div>
              ))}
            </div>
            <div className="flex flex-wrap  grow-[5] ">{renderDate()}</div>
          </div>
        ) : (
          <></>
        ),
        document.body,
      )}
    </div>
  );
};

/**
 *
 * @param {*} value state
 * @param {*} setValue setstate
 * @param {*} placeholder
 * @param {*} onChange onChange事件
 * @param {*} readonly 是否唯獨
 * @param {*} disabled 是否禁用
 * @returns
 */
const TimePicker = ({
  value,
  setValue,
  placeholder,
  onChange,
  readonly = false,
  disabled = false,
}) => {
  /**
   * 檢查是否為時間正確格式 hh:mm:ss
   * @param {String} value
   * @returns 正確傳回物件 否則false
   */
  const isValidTime = (v) => {
    let regex = /^(?:[01]\d|2[0-3]):(?:[0-5]\d):(?:[0-5]\d)$/;
    if (!regex.test(v)) {
      return false;
    }
    return {
      hour: v.split(':')[0],
      minute: v.split(':')[1],
      second: v.split(':')[2],
    };
  };

  /**
   * 組成時間格式
   * @param {*} hour 時
   * @param {*} minute 分
   * @param {*} second 秒
   * @returns
   */
  const getTime = (hour, minute, second) => {
    return `${hour}:${minute}:${second}`;
  };

  const [hiddenValue, setHiddenValue] = useState(value);
  const [showCalendar, setShowCalendar] = useState(false);
  const [hour, setHour] = useState(isValidTime(value) ? isValidTime(value).hour : '00');
  const [minute, setMinute] = useState(isValidTime(value) ? isValidTime(value).minute : '00');
  const [second, setSecond] = useState(isValidTime(value) ? isValidTime(value).second : '00');
  const inputRef = useRef(null);
  const calendarRef = useRef(null);

  /**
   * 觸發onChange 事件
   * @param {*} data 要丟出資料
   */
  const calendarTriggerOnChange = (data) => {
    if (onChange) {
      onChange(data);
    }
  };

  /**
   * 設置Time選單
   * @param {String} v  hh:mm:ss
   * @returns
   */
  const setCalendar = (v) => {
    let obj = isValidTime(v);
    if (obj) {
      setValue(getTime(obj.hour, obj.minute, obj.second));
      setHour(obj.hour);
      setMinute(obj.minute);
      setSecond(obj.second);
      return;
    }
  };

  /**
   * focus 時 調整彈出位置 &  設定選單顯示
   */
  const handleFocus = () => {
    setCalendar(value);
    setShowCalendar(true);

    setTimeout(() => {
      if (inputRef.current && calendarRef.current) {
        const inputRect = inputRef.current.getBoundingClientRect();
        const calendarHeight = calendarRef.current.offsetHeight;
        const calendarWidth = calendarRef.current.offsetWidth;
        const spaceBelow = window.innerHeight - inputRect.bottom;
        const spaceAbove = inputRect.top;
        const spaceRight = window.innerWidth - inputRect.left;
        const spaceLeft = inputRect.right;

        let top, bottom, left, right;

        // 判斷垂直
        if (spaceBelow >= calendarHeight) {
          // 向下
          top = `${inputRect.bottom}px`;
          bottom = 'auto';
        } else if (spaceAbove >= calendarHeight) {
          // 向上
          top = 'auto';
          bottom = `${window.innerHeight - inputRect.top}px`;
        } else {
          // Default
          top = `60px`;
          if (window.innerHeight - 60 - calendarHeight < 0) {
            top = '0px';
          }
          bottom = 'auto';
        }

        // 判斷水平
        if (spaceRight >= calendarWidth) {
          // 向右
          left = `${inputRect.left}px`;
          right = 'auto';
        } else if (spaceLeft >= calendarWidth) {
          // 向左
          left = 'auto';
          right = `${window.innerWidth - inputRect.right}px`;
        } else {
          // Default
          left = `${inputRect.left}px`;
          right = 'auto';
        }

        calendarRef.current.style.top = top;
        calendarRef.current.style.bottom = bottom;
        calendarRef.current.style.left = left;
        calendarRef.current.style.right = right;
        calendarRef.current.style.visibility = 'visible';
      }
    }, 0);
  };

  /**
   * 輸入框onChange 時間正確就設定選單
   * @param {Event} e
   * @returns
   */
  const handleOnChange = (e) => {
    const input = e.target.value.trim();

    // 校驗輸入長度與格式
    if (!calendarSetting.regexNosymbolTW.test(input)) {
      setValue(input); // 如果不是合法格式，直接更新輸入框顯示
      return;
    }

    // 長度校驗（確保民國年格式正確）
    if (input.length !== 7) {
      setValue(input); // 長度不正確，直接返回
      return;
    }

    // 將民國年格式轉換為西元年
    const year = parseInt(input.slice(0, 3)) + 1911; // 民國年轉換為西元
    const month = input.slice(3, 5); // 提取月份
    const day = input.slice(5, 7); // 提取日期

    // 構造日期字串並進行校驗
    const formattedDate = `${year}-${month}-${day}`;
    const validDate = calendarIsValidDate(formattedDate, calendarSetting.type.value, locale);

    if (validDate) {
      setCalendar(validDate); // 設定日曆高亮
      setValue(input); // 更新輸入框值
    } else {
      // 如果為無效日期，清空值或提示使用者
      setValue('');
      console.error('無效日期，請檢查輸入！');
    }
  };

  /**
   * 失去焦點 檢查時間格式 & onChange事件
   */
  const handleOnBlur = () => {
    let obj = isValidTime(value);

    if (obj) {
      setValue(getTime(obj.hour, obj.minute, obj.second));
      if (hiddenValue !== value) {
        calendarTriggerOnChange(getTime(obj.hour, obj.minute, obj.second));
      }
      setHiddenValue(getTime(obj.hour, obj.minute, obj.second));
    }
    if (!obj) {
      setValue('');
      if (hiddenValue) {
        calendarTriggerOnChange('');
      }
      setHiddenValue('');
    }
  };

  /**
   * 點擊元件外關閉彈出視窗
   * @param {Event} event
   */
  const handleClickOutside = (event) => {
    if (
      calendarRef.current &&
      !calendarRef.current.contains(event.target) &&
      inputRef.current &&
      !inputRef.current.contains(event.target)
    ) {
      setShowCalendar(false);
    }
  };

  /**
   * 輸入長度render select option dom
   * @param {number} length
   * @returns
   */
  const renderOption = (length) => {
    return Array(length)
      .fill(null)
      .map((_, index) => {
        return (
          <option key={index} value={index.toString().padStart(2, '0')}>
            {index.toString().padStart(2, '0')}
          </option>
        );
      });
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative  inline-block w-full" onClick={(e) => e.preventDefault()}>
      <div className="relative inline-block w-full">
        <input
          type="text"
          ref={inputRef}
          onFocus={handleFocus}
          value={value}
          onChange={handleOnChange}
          onBlur={handleOnBlur}
          placeholder={placeholder}
          maxLength={8}
          readOnly={readonly}
          disabled={disabled}
          className={`w-full text-black bg-none bg-white  ${
            disabled ? 'cursor-not-allowed bg-[#dddddd]' : ''
          }
                    rounded border-solid border-[1px] focus:border-[2px] border-[#999] focus:border-[#5d8ee5] focus:outline-none focus:bg-white focus:shadow-input-focus
                    block h-[36px] leading-[1.42857143] pl-[4px] shadow-input`}
        />
        {!value && !disabled && (
          <FontAwesomeIcon
            className={`text-gray-300 absolute right-2 top-1/2 transform -translate-y-1/2 ${
              disabled ? 'cursor-not-allowed' : 'cursor-pointer'
            }`}
            icon={faClock}
            onClick={() => {
              if (!showCalendar && !disabled) {
                inputRef.current.focus();
              }
            }}
          ></FontAwesomeIcon>
        )}
        {value && !disabled && (
          <FontAwesomeIcon
            className="text-gray-400 absolute right-2 top-1/2 transform -translate-y-1/2 cursor-pointer scale-75"
            icon={faXmark}
            onClick={() => {
              if (value) {
                setValue('');
                if (hiddenValue) {
                  calendarTriggerOnChange('');
                }
                setHiddenValue('');
              }
            }}
          ></FontAwesomeIcon>
        )}
      </div>
      {createPortal(
        showCalendar ? (
          <div
            ref={calendarRef}
            className={` z-50 pt-3 px-2 flex flex-row flex-wrap  invisible fixed  bg-white  
                rounded  shadow-md  border-solid border-[1px] border-[#ebebeb]  aspect-square w-[220px] h-[180px] `}
          >
            <div className="w-[calc(100%/3)] h-[calc(100%/3)] text-center font-bold text-xl pr-1">
              時
            </div>
            <div className="w-[calc(100%/3)] h-[calc(100%/3)] text-center font-bold text-xl pr-1">
              分
            </div>
            <div className="w-[calc(100%/3)] h-[calc(100%/3)] text-center font-bold text-xl pr-1">
              秒
            </div>
            <div className="w-[calc(100%/3)] h-[calc(100%/4)]  text-center">
              <select
                className="bg-transparent"
                value={hour}
                onChange={(e) => {
                  setHour(e.target.value);
                }}
              >
                {renderOption(24)}
              </select>
            </div>

            <div className="w-[calc(100%/3)] h-[calc(100%/4)]  text-center">
              <select
                className="bg-transparent"
                value={minute}
                onChange={(e) => {
                  setMinute(e.target.value);
                }}
              >
                {renderOption(60)}
              </select>
            </div>

            <div className="w-[calc(100%/3)] h-[calc(100%/4)]  text-center">
              <select
                className="bg-transparent"
                value={second}
                onChange={(e) => {
                  setSecond(e.target.value);
                }}
              >
                {renderOption(60)}
              </select>
            </div>

            <div className="pt-2 pb-1 w-full h-[calc(100%/4)]   flex justify-between border-t-[1px] border-solid border-gray-300">
              <button
                className={` bg-transparent border-[1px] border-solid border-gray-300 rounded  p-[5px] text-sm  text-black`}
                onClick={() => {
                  let now = new Date();
                  setHour(now.getHours().toString().padStart(2, '0'));
                  setMinute(now.getMinutes().toString().padStart(2, '0'));
                  setSecond(now.getSeconds().toString().padStart(2, '0'));
                }}
              >
                現在時間
              </button>

              <button
                className={` bg-blue-400 rounded text-sm text-white px-3  `}
                onClick={() => {
                  if (value !== getTime(hour, minute, second)) {
                    setValue(getTime(hour, minute, second));
                    calendarTriggerOnChange(getTime(hour, minute, second));
                    setHiddenValue(getTime(hour, minute, second));
                  }
                  setShowCalendar(false);
                }}
              >
                確定
              </button>
            </div>
          </div>
        ) : (
          <></>
        ),
        document.body,
      )}
    </div>
  );
};

/**
 *
 * @param {*} value state
 * @param {*} setValue setstate
 * @param {*} min 最小值
 * @param {*} max 最大值
 * @param {*} placeholder
 * @param {*} onChange onChange事件
 * @param {*} locale  語言環境
 * @param {*} readonly 是否唯獨
 * @param {*} disabled 是否禁用
 * @returns
 */
const DateRangePicker = ({
  value,
  setValue,
  placeholder,
  min,
  max,
  onChange,
  locale = defaultLocale(),
  readonly = false,
  disabled = false,
}) => {
  /**
   * 處理DateRange 顯示字串
   * @param {string[2]} dateArray 長度2陣列
   * @returns 顯示字串
   */
  const formatDateRangeString = (dateArray) => {
    if (!dateArray[0] && !dateArray[1]) {
      return '';
    }
    let stDate = calendarIsValidDate(dateArray[0], calendarSetting.type.value, locale);
    let edDate = calendarIsValidDate(dateArray[1], calendarSetting.type.value, locale);

    return `${
      stDate ? stDate.format(calendarSetting.displayFormat, locale) : ''
    }${calendarSetting.dateRangeSplitText}${
      edDate ? edDate.format(calendarSetting.displayFormat, locale) : ''
    }`;
  };
  const [innerValue, setInnerValue] = useState(formatDateRangeString(value));
  const [showCalendar, setShowCalendar] = useState(false);
  const inputRef = useRef(null);
  const calendarRef = useRef(null);
  const hiddenValueRef = useRef([...value]); //儲存有效值，判斷是否觸發OnChange
  const days = ['一', '二', '三', '四', '五', '六', '日'];
  const months = [
    '一月',
    '二月',
    '三月',
    '四月',
    '五月',
    '六月',
    '七月',
    '八月',
    '九月',
    '十月',
    '十一月',
    '十二月',
  ];

  //目前月曆時間Date type value, 固定存一號(避免閏年),切換行事曆年月用
  const [CalendarDate, setCalendarDate] = useState();
  //該月第一天 星期幾
  const [firstDayOfMonth, setFirstDayOfMonth] = useState();
  //該月有幾日
  const [daysInMonth, setDaysInMonth] = useState();

  /**
   * 觸發onChange 事件
   * @param {*} data 要丟出資料
   */
  const calendarTriggerOnChange = (data) => {
    if (onChange) {
      onChange(data);
    }
  };

  /**
   * 設置日曆選單年月
   * @param {Date} DateObject
   */
  const setCalendar = (DateObject) => {
    setCalendarDate(new Date(DateObject.getFullYear(), DateObject.getMonth(), 1));
    setFirstDayOfMonth(getFirstDayOfMonth(DateObject));
    setDaysInMonth(getDaysInMonth(DateObject));
  };

  /**
   * 取得該月份第一天星期幾
   * @param {Date} date
   * @returns
   */
  const getFirstDayOfMonth = (date) => {
    let firstDay = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    return firstDay === 0 ? 6 : firstDay - 1;
  };

  /**
   * 取得該月份有幾日
   * @param {Date} date
   * @returns
   */
  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  /**
   * 如果元件有傳入min prop ，回傳min日期+1 ，無則目前日期
   * @returns  Date Type
   */
  const getMinDate = () => {
    let minDate = calendarIsValidDate(min, calendarSetting.type.value, locale);
    if (minDate) {
      minDate.setDate(minDate.getDate() + 1);
      minDate.setDate(1);
      return minDate;
    } else {
      return new Date();
    }
  };

  /**
   * 日期array sort用 比較method
   * @param {String} dateStr1
   * @param {String} dateStr2
   * @returns
   */
  const compareDates = (dateStr1, dateStr2) => {
    return dateStr1 < dateStr2 ? -1 : 0;
  };

  /**
   * 行事曆切換月份
   * @param {number} shift  +1 or -1
   */
  const handleMonthOnChange = (shift) => {
    CalendarDate.setMonth(CalendarDate.getMonth() + shift);
    setFirstDayOfMonth(getFirstDayOfMonth(CalendarDate));
    setDaysInMonth(getDaysInMonth(CalendarDate));
    setCalendarDate(new Date(CalendarDate));
  };

  /**
   * 日曆選單set年份
   * @param {number} value 年份
   */
  const handleYearOnChange = (value) => {
    CalendarDate.setFullYear(value);
    setFirstDayOfMonth(getFirstDayOfMonth(CalendarDate));
    setDaysInMonth(getDaysInMonth(CalendarDate));
    setCalendarDate(new Date(CalendarDate));
  };

  /**
   * 選單點擊日期 setValue & onChange事件
   * 點選兩個日期形成一個Range 才會觸發onChange
   * @param {Date} date
   */
  const handleDateOnChange = (date) => {
    let tempInnerDateRangeArray = value;
    if (!Array.isArray(tempInnerDateRangeArray)) {
      tempInnerDateRangeArray = new Array(2);
    }

    if (tempInnerDateRangeArray[0] && tempInnerDateRangeArray[1]) {
      tempInnerDateRangeArray[0] = date.format(calendarSetting.valueFormat, locale);
      tempInnerDateRangeArray[1] = '';
      setValue([...tempInnerDateRangeArray]);
      setInnerValue(formatDateRangeString([...tempInnerDateRangeArray]));
    } else if (tempInnerDateRangeArray[0] && !tempInnerDateRangeArray[1]) {
      tempInnerDateRangeArray[1] = date.format(calendarSetting.valueFormat, locale);
      tempInnerDateRangeArray.sort(compareDates);
      setValue([...tempInnerDateRangeArray]);
      setInnerValue(formatDateRangeString([...tempInnerDateRangeArray]));

      let isEqual =
        tempInnerDateRangeArray.length === hiddenValueRef.current.length &&
        tempInnerDateRangeArray.every((value, index) => value === hiddenValueRef.current[index]);
      if (!isEqual) {
        calendarTriggerOnChange(tempInnerDateRangeArray);
      }
      hiddenValueRef.current = tempInnerDateRangeArray;
    } else {
      tempInnerDateRangeArray[0] = date.format(calendarSetting.valueFormat, locale);
      setValue([...tempInnerDateRangeArray]);
      setInnerValue(formatDateRangeString([...tempInnerDateRangeArray]));
    }
  };

  /**
   * 依據傳入Date 回傳年份 民國年年份
   * @param {Date} date
   * @returns
   */
  const handleLocaleYear = (date) => {
    return locale === calendarSetting.localeTW ? date.getFullYear() - 1911 : date.getFullYear();
  };

  /**
   * focus 時 調整彈出位置 & 設定日曆選單顯示年月
   */
  const handleFocus = () => {
    let startDate = new Date();
    if (Array.isArray(value) && value.length > 0) {
      let sD = calendarIsValidDate(value[0], calendarSetting.type.value, locale);
      if (sD) {
        startDate = sD;
      } else if (min) {
        startDate = getMinDate();
      }
    }
    setCalendar(startDate);
    setShowCalendar(true);

    setTimeout(() => {
      if (inputRef.current && calendarRef.current) {
        const inputRect = inputRef.current.getBoundingClientRect();
        const calendarHeight = calendarRef.current.offsetHeight;
        const calendarWidth = calendarRef.current.offsetWidth;
        const spaceBelow = window.innerHeight - inputRect.bottom;
        const spaceAbove = inputRect.top;
        const spaceRight = window.innerWidth - inputRect.left;
        const spaceLeft = inputRect.right;

        let top, bottom, left, right;

        // 判斷垂直
        if (spaceBelow >= calendarHeight) {
          // 向下
          top = `${inputRect.bottom}px`;
          bottom = 'auto';
        } else if (spaceAbove >= calendarHeight) {
          // 向上
          top = 'auto';
          bottom = `${window.innerHeight - inputRect.top}px`;
        } else {
          // Default
          top = `60px`;
          if (window.innerHeight - 60 - calendarHeight < 0) {
            top = '0px';
          }
          bottom = 'auto';
        }

        // 判斷水平
        if (spaceRight >= calendarWidth) {
          // 向右
          left = `${inputRect.left}px`;
          right = 'auto';
        } else if (spaceLeft >= calendarWidth) {
          // 向左
          left = 'auto';
          right = `${window.innerWidth - inputRect.right}px`;
        } else {
          // Default
          left = `${inputRect.left}px`;
          right = 'auto';
        }

        calendarRef.current.style.top = top;
        calendarRef.current.style.bottom = bottom;
        calendarRef.current.style.left = left;
        calendarRef.current.style.right = right;
        calendarRef.current.style.visibility = 'visible';
      }
    }, 0);
  };

  /**
   * 輸入框onChage & 設定日曆年月
   * @param {Event} e
   */
  const handleOnChange = (e) => {
    let v = e.target.value;
    setInnerValue(v);

    if (v && v.split(calendarSetting.dateRangeSplitText).length === 2) {
      let inputDate = v.split(calendarSetting.dateRangeSplitText);
      let sDate = calendarIsValidDate(inputDate[0], calendarSetting.type.display, locale);
      let eDate = calendarIsValidDate(inputDate[1], calendarSetting.type.display, locale);
      if (sDate && eDate) {
        if (
          value[0] !== sDate.format(calendarSetting.valueFormat, locale) ||
          value[1] !== eDate.format(calendarSetting.valueFormat, locale)
        ) {
          if (
            eDate >= sDate &&
            calendarisEnableDate(
              min,
              max,
              sDate.format(calendarSetting.valueFormat, locale),
              locale,
            ) &&
            calendarisEnableDate(
              min,
              max,
              eDate.format(calendarSetting.valueFormat, locale),
              locale,
            )
          ) {
            setValue([
              sDate.format(calendarSetting.valueFormat, locale),
              eDate.format(calendarSetting.valueFormat, locale),
            ]);
            if (
              sDate.getFullYear() !== CalendarDate.getFullYear() ||
              sDate.getMonth() !== CalendarDate.getMonth()
            ) {
              setCalendar(sDate);
            }
          }
        }
      }
    }
  };

  /**
   * 失去焦點事件 setValue & onChange事件
   * @param {Event} e
   */
  const handleOnBlur = (e) => {
    let isValid = true;

    const dateArray = innerValue ? innerValue.split(calendarSetting.dateRangeSplitText) : null;

    if (!dateArray) {
      isValid = false;
    } else if (dateArray.length !== 2) {
      isValid = false;
    } else {
      let sD = calendarIsValidDate(dateArray[0], calendarSetting.type.display, locale);
      let eD = calendarIsValidDate(dateArray[1], calendarSetting.type.display, locale);
      if (!sD || !eD || !(eD >= sD)) {
        isValid = false;
      } else if (
        !calendarisEnableDate(min, max, sD.format(calendarSetting.valueFormat, locale), locale) ||
        !calendarisEnableDate(min, max, eD.format(calendarSetting.valueFormat, locale), locale)
      ) {
        isValid = false;
      }
    }

    if (!isValid) {
      if (hiddenValueRef.current[0] || hiddenValueRef.current[1]) {
        calendarTriggerOnChange(new Array(2));
      }
      setInnerValue('');
      setValue(new Array(2));
      hiddenValueRef.current = new Array(2);
    } else {
      let isEqual =
        value.length === hiddenValueRef.current.length &&
        value.every((value, index) => value === hiddenValueRef.current[index]);
      if (!isEqual) {
        calendarTriggerOnChange(value);
      }
      hiddenValueRef.current = value;
    }
  };

  /**
   * 點擊元件外關閉彈出視窗
   * @param {Event} event
   */
  const handleClickOutside = (event) => {
    if (
      calendarRef.current &&
      !calendarRef.current.contains(event.target) &&
      inputRef.current &&
      !inputRef.current.contains(event.target)
    ) {
      setShowCalendar(false);
      //只點選一個日期 關閉時清除掉
      if (inputRef.current.value) {
        let dateArray = inputRef.current.value.split(calendarSetting.dateRangeSplitText);
        if (
          dateArray.length < 2 ||
          !calendarIsValidDate(dateArray[1], calendarSetting.type.display, locale)
        ) {
          setInnerValue('');
          setValue(new Array(2));
          if (hiddenValueRef.current[0] || hiddenValueRef.current[1]) {
            calendarTriggerOnChange(new Array(2));
          }
          hiddenValueRef.current = new Array(2);
        }
      }
    }
  };

  /**
   * render 日曆日期dom
   * @returns
   */
  const renderDate = () => {
    let emptyDateDom = Array(firstDayOfMonth)
      .fill(null)
      .map((_, index) => (
        <div
          key={index}
          className="w-[calc(100%/7)] aspect-square p-[1px] flex justify-center items-center rounded-[50%] "
        ></div>
      ));

    let validDate = Array(daysInMonth)
      .fill(null)
      .map((_, index) => {
        let _date = new Date(CalendarDate);
        _date.setDate(index + 1);
        let _dateString = _date.format(calendarSetting.valueFormat, locale);
        let isToday = _dateString === new Date().format(calendarSetting.valueFormat, locale);
        let isInRange =
          calendarIsValidDate(value[0], calendarSetting.type.value, locale) &&
          calendarIsValidDate(value[1], calendarSetting.type.value, locale) &&
          _dateString > value[0] &&
          _dateString < value[1];
        let isStart = value[0] === _dateString;
        let isEnd = value[1] === _dateString;
        let isValidDate = calendarisEnableDate(min, max, _dateString, locale);
        return (
          <div
            key={index + firstDayOfMonth}
            className={`w-[calc(100%/7)] aspect-square p-[1px]   flex justify-center items-center  cursor-pointer 
                ${
                  (isStart || isEnd || isInRange) &&
                  !isValidDate &&
                  '!text-red-600 !cursor-not-allowed'
                }
                ${isStart && 'rounded-l-md'}  ${isEnd && 'rounded-r-md'} ${
                  !isInRange && !isStart && !isEnd && 'rounded-[10%] hover:bg-gray-200 '
                }
                ${
                  value.includes(_dateString)
                    ? 'bg-blue-500 text-white'
                    : isInRange
                      ? 'bg-gray-100 !rounded-[0px]'
                      : !isValidDate
                        ? '!cursor-default !bg-transparent text-gray-200'
                        : 'text-gray-700'
                }  
                 ${isToday ? 'border-sky-300 border-[2px] border-solid ' : ''} `}
            {...(isValidDate ? { onClick: () => handleDateOnChange(_date) } : {})}
          >
            {index + 1}
          </div>
        );
      });

    return emptyDateDom.concat(validDate);
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [locale]);

  return (
    <div className={`relative inline-block w-full`} onClick={(e) => e.preventDefault()}>
      <div className={`relative inline-block w-full `}>
        <input
          type="text"
          ref={inputRef}
          onFocus={handleFocus}
          value={innerValue}
          onChange={handleOnChange}
          onBlur={handleOnBlur}
          placeholder={placeholder}
          maxLength={locale === calendarSetting.localeTW ? 21 : 23}
          readOnly={readonly}
          disabled={disabled}
          className={`w-full text-black bg-none bg-white   ${
            disabled ? 'cursor-not-allowed !bg-[#dddddd]' : ''
          }
                    rounded border-solid border-[1px] focus:border-[2px] border-[#999] focus:border-[#5d8ee5] focus:outline-none focus:bg-white focus:shadow-input-focus
                    block h-[36px] leading-[1.42857143] pl-[4px] shadow-input`}
        />
        {!innerValue && !disabled && (
          <FontAwesomeIcon
            className={`text-gray-300 absolute right-2 top-1/2 transform -translate-y-1/2  ${
              disabled ? 'cursor-not-allowed' : 'cursor-pointer'
            }`}
            icon={faCalendarDays}
            onClick={() => {
              if (!showCalendar && !disabled) {
                inputRef.current.focus();
              }
            }}
          ></FontAwesomeIcon>
        )}
        {innerValue && !disabled && (
          <FontAwesomeIcon
            className="text-gray-400 absolute right-2 top-1/2 transform -translate-y-1/2 cursor-pointer scale-75"
            icon={faXmark}
            onClick={() => {
              setValue(new Array(2));
              setInnerValue('');
              if (hiddenValueRef.current[0] || hiddenValueRef.current[1]) {
                calendarTriggerOnChange(new Array(2));
              }
              hiddenValueRef.current = new Array(2);
            }}
          ></FontAwesomeIcon>
        )}
      </div>

      {createPortal(
        showCalendar && !disabled ? (
          <div
            ref={calendarRef}
            className={` z-50 p-2 flex flex-col bg-white  invisible fixed 
                rounded shadow-md  border-solid border-[1px] border-[#ebebeb]  aspect-square w-[300px] `}
          >
            <div className=" flex grow-[1] justify-between items-center  pb-2 border-b-[1px] border-solid border-gray-300">
              <button
                className="w-[2rem] h-[2rem] rounded-[50%] hover:bg-slate-200"
                onClick={() => {
                  handleMonthOnChange(-1);
                }}
              >
                <FontAwesomeIcon icon={faAngleLeft}></FontAwesomeIcon>
              </button>
              <div className="font-bold text-lg flex flex-nowrap gap-2">
                <select
                  value={CalendarDate.getFullYear()}
                  onChange={(e) => {
                    handleYearOnChange(e.target.value);
                  }}
                  className="bg-transparent"
                >
                  {Array(calendarSetting.selectYearsRange)
                    .fill(null)
                    .map((_, index) => {
                      if (index < Math.floor(calendarSetting.selectYearsRange / 2)) {
                        let year =
                          CalendarDate.getFullYear() -
                          (Math.floor(calendarSetting.selectYearsRange / 2) - index);
                        let twYear =
                          handleLocaleYear(CalendarDate) -
                          (Math.floor(calendarSetting.selectYearsRange / 2) - index);
                        return (
                          <option key={index} value={year}>{`${
                            locale === calendarSetting.localeTW ? '民國' : ''
                          }${twYear}年`}</option>
                        );
                      } else {
                        let year =
                          CalendarDate.getFullYear() +
                          (index - Math.floor(calendarSetting.selectYearsRange / 2));
                        let twYear =
                          handleLocaleYear(CalendarDate) +
                          (index - Math.floor(calendarSetting.selectYearsRange / 2));
                        return (
                          <option key={index} value={year}>{`${
                            locale === calendarSetting.localeTW ? '民國' : ''
                          }${twYear}年`}</option>
                        );
                      }
                    })}
                </select>
                {months[CalendarDate.getMonth()]}
              </div>
              <button
                className="w-[2rem] h-[2rem] rounded-[50%] hover:bg-slate-200"
                onClick={() => {
                  handleMonthOnChange(1);
                }}
              >
                <FontAwesomeIcon icon={faAngleRight}></FontAwesomeIcon>
              </button>
            </div>
            <div className="flex grow-[1] font-bold my-2 ">
              {days.map((day, index) => (
                <div
                  key={index}
                  className="w-[calc(100%/7)] flex justify-center items-center text-lg text-gray-800"
                >
                  {day}
                </div>
              ))}
            </div>
            <div className="flex flex-wrap  grow-[5] ">{renderDate()}</div>
          </div>
        ) : (
          <></>
        ),
        document.body,
      )}
    </div>
  );
};

/**
 *
 * @param {*} value state
 * @param {*} setValue setstate
 * @param {*} min 最小值
 * @param {*} max 最大值
 * @param {*} placeholder
 * @param {*} onChange onChange事件
 * @param {*} locale  語言環境
 * @param {*} readonly 是否唯獨
 * @param {*} disabled 是否禁用
 * @returns
 */
const DateTimePicker = ({
  value,
  setValue,
  min,
  max,
  placeholder,
  onChange,
  locale = defaultLocale(),
  readonly = false,
  disabled = false,
}) => {
  const [hiddenValue, setHiddenValue] = useState(value);
  const [showCalendar, setShowCalendar] = useState(false);
  const inputRef = useRef(null);
  const calendarRef = useRef(null);
  const days = ['一', '二', '三', '四', '五', '六', '日'];
  const months = [
    '一月',
    '二月',
    '三月',
    '四月',
    '五月',
    '六月',
    '七月',
    '八月',
    '九月',
    '十月',
    '十一月',
    '十二月',
  ];

  //目前月曆時間Date type value, 固定存一號(避免閏年),切換行事曆年月用
  const [CalendarDate, setCalendarDate] = useState();
  //該月第一天 星期幾
  const [firstDayOfMonth, setFirstDayOfMonth] = useState();
  //該月有幾日
  const [daysInMonth, setDaysInMonth] = useState();

  /**
   * 檢查是否為時間正確格式 hh:mm:ss
   * @param {String} value
   * @returns 正確傳回物件 否則false
   */
  const isValidTime = (v) => {
    let regex = /^(?:[01]\d|2[0-3]):(?:[0-5]\d):(?:[0-5]\d)$/;
    if (!regex.test(v)) {
      return false;
    }
    return {
      hour: v.split(':')[0],
      minute: v.split(':')[1],
      second: v.split(':')[2],
    };
  };

  /**
   * 檢查時間是否在min max範圍內
   * @param {String} _min
   * @param {String} _max
   * @param {String} _value
   * @returns
   */
  const isEnabledTime = (_min, _max, _value) => {
    let minT = isValidTime(_min);
    let maxT = isValidTime(_max);
    return !(minT && _value < _min) && !(maxT && _value > _max);
  };

  /**
   * 處理日期時間字串
   * @param {String} IV
   * @returns
   */
  const handleDateTime = (IV) => {
    let dateNtime = IV ? IV.split(' ') : [];
    let tempD = dateNtime[0] ? dateNtime[0] : '';
    let tempT = dateNtime[1] ? dateNtime[1] : '';

    // 如果時間已經包含冒號（格式為 hh:mm:ss），直接使用
    if (tempT && tempT.includes(':')) {
      return [tempD, tempT];
    }

    // 如果時間是純數字格式（hhmmss），轉換為 hh:mm:ss
    if (tempT && tempT.length === 6) {
      tempT = `${tempT.substring(0, 2)}:${tempT.substring(2, 4)}:${tempT.substring(4, 6)}`;
    }

    return [tempD, tempT];
  };

  const [hour, setHour] = useState(
    isValidTime(handleDateTime(value)[1]) ? isValidTime(handleDateTime(value)[1]).hour : '00',
  );
  const [minute, setMinute] = useState(
    isValidTime(handleDateTime(value)[1]) ? isValidTime(handleDateTime(value)[1]).minute : '00',
  );
  const [second, setSecond] = useState(
    isValidTime(handleDateTime(value)[1]) ? isValidTime(handleDateTime(value)[1]).second : '00',
  );

  /**
   * 觸發onChange 事件
   * @param {*} data 要丟出資料
   */
  const calendarTriggerOnChange = (data) => {
    if (onChange) {
      onChange(data);
    }
  };

  /**
   *  設置目前日期選單年月
   * @param {Date} DateObject
   */
  const setCalendar = (DateObject) => {
    setCalendarDate(new Date(DateObject.getFullYear(), DateObject.getMonth(), 1));
    setFirstDayOfMonth(getFirstDayOfMonth(DateObject));
    setDaysInMonth(getDaysInMonth(DateObject));
  };

  /**
   *
   * @returns 如果元件有傳入min prop ，回傳min日期+1 ，無則目前日期
   */
  const getMinDate = () => {
    let [tempD] = handleDateTime(min);
    let minDate = calendarIsValidDate(tempD, calendarSetting.type.value, locale);
    if (minDate) {
      minDate.setDate(minDate.getDate() + 1);
      return minDate;
    } else {
      return new Date();
    }
  };

  /**
   * 行事曆切換月份
   * @param {Number} shift +1 or -1
   */
  const handleMonthOnChange = (shift) => {
    CalendarDate.setMonth(CalendarDate.getMonth() + shift);
    setFirstDayOfMonth(getFirstDayOfMonth(CalendarDate));
    setDaysInMonth(getDaysInMonth(CalendarDate));
    setCalendarDate(new Date(CalendarDate));
  };

  /**
   * 處理年分下拉選單選擇後 調整目前日曆選單
   * @param {Number} value 年份(西元)
   */
  const handleYearOnChange = (value) => {
    CalendarDate.setFullYear(value);
    setFirstDayOfMonth(getFirstDayOfMonth(CalendarDate));
    setDaysInMonth(getDaysInMonth(CalendarDate));
    setCalendarDate(new Date(CalendarDate));
  };

  /**
   * 日曆點擊日期後setValue
   * @param {Date} date
   */
  const handleDateOnChange = (date) => {
    setShowCalendar(false);
    if (value !== date.format(calendarSetting.valueFormat)) {
      let dateFormatted = date.format(calendarSetting.displayFormat, locale);
      let timeFormatted = `${hour}:${minute}:${second}`;
      let replacev = `${dateFormatted} ${timeFormatted}`;
      setValue(replacev);
      if (hiddenValue !== replacev) {
        calendarTriggerOnChange(replacev);
      }
      setHiddenValue(replacev);
    }
  };

  /**
   * 依照目前locale 取得年份
   * @param {Date} date
   * @returns Number
   */
  const handleLocaleYear = (date) => {
    return locale === calendarSetting.localeTW ? date.getFullYear() - 1911 : date.getFullYear();
  };

  /**
   * 依照傳入Date取得該月份的第一天星期幾
   * @param {Date} date
   * @returns
   */
  const getFirstDayOfMonth = (date) => {
    let firstDay = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    return firstDay === 0 ? 6 : firstDay - 1;
  };

  /**
   * 依照傳入Date取得該月份的天數
   * @param {Date} date
   * @returns
   */
  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  /**
   * focus 時 調整彈出位置 &  設定日曆選單顯示年月
   */
  const handleFocus = () => {
    let [tempD, tempT] = handleDateTime(value);
    let nowValue = calendarIsValidDate(tempD, calendarSetting.type.value, locale);
    const nowdate = nowValue ? nowValue : getMinDate();
    setCalendar(nowdate);
    setShowCalendar(true);

    let timeValid = isValidTime(tempT);

    if (timeValid) {
      setHour(timeValid.hour);
      setMinute(timeValid.minute);
      setSecond(timeValid.second);
    } else {
      setHour('00');
      setMinute('00');
      setSecond('00');
    }

    setTimeout(() => {
      if (inputRef.current && calendarRef.current) {
        const inputRect = inputRef.current.getBoundingClientRect();
        const calendarHeight = calendarRef.current.offsetHeight;
        const calendarWidth = calendarRef.current.offsetWidth;
        const spaceBelow = window.innerHeight - inputRect.bottom;
        const spaceAbove = inputRect.top;
        const spaceRight = window.innerWidth - inputRect.left;
        const spaceLeft = inputRect.right;

        let top, bottom, left, right;

        if (spaceAbove > calendarHeight) {
          // 向上
          top = 'auto';
          bottom = `${window.innerHeight - inputRect.top}px`;
        } else if (spaceBelow > calendarHeight) {
          // 向下
          top = `${inputRect.bottom}px`;
          bottom = 'auto';
        } else {
          //top 設定最上方
          top = `60px`;
          if (window.innerHeight - 60 - calendarHeight < 0) {
            top = '0px';
          }

          bottom = 'auto';
        }

        // 判斷水平
        if (spaceRight >= calendarWidth) {
          // 向右
          left = `${inputRect.left}px`;
          right = 'auto';
        } else if (spaceLeft >= calendarWidth) {
          // 向左
          left = 'auto';
          right = `${window.innerWidth - inputRect.right}px`;
        } else {
          // Default
          let space =
            window.innerWidth > calendarWidth
              ? (window.innerWidth - calendarWidth) / 2
              : inputRect.left;
          left = `${space}px`;
          right = 'auto';
        }

        calendarRef.current.style.top = top;
        calendarRef.current.style.bottom = bottom;
        calendarRef.current.style.left = left;
        calendarRef.current.style.right = right;
        calendarRef.current.style.visibility = 'visible';
      }
    }, 0);
  };

  /**
   * 輸入框Change事件，若目前輸入的值是正確日期， 調整日曆顯示年月
   * @param {Event} e Event
   */
  const handleOnChange = (e) => {
    setValue(e.target.value);
    //調整輸入字串格式
    let [tempD, tempT] = handleDateTime(e.target.value);

    let inputDate = calendarIsValidDate(tempD, calendarSetting.type.display, locale);
    let inputTime = isValidTime(tempT);

    let [minD] = handleDateTime(min);
    let [maxD] = handleDateTime(max);

    if (
      inputDate &&
      calendarisEnableDate(minD, maxD, inputDate.format('yyyymmdd', locale), locale)
    ) {
      if (
        inputDate.getFullYear() !== CalendarDate.getFullYear() ||
        inputDate.getMonth() !== CalendarDate.getMonth()
      ) {
        setCalendar(inputDate);
      }

      if (inputTime) {
        setHour(inputTime.hour);
        setMinute(inputTime.minute);
        setSecond(inputTime.second);
      }
    }
  };

  /**
   * 失去焦點事件，檢查是否日期正確，setValue & OnChange事件觸發
   */
  const handleOnBlur = () => {
    if (!value) {
      if (hiddenValue) {
        calendarTriggerOnChange('');
      }
      setHiddenValue('');
      return;
    }

    let [tempD, tempT] = handleDateTime(value);

    let inputDate = calendarIsValidDate(tempD, calendarSetting.type.value, locale);
    let inputTime = isValidTime(tempT);

    let [minD, minT] = handleDateTime(min);
    let [maxD, maxT] = handleDateTime(max);

    let timeIsEnabled = true;
    if (inputTime && (tempD === minD || tempD === maxD)) {
      timeIsEnabled = isEnabledTime(minT, maxT, tempT);
    }

    if (
      !inputDate ||
      !calendarisEnableDate(minD, maxD, inputDate.format('yyyymmdd', locale), locale) ||
      !inputTime ||
      !timeIsEnabled
    ) {
      setValue('');
      if (hiddenValue) {
        calendarTriggerOnChange('');
      }
      setHiddenValue('');
    } else {
      let dateFormatted = inputDate.format(calendarSetting.displayFormat, locale);
      let timeFormatted = `${inputTime.hour}:${inputTime.minute}:${inputTime.second}`;
      let replacev = `${dateFormatted} ${timeFormatted}`;
      setValue(replacev);
      if (hiddenValue !== replacev) {
        calendarTriggerOnChange(replacev);
      }
      setHiddenValue(replacev);
    }
  };

  /**
   * 輸入框display 回傳display格式
   * @param {String} value 目前輸入框值
   * @returns  display格式
   */
  const inputDisPlayFormat = (value) => {
    if (!value) {
      return '';
    }

    let [tempD, tempT] = handleDateTime(value);

    let tempDate = calendarIsValidDate(tempD, calendarSetting.type.value, locale);
    let tempTime = isValidTime(tempT);
    if (tempDate && tempTime) {
      return `${tempDate.format(calendarSetting.displayFormat, locale)} ${
        tempTime.hour
      }:${tempTime.minute}:${tempTime.second}`;
    } else {
      return value;
    }
  };

  /**
   * 關閉事件
   * @param {Event} event
   */
  const handleClickOutside = (event) => {
    if (
      calendarRef.current &&
      !calendarRef.current.contains(event.target) &&
      inputRef.current &&
      !inputRef.current.contains(event.target)
    ) {
      setShowCalendar(false);
    }
  };

  /**
   * render 年份下拉選項
   * @returns 年份選項
   */
  const renderSelectYears = () => {
    return Array(calendarSetting.selectYearsRange)
      .fill(null)
      .map((_, index) => {
        if (index < Math.floor(calendarSetting.selectYearsRange / 2)) {
          let year =
            CalendarDate.getFullYear() - (Math.floor(calendarSetting.selectYearsRange / 2) - index);
          let twYear =
            handleLocaleYear(CalendarDate) -
            (Math.floor(calendarSetting.selectYearsRange / 2) - index);
          return (
            <option key={index} value={year}>{`${
              locale === calendarSetting.localeTW ? '民國' : ''
            }${twYear}年`}</option>
          );
        } else {
          let year =
            CalendarDate.getFullYear() + (index - Math.floor(calendarSetting.selectYearsRange / 2));
          let twYear =
            handleLocaleYear(CalendarDate) +
            (index - Math.floor(calendarSetting.selectYearsRange / 2));
          return (
            <option key={index} value={year}>{`${
              locale === calendarSetting.localeTW ? '民國' : ''
            }${twYear}年`}</option>
          );
        }
      });
  };

  /**
   * 輸入長度render select option dom
   * @param {number} length
   * @returns
   */
  const renderOption = (length, part) => {
    let minD = SafeReplaceALL(
      SafeReplaceALL(min, calendarSetting.displayFormatSplitText, ''),
      calendarSetting.valueFormatSplitText,
      '',
    );
    let maxD = SafeReplaceALL(
      SafeReplaceALL(max, calendarSetting.displayFormatSplitText, ''),
      calendarSetting.valueFormatSplitText,
      '',
    );
    let nowV = SafeReplaceALL(
      SafeReplaceALL(value, calendarSetting.displayFormatSplitText, ''),
      calendarSetting.valueFormatSplitText,
      '',
    );

    let [tempMinD, tempMinT] = handleDateTime(minD);
    let [tempMaxD, tempMaxT] = handleDateTime(maxD);
    let [tempNowD, tempNowT] = handleDateTime(nowV);

    let OptionArray = Array(length)
      .fill(null)
      .map((_, index) => {
        return index.toString().padStart(2, '0');
      });

    //先看看日期是否一樣 如果有值才比較是否一樣 分 min 跟 max
    if (tempMinD && tempNowD && tempMinD === tempNowD) {
      let minT = isValidTime(tempMinT);
      let nowT = isValidTime(tempNowT);
      if (minT && nowT) {
        if (part === 'H') {
          OptionArray = OptionArray.filter((v) => {
            return v >= minT.hour;
          });
        } else if (part === 'M') {
          if (nowT.hour === minT.hour) {
            OptionArray = OptionArray.filter((v) => {
              return v >= minT.minute;
            });
          } else if (nowT.hour < minT.hour) {
            OptionArray = [];
          }
        } else if (part === 'S') {
          if (nowT.hour === minT.hour && nowT.minute === minT.minute) {
            OptionArray = OptionArray.filter((v) => {
              return v >= minT.second;
            });
          } else if (nowT.hour < minT.hour || nowT.minute < minT.minute) {
            OptionArray = [];
          }
        }
      }
    }
    if (tempMaxD && tempNowD && tempMaxD === tempNowD) {
      let maxT = isValidTime(tempMaxT);
      let nowT = isValidTime(tempNowT);
      if (maxT && nowT) {
        if (part === 'H') {
          OptionArray = OptionArray.filter((v) => {
            return v <= maxT.hour;
          });
        } else if (part === 'M') {
          if (nowT.hour === maxT.hour) {
            OptionArray = OptionArray.filter((v) => {
              return v <= maxT.minute;
            });
          } else if (nowT.hour > maxT.hour) {
            OptionArray = [];
          }
        } else if (part === 'S') {
          if (nowT.hour === maxT.hour && nowT.minute === maxT.minute) {
            OptionArray = OptionArray.filter((v) => {
              return v <= maxT.second;
            });
          } else if (nowT.hour > maxT.hour || nowT.minute > maxT.minute) {
            OptionArray = [];
          }
        }
      }
    }

    return Array(length)
      .fill(null)
      .map((_, index) => {
        let isEnabled = OptionArray.includes(index.toString().padStart(2, '0'));
        return (
          <option disabled={!isEnabled} key={index} value={index.toString().padStart(2, '0')}>
            {index.toString().padStart(2, '0')}
          </option>
        );
      });
  };

  const isTodayCss = 'border-sky-300 border-[2px] border-solid';
  const isValueCss = 'bg-gray-400';
  /**
   * render 日曆日期dom
   * @returns
   */
  const renderDate = () => {
    let emptyDateDom = Array(firstDayOfMonth)
      .fill(null)
      .map((_, index) => (
        <div
          key={index}
          className="w-[calc(100%/7)] aspect-square p-[1px] flex justify-center items-center rounded-[50%] "
        ></div>
      ));

    let [minD] = handleDateTime(min);
    let [maxD] = handleDateTime(max);
    let nowD = inputDisPlayFormat(value)
      ?.replaceAll(calendarSetting.displayFormatSplitText, calendarSetting.valueFormatSplitText)
      .split(' ')[0];

    let validDateDom = Array(daysInMonth)
      .fill(null)
      .map((_, index) => {
        let _date = new Date(CalendarDate);
        _date.setDate(index + 1);
        let isValue = _date.format(calendarSetting.valueFormat, locale) === nowD;
        let isToday =
          _date.format(calendarSetting.valueFormat) ===
          new Date().format(calendarSetting.valueFormat);

        let isEnable = calendarisEnableDate(minD, maxD, _date.format('yyyymmdd', locale), locale);

        if (isEnable) {
          return (
            <div
              key={firstDayOfMonth + index}
              className={`w-[calc(100%/7)] aspect-square p-[1px] text-gray-700  flex justify-center items-center rounded-[50%] cursor-pointer 
                    hover:bg-gray-200 
                    ${isValue ? isValueCss : ''}   ${isToday ? isTodayCss : ''} `}
              onClick={() => {
                handleDateOnChange(_date);
              }}
            >
              {index + 1}
            </div>
          );
        } else {
          return (
            <div
              key={firstDayOfMonth + index}
              className={`w-[calc(100%/7)] aspect-square p-[1px] flex justify-center items-center rounded-[50%] text-gray-300 pointer-events-none 
                    ${isValue ? isValueCss : ''}  ${isToday ? isTodayCss : ''}  `}
            >
              {index + 1}
            </div>
          );
        }
      });

    return emptyDateDom.concat(validDateDom);
  };

  /**
   * 時間下拉選單onChange
   * @param {String} part H: M : S
   * @param {*} v Value
   */
  const handleTimeOnChange = (part, v) => {
    let [tempD] = handleDateTime(value);
    let inputDate = calendarIsValidDate(tempD, calendarSetting.type.display, locale);

    let h = hour;
    let m = minute;
    let s = second;

    if (part === 'H') {
      h = v;
    } else if (part === 'M') {
      m = v;
    } else if (part === 'S') {
      s = v;
    }

    if (inputDate) {
      let dateFormatted = inputDate.format(calendarSetting.displayFormat, locale);
      let timeFormatted = `${h}:${m}:${s}`;
      let replacev = `${dateFormatted} ${timeFormatted}`;

      setValue(replacev);
      if (hiddenValue !== replacev) {
        calendarTriggerOnChange(replacev);
      }
      setHiddenValue(replacev);

      // 更新時、分、秒的狀態
      if (part === 'H') setHour(v);
      else if (part === 'M') setMinute(v);
      else if (part === 'S') setSecond(v);
    }
  };

  /**
   * 回傳是否可以點擊當下時間(是否在min max範圍內)
   * @returns boolean
   */
  const IsNowTimeCanClick = () => {
    let [minD, minT] = handleDateTime(min);
    let [maxD, maxT] = handleDateTime(max);

    let minIsValidDate = calendarIsValidDate(minD, calendarSetting.type.value, locale);
    let minIsValidTime = isValidTime(minT);

    let maxIsValidDate = calendarIsValidDate(maxD, calendarSetting.type.value, locale);
    let maxIsValidTime = isValidTime(maxT);

    if (minIsValidDate && minIsValidTime) {
      //檢查目前日期時間是否小於最小日期
      let now = new Date();
      let Tmin = `${minIsValidDate.format('yyyymmdd', locale)} ${
        minIsValidTime.hour
      }${minIsValidTime.minute}${minIsValidTime.second}`;
      let nowDate = `${now.format('yyyymmdd', locale)} ${now
        .getHours()
        .toString()
        .padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}${now
        .getSeconds()
        .toString()
        .padStart(2, '0')}`;

      if (nowDate < Tmin) {
        return false;
      }
    }

    if (maxIsValidDate && maxIsValidTime) {
      //檢查目前日期時間是否大於最大日期
      let now = new Date();
      let Tmax = `${maxIsValidDate.format('yyyymmdd', locale)} ${
        maxIsValidTime.hour
      }${maxIsValidTime.minute}${maxIsValidTime.second}`;
      let nowDate = `${now.format('yyyymmdd', locale)} ${now
        .getHours()
        .toString()
        .padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}${now
        .getSeconds()
        .toString()
        .padStart(2, '0')}`;
      if (nowDate > Tmax) {
        return false;
      }
    }
    return true;
  };

  /**
   * 現在時間click事件
   */
  const nowTimeOnClick = () => {
    if (IsNowTimeCanClick()) {
      let now = new Date();
      let nowDate = now.format(calendarSetting.displayFormat, locale);
      let h = now.getHours().toString().padStart(2, '0');
      let m = now.getMinutes().toString().padStart(2, '0');
      let s = now.getSeconds().toString().padStart(2, '0');
      let nowTime = `${h}:${m}:${s}`;

      let replacev = `${nowDate} ${nowTime}`;
      setValue(replacev);
      setHour(h);
      setMinute(m);
      setSecond(s);
      if (hiddenValue !== replacev) {
        calendarTriggerOnChange(replacev);
      }
      setHiddenValue(replacev);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className={`relative  inline-block w-full`} onClick={(e) => e.preventDefault()}>
      <div className={`relative inline-block w-full `}>
        <input
          type="text"
          ref={inputRef}
          onFocus={handleFocus}
          value={inputDisPlayFormat(value)}
          onChange={handleOnChange}
          onBlur={handleOnBlur}
          placeholder={placeholder}
          maxLength={19}
          readOnly={readonly}
          disabled={disabled}
          className={`w-full text-black bg-none bg-white   ${
            disabled ? 'cursor-not-allowed !bg-[#dddddd]' : ''
          }
                    rounded border-solid border-[1px] focus:border-[2px] border-[#999] focus:border-[#5d8ee5] focus:outline-none focus:bg-white focus:shadow-input-focus
                    block h-[36px] leading-[1.42857143] pl-[4px] shadow-input`}
        />
        {!value && !disabled && (
          <FontAwesomeIcon
            className={`text-gray-300 absolute right-2 top-1/2 transform -translate-y-1/2  ${
              disabled ? 'cursor-not-allowed' : 'cursor-pointer'
            }`}
            icon={faCalendarDays}
            onClick={() => {
              if (!showCalendar && !disabled) {
                inputRef.current.focus();
              }
            }}
          ></FontAwesomeIcon>
        )}
        {value && !disabled && (
          <FontAwesomeIcon
            className="text-gray-400 absolute right-2 top-1/2 transform -translate-y-1/2 cursor-pointer scale-75"
            icon={faXmark}
            onClick={() => {
              setValue('');
              if (hiddenValue) {
                calendarTriggerOnChange('');
              }
              setHiddenValue('');
            }}
          ></FontAwesomeIcon>
        )}
      </div>
      {createPortal(
        showCalendar && !disabled ? (
          <div
            ref={calendarRef}
            className={` z-50  p-2 flex flex-col fixed  bg-white  invisible
                rounded shadow-md  border-solid border-[1px] border-[#ebebeb]  aspect-square w-[300px] `}
          >
            <div className=" flex grow-[1] justify-between items-center  pb-2 border-b-[1px] border-solid border-gray-300">
              <button
                className="w-[2rem] h-[2rem] rounded-[50%] hover:bg-slate-200"
                onClick={() => {
                  handleMonthOnChange(-1);
                }}
              >
                <FontAwesomeIcon icon={faAngleLeft}></FontAwesomeIcon>
              </button>
              <div className="font-bold text-lg flex flex-nowrap gap-2">
                <select
                  value={CalendarDate.getFullYear()}
                  onChange={(e) => {
                    handleYearOnChange(e.target.value);
                  }}
                  className="bg-transparent"
                >
                  {renderSelectYears()}
                </select>
                {months[CalendarDate.getMonth()]}
              </div>
              <button
                className="w-[2rem] h-[2rem] rounded-[50%] hover:bg-slate-200"
                onClick={() => {
                  handleMonthOnChange(1);
                }}
              >
                <FontAwesomeIcon icon={faAngleRight}></FontAwesomeIcon>
              </button>
            </div>
            <div className="flex grow-[1] font-bold my-2 ">
              {days.map((day, index) => (
                <div
                  key={index}
                  className="w-[calc(100%/7)] flex justify-center items-center text-lg text-gray-800"
                >
                  {day}
                </div>
              ))}
            </div>
            <div className="flex flex-wrap  grow-[5] ">{renderDate()}</div>

            <div className="flex grow-[1] ml-2 mt-1">
              <div className="grid grid-cols-3 gap-2 w-full">
                <div className="col-span-1 text-start font-bold text-lg">Time</div>
                <div className="col-span-2 text-start text-lg border-b border-black border-solid mr-5">
                  {hour}:{minute}:{second}
                </div>

                <div className="col-span-1 text-start font-bold text-lg">Hour</div>
                <div className="col-span-2 text-start text-lg">
                  <select
                    className="bg-gray-200 p-0.5 rounded cursor-pointer"
                    value={hour}
                    onChange={(e) => {
                      setHour(e.target.value);
                      handleTimeOnChange('H', e.target.value);
                    }}
                  >
                    {renderOption(24, 'H')}
                  </select>
                </div>

                <div className="col-span-1 text-start font-bold text-lg">Minute</div>
                <div className="col-span-2 text-start text-lg">
                  <select
                    className="bg-gray-200 p-0.5 rounded cursor-pointer"
                    value={minute}
                    onChange={(e) => {
                      setMinute(e.target.value);
                      handleTimeOnChange('M', e.target.value);
                    }}
                  >
                    {renderOption(60, 'M')}
                  </select>
                </div>

                <div className="col-span-1 text-start font-bold text-lg">Second</div>
                <div className="col-span-2 text-start text-lg">
                  <select
                    className="bg-gray-200 p-0.5 rounded cursor-pointer"
                    value={second}
                    onChange={(e) => {
                      setSecond(e.target.value);
                      handleTimeOnChange('S', e.target.value);
                    }}
                  >
                    {renderOption(60, 'S')}
                  </select>
                </div>
              </div>
            </div>
            <div className="flex grow-[1] ml-2  justify-between mt-2 pt-2 border-t-[1px] border-solid border-gray-300">
              <button
                disabled={!IsNowTimeCanClick()}
                className={` bg-transparent border-[1px] border-solid border-gray-300 rounded  p-[5px] text-sm 
                                 text-black  ${
                                   !IsNowTimeCanClick()
                                     ? 'cursor-not-allowed !bg-gray-300'
                                     : 'cursor-pointer'
                                 } `}
                onClick={nowTimeOnClick}
              >
                現在時間
              </button>

              <button
                className={` bg-blue-400 rounded text-sm text-white px-3  `}
                onClick={() => setShowCalendar(false)}
              >
                確定
              </button>
            </div>
          </div>
        ) : (
          <></>
        ),
        document.body,
      )}
    </div>
  );
};

DatePicker.propTypes = {
  value: PropTypes.string.isRequired,
  setValue: PropTypes.func.isRequired,
  onChange: PropTypes.func,
  min: PropTypes.string,
  max: PropTypes.string,
  placeholder: PropTypes.string,
  locale: PropTypes.oneOf(['tw']),
  readonly: PropTypes.bool,
  disabled: PropTypes.bool,
};

DateRangePicker.propTypes = {
  value: PropTypes.arrayOf(PropTypes.string),
  setValue: PropTypes.func.isRequired,
  onChange: PropTypes.func,
  min: PropTypes.string,
  max: PropTypes.string,
  placeholder: PropTypes.string,
  locale: PropTypes.oneOf(['tw']),
  readonly: PropTypes.bool,
  disabled: PropTypes.bool,
};
TimePicker.propTypes = {
  value: PropTypes.string,
  setValue: PropTypes.func.isRequired,
  onChange: PropTypes.func,
  placeholder: PropTypes.string,
  readonly: PropTypes.bool,
  disabled: PropTypes.bool,
};
DateTimePicker.propTypes = {
  value: PropTypes.string.isRequired,
  setValue: PropTypes.func.isRequired,
  onChange: PropTypes.func,
  min: PropTypes.string,
  max: PropTypes.string,
  placeholder: PropTypes.string,
  locale: PropTypes.oneOf(['tw']),
  readonly: PropTypes.bool,
  disabled: PropTypes.bool,
};
export { DatePicker, TimePicker, DateRangePicker, DateTimePicker };
