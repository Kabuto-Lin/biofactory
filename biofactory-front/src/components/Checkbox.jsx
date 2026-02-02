import PropTypes from 'prop-types';

/**
 *
 * @param {Array} items CheckboxGroup內容陣列
 * @param {Function} onSetItems CheckboxGroup的內容陣列Change Function
 * @param {boolean} disabled 是否全不能選
 */
const CheckboxGroup = ({ items = [], onSetItems, disabled = false }) => {
  //#region Checkbox的onChange事件
  /**
   * Checkbox的onChange事件
   * @param {Event} e DOM的event object
   */
  const handleOnChange = (e) => {
    const idx = items.findIndex((x) => x.value == e.target.value);
    items[idx].selected = e.target.checked;

    onSetItems([...items]);
  };
  //#endregion
  return (
    <div>
      {items.map((item, index) => {
        return (
          <Checkbox
            key={index}
            text={item.text}
            value={item.value}
            onChange={handleOnChange}
            disabled={disabled ? disabled : item.disabled}
            checked={item.selected}
          />
        );
      })}
    </div>
  );
};

/**
 *
 * @param {string} text 要顯示的文字
 * @param {string} value 選的值
 * @param {Function} onChange 一般input checkbox的onChange
 * @param {boolean} disabled 此選項是否要被禁止選取
 * @param {boolean} checked 顯示是否要被勾選
 */
export const Checkbox = ({ text, value, onChange, disabled = false, checked = false }) => {
  return (
    <label
      className={`pl-[20px] inline-flex font-[400] items-center ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <input
        type="checkbox"
        value={value}
        onChange={onChange}
        className="w-[20px] h-[20px] cursor-pointer disabled:cursor-not-allowed"
        disabled={disabled}
        checked={checked}
      />
      <span className="ml-2">{text}</span>
    </label>
  );
};

CheckboxGroup.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      text: PropTypes.string,
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      disabled: PropTypes.bool,
      selected: PropTypes.bool,
    }),
  ).isRequired,
  disabled: PropTypes.bool,
  onSetItems: PropTypes.func.isRequired,
};

Checkbox.propTypes = {
  text: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  checked: PropTypes.bool.isRequired,
};

export default CheckboxGroup;
