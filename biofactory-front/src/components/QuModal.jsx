import React, { useState, createContext } from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';
import Swal from 'sweetalert2';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretDown } from '@fortawesome/free-solid-svg-icons';

export const QuModalContext = createContext();

const _doQuModal = (sender = '', quModalingEvent, quModalInitedEvent, showQuModal = () => {}) => {
  // 先定義 l_arg 變數，再在 thenable 中使用
  let l_arg;
  let thenable = {
    then: async () => {
      if (l_arg.cancel) {
        if (l_arg.message) {
          await Swal.fire({
            title: l_arg.message,
            icon: 'warning',
          });
        }
        return;
      }
      showQuModal(l_arg);
      if (quModalInitedEvent) {
        quModalInitedEvent(l_arg);
      }
    },
  };
  
  // 初始化 l_arg
  l_arg = {
    oldRow: {},
    sender,
    message: '',
    cancel: false,
    async: false,
    defer: thenable,
  };

  if (quModalingEvent) {
    quModalingEvent(l_arg);
  }

  if (l_arg.async === false) {
    Promise.resolve(l_arg.defer);
  }
};

/**
 * @component QuModal
 * @description 可重用的彈窗元件，透過狀態控制顯示與隱藏。
 *
 * 主要功能：
 * - 支援彈窗內容的自定義。
 * - 提供關閉彈窗的回調函式。
 *
 * @param {boolean} show - 控制彈窗是否顯示。
 * @param {function} setShow - 更新彈窗顯示狀態的函式。
 * @param {function} onClose - 彈窗關閉時的回調函式。
 * @param {ReactNode} children - 彈窗內顯示的內容。
 *
 * @returns {JSX.Element} QuModal 元件
 *
 * @example
 * <QuModal show={isOpen} setShow={setIsOpen} onClose={() => console.log('彈窗已關閉')}>
 *   <p>這是彈窗內容</p>
 * </QuModal>
 */
const QuModal = ({ show, setShow, onClose = () => {}, children }) => {
  /**
   * 關閉彈窗並觸發 onClose 回調。
   */
  const closeModal = () => {
    if (onClose) {
      onClose();
    }
    setShow(false);
  };

  return createPortal(
    <div
      className={`${
        show ? 'opacity-100 visible' : 'opacity-0 invisible'
      } bg-[#1b1b1b8f] transition-all duration-300 z-[99]
            fixed inset-y-0 inset-x-0 flex mt-20`}
      onClick={() => closeModal()}
    >
      <div
        className={`${
          show ? 'translate-y-0' : 'translate-y-[-1000px]'
        } w-[90%] sm:w-[85%] md:w-[80%] lg:w-[75%] xl:w-[70%]  m-auto
            p-4 rounded-lg shadow-lg transition-all duration-[400ms]  bg-white`}
        onClick={(e) => e.stopPropagation()}
      >
        <main className="overflow-auto max-h-[calc(100vh-130px)]">
          {children !== null && React.cloneElement(children)}
        </main>
      </div>
    </div>,
    document.getElementById('root'),
  );
};

/**
 * @component QuBtn
 * @description 用於觸發 QuModal 的按鈕元件，並提供上下文支持。
 *
 * 主要功能：
 * - 提供按鈕點擊事件以觸發彈窗。
 * - 支援多選模式與自定義按鈕。
 *
 * @param {string} sender - 按鈕的識別名稱(按鈕來源)。
 * @param {function} quModalingEvent - 彈窗顯示前的回調函式。
 * @param {function} quModalCallbackedEvent - 彈窗關閉後的回調函式。
 * @param {boolean} isMultiSelect - 是否啟用多選模式。
 * @param {ReactNode} btnElement - 自定義按鈕元素。
 * @param {ReactNode} children - 彈窗內顯示的內容。
 * @param {object} optionalControls - 額外的控制選項。
 *
 * @returns {JSX.Element} QuBtn 元件
 *
 * @example
    <QuBtn
      sender="btn_Willdo" // 傳遞特定來源參數(識別按鈕來源)
      quModalingEvent={handleModalingEvent} // 彈窗帶入預設值
      quModalCallbackedEvent={handleModalCallback} // 彈窗帶回值
      btnElement={
        <Button
          leftIcon={faUserFriends}
          label="會辦"
          onClick={() => {}}
        />
      } // 自定義按鈕
    >
 */
const QuBtn = ({
  sender = '',
  quModalingEvent,
  quModalCallbackedEvent,
  isMultiSelect = false,
  btnElement = null,
  children,
  optionalControls = {},
}) => {
  const [show, setShow] = useState(false);
  const [initialValue, setInitialValue] = useState(null);
  const [quModalInitedEvent, setQuModalInitedEvent] = useState(() => {});
  const [quModalingEventObject, setQuModalingEventObject] = useState(null);

  /**
   * 處理按鈕點擊事件，觸發彈窗顯示。
   */
  const onClick = () => {
    const args = { sender };
    if (quModalingEvent) {
      quModalingEvent(args);
    }
    setInitialValue(args.initialValue);
    _doQuModal(sender, quModalingEvent, quModalInitedEvent, (quModalingEventObject) => {
      setQuModalingEventObject(quModalingEventObject);
      setShow(true);
    });
  };

  return (
    <>
      <QuModalContext.Provider
        value={{
          initialValue,
          show,
          setShow,
          sender,
          quModalCallbackedEvent,
          isMultiSelect,
          setQuModalInitedEvent,
          quModalingEventObject,
          optionalControls,
        }}
      >
        {btnElement ? (
          React.cloneElement(btnElement, { onClick })
        ) : (
          <button
            type="button"
            className="bg-primary h-[36px] px-3 rounded-md border rounded-l-[3px] ml-[-2px]"
            onClick={onClick}
          >
            <FontAwesomeIcon icon={faCaretDown} className="text-white"></FontAwesomeIcon>
          </button>
        )}

        <QuModal show={show} setShow={setShow} sender={sender} onClose={() => {}}>
          {show ? children : null}
        </QuModal>
      </QuModalContext.Provider>
    </>
  );
};

// PropTypes 驗證
QuModal.propTypes = {
  show: PropTypes.bool.isRequired, // 是否顯示彈窗
  setShow: PropTypes.any.isRequired, // 更新彈窗顯示狀態的函式
  sender: PropTypes.string.isRequired, // 彈窗的識別名稱
  onClose: PropTypes.func, // 彈窗關閉時的回調函式
  children: PropTypes.any, // 彈窗內顯示的內容
};

QuBtn.propTypes = {
  sender: PropTypes.string.isRequired, // 按鈕的識別名稱
  quModalingEvent: PropTypes.func, // 彈窗顯示前的回調函式
  quModalCallbackedEvent: PropTypes.func, // 彈窗關閉後的回調函式
  isMultiSelect: PropTypes.bool, // 是否啟用多選模式
  btnElement: PropTypes.node, // 自定義按鈕元素
  children: PropTypes.node, // 彈窗內顯示的內容
  optionalControls: PropTypes.object, // 額外的控制選項
};

export { QuBtn };
export default QuModal;
