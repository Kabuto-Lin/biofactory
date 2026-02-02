import { useEffect, useRef, useState, forwardRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronUp, faTimes } from '@fortawesome/free-solid-svg-icons';

// 定義下拉選單的最大高度常量（單位為 rem）
const DROPDOWN_MAX_HEIGHT_REM = 13; // max-h-52 對應 13rem
// 計算像素值 (假設 1rem = 16px)
const DROPDOWN_MAX_HEIGHT_PX = DROPDOWN_MAX_HEIGHT_REM * 16;

/**
 * @function useOutsideClick
 * @description 自定義 Hook，用於偵測點擊元素外部的事件
 *
 * @param {React.RefObject} ref - 目標元素的參考
 * @param {Function} handler - 點擊外部時觸發的回調函數
 */
const useOutsideClick = (ref, handler) => {
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        handler();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [ref, handler]);
};

/**
 * @component Input
 * @description 輸入框元件，用於下拉選單的過濾功能
 *
 * @param {string} type - 輸入框類型
 * @param {string} value - 輸入框值
 * @param {boolean} clearButton - 是否顯示清除按鈕
 * @param {Function} setValue - 設置輸入值的函數
 * @param {string} placeholder - 提示文字
 * @param {string} className - 額外的 CSS 類名
 * @param {boolean} isAutoFocus - 是否自動聚焦
 * @param {boolean} disabled - 是否禁用
 *
 * @returns {JSX.Element} 輸入框元件
 */
const Input = ({
  type,
  value,
  clearButton,
  setValue,
  placeholder,
  className,
  isAutoFocus,
  disabled,
}) => {
  const defaultClassName =
    'border-2 px-2 py-1 rounded outline-none focus:border-blue-400 focus:shadow-[0_0px_5px_2px_rgba(0,0,0,0.1)]';

  const clearInput = () => {
    setValue('');
  };

  return (
    <div className="relative w-full">
      <input
        className={`${className} ${defaultClassName}`}
        type={type}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        autoFocus={isAutoFocus}
        disabled={disabled}
      />
      {clearButton && value && !disabled && (
        <button onClick={clearInput} className="absolute right-2 top-[0.35rem] opacity-50">
          <FontAwesomeIcon icon={faTimes} />
        </button>
      )}
    </div>
  );
};

const mockDropDownData = [
  // 假資料: 如果API壞掉/沒資料時的下拉選單預設值
  {
    KEY: 'noData',
    DESC: '查無資料',
  },
];

/**
 * @component Dropdown
 * @description 可定制的下拉選單元件，支援搜尋過濾、鍵盤導航和 React Hook Form 整合。
 *
 * 主要功能：
 * - 支援搜尋過濾功能
 * - 自動聚焦選中項目
 * - 多種下拉位置選擇
 * - 整合 React Hook Form
 * - 支援鍵盤導航
 * - 禁用狀態處理
 * - 可自定義樣式
 * - 支援 Table/Modal 等複雜場景的定位
 *
 * @param {string} id - 下拉選單的 ID。
 * @param {string} title - 未選擇項目時顯示的標題文字，默認為 'Select'。
 * @param {Array} data - 下拉選單的數據，格式為 [{KEY: 'value', DESC: '顯示文字'}, ...]。
 * @param {string} selectedId - 當前選中項目的 KEY。
 * @param {Function} onSelect - 選擇項目時的回調函數，接收所選項目的 KEY。
 * @param {string} className - 額外的 CSS 類名。
 * @param {boolean} addInputWithFilter - 是否啟用搜尋過濾功能。
 * @param {Function} handleKeyDown - 處理鍵盤按下事件的函數。
 * @param {Object} field - React Hook Form 的欄位對象。
 * @param {boolean} disabled - 是否禁用下拉選單。
 * @param {React.Ref} ref - forwardRef 的 ref。
 * @param {HTMLElement} [scrollContainer] - （可選）用於計算滾動與定位的容器，僅在 Table 等有橫向/縱向 scroll 的情境下傳入。
 *   - 有傳入 scrollContainer 時，下拉選單會以 fixed 並動態計算絕對位置，適用於 Table 等有 overflow/scroll 的場景。
 *   - 未傳入 scrollContainer 時，下拉選單以 absolute 相對父層定位，適用於 Modal、一般表單等情境。
 *
 * @returns {JSX.Element} 下拉選單元件
 *
 * @example
 *  一般用法（不需 scrollContainer，適用於 Modal、表單等）
 * <Dropdown
 *   title="請選擇"
 *   data={[
 *     { KEY: 'option1', DESC: '選項一' },
 *     { KEY: 'option2', DESC: '選項二' }
 *   ]}
 *   onSelect={(key) => console.log('Selected:', key)}
 * />
 *
 * @example
 * 用於 Table（需傳入 scrollContainer 以正確定位）
 * <Dropdown
 *   title="請選擇"
 *   data={tableOptions}
 *   scrollContainer={document.querySelector('#tableContainer')}
 *   onSelect={...}
 * />
 *
 * @example
 * 與 React Hook Form 整合：
 * <Controller
 *   name="category"
 *   control={control}
 *   render={({ field }) => (
 *     <Dropdown
 *       title="選擇分類"
 *       data={categoryOptions}
 *       field={field}
 *       addInputWithFilter={true}
 *     />
 *   )}
 * />
 *
 */
