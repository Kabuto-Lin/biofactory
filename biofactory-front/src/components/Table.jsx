import React from 'react';
import { useForm, useFieldArray, Controller, get } from 'react-hook-form';
import { useState, useEffect, useMemo, useRef } from 'react';
import Pagination from './Pagination';
import Swal from 'sweetalert2';
import { QuBtn } from './QuModal'; // 導入 QuBtn 組件
import Button from './Button'; // 確保正確導入 Button 組件
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faThumbtack,
  faThumbtackSlash,
  faArrowUpShortWide,
  faArrowDownShortWide,
  faPlus,
  faMinus,
  faTimes,
  faCopy,
} from '@fortawesome/free-solid-svg-icons';

/**
 * @component Table
 * @description 高度可定制的數據表格組件，整合了 React Hook Form，支持排序、凍結列、調整寬度、分頁等功能
 *
 * 主要功能：
 * - 數據表格顯示與編輯
 * - 排序功能（點擊表頭）
 * - 凍結列（固定某些列）
 * - 可拖曳調整列寬
 * - 可拖曳重新排序列
 * - 分頁功能
 * - 行操作（增加、刪除、複製）
 * - 支持多種輸入類型（文本、金額、下拉選擇等）
 * - 支持使用 Enter 鍵自動跳轉到下一個輸入框
 *
 * @param {string} name - 表單欄位名稱，用於 React Hook Form
 * @param {Array} columns - 定義表格列的配置陣列
 * @param {Function} setColumns - 設置列配置的函數
 * @param {Object} emptyRow - 新增行時使用的空白行模板
 * @param {boolean} isShowDefaultButton - 是否顯示默認按鈕（新增、刪除）
 * * @param {Array} customButtons - 自定義按鈕配置，支持普通按钮和 QuBtn 类型按钮：
 *   - {string} type - 按鈕類型，設置為 'quBtn' 時將渲染為 QuBtn 彈窗按鈕
 *   - {string} sender - QuBtn 的 sender 參數 (僅 quBtn 類型需要)
 *   - {function} quModalingEvent - QuBtn 的彈窗開啟事件 (僅 quBtn 類型需要)
 *   - {function} quModalCallbackedEvent - QuBtn 的彈窗關閉回調 (僅 quBtn 類型需要)
 *   - {boolean} isMultiSelect - QuBtn 的多選模式設置 (僅 quBtn 類型需要)
 *   - {ReactNode} children - QuBtn 的彈窗內容 (僅 quBtn 類型需要)
 * @param {Object} events - 表格操作事件回調函數，包含：
 *   - {Function} events.inserting - 新增行前 觸發的函數
 *   - {Function} events.inserted - 新增行後 觸發的函數
 *   - {Function} events.deleting - 刪除前 觸發的函數
 *   - {Function} events.deleted - 刪除後 觸發的函數
 *   - {Function} events.onMDSRowSelect - 點擊行時 觸發的函數 (僅MD 變形版 / MDT 需要)
 *
 * @param {Object} methods - React Hook Form 的 methods 物件
 * @param {Function} handlePageChange - 頁碼變更處理函數
 * @param {number} currentPage - 當前頁碼
 * @param {number} itemsPerPage - 每頁項目數
 * @param {Function} handleClick - 行點擊事件處理函數
 * @param {Function} handleDoubleClick - 行雙擊事件處理函數
 * @param {boolean} showPagination - 是否顯示分頁，默認為 true
 * @param {number} selectedRowIndex - 當前選中行的索引 (僅MD 變形版 / MDT 需要)
 * @param {Function} setSelectedRowIndex - 設置選中行的函數 (僅MD 變形版 / MDT 需要)
 * @param {number} refreshTrigger - 強制更新table(僅MD 變形版 / MDT 需要)
 *
 * @returns {JSX.Element} 表格元件
 */

