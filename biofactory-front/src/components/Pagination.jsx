/**
 * @component Pagination
 * @description 分頁導航元件，提供頁碼導航和每頁顯示數量選擇功能。
 *
 * 主要功能：
 * - 動態計算並顯示頁碼按鈕
 * - 提供首頁、上一頁、下一頁、末頁快速導航
 * - 支援自定義每頁顯示數量
 * - 響應式設計，在小螢幕上顯示簡化版本
 * - 顯示總項目數和總頁數資訊
 *
 * @param {number} totalItems - 總項目數量
 * @param {Array<number>} itemsPerPageOptions - 每頁顯示數量選項的陣列，例如 [10, 20, 50]
 * @param {Function} onPageChange - 頁碼變更的回調函數，接收參數：(頁碼, 每頁數量)
 * @param {number} currentPage - 當前頁碼
 * @param {number} itemsPerPage - 每頁顯示數量
 *
 * @returns {JSX.Element} 分頁導航元件
 *
 * @example
 * <Pagination
 *   totalItems={100}
 *   itemsPerPageOptions={[10, 20, 50]}
 *   onPageChange={(page, pageSize) => handlePageChange(page, pageSize)}
 *   currentPage={currentPage}
 *   itemsPerPage={itemsPerPage}
 * />
 */

const Pagination = ({
  totalItems,
  itemsPerPageOptions,
  onPageChange,
  currentPage,
  itemsPerPage,
}) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const handlePageChange = (newPage) => {
    // 傳遞新頁碼和每頁數量
    onPageChange(newPage, itemsPerPage);
  };

  const handleItemsPerPageChange = (e) => {
    // 更新每頁數量時，重置頁碼為 1
    const newItemsPerPage = parseInt(e.target.value);
    onPageChange(1, newItemsPerPage);
  };

  const renderPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5; // 最多顯示5個頁碼按鈕

    // 計算起始和結束頁碼
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    // 調整開始頁碼，確保顯示完整的頁碼按鈕
    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(
        <button
          key={i}
          type="button"
          onClick={() => handlePageChange(i)}
          className={`rounded px-3 py-1 mx-1 ${currentPage === i ? 'bg-primary text-white' : 'bg-gray-200'}`}
        >
          {i}
        </button>,
      );
    }
    return pageNumbers;
  };

  const buttonClassName =
    'rounded px-3 py-1 mx-1 bg-gray-200 disabled:opacity-50 hover:bg-primary hover:text-white';

  return (
    <div className="flex items-center justify-around mt-4">

      {/* 分頁按鈕區域 */}
      <div>
        <button
          type="button"
          onClick={() => handlePageChange(1)}
          disabled={currentPage === 1 || totalPages === 0}
          className={buttonClassName}
        >
          {/* <span className="hidden lg:inline-block">首頁</span> */}
          <span className="inline-block">{`<<`}</span>
        </button>
        {/* <button
          type="button"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1 || totalPages === 0}
          className={buttonClassName}
        >
          <span className="hidden lg:inline-block">上一頁</span>
          <span className="inline-block lg:hidden">{`<`}</span>
        </button> */}
        {renderPageNumbers()}
        {/* <button
          type="button"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages || totalPages === 0}
          className={buttonClassName}
        >
          <span className="hidden lg:inline-block">下一頁</span>
          <span className="inline-block lg:hidden">{`>`}</span>
        </button> */}
        <button
          type="button"
          onClick={() => handlePageChange(totalPages)}
          disabled={currentPage === totalPages || totalPages === 0}
          className={buttonClassName}
        >
          {/* <span className="hidden lg:inline-block">末頁</span> */}
          <span className="inline-block ">{`>>`}</span>
        </button>
      </div>

      {/* 每頁顯示數量選擇器 */}
      <div className="max-w-[120px] flex flex-col items-end">
        <div>
          <span className="">每頁：</span>
          <select value={itemsPerPage} onChange={handleItemsPerPageChange} className="mr-2">
            {itemsPerPageOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          筆
        </div>
        <div>
          <span> / 共 {totalItems} 筆</span>
        </div>
      </div>

    </div >
  );
};

export default Pagination;