const Dropdown = forwardRef(
  (
    {
      id,
      title = 'Select',
      data = [],
      selectedId,
      onSelect,
      className,
      addInputWithFilter,
      handleKeyDown,
      field,
      disabled,
      scrollContainer, // 不設預設值
    },
    ref,
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const [showInput, setShowInput] = useState(false);
    const [showData, setShowData] = useState([]);
    const [selectedItem, setSelectedItem] = useState(null);
    // const [selectedItem, setSelectedItem] = useState(() =>
    //   selectedId ? showData.find((item) => item.KEY === selectedId) : '',
    // );
    const [inputValue, setInputValue] = useState('');
    const dropdownRef = useRef(null);
    const listItemRefs = useRef({}); // 儲存每個 li 元素的 ref
    const [positions, setPositions] = useState({ top: 0, left: 0, width: 0 });
    const triggerRef = useRef(null); // 引用触发按钮

    // 合併外部 ref 和內部 triggerRef
    const setRefs = (node) => {
      if (typeof ref === 'function') {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
      triggerRef.current = node;
    };

    // 動態計算菜單位置
    const calculatePosition = () => {
      if (!triggerRef.current) return;

      // 確保元素具有正確的大小和位置
      const rect = triggerRef.current.getBoundingClientRect();

      // 如果元素不可見或大小為0，延遲重新計算
      if (rect.width === 0 || rect.height === 0) {
        setTimeout(calculatePosition, 10);
        return;
      }

      // 檢查是否需要向上展開
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceNeeded = DROPDOWN_MAX_HEIGHT_PX; // max-h-52 等於 13rem，約 208px (13 * 16px)
      const shouldExpandUpward = spaceBelow < spaceNeeded;

      // 計算累積的滾動偏移（適用於嵌套滾動容器）
      let totalScrollTop = 0;
      let totalScrollLeft = 0;
      let currentNode = triggerRef.current.parentElement;

      while (currentNode && currentNode !== document.body) {
        totalScrollTop += currentNode.scrollTop || 0;
        totalScrollLeft += currentNode.scrollLeft || 0;
        currentNode = currentNode.parentElement;
      }

      // 獲取表格容器的橫向滾動偏移（如果有指定 scrollContainer）
      const containerScrollLeft = scrollContainer?.scrollLeft || 0;

      // 設置最終位置，考慮畫面捲動和表格容器的橫向滾動
      if (shouldExpandUpward) {
        // 向上展開時，將 bottom 設置為 100%
        setPositions({
          top: null,
          bottom: '100%', // 確保下拉選單顯示在按鈕上方
          left: rect.left + totalScrollLeft - containerScrollLeft,
          width: rect.width,
        });
      } else {
        setPositions({
          top: rect.bottom + totalScrollTop,
          bottom: null,
          left: rect.left + totalScrollLeft - containerScrollLeft,
          width: rect.width,
        });
      }
    };

    // 只有有 scrollContainer 時才監聽 scroll/resize 並計算位置
    useEffect(() => {
      if (!isOpen) return;
      if (!scrollContainer) return;
      const handleScroll = () => {
        requestAnimationFrame(() => {
          calculatePosition();
        });
      };
      window.addEventListener('scroll', handleScroll, true);
      scrollContainer.addEventListener('scroll', handleScroll, true);
      window.addEventListener('resize', handleScroll);
      return () => {
        window.removeEventListener('scroll', handleScroll, true);
        scrollContainer.removeEventListener('scroll', handleScroll, true);
        window.removeEventListener('resize', handleScroll);
      };
    }, [isOpen, scrollContainer]);

    // 初始化顯示數據
    useEffect(() => {
      setShowData(data?.length > 0 ? data : mockDropDownData);
    }, [data]);

    // 合併選中項目計算，只保留一個 useEffect
    useEffect(() => {
      let key = null;
      if (field?.value !== undefined && field?.value !== null) {
        key = field.value;
      } else if (selectedId !== undefined && selectedId !== null) {
        key = selectedId;
      }
      if (key !== null && data.length > 0) {
        // 支援字串/數字比對
        const newSelectedItem = data.find((item) => item.KEY == key);
        setSelectedItem(newSelectedItem || null);
      } else {
        setSelectedItem(null);
      }
    }, [field?.value, selectedId, data]);

    useEffect(() => {
      if (isOpen) {
        // 如果有選中項目，聚焦到選中項目
        if (selectedItem?.KEY && listItemRefs.current[selectedItem.KEY]) {
          listItemRefs.current[selectedItem.KEY].focus();
        }
        // 否則，如果沒有啟用搜索框，聚焦到第一個項目
        else if (!showInput && showData.length > 0) {
          setTimeout(() => {
            const firstItemKey = showData[0].KEY;
            if (listItemRefs.current[firstItemKey]) {
              listItemRefs.current[firstItemKey].focus();
            }
          }, 50); // 短暫延遲確保DOM已更新
        }

        if (selectedItem) calculatePosition();
      }
    }, [isOpen, selectedItem, showData, showInput]); // 監聽 isOpen, selectedItem, showData, showInput 變化

    useOutsideClick(dropdownRef, () => {
      setIsOpen(false);
      setShowInput(false);
      // 重置過濾數據
      if (addInputWithFilter) {
        setInputValue('');
        setShowData(data?.length > 0 ? data : mockDropDownData);
      }
    });

    const handleChange = (item) => {
      setShowInput(false);
      setSelectedItem(item); // 確保選中項目正確更新
      setInputValue(''); // 清空搜索內容
      setShowData(data?.length > 0 ? data : mockDropDownData); // 重置顯示數據

      if (onSelect) {
        onSelect(item.KEY);
      }

      if (field?.onChange) {
        field.onChange(item.KEY); // 更新 React Hook Form 的值
      }

      setIsOpen(false);
    };
    const handleOnClick = () => {
      if (disabled) return;

      // 先計算位置
      calculatePosition();

      // 更新狀態
      const newIsOpen = !isOpen;
      setIsOpen(newIsOpen);

      // 如果是要開啟選單
      if (newIsOpen) {
        if (addInputWithFilter) {
          setShowInput(true); // 當有搜尋功能時，點擊後顯示輸入框

          // 使用setTimeout確保DOM更新後再聚焦欄位
          setTimeout(() => {
            const inputElement = dropdownRef.current?.querySelector('input');
            if (inputElement) inputElement.focus();
            // 重新計算位置確保準確
            calculatePosition();
          }, 0);
        } else {
          // 重新計算位置確保準確
          setTimeout(calculatePosition, 10);
        }
      }
    };

    const filterDropDownData = (data, filterWord) => {
      if (!filterWord) return data;

      const filtered = data.filter((item) =>
        item.DESC.toLowerCase().includes(filterWord.toLowerCase()),
      );

      return filtered.length > 0 ? filtered : mockDropDownData;
    };

    const searchInputOnChange = (value) => {
      setInputValue(value);
      const filterData = filterDropDownData(data, value);
      setShowData(filterData);
    };
    const internalHandleKeyDown = (event) => {
      // 處理內部的onKeyDown事件，按enter打開選單
      if (event.key === 'Enter') {
        if (isOpen && showData.length > 0) {
          // 如果選單已經打開，选中當前聚焦的選項或默認第一個選項
          const firstItem = showData[0];

          // 簡化邏輯：如果按鈕上按 Enter，直接選擇第一個選項
          handleChange(firstItem);
        } else {
          // 先計算位置，再開啟選單
          calculatePosition();
          setIsOpen(true);

          if (addInputWithFilter) {
            setShowInput(true);
            // 輸入框自動聚焦
            setTimeout(() => {
              const inputElement = dropdownRef.current?.querySelector('input');
              if (inputElement) inputElement.focus();
              // 重新計算位置以確保正確顯示
              calculatePosition();
            }, 0);
          } else {
            // 若無輸入框，則延遲後聚焦第一個項目
            setTimeout(() => {
              if (showData.length > 0 && listItemRefs.current[showData[0].KEY]) {
                listItemRefs.current[showData[0].KEY].focus();
              }
              // 重新計算位置以確保正確顯示
              calculatePosition();
            }, 50);
          }
        }
      } else if (event.key === 'ArrowDown') {
        event.preventDefault();
        if (!isOpen) {
          // 如果選單關閉，則打開選單
          // 先計算位置，再開啟選單
          calculatePosition();
          setIsOpen(true);

          // 延遲聚焦第一個項目
          setTimeout(() => {
            if (showData.length > 0 && listItemRefs.current[showData[0].KEY]) {
              listItemRefs.current[showData[0].KEY].focus();
            }
            // 重新計算位置以確保正確顯示
            calculatePosition();
          }, 50);
        } else if (showData.length > 0) {
          // 如果選單已打開且有項目
          // 找到當前聚焦的元素
          const focusedElement = document.activeElement;
          let currentIndex = -1;

          // 檢查是否有項目被聚焦
          for (let i = 0; i < showData.length; i++) {
            if (listItemRefs.current[showData[i].KEY] === focusedElement) {
              currentIndex = i;
              break;
            }
          }

          // 計算下一個要聚焦的項目索引
          const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % showData.length;
          const nextItem = showData[nextIndex];

          if (listItemRefs.current[nextItem.KEY]) {
            listItemRefs.current[nextItem.KEY].focus();
            // 更新視覺上的選中項目
            setSelectedItem(nextItem);
          }
        }
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        if (!isOpen) {
          // 如果選單關閉，則打開選單
          // 先計算位置，再開啟選單
          calculatePosition();
          setIsOpen(true);

          // 延遲聚焦最後一個項目
          setTimeout(() => {
            if (showData.length > 0) {
              const lastItem = showData[showData.length - 1];
              if (listItemRefs.current[lastItem.KEY]) {
                listItemRefs.current[lastItem.KEY].focus();
              }
            }
            // 重新計算位置以確保正確顯示
            calculatePosition();
          }, 50);
        } else if (showData.length > 0) {
          // 如果選單已打開且有項目
          // 找到當前聚焦的元素
          const focusedElement = document.activeElement;
          let currentIndex = -1;

          // 檢查是否有項目被聚焦
          for (let i = 0; i < showData.length; i++) {
            if (listItemRefs.current[showData[i].KEY] === focusedElement) {
              currentIndex = i;
              break;
            }
          }

          // 計算上一個要聚焦的項目索引
          const prevIndex =
            currentIndex === -1
              ? showData.length - 1
              : (currentIndex - 1 + showData.length) % showData.length;
          const prevItem = showData[prevIndex];

          if (listItemRefs.current[prevItem.KEY]) {
            listItemRefs.current[prevItem.KEY].focus();
            // 更新視覺上的選中項目
            setSelectedItem(prevItem);
          }
        }
      }
    };

    const DropdownButton = (
      <button
        {...field}
        id={id}
        aria-label={selectedItem?.DESC || title} // 動態設置 aria-label 顯示選中項目
        aria-haspopup="true"
        aria-expanded={isOpen}
        type="button"
        onClick={handleOnClick}
        className={`flex justify-between items-center gap-5 rounded w-full py-1 px-2 border-2 ${
          disabled
            ? 'text-gray-500 border-gray-300 bg-gray-100 cursor-not-allowed'
            : 'text-black border-gray-400'
        }`}
        ref={setRefs}
        onKeyDown={(event) => {
          internalHandleKeyDown(event); // 處理內部的上下箭頭與Enter按鍵
          if (handleKeyDown) handleKeyDown(event); // 調用父組件傳遞的handleKeyDown函數
        }}
        disabled={disabled}
      >
        <span className="flex-1 text-left">
          {/* 顯示對應 DESC，若無則顯示 title */}
          {selectedItem?.DESC || title}
        </span>
        <FontAwesomeIcon
          className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}
          icon={faChevronDown}
        />
      </button>
    );
    return (
      <div
        ref={dropdownRef}
        className={`relative ${className} ${disabled ? 'cursor-not-allowed' : ''}`}
      >
        {addInputWithFilter && showInput ? (
          <Input
            type="text"
            value={inputValue}
            clearButton
            setValue={(value) => {
              searchInputOnChange(value);
            }}
            placeholder="請輸入篩選條件"
            className="w-full outline-none border-2 border-slate-400 bg-transparent rounded focus:shadow-[0_0px_5px_2px_rgba(96,165,250,0.5)]"
            isAutoFocus={true}
            disabled={disabled}
          />
        ) : (
          DropdownButton
        )}
        {/* Open 展開下拉內容 */}
        {isOpen &&
          (scrollContainer ? (
            <div
              aria-label="Dropdown menu"
              className="fixed bg-gray-100 overflow-y-auto py-3 rounded shadow-md z-50"
              style={{
                maxHeight: `${DROPDOWN_MAX_HEIGHT_REM}rem`,
                top: positions.top,
                bottom: positions.bottom,
                left: positions.left,
                width: positions.width || 'auto',
              }}
              data-testid="dropdown-list"
            >
              <ul role="listbox" className="leading-8 md:leading-10">
                {showData.map((item) => (
                  <li
                    key={item.KEY}
                    onClick={() => handleChange(item)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleChange(item);
                      } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                        // 讓箭頭鍵事件冒泡到父元素處理
                        internalHandleKeyDown(e);
                      }
                    }}
                    className={`flex items-center cursor-pointer hover:bg-gray-200 px-3 ${
                      selectedItem?.KEY === item.KEY ? 'bg-gray-300' : ''
                    }`}
                    ref={(el) => {
                      listItemRefs.current[item.KEY] = el;
                    }} // 為每個項目設置 ref
                    tabIndex={0} // 讓 li 元素可以被 focus
                    role="option"
                    aria-selected={selectedItem?.KEY === item.KEY}
                  >
                    <span>{item.DESC}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div
              aria-label="Dropdown menu"
              className="absolute left-0 bg-gray-100 overflow-y-auto py-3 rounded shadow-md z-50"
              style={{
                maxHeight: `${DROPDOWN_MAX_HEIGHT_REM}rem`,
                minWidth: '100%',
              }}
              data-testid="dropdown-list"
            >
              <ul role="listbox" className="leading-8 md:leading-10">
                {showData.map((item) => (
                  <li
                    key={item.KEY}
                    onClick={() => handleChange(item)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleChange(item);
                      } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                        // 讓箭頭鍵事件冒泡到父元素處理
                        internalHandleKeyDown(e);
                      }
                    }}
                    className={`flex items-center cursor-pointer hover:bg-gray-200 px-3 ${
                      selectedItem?.KEY === item.KEY ? 'bg-gray-300' : ''
                    }`}
                    ref={(el) => {
                      listItemRefs.current[item.KEY] = el;
                    }} // 為每個項目設置 ref
                    tabIndex={0} // 讓 li 元素可以被 focus
                    role="option"
                    aria-selected={selectedItem?.KEY === item.KEY}
                  >
                    <span>{item.DESC}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
      </div>
    );
  },
);

Dropdown.displayName = 'Dropdown';
export default Dropdown;
