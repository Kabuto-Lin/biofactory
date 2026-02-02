/**
 * @component Label
 * @description 標籤元件，用於表單輸入元素的標籤顯示，支援必填項提示。
 *
 * 主要功能：
 * - 支援必填欄位的視覺提示（紅色文字和警告圖示）
 * - 可包裝其他元件作為子元素
 * - 當欄位為必填且無值時顯示警告提示
 * - 支援自定義樣式
 *
 * @param {string} id - 關聯輸入元素的 ID
 * @param {string} label - 顯示的標籤文字
 * @param {string} text - 錯誤提示文字，當必填欄位未填時顯示
 * @param {string} value - 目前欄位的值，用於判斷必填欄位是否已填
 * @param {string} className - 額外的 CSS 類名
 * @param {boolean} required - 是否為必填欄位，為 true 時將顯示警告提示
 * @param {JSX.Element} children - 標籤關聯的輸入元素或其他內容
 *
 * @returns {JSX.Element} Label 元件
 *
 * @example
 * <Label id="name" label="姓名" required={true} value={name}>
 *   <Input id="name" value={name} setValue={setName} />
 * </Label>
 */

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';

const Label = ({ id, label, text = '內容不可空白', value, className, required, children }) => {
  const isRequired = required && (value === null || value === undefined || value?.length < 1);
  return (
    <>
      <label
        htmlFor={id}
        className={`${isRequired ? 'text-red-500' : ''} ${className} flex items-center font-semibold gap-2 whitespace-nowrap`}
      >
        {isRequired && (
          <div className="tooltip">
            <FontAwesomeIcon icon={faTriangleExclamation} className="icon" />
            <span>
              {label}
              <br />
              {text}
            </span>
          </div>
        )}
        {label}
      </label>
      {children}
    </>
  );
};
export default Label;
