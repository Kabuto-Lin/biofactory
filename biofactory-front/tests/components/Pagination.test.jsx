import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Pagination from '../../src/components/Pagination';

describe('分頁元件', () => {
  // 基本參數設置
  const defaultProps = {
    totalItems: 100,
    itemsPerPageOptions: [10, 20, 50],
    onPageChange: vi.fn(),
    currentPage: 1,
    itemsPerPage: 10,
  };

  // 重置 mock 函數
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // 基本 UI 測試
  describe('基本 UI 渲染', () => {
    it('應正確渲染分頁控制項', () => {
      render(<Pagination {...defaultProps} />);

      // 檢查頁碼按鈕是否存在
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();

      // 檢查導航按鈕是否存在
      expect(screen.getByText('首頁')).toBeInTheDocument();
      expect(screen.getByText('上一頁')).toBeInTheDocument();
      expect(screen.getByText('下一頁')).toBeInTheDocument();
      expect(screen.getByText('末頁')).toBeInTheDocument();

      // 檢查每頁顯示數量選擇器是否存在
      expect(screen.getByText('每頁顯示：')).toBeInTheDocument();

      // 檢查下拉選單中的選項
      const select = screen.getByRole('combobox');
      expect(select).toBeInTheDocument();
      expect(select).toHaveValue('10');

      // 檢查總計信息
      expect(screen.getByText(/總計 100 筆/)).toBeInTheDocument();
      expect(screen.getByText(/共 10 頁/)).toBeInTheDocument();
    });

    it('應根據當前頁碼高亮對應的頁碼按鈕', () => {
      render(<Pagination {...defaultProps} currentPage={2} />);

      // 獲取所有頁碼按鈕
      const pageButton = screen.getByText('2');

      // 檢查當前頁碼按鈕的樣式
      expect(pageButton).toHaveClass('bg-primary');
      expect(pageButton).toHaveClass('text-white');

      // 檢查非當前頁碼按鈕的樣式
      const otherPageButton = screen.getByText('1');
      expect(otherPageButton).not.toHaveClass('bg-primary');
      expect(otherPageButton).toHaveClass('bg-gray-200');
    });
  });

  // 功能測試
  describe('功能測試', () => {
    it('點擊頁碼按鈕應呼叫 onPageChange 回調函數', () => {
      render(<Pagination {...defaultProps} />);

      // 點擊第 2 頁按鈕
      fireEvent.click(screen.getByText('2'));

      // 檢查是否用正確的參數呼叫了回調函數
      expect(defaultProps.onPageChange).toHaveBeenCalledWith(2, 10);
    });

    it('點擊首頁按鈕應該導航到第一頁', () => {
      render(<Pagination {...defaultProps} currentPage={3} />);

      // 點擊首頁按鈕
      fireEvent.click(screen.getByText('首頁'));

      // 檢查是否用正確的參數呼叫了回調函數
      expect(defaultProps.onPageChange).toHaveBeenCalledWith(1, 10);
    });

    it('點擊上一頁按鈕應該導航到前一頁', () => {
      render(<Pagination {...defaultProps} currentPage={3} />);

      // 點擊上一頁按鈕
      fireEvent.click(screen.getByText('上一頁'));

      // 檢查是否用正確的參數呼叫了回調函數
      expect(defaultProps.onPageChange).toHaveBeenCalledWith(2, 10);
    });

    it('點擊下一頁按鈕應該導航到下一頁', () => {
      render(<Pagination {...defaultProps} currentPage={3} />);

      // 點擊下一頁按鈕
      fireEvent.click(screen.getByText('下一頁'));

      // 檢查是否用正確的參數呼叫了回調函數
      expect(defaultProps.onPageChange).toHaveBeenCalledWith(4, 10);
    });

    it('點擊末頁按鈕應該導航到最後一頁', () => {
      render(<Pagination {...defaultProps} currentPage={3} />);

      // 點擊末頁按鈕
      fireEvent.click(screen.getByText('末頁'));

      // 檢查是否用正確的參數呼叫了回調函數
      expect(defaultProps.onPageChange).toHaveBeenCalledWith(10, 10); // 共 10 頁
    });

    it('更改每頁顯示數量應重置為第一頁並更新每頁數量', () => {
      render(<Pagination {...defaultProps} currentPage={3} />);

      // 選擇每頁顯示 20 項
      fireEvent.change(screen.getByRole('combobox'), { target: { value: '20' } });

      // 檢查是否用正確的參數呼叫了回調函數（重置到第 1 頁，每頁 20 項）
      expect(defaultProps.onPageChange).toHaveBeenCalledWith(1, 20);
    });

    it('應在小螢幕上顯示簡化版本的導航按鈕文字', () => {
      // 注意：這個測試無法實際測試螢幕大小變化，因為 jsdom 無法模擬 CSS 媒體查詢
      // 但我們可以檢查元素是否存在對應的類名

      render(<Pagination {...defaultProps} />);

      // 檢查首頁按鈕是否同時包含完整文字和簡化文字
      const firstPageButton = screen.getByText('首頁').closest('button');
      expect(firstPageButton).toContainHTML('<span class="hidden lg:inline-block">首頁</span>');
      expect(firstPageButton).toContainHTML('<span class="inline-block lg:hidden">&lt;&lt;</span>');
    });
  });

  // 邊界值測試
  describe('邊界值測試', () => {
    it('當在第一頁時，首頁和上一頁按鈕應被禁用', () => {
      render(<Pagination {...defaultProps} currentPage={1} />);

      // 檢查首頁和上一頁按鈕是否被禁用
      expect(screen.getByText('首頁').closest('button')).toBeDisabled();
      expect(screen.getByText('上一頁').closest('button')).toBeDisabled();

      // 檢查下一頁和末頁按鈕是否啟用
      expect(screen.getByText('下一頁').closest('button')).not.toBeDisabled();
      expect(screen.getByText('末頁').closest('button')).not.toBeDisabled();
    });

    it('當在最後一頁時，下一頁和末頁按鈕應被禁用', () => {
      render(<Pagination {...defaultProps} currentPage={10} />); // 總頁數為 10

      // 檢查下一頁和末頁按鈕是否被禁用
      expect(screen.getByText('下一頁').closest('button')).toBeDisabled();
      expect(screen.getByText('末頁').closest('button')).toBeDisabled();

      // 檢查首頁和上一頁按鈕是否啟用
      expect(screen.getByText('首頁').closest('button')).not.toBeDisabled();
      expect(screen.getByText('上一頁').closest('button')).not.toBeDisabled();
    });
    it('當總項目數為 0 時，應該正確處理並顯示 0 頁', () => {
      // 創建一個特殊的 props 對象，將 currentPage 設為 0，使其與 totalPages 相等
      const specialProps = {
        ...defaultProps,
        totalItems: 0,
        currentPage: 0, // 將當前頁設為 0，以匹配 totalPages
      };

      render(<Pagination {...specialProps} />);

      // 檢查是否顯示總計 0 筆，共 0 頁
      expect(screen.getByText(/總計 0 筆/)).toBeInTheDocument();
      expect(screen.getByText(/共 0 頁/)).toBeInTheDocument();

      // 檢查首頁和上一頁按鈕是否被禁用 (因為當前頁是第 0 頁，小於或等於 1)
      expect(screen.getByText('首頁').closest('button')).toBeDisabled();
      expect(screen.getByText('上一頁').closest('button')).toBeDisabled();

      // 檢查下一頁和末頁按鈕是否被禁用 (因為當前頁等於總頁數 0)
      const nextPageButton = screen.getByText('下一頁').closest('button');
      const lastPageButton = screen.getByText('末頁').closest('button');
      expect(nextPageButton).toBeDisabled();
      expect(lastPageButton).toBeDisabled();
    });
    it('當頁數超過 5 頁時，應該正確顯示有限數量的頁碼按鈕', () => {
      render(<Pagination {...defaultProps} totalItems={200} currentPage={6} />); // 總頁數為 20

      // 檢查是否只顯示了附近的頁碼
      expect(screen.queryByRole('button', { name: '1' })).not.toBeInTheDocument(); // 第 1 頁不應顯示
      expect(screen.getByRole('button', { name: '4' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '5' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '6' })).toBeInTheDocument(); // 當前頁
      expect(screen.getByRole('button', { name: '7' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '8' })).toBeInTheDocument();

      // 使用更精確的查詢方式來檢查最後一頁是否不存在
      // 這樣可以避免和下拉選單中的選項文字混淆
      expect(screen.queryByRole('button', { name: '20' })).not.toBeInTheDocument(); // 第 20 頁不應顯示
    });

    it('當總項目數不能被每頁數量整除時，應正確計算總頁數', () => {
      render(<Pagination {...defaultProps} totalItems={95} />); // 95 / 10 = 9.5 -> 10 頁

      // 檢查總頁數
      expect(screen.getByText(/共 10 頁/)).toBeInTheDocument();
    });
  });
});