// 支援 min-w-[120px] 或 width: '120px' 這兩種格式
// 解析寬度的函數 - 處理各種格式的寬度
const parseWidth = (className, width) => {
  // 檢查是否含有數字的函數
  const containsNumbers = (str) => /\d/.test(str);

  // 檢查 className 是否為不含數字的字符串，如果是，直接返回 className
  if (className && typeof className === 'string' && !containsNumbers(className)) {
    return className;
  }

  // 解析 min-w-[120px] 格式
  const minWMatch = className?.match(/min-w-\[(\d+)px\]/);
  if (minWMatch) return parseInt(minWMatch[1]);

  // 解析 w-[100px] 格式
  const wMatch = className?.match(/w-\[(\d+)px\]/);
  if (wMatch) return parseInt(wMatch[1]);

  // 檢查 width 是否為不含數字的字符串，如果是，直接返回 width
  if (width && typeof width === 'string' && !containsNumbers(width)) {
    return width;
  }

  // 再解析 width: '120px' 這種格式
  if (typeof width === 'string' && width.endsWith('px')) {
    return parseInt(width);
  }

  // 解析 width: 'w-[100px]' 或 width: 'min-w-[100px]' 這種混合格式
  if (typeof width === 'string') {
    const widthMatch = width.match(/w-\[(\d+)px\]/);
    if (widthMatch) return parseInt(widthMatch[1]);

    const minWidthMatch = width.match(/min-w-\[(\d+)px\]/);
    if (minWidthMatch) return parseInt(minWidthMatch[1]);
  }

  return 50; // 預設最小寬度
};

