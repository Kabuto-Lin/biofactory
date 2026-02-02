/**
 * @component Button
 * @description 可定制的按鈕組件，支持左右圖標、通知標記和禁用狀態
 *
 * 主要功能：
 * - 顯示文字和/或圖標按鈕
 * - 支援左側或右側圖標
 * - 自適應寬度和尺寸
 * - 可顯示通知提示標記
 * - 支援禁用狀態
 * - 完全可定制的樣式
 * - 支援通過 ref 引用按鈕元素
 *
 * @param {import('@fortawesome/fontawesome-svg-core').IconDefinition} leftIcon - 左側顯示的圖標
 * @param {import('@fortawesome/fontawesome-svg-core').IconDefinition} rightIcon - 右側顯示的圖標
 * @param {string} label - 按鈕文字
 * @param {string} className - 額外的 CSS 類名
 * @param {Function} onClick - 點擊按鈕的回調函數
 * @param {boolean} notification - 是否顯示通知提示標記
 * @param {boolean} disabled - 是否禁用按鈕
 * @param {React.Ref} ref - forwardRef 的 ref (一般使用者不會用到)
 *
 * @returns {JSX.Element} 按鈕元件
 *
 * @example
 * 基本用法
 * <Button label="確認" onClick={handleConfirm} />
 *
 * @example
 * 帶左側圖標
 * <Button leftIcon={faSave} label="保存" onClick={handleSave} />
 *
 * @example
 * 自定義樣式 + 禁用狀態 + 提示紅點
 * <Button label="刪除" className="bg-red-500" onClick={handleDelete} disabled={true} notification={true}/>
 */

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { forwardRef } from 'react';

const Button = forwardRef(
  ({ leftIcon, rightIcon, label, className, onClick, notification, disabled }, ref) => {
    return (
      <div className="relative">
        <button
          className={`flex justify-center items-center px-3 py-2 rounded font-semibold hover:opacity-80 bg-primary ${disabled ? 'cursor-not-allowed bg-tertiary ' : 'cursor-pointer text-white'} ${className}`}
          onClick={onClick}
          ref={ref}
          disabled={disabled}
          type="button"
        >
          {leftIcon ? (
            <>
              <FontAwesomeIcon icon={leftIcon} />{' '}
              <span className={label ? 'pl-2 max-lg:hidden' : ''}> {label} </span>{' '}
            </>
          ) : rightIcon ? (
            <>
              <span className="pr-2 max-lg:hidden"> {label} </span>
              <FontAwesomeIcon icon={rightIcon} />{' '}
            </>
          ) : (
            label
          )}
        </button>
        {notification && (
          <div className=" absolute top-0 right-0 w-3 h-3 bg-red-600  translate-x-1/2 -translate-y-1/2 rounded-full"></div>
        )}
      </div>
    );
  },
);

Button.displayName = 'Button';
export default Button;
