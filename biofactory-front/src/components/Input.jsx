/**
 * @component Input
 * @description 功能豐富的輸入框元件，支援多種輸入類型和格式化功能。
 *
 * 主要功能：
 * - 支援多種輸入類型：文本、密碼、電子郵件、數字、金額等
 * - 金額類型支援千分位格式化顯示
 * - 提供清除按鈕快速清空內容
 * - 與 React Hook Form 完全整合
 * - 支援自動聚焦
 * - 支援禁用狀態
 * - 可自定義樣式
 *
 * @param {string} id - 輸入框的 ID
 * @param {string} type - 輸入類型，支援 'text', 'password', 'email', 'number', 'tel', 'money', 'date', 'checkbox', 'file'
 * @param {string|number} value - 輸入框的值（直接使用時）
 * @param {string} placeholder - 提示文字
 * @param {string} className - 額外的 CSS 類名
 * @param {boolean} isShowThousandsComma - 金額類型是否顯示千分位
 * @param {Function} handleKeyDown - 鍵盤按下事件處理函數
 * @param {boolean} clearButton - 是否顯示清除按鈕，預設為 true
 * @param {boolean} isAutoFocus - 是否自動聚焦，預設為 false
 * @param {Object} field - React Hook Form 的欄位資料
 * @param {boolean} disabled - 是否禁用
 * @param {number} maxLength - 輸入最大長度限制
 * @param {Object} ref - 轉發的 ref
 *
 * @returns {JSX.Element} Input 元件
 *
 * @example
 *  基本文本輸入
 * <Input id="name" type="text" placeholder="請輸入姓名" />
 *
 * @example
 *  金額輸入帶千分位
 * <Input type="money" isShowThousandsComma={true} field={register('amount')} />
 *
 * @example
 * 整合 React Hook Form
 * <Controller
 *   name="email"
 *   control={control}
 *   render={({ field }) => <Input type="email" field={field} />}
 * />
 * 
 * @example
 * 特殊用法: 自定義value和onChange，本範例用於消除儲存按鈕的變更紅點(改變RHF Dirty狀態)
 * <Input
 *   type="text"
 *   field={{
 *     value: field.value,
 *     onChange: (e) => {
 *       const value = e?.target?.value ?? e; // 讓清除按鈕可以正常運作
 *       setValue('searchTerm.PROG_NA', value, { shouldDirty: false });
 *     },
 *   }}
 *   maxLength={80}
 * />
 */

