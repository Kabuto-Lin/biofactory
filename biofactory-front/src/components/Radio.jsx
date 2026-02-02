import React from 'react';
import PropTypes from 'prop-types';

/**
 * @component RadioGroup
 * @description 單選框組元件，提供一組選項供用戶選擇，支援與 React Hook Form 整合。
 *
 * 主要功能：
 * - 支援多選項配置
 * - 可禁用整個組或單個選項
 * - 與 React Hook Form 無縫整合
 * - 自適應水平排列
 * - 易於定制樣式
 *
 * @param {Array} items - 選項資料陣列，每個對象包含：
 *   - {string} DESC - 顯示的文字
 *   - {string|number} KEY - 選項值
 *   - {boolean} disabled - 是否禁用此選項
 * @param {string|number} selectedValue - 當前選中的值（非 RHF 模式下使用）
 * @param {Function} onSelectedValue - 選擇變更時的回調函數，接收所選值作為參數（非 RHF 模式下使用）
 * @param {boolean} disabled - 是否禁用整個單選組
 * @param {string} className - 額外的 CSS 類名
 * @param {Object} field - React Hook Form 的欄位對象（RHF 模式下使用，會自動同步 value/onChange）
 * @param {Function} setValue - (可選) React Hook Form 的 setValue 函式，若要自訂 shouldDirty 行為時傳入
 * @param {boolean} shouldDirty - (可選) 是否讓此欄位變 dirty，預設 true。搜尋欄位可設為 false 避免影響主檔 isDirty 狀態
 *
 * @returns {JSX.Element} RadioGroup 元件
 *
 * @example
 * 基本用法
 * const [gender, setGender] = useState('male');
 * <RadioGroup
 *   items={[
 *     { DESC: '男', KEY: 'male' },
 *     { DESC: '女', KEY: 'female' },
 *     { DESC: '其他', KEY: 'other', disabled: true }
 *   ]}
 *   selectedValue={gender}
 *   onSelectedValue={setGender}
 * />
 *
 * @example
 * 整合 React Hook Form
 * <Controller
 *   name="gender"
 *   control={control}
 *   render={({ field }) => (
 *     <RadioGroup
 *       items={genderOptions}
 *       field={field}
 *     />
 *   )}
 * />
 */

const RadioGroup = ({
  items = [],
  selectedValue = '',
  onSelectedValue = () => {},
  disabled = false,
  className = '',
  field = null,
  setValue = null, // 新增: RHF setValue
  shouldDirty = true, // 新增: 是否讓欄位變 dirty
}) => {
  /**
   * 單選變更事件
   * - RHF 模式下，若有 setValue 則用 setValue(field.name, value, { shouldDirty })，否則 fallback 用 field.onChange
   * - 非 RHF 模式下，呼叫 onSelectedValue
   */
  const handleOnChange = (e) => {
    const value = e.target.value;
    if (field && setValue) {
      setValue(field.name, value, { shouldDirty });
    } else if (field) {
      field.onChange(value);
    } else if (onSelectedValue) {
      onSelectedValue(value);
    }
  };

  return (
    <div className={`flex gap-4 ${className}`}>
      {items.map((item, index) => (
        <Radio
          key={`${item.KEY}-${index}`}
          text={item.DESC}
          value={item.KEY}
          onChange={handleOnChange}
          disabled={disabled || item.disabled}
          checked={
            field ? field.value === (item.KEY?.toString() || '') : selectedValue === (item.KEY?.toString() || '')
          }
        />
      ))}
    </div>
  );
};

/**
 * @component Radio
 * @description 單個單選按鈕元件，通常作為 RadioGroup 的子元件使用。
 *
 * @param {string} text - 選項顯示文字
 * @param {string|number} value - 選項值
 * @param {Function} onChange - 選擇變更時的回調函數
 * @param {boolean} disabled - 是否禁用此選項
 * @param {boolean} checked - 是否選中此選項
 *
 * @returns {JSX.Element} Radio 元件
 */

const Radio = React.memo(({ text, value, onChange, disabled = false, checked = false }) => {
  return (
    <label
      className={`flex gap-1 font-[400] items-center ${
        disabled ? 'cursor-not-allowed' : 'cursor-pointer'
      }`}
    >
      <input
        type="radio"
        value={value}
        onChange={onChange}
        checked={checked}
        disabled={disabled}
        className="cursor-pointer disabled:cursor-not-allowed h-4 w-4"
      />
      <span className="ml-2">{text}</span>
    </label>
  );
});

Radio.displayName = 'Radio';

RadioGroup.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      DESC: PropTypes.string.isRequired,
      KEY: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      disabled: PropTypes.bool,
    }),
  ).isRequired,
  disabled: PropTypes.bool,
  onSelectedValue: PropTypes.func,
  selectedValue: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  className: PropTypes.string,
  field: PropTypes.object,
  setValue: PropTypes.func,
  shouldDirty: PropTypes.bool,
  // Ensure at least one of onSelectedValue or field is provided
  validate(props, propName, componentName) {
    if (!props.onSelectedValue && !props.field) {
      return new Error(
        `One of 'onSelectedValue' or 'field' must be provided in '${componentName}'.`,
      );
    }
  },
};

Radio.propTypes = {
  text: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  onChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  checked: PropTypes.bool,
};

export default RadioGroup;