const Table = ({
  name,
  columns,
  setColumns,
  emptyRow,
  isShowDefaultButton = true,
  customButtons,
  events,
  methods,
  handlePageChange,
  currentPage,
  itemsPerPage,
  handleClick = () => {},
  handleDoubleClick = () => {},
  showPagination = true,
  selectedRowIndex, // 當前選中行的索引 (僅MD 變形版 / MDT 需要)
  setSelectedRowIndex, // 設置選中行的函數 (僅MD 變形版 / MDT 需要)
  refreshTrigger, // 強制更新table(僅MD 變形版 / MDT 需要)
}) => {
  const inputRefs = useRef([]); // 這些refs將會指向每個input元素
  const [selectedRows, setSelectedRows] = useState([]);
  const [columnWidths, setColumnWidths] = useState(
    () =>
      columns?.map((col) => ({
        field: col.field,
        width: parseWidth(col.css, col.width) || 50,
      })) || [],
  );
  const [frozenColumns, setFrozenColumns] = useState(
    () => columns?.filter((col) => col.frozen).map((col) => col.field) || [],
  );

  const [draggedColumn, setDraggedColumn] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: '', direction: '' });
  const [resizingColumn, setResizingColumn] = useState(null); // 調整寬度的欄位
  const [isResizing, setIsResizing] = useState(false);
  const hasCheckboxTemplate = columns.some((column) => column.template === 'checkbox');

  const {
    control,
    getValues,
    setValue,
    watch,
    formState: { isDirty, dirtyFields, errors },
  } = methods || {};
  const { fields, append, remove, insert, update } = useFieldArray({ control, name });
  const tableName = name;

  const watchedFields = watch(name, []); // 提供預設值，並確保監視整個欄位陣列

  const updatedFields = useMemo(() => {
    return fields.map((field, index) => ({
      ...field,
      ...watchedFields?.[index], // 合併fields的靜態快照id 與 watch的即時內容
    }));
  }, [fields, watchedFields, refreshTrigger]); // refreshTrigger確保在MDS模式中 INPUT 輸入變化時重新渲染表格

  // 新增 useEffect 來確認 watch 是否正常工作
  // useEffect(() => {
  //   if (watchedFields && watchedFields.length > 0) {
  //     console.log('🔄 watchedFields表單值變化:', watchedFields);
  //   }
  // }, [watchedFields, fields]);

  // 將每個input元素的ref儲存在inputRefs.current陣列中
  function setInputRef(element, rowIndex, colIndex) {
    if (!inputRefs.current[rowIndex]) {
      inputRefs.current[rowIndex] = [];
    }
    inputRefs.current[rowIndex][colIndex] = element;
  }

  // 處理按下Enter鍵或Tab鍵時移動焦點到下一個輸入框
  const handleInputKeyDown = (event, rowIndex, colIndex) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      let nextRowIndex = rowIndex;
      let nextColIndex = colIndex + 1;

      // 找到下一個可聚焦的元素
      while (nextRowIndex < currentItems.length) {
        while (nextColIndex < columns.length) {
          if (
            columns[nextColIndex].template !== 'checkbox' ||
            columns[nextColIndex].template !== 'actions'
          ) {
            const nextInput = inputRefs.current[nextRowIndex][nextColIndex];
            if (nextInput) {
              nextInput.focus();
              return;
            }
          }
          nextColIndex++;
        }
        nextRowIndex++;
        nextColIndex = 0;
      }

      // 如果到達最後一個輸入框，添加new Row並聚焦到第一個輸入框
      if (nextRowIndex >= currentItems.length) {
        handleAppend();
        setTimeout(() => {
          const newRowIndex = currentItems.length;
          for (let i = 0; i < columns.length; i++) {
            if (
              columns[nextColIndex].template !== 'checkbox' ||
              columns[nextColIndex].template !== 'actions'
            ) {
              const firstInput = inputRefs.current[newRowIndex][i];
              if (firstInput) {
                firstInput.focus();
                return;
              }
            }
          }
        }, 0);
      }
    }
  };

  // Memoize sorted data by using the actual form values
  const sortedFields = useMemo(() => {
    if (!sortConfig.key) return updatedFields;

    return [...updatedFields].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];

      if (aVal === undefined || bVal === undefined) return 0;

      // 檢查是否可轉換為數字
      const isANumber = !isNaN(parseFloat(aVal));
      const isBNumber = !isNaN(parseFloat(bVal));

      // 如果都可以轉換為數字
      if (isANumber && isBNumber) {
        return sortConfig.direction === 'asc'
          ? parseFloat(aVal) - parseFloat(bVal)
          : parseFloat(bVal) - parseFloat(aVal);
      }

      // 否則使用字串比較
      return sortConfig.direction === 'asc'
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });
  }, [updatedFields, sortConfig.key, sortConfig.direction, fields.length]);

  // Handle select all rows
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedRows(fields.map((_, index) => index));
    } else {
      setSelectedRows([]);
    }
  };

  // Handle single row selection
  const handleSelectRow = (index) => {
    setSelectedRows((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index],
    );
  };

  // Sorting logic
  const handleSort = (field) => {
    setSortConfig((prev) => ({
      key: field,
      direction: prev.key === field ? (prev.direction === 'asc' ? 'desc' : 'asc') : 'asc',
    }));
  };

  // Pagination calculations
  const startIndex = (currentPage - 1) * itemsPerPage || 0;
  const currentItems =
    currentPage && itemsPerPage
      ? sortedFields.slice(startIndex, startIndex + itemsPerPage)
      : sortedFields;

  const handleAppend = (e) => {
    e.preventDefault();
    e.stopPropagation();

    // 新增前- 自定義事件
    events?.inserting && events.inserting();

    const emptyRowWithId = { ...emptyRow, ROWSEQ_O: fields.length + 1 };
    append(emptyRowWithId);

    const newTotalPages = Math.ceil((fields.length + 1) / itemsPerPage);
    if (fields.length === 0) {
      // 新增第一筆資料時，切換至第一頁
      handlePageChange(1, itemsPerPage);
    } else if (newTotalPages > currentPage) {
      // 新增資料超出當頁數量，自動切換頁碼
      handlePageChange(newTotalPages, itemsPerPage);
    }

    // 新增後- 自定義事件
    events?.inserted && events.inserted();
  };
  const handleCopy = (e, index) => {
    e.preventDefault();
    e.stopPropagation();
    const actualIndex = startIndex + index;

    // 使用 watchedFields 直接獲取最新數據，因為它始終反映表單值的即時變化
    const itemToCopy =
      watchedFields && watchedFields[actualIndex]
        ? {
            ...fields[actualIndex], // 保留 fields 中的元數據 (id等)
            ...watchedFields[actualIndex], // 覆蓋為最新的表單值
          }
        : fields[actualIndex]; // 防止 watchedFields 為空的情況

    const copyId = Math.random().toString(36).substring(7);

    const copiedItem = {
      ...itemToCopy,
      ROWSEQ_O: watchedFields ? watchedFields.length + 1 : fields.length + 1,
      id: undefined, // 移除原本的 id，讓 useFieldArray 自動產生新的
      copyId: copyId, // 後續刪除會用到
    };

    // 在當前後面位置插入複製的資料
    insert(actualIndex + 1, copiedItem);

    // 使用 watchedFields 計算新的頁面總數
    const newTotalPages = Math.ceil(((watchedFields?.length ?? fields?.length) + 1) / itemsPerPage);
    // const newTotalPages = Math.ceil((fields.length + 1) / itemsPerPage);

    if (fields.length === 0) {
      // 新增第一筆資料時，切換至第一頁
      handlePageChange(1, itemsPerPage);
    } else if (newTotalPages > currentPage) {
      // 新增資料超出當頁數量，自動切換頁碼
      handlePageChange(newTotalPages, itemsPerPage);
    }
  };

  // Handle row deletion
  const handleDelete = (e, index) => {
    e.preventDefault();
    e.stopPropagation();

    // 計算當前頁面的實際索引
    const actualIndex = startIndex + index;

    // 取得要刪除的資料
    const itemToDelete = sortedFields[actualIndex];
    // console.log('刪除項目:', itemToDelete);

    let originalIndex = -1;

    if (itemToDelete?.id) {
      // 原始資料：根據 `id` 找索引
      originalIndex = updatedFields.findIndex((field) => field.id === itemToDelete.id);
    } else if (itemToDelete?.copyId) {
      // 新複製資料：根據 `copyId` 找索引
      originalIndex = updatedFields.findIndex((field) => field.copyId === itemToDelete.copyId);
    }

    if (originalIndex === -1) {
      console.error('❌ 找不到要刪除的項目，可能是索引對應錯誤');
      return;
    }

    // 執行刪除
    remove(originalIndex);

    // 更新選取行狀態
    setSelectedRows((prev) =>
      prev.filter((i) => i !== originalIndex).map((i) => (i > originalIndex ? i - 1 : i)),
    );

    // 調整頁碼
    const newTotalPages = Math.ceil((updatedFields.length - 1) / itemsPerPage);
    if (currentPage > newTotalPages) {
      handlePageChange(newTotalPages, itemsPerPage);
    }
  };

  // Handle bulk deletion 批量刪除
  const handleBulkDelete = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!selectedRows.length) {
      // 顯示提示訊息
      Swal.fire({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 2500,
        icon: 'info',
        title: '請先勾選要刪除的資料列',
      });
    }

    //刪除前-自訂義事件
    events?.deleting && events.deleting();

    const sortedSelectedRows = [...selectedRows].sort((a, b) => b - a);
    sortedSelectedRows.forEach((index) => {
      remove(index);
    });

    //刪除後-自訂義事件
    events?.deleted && events.deleted();

    setSelectedRows([]);

    // Adjust current page if necessary
    const newTotalPages = Math.ceil((fields.length - sortedSelectedRows.length) / itemsPerPage);
    if (currentPage > newTotalPages) {
      handlePageChange(newTotalPages, itemsPerPage);
    }
  };

  // 處理欄位寬度調整的滑鼠事件
  const handleMouseDown = (e, columnKey) => {
    // 防止觸發拖曳事件
    e.stopPropagation();

    const startX = e.clientX;
    const columnIndex = columnWidths.findIndex((col) => col.field === columnKey);
    const startWidth = columnWidths[columnIndex].width;
    // 使用 parseWidth 函數解析最小寬度
    const minWidth = parseWidth(columns[columnIndex].css, columns[columnIndex].width);
    setIsResizing(true);

    const handleMouseMove = (e) => {
      const deltaX = e.clientX - startX;
      const newWidth = Math.max(minWidth, startWidth + deltaX);

      const newColumnWidths = [...columnWidths];
      newColumnWidths[columnIndex] = {
        ...newColumnWidths[columnIndex],
        width: newWidth,
      };

      setColumnWidths(newColumnWidths);
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      setResizingColumn(null);
      setIsResizing(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    setResizingColumn(columnKey);
  };

  // 獲取特定欄位寬度
  const getColumnWidth = (key) => {
    const widthConfig = columnWidths.find((col) => col.field === key);

    // 如果沒有找到寬度配置，返回預設值
    if (!widthConfig?.width) {
      return parseWidth(); // 會返回預設最小寬度 50
    }

    // 如果寬度是字串類型，直接返回原字串，不做特殊處理
    if (typeof widthConfig.width === 'string') {
      return widthConfig.width;
    }

    // 返回數值寬度
    return widthConfig.width;
  };

  // 拖曳列排序
  const handleDragStart = (e, column) => {
    // 不允許凍結的欄位被拖曳
    if (frozenColumns.includes(column.field) || isResizing) return;

    setDraggedColumn(column);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.target);
  };

  const handleDragOver = (e) => {
    // 防止調整寬度時觸發拖曳
    if (isResizing) return;

    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, targetColumn) => {
    // 防止調整寬度時觸發拖曳
    if (isResizing) return;

    e.preventDefault();

    // 不允許拖曳到凍結欄位上
    if (frozenColumns.includes(targetColumn.field) || !draggedColumn) return;

    if (draggedColumn.field !== targetColumn.field) {
      // 重新排序 columns
      const newColumns = [...columns];
      const draggedIndex = newColumns.findIndex((col) => col.field === draggedColumn.field);
      const targetIndex = newColumns.findIndex((col) => col.field === targetColumn.field);

      newColumns.splice(draggedIndex, 1);
      newColumns.splice(targetIndex, 0, draggedColumn);

      // 重新排序 columnWidths
      const newColumnWidths = newColumns.map((col) =>
        columnWidths.find((w) => w.field === col.field),
      );

      setColumns(newColumns); // 這裡的setColumns需要從外部傳入
      setColumnWidths(newColumnWidths);
    }

    setDraggedColumn(null);
  };

  // 切換凍結欄位
  const toggleFrozenColumn = (key) => {
    setFrozenColumns((prev) => {
      if (prev.includes(key)) {
        return prev.filter((k) => k !== key); // 如果已經存在，則取消凍結
      }
      return [...prev, key]; // 依照按下的順序加入
    });
  };

  // 左方固定顯示欄位 `checkbox` 和 `actions`
  const LeftFixedColumns = columns.filter(
    (col) => col.template === 'checkbox' || col.template === 'actions',
  );

  // 取得需要排序的欄位（排除 `checkbox` 和 `actions`）
  const sortableColumns = columns.filter(
    (col) => col.template !== 'checkbox' && col.template !== 'actions',
  );

  // 凍結欄位與非凍結欄位分類
  // const frozenSorted = sortableColumns.filter((col) => frozenColumns.includes(col.field));
  // 依照 frozenColumns 的順序來排序
  const frozenSorted = frozenColumns
    .map((key) => sortableColumns.find((col) => col.field === key))
    .filter(Boolean); // 過濾掉 undefined，確保只保留有效欄位
  const nonFrozenSorted = sortableColumns.filter((col) => !frozenColumns.includes(col.field));

  // 合併排序結果
  const sortedColumns = [...LeftFixedColumns, ...frozenSorted, ...nonFrozenSorted];

  const handleRowClick = async (e, row) => {
    // console.log('已選取該行', row);

    if (!hasCheckboxTemplate) {
      // 如果沒有checkbox模板，則執行點擊行的處理
      // 控制讓點選的Row改變背景色
      const index = fields.findIndex((field) => field.ROWSEQ_O === row.ROWSEQ_O);
      setSelectedRows([index]);

      // 點擊Row顯示對應資料，更新父組件的畫面 (僅MD 變形版 MD Transform / MDT 用到)
      setSelectedRowIndex && setSelectedRowIndex(index);
      events?.onMDSRowSelect && events?.onMDSRowSelect(row, index);
    }

    handleClick(row);
  };

  return (
    <div className="w-full">
      {/* Action Buttons */}
      {(isShowDefaultButton || customButtons) && (
        <div className="mb-4 flex gap-2" id="tableButtonPanel">
          {isShowDefaultButton && (
            <div className="flex gap-2 my-3" id="tableButtonPanel">
              <Button leftIcon={faPlus} label="新增" className="" onClick={handleAppend} />
              <Button
                leftIcon={faMinus}
                label="刪除"
                className="bg-red-500"
                onClick={handleBulkDelete}
              />
            </div>
          )}
          {/* 自定義按鈕 */}
          {customButtons && (
            <div className="flex gap-2 my-3" id="customTableButtonsPanel">
              {customButtons.map((btnConfig, index) =>
                btnConfig.type === 'quBtn' ? (
                  // 渲染 QuBtn 類型按鈕
                  <QuBtn
                    key={index}
                    sender={btnConfig.sender || ''}
                    quModalingEvent={btnConfig.quModalingEvent}
                    quModalCallbackedEvent={btnConfig.quModalCallbackedEvent}
                    isMultiSelect={btnConfig.isMultiSelect || false}
                    btnElement={
                      <Button
                        key={`quBtn-${index}`}
                        leftIcon={btnConfig.icon}
                        label={btnConfig.label}
                        className={btnConfig.className}
                        disabled={btnConfig.disabled}
                      />
                    }
                  >
                    {btnConfig.children}
                  </QuBtn>
                ) : (
                  // 渲染普通按鈕
                  <Button
                    key={`button-${index}`}
                    leftIcon={btnConfig.icon}
                    label={btnConfig.label}
                    className={btnConfig.className}
                    onClick={btnConfig.onClick}
                    disabled={btnConfig.disabled}
                  />
                ),
              )}
            </div>
          )}
        </div>
      )}
      {/* Table */}
      {/* <div className="max-h-[380px] overflow-auto"> */}
      <div className="overflow-x-auto overflow-y-visible relative" id="tableContainer">
        <table className="w-full bg-white border" key={name}>
          <thead className="bg-primary text-white sticky top-0 z-10">
            <tr>
              {sortedColumns.map((column, index) => {
                const isFrozen = frozenColumns.includes(column.field);
                const width = getColumnWidth(column.field) || '';
                return (
                  <th
                    key={`${column.field}-${index}`}
                    className={`p-2 border ${column.css ? column.css : ''} ${isFrozen ? 'sticky left-0 bg-gray-500 z-10' : 'cursor-move'} 
                    ${draggedColumn?.field === column.field ? 'opacity-50' : ''}`}
                    draggable={!isFrozen && !isResizing}
                    onDragStart={(e) => handleDragStart(e, column)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, column)}
                    style={{
                      width: typeof width === 'number' ? `${width}px` : width || '50px',
                      position: 'relative',
                    }}
                  >
                    {column.template === 'checkbox' ? (
                      <input
                        type="checkbox"
                        className="w-4 h-4"
                        onChange={handleSelectAll}
                        checked={selectedRows.length === fields.length && fields.length > 0}
                      />
                    ) : (
                      <>
                        <div
                          className={
                            column.template !== 'actions' ? 'flex items-center justify-between' : ''
                          }
                        >
                          <span className="">{column.header || column.displayName}</span>
                          {column.field && column.template !== 'actions' && (
                            <div className="flex items-center justify-center">
                              <div className="ml-1">
                                {/* 排序按鈕 */}
                                <button
                                  className={`w-4 h-4 cursor-pointer ${
                                    sortConfig.key === column.field &&
                                    sortConfig.direction === 'desc'
                                      ? 'text-yellow-300'
                                      : ''
                                  }`}
                                  type="button"
                                  onClick={() => handleSort(column.field)}
                                >
                                  {sortConfig.direction === 'asc' ? (
                                    <FontAwesomeIcon icon={faArrowDownShortWide} />
                                  ) : (
                                    <FontAwesomeIcon icon={faArrowUpShortWide} />
                                  )}
                                </button>
                              </div>
                              {/* 凍結按鈕 */}
                              {column.frozen !== false && (
                                <button
                                  onClick={() => toggleFrozenColumn(column.field)}
                                  className="ml-2 text-blue-100"
                                  type="button"
                                >
                                  {isFrozen ? (
                                    <FontAwesomeIcon icon={faThumbtackSlash} />
                                  ) : (
                                    <FontAwesomeIcon icon={faThumbtack} />
                                  )}
                                </button>
                              )}

                              {/* 欄位寬度調整區域 */}
                              <div
                                onMouseDown={(e) => handleMouseDown(e, column.field)}
                                className={`absolute right-0 top-0 bottom-0 w-2 hover:bg-blue-200 cursor-col-resize z-20 ${resizingColumn === column.field ? 'bg-blue-300' : ''}`}
                                style={{ cursor: 'col-resize' }}
                              />
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {currentItems.length <= 0 && (
              <tr>
                <td colSpan={columns?.length} className="text-center bg-gray-200 py-2">
                  查無資料
                </td>
              </tr>
            )}
            {currentItems.map((row, rowIndex) => {
              const actualIndex = startIndex + rowIndex;
              const isFrozen = frozenColumns.includes(row.field);
              const colWidth = getColumnWidth(row.field);
              return (
                <tr
                  key={row.id || actualIndex}
                  className={`border-b 
                  ${
                    selectedRowIndex === actualIndex || selectedRows.includes(actualIndex)
                      ? 'bg-blue-200'
                      : rowIndex % 2 === 0
                        ? 'bg-white'
                        : 'bg-gray-200'
                  }
                  ${isFrozen ? 'sticky left-0 bg-white z-10' : ''}
                  `}
                  style={{
                    width: typeof colWidth === 'number' ? `${colWidth}px` : colWidth || '50px',
                    maxWidth: typeof colWidth === 'number' ? `${colWidth}px` : colWidth || '50px',
                  }}
                  onDoubleClick={(event) => handleDoubleClick(row, rowIndex, event)}
                  onClick={(event) => handleRowClick(event, row)}
                >
                  {sortedColumns.map((column, colIndex) => (
                    <td key={`${actualIndex}-${column.field}`} className="text-center px-2">
                      {renderCell(
                        tableName,
                        column,
                        row,
                        actualIndex,
                        colIndex,
                        control,
                        () => handleSelectRow(actualIndex),
                        (e) => handleDelete(e, rowIndex),
                        (e) => handleCopy(e, rowIndex),
                        selectedRows,
                        setInputRef,
                        handleInputKeyDown,
                        methods, // 傳遞整個 methods 物件而不是解構的 errors
                      )}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {/* Pagination */}
      {showPagination && (
        <Pagination
          totalItems={fields.length}
          itemsPerPageOptions={[10, 50, 100, 150]}
          onPageChange={handlePageChange}
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
        />
      )}
    </div>
  );
};

// Helper function to render different cell types
const renderCell = (
  tableName,
  column,
  row,
  rowIndex,
  colIndex,
  control,
  onSelect,
  onDelete,
  onCopy,
  selectedRows,
  setInputRef,
  handleInputKeyDown,
  methods, // 改為接收整個 methods 物件
) => {
  // 在這裡獲取最新的 errors
  const errors = methods?.formState?.errors;
  switch (column.template) {
    case 'checkbox':
      return (
        <input
          type="checkbox"
          className="w-4 h-4"
          onChange={onSelect}
          checked={selectedRows.includes(rowIndex)}
        />
      );

    case 'actions':
      return (
        (column.actions?.length > 0 || column.customActions?.length > 0) && (
          <div className="flex justify-center items-center gap-2">
            {column.actions?.includes('onDelete') && (
              <Button
                key={`delete-${rowIndex}`}
                leftIcon={faTimes}
                onClick={onDelete}
                className="bg-red-500 hover:text-black hover:bg-yellow-500 w-6 h-6 rounded-full px-2 py-1 text-white text-xs"
              />
            )}
            {column.actions?.includes('onCopy') && (
              <Button
                key={`copy-${rowIndex}`}
                leftIcon={faCopy}
                onClick={onCopy}
                className="bg-blue-500 hover:text-black hover:bg-yellow-500 w-6 h-6 rounded-full px-2 py-1 text-white text-xs"
              />
            )}
            {column.customActions?.map((action, index) => (
              <Button
                key={`customBtn-${rowIndex}-${index}`}
                leftIcon={action.icon}
                onClick={() => action.onClick(row)}
                className={`bg-primary hover:text-black hover:bg-yellow-500 w-6 h-6 rounded-full px-2 py-1 text-white text-xs ${action.className}`}
              />
            ))}
          </div>
        )
      );
    case 'custom':
      // 添加 key={rowIndex + '-' + column.field} 以確保每個渲染的自定義元素都有唯一的 key
      const customContent = column.customRender(row, rowIndex);
      // 如果返回的是 React 元素而不是陣列，則包裝並添加 key
      return React.isValidElement(customContent)
        ? React.cloneElement(customContent, { key: `${rowIndex}-${column.field}` })
        : customContent;

    case 'money':
      return (
        <Controller
          name={`${tableName}.${rowIndex}.${column.field}`}
          control={control}
          rules={column.rules}
          render={({ field }) => (
            <Input
              field={field}
              className={`w-full outline-none border-2 bg-transparent rounded focus:border-blue-400 focus:shadow-[0_0px_5px_2px_rgba(96,165,250,0.5)] ${errors?.[tableName]?.[rowIndex]?.[column.field] ? 'border-red-500' : 'border-slate-400'}`}
              type="money"
              isShowThousandsComma={true}
              placeholder="僅限輸入數字"
              ref={(element) => setInputRef(element, rowIndex, colIndex)}
              handleKeyDown={(event) => handleInputKeyDown(event, rowIndex, colIndex)}
            />
          )}
        />
      );

    case 'input':
      return (
        <Controller
          name={`${tableName}.${rowIndex}.${column.field}`}
          control={control}
          defaultValue={row[column.field] || ''}
          rules={column.rules}
          render={({ field }) => (
            <Input
              className={`w-full bg-transparent ${errors?.[tableName]?.[rowIndex]?.[column.field] ? 'border-red-500' : 'border-slate-400'}`}
              type={column.type ?? 'text'}
              field={{
                ...field,
                onChange: (e) => {
                  field.onChange(e);
                },
                value: field.value || '',
              }}
              ref={(element) => setInputRef(element, rowIndex, colIndex)}
              handleKeyDown={(event) => handleInputKeyDown(event, rowIndex, colIndex)}
              onBlur={field.onBlur}
              onFocus={field.onFocus}
              disabled={column.disabled}
              placeholder={column.placeholder}
            />
          )}
        />
      );

    case 'select':
      return (
        <Controller
          name={`${tableName}.${rowIndex}.${column.field}`}
          control={control}
          rules={column.rules}
          defaultValue={row[column.field] || ''}
          render={({ field }) => (
            <select
              {...field}
              className={`w-full border-2 rounded px-2 py-1 bg-transparent min-h-[35px] ${errors?.[tableName]?.[rowIndex]?.[column.field] ? 'border-red-500' : 'border-slate-400'}`}
              ref={(element) => setInputRef(element, rowIndex, colIndex)}
              onKeyDown={(event) => handleInputKeyDown(event, rowIndex, colIndex)}
            >
              <option value="">請選擇</option>
              {column.options?.map((option, index) => (
                <option
                  key={`${rowIndex}.${column.field}.${index}`}
                  value={option.KEY}
                  data-even={index % 2 === 1 ? 'true' : 'false'} // 調整奇數行背景色
                >
                  {option.DESC}
                </option>
              ))}
            </select>
          )}
        />
      );

    case 'date':
      return (
        <Controller
          name={`${tableName}.${rowIndex}.${column.field}`}
          control={control}
          defaultValue={row[column.field] || ''}
          rules={column.rules}
          render={({ field }) => (
            <DatePicker
              {...field}
              className={`w-full bg-transparent col-span-4 border-2 px-2 py-1 rounded ${errors?.[tableName]?.[rowIndex]?.[column.field] ? 'border-red-500' : 'border-slate-400'}`}
              value={field.value ?? ''}
              setValue={field.onChange}
              placeholder={'請選擇時間'}
            />
          )}
        />
      );

    default:
      return row[column.field];
  }
};

export default Table;