import { forwardRef, useState, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';

const Input = forwardRef(
  (
    {
      id,
      type,
      value,
      placeholder,
      className,
      isShowThousandsComma,
      handleKeyDown,
      clearButton = true,
      isAutoFocus = false,
      onChange = () => {},
      field,
      disabled,
      maxLength,
    },
    ref,
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const inputRef = useRef(null);
    
    // 處理 onChange 事件的函數
    const handleInputChange = (e) => {
      if (field?.onChange) {
        field.onChange(e);
      }
      
      // 執行自訂的 onChange 函數
      if (typeof onChange === 'function' && onChange !== field?.onChange) {
        onChange(e);
      }
    };
    
    const patchedField = {
      // Value 如果是undefined 會報錯，所以這裡給預設值
      ...field,
      value: field?.value ?? '',
      onChange: handleInputChange,
    };

    // 遮罩功能function
    function maskString(value, start = 0, end = value.length - 1) {
      let maskedValue = '';
      for (let i = 0; i < value.length; i++) {
        if (i >= start && i <= end) {
          maskedValue += '*'; // 在指定範圍內的字元替換成星號
        } else {
          maskedValue += value[i]; // 其他字元保持原樣
        }
      }
      return maskedValue;
    }

    //输入值变化時處裡千分位
    const handleMoneyChange = (e) => {
      const inputValue = e.target.value;
      const rawValue = inputValue.replace(/,/g, ''); // 移除千分位的逗号
      const isValidNumber = !isNaN(rawValue) || rawValue === '' || rawValue.endsWith('.'); // 验证输入是否为数字或以小数点结尾

      if (isValidNumber) {
        // 更新未格式化的值
        field.onChange(rawValue);

        // 仅在失焦时格式化显示值
        e.target.value = rawValue;
      }
    };

    const handleMoneyBlur = (e) => {
      setIsFocused(false);
      const rawValue = e.target.value.replace(/,/g, '');
      const formattedValue = isShowThousandsComma ? format(rawValue) : rawValue;
      field.onBlur(formattedValue);
      e.target.value = formattedValue;
    };

    // 格式化千分位
    function format(value) {
      if (!value) return '';

      // 確保 value 是字串類型
      value = String(value ?? '');
      // 移除所有非数字和非小数点的字符
      value = value.replace(/[^\d.]/g, '');

      // 如果只有小数点，显示 "0."
      if (value === '.') {
        return '0.';
      }

      // 保留小数点结尾的情况
      if (value.endsWith('.')) {
        return (
          new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 5,
          }).format(value.slice(0, -1)) + '.' // 去掉最后一个点
        );
      }

      // 保留小数点后面部分输入的零
      const [integerPart, decimalPart] = value.split('.');

      if (decimalPart !== undefined) {
        return (
          new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 5,
          }).format(integerPart) +
          '.' +
          decimalPart.slice(0, 5)
        );
      }

      // 转换为浮点数并格式化
      const floatValue = parseFloat(value);

      return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 5,
      }).format(floatValue);
    }

    // 點擊欄位，自动全选内容
    const handleMoneyClick = (e) => {
      e.target.select();
    };

    // 清除輸入框內容
    const clearInput = (e) => {
      e.preventDefault();
      e.stopPropagation();
      field.onChange(null); // 數字欄位帶""會導致錯誤，所以改null
      inputRef.current?.focus(); //自動聚焦
    };

    //合併內外部ref
    function mergeRefs(...refs) {
      return (node) => {
        refs.forEach((ref) => {
          if (typeof ref === 'function') {
            ref(node);
          } else if (ref) {
            ref.current = node;
          }
        });
      };
    }

    // Input元件組
    const InputGroup = () => {
      let tempValue = value;
      // if (maskParams?.mask) {
      //   tempValue = maskString(value, maskParams?.start, maskParams?.end);
      // } else {
      //   tempValue = value;
      // }

      const defaultClassName = `border-2 pl-2 pr-6 py-1 rounded outline-none focus:border-blue-400 focus:shadow-[0_0px_5px_2px_rgba(0,0,0,0.1)] w-full ${disabled ? 'cursor-not-allowed  !bg-tertiary' : 'cursor-pointer'}`;

      const defaultInput = (
        <div className="relative w-full">
          <input
            {...patchedField}
            className={`${defaultClassName} ${className}`}
            id={id}
            type={type}
            placeholder={placeholder}
            ref={mergeRefs(inputRef, ref)}
            onKeyDown={handleKeyDown}
            autoFocus={isAutoFocus}
            disabled={disabled}
            maxLength={maxLength}
            onChange={patchedField.onChange}
            {...(type === 'number'
              ? {
                  onChange: (e) => {
                    const val = e.target.value;
                    const num = Number(val); // RHF需要手動處裡數字格式
                    patchedField.onChange(val === '' || isNaN(num) ? null : num);
                  },
                }
              : {})}
          />
          {clearButton && field && (
            <button
              onClick={clearInput}
              className="absolute right-2 top-1/2 -translate-y-1/2 scale-90 opacity-50"
            >
              {!disabled && <FontAwesomeIcon icon={faXmark} />}
            </button>
          )}
        </div>
      );

      switch (type) {
        case 'text':
        case 'password':
        case 'email':
        case 'number':
        case 'tel':
          return defaultInput;

        case 'money':
          return (
            <input
              {...field}
              className={`${className} ${defaultClassName} text-right`}
              id={id}
              type="text"
              value={isFocused ? field?.value : format(field?.value)}
              onFocus={() => setIsFocused(true)} // 输入时不格式化
              onChange={handleMoneyChange}
              onBlur={handleMoneyBlur}
              onClick={handleMoneyClick}
              placeholder={placeholder}
              ref={mergeRefs(inputRef, ref)}
              onKeyDown={handleKeyDown}
              disabled={disabled}
              maxLength={maxLength}
            />
          );

        case 'date':
          return (
            <input
              {...field}
              className={`${className} ${defaultClassName}`}
              id={id}
              type="date"
              // value={field?.value}
              // onChange={(e) => setValue(e.target.value)}
              placeholder={placeholder}
              ref={mergeRefs(inputRef, ref)}
              disabled={disabled}
              maxLength={maxLength}
            />
          );

        case 'checkbox':
          return (
            <input
              {...field}
              className={`${className} w-4 h-4`}
              type="checkbox"
              checked={field?.value}
              onChange={(e) => field?.onChange(e.target.checked)}
            />
          );

        case 'file':
          return (
            <input
              className={`${className} ${defaultClassName}`}
              id={id}
              type={type}
              value={tempValue}
              // onChange={(e) => setValue(e.target)}
              placeholder={placeholder}
            />
          );

        default:
          defaultInput;
      }
    };

    return InputGroup();
  },
);

Input.displayName = Input;
export default Input;
