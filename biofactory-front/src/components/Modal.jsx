import React from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faXmark } from '@fortawesome/free-solid-svg-icons';

/**
 * @component Modal
 * @description 彈窗元件，用於顯示彈出式內容，包含標題、內容區域和按鈕。
 *
 * 主要功能：
 * - 支援自定義標題和內容
 * - 提供確定和取消按鈕及對應回調函數
 * - 支援自動將 setShow 傳遞給子元件
 * - 支援自定義頁腳顯示狀態
 * - 可控制 z-index 層級
 *
 * @param {boolean} show - 控制模態框顯示或隱藏
 * @param {Function} setShow - 用於更新 show 狀擬事態的函數
 * @param {string|JSX.Element} title - 彈窗標題
 * @param {Function} submit - 確定按鈕點擊後的回調函數，若返回 true 則自動關閉模態框
 * @param {Function} cancel - 取消按鈕點擊後的回調函數，若返回 true 則自動關閉模態框
 * @param {JSX.Element} children - 彈窗內容
 * @param {string} className - 額外的 CSS 類名
 * @param {string} zIndex - 自定義 z-index 值，默認為 z-[99]
 * @param {boolean|JSX.Element} footer - 控制底部按鈕區域：
 *                                      - false: 不顯示任何底部內容
 *                                      - JSX元素: 顯示自訂底部內容
 *                                      - 未提供或null: 顯示預設的確定、取消按鈕
 *
 * @returns {JSX.Element} Modal 元件
 *
 * @example
 * <Modal
 *   show={showModal}
 *   setShow={setShowModal}
 *   title="確認操作"
 *   submit={() => { console.log('確認'); return true; }}
 *   cancel={() => { console.log('取消'); return true; }}
 * >
 *   <p>確定要執行此操作嗎？</p>
 * </Modal>
 */

const Modal = ({
  show,
  setShow,
  title,
  submit,
  cancel,
  children,
  className,
  zIndex,
  footer,
  header,
}) => {
  /**
   * 取消點擊
   */
  const handleOnCancelClick = () => {
    if (cancel && cancel()) {
      setShow(false);
    }
    setShow(false);
  };

  /**
   * 確定點擊
   */
  const handleOnConfirmClick = () => {
    if (submit && submit()) {
      setShow(false);
    }
  };

  // Clone children and pass setShow as prop
  const clonedChildren = React.Children.map(children, (child) => {
    // 只将 setShow 传递给自定义组件
    if (typeof child.type === 'function' || typeof child.type === 'object') {
      return React.cloneElement(child, { setShow });
    }
    // 对于原生元素（如 <div> 等），保持原样
    return child;
  });

  return (
    <div
      className={`${show ? 'opacity-100 visible' : 'opacity-0 invisible'} bg-[#0000008f] transition-all duration-300 
            fixed inset-y-0 inset-x-0 flex overflow-auto ${zIndex ? zIndex : 'z-[99]'} `}
      onClick={() => setShow(false)}
    >
      <div
        className={`${show ? 'translate-y-[0px]' : 'translate-y-[-1000px]'} w-auto min-w-96 m-auto max-h-[100vh] overflow-auto
            xl:max-w-[80%] 2xl:xl:max-w-[75%] p-4 rounded-lg shadow-lg transition-all duration-[400ms] bg-white ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {header === false ? null : (
          <header className="relative border-b-2 border-solid border-gray-300 pb-3">
            <h2 className="text-center text-lg font-semibold">{title}</h2>
            <button
              className="modal-svg-delete-background absolute top-0 right-0 box-content w-4 h-4 p-1 text-black opacity-50 bg-transparent border-0 rounded-sm"
              onClick={() => setShow(false)}
              type="button"
              style={{
                background: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='%23000'%3e%3cpath d='M.293.293a1 1 0 011.414 0L8 6.586 14.293.293a1 1 0 111.414 1.414L9.414 8l6.293 6.293a1 1 0 01-1.414 1.414L8 9.414l-6.293 6.293a1 1 0 01-1.414-1.414L6.586 8 .293 1.707a1 1 0 010-1.414z'/%3e%3c/svg%3e")`,
                backgroundPosition: 'center',
                backgroundSize: '1em auto',
                backgroundRepeat: 'no-repeat',
              }}
            ></button>
          </header>
        )}

        <main className="">{clonedChildren}</main>

        {footer === false ? null : footer ? (
          footer
        ) : (
          <footer className={`border-t-2 border-gray-300 py-4 pb-0 flex justify-center`}>
            <button
              className="bg-primary text-white font-bold py-2 px-4 rounded mr-2 float-right"
              onClick={handleOnConfirmClick}
              type="button"
            >
              <FontAwesomeIcon icon={faCheck} /> 確定
            </button>
            <button
              className="bg-gray-500 text-white font-bold py-2 px-4 rounded mr-2 float-right"
              onClick={handleOnCancelClick}
              type="button"
            >
              <FontAwesomeIcon icon={faXmark} /> 取消
            </button>
          </footer>
        )}
      </div>
    </div>
  );
};

Modal.propTypes = {
  title: PropTypes.any,
  show: PropTypes.bool.isRequired,
  setShow: PropTypes.any.isRequired,
  submit: PropTypes.func,
  cancel: PropTypes.func,
  header: PropTypes.bool,
};
export default Modal;
