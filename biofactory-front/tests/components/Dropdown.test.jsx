import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import Dropdown from '../../src/components/Dropdown';

// 模擬 FontAwesome 元件
vi.mock('@fortawesome/react-fontawesome', () => ({
  FontAwesomeIcon: ({ icon }) => <span data-testid={`icon-${icon}`} />,
}));

// 模擬圖標
vi.mock('@fortawesome/free-solid-svg-icons', () => ({
  faChevronDown: 'faChevronDown',
  faChevronUp: 'faChevronUp',
  faTimes: 'faTimes',
}));

describe('Dropdown 元件', () => {
  // 測試數據
  const mockData = [
    { KEY: '1', DESC: '選項一' },
    { KEY: '2', DESC: '選項二' },
    { KEY: '3', DESC: '選項三' },
  ];

  // 基本 UI 渲染測試
  describe('基本 UI 渲染', () => {
    it('應正確渲染基本下拉選單', () => {
      render(<Dropdown title="測試標題" data={mockData} />);

      // 檢查標題是否正確顯示
      expect(screen.getByText('測試標題')).toBeInTheDocument();

      // 檢查下拉圖標是否存在
      expect(screen.getByTestId('icon-faChevronDown')).toBeInTheDocument();

      // 初始狀態下下拉選項應該是隱藏的
      expect(screen.queryByText('選項一')).not.toBeInTheDocument();
    });

    it('點擊後應顯示下拉選項', () => {
      render(<Dropdown title="測試標題" data={mockData} />);

      // 點擊下拉選單
      fireEvent.click(screen.getByText('測試標題'));

      // 檢查選項是否顯示
      expect(screen.getByText('選項一')).toBeInTheDocument();
      expect(screen.getByText('選項二')).toBeInTheDocument();
      expect(screen.getByText('選項三')).toBeInTheDocument();
    });

    it('選擇項目後應顯示選中項目', () => {
      const onSelect = vi.fn();
      render(<Dropdown title="測試標題" data={mockData} onSelect={onSelect} />);

      // 點擊下拉選單
      fireEvent.click(screen.getByText('測試標題'));

      // 選擇一個選項
      fireEvent.click(screen.getByText('選項二'));

      // 檢查回調是否被正確調用
      expect(onSelect).toHaveBeenCalledWith('2');
    });

    it('添加搜尋功能時應渲染搜尋框', () => {
      render(<Dropdown title="測試標題" data={mockData} addInputWithFilter={true} />);

      // 點擊下拉選單
      fireEvent.click(screen.getByText('測試標題')); // 檢查搜尋框是否存在
      const searchInput = screen.getByPlaceholderText('請輸入篩選條件');
      expect(searchInput).toBeInTheDocument();
    });
  });

  // 功能測試
  describe('功能測試', () => {
    it('搜尋功能應正確過濾選項', async () => {
      render(<Dropdown title="測試標題" data={mockData} addInputWithFilter={true} />);

      // 點擊下拉選單
      fireEvent.click(screen.getByText('測試標題'));

      // 輸入搜尋關鍵字
      const searchInput = screen.getByPlaceholderText('請輸入篩選條件');
      fireEvent.change(searchInput, { target: { value: '選項一' } });

      // 檢查過濾結果
      await waitFor(() => {
        expect(screen.getByText('選項一')).toBeInTheDocument();
        expect(screen.queryByText('選項二')).not.toBeInTheDocument();
        expect(screen.queryByText('選項三')).not.toBeInTheDocument();
      });
    });

    it('點擊清除按鈕應清空搜尋關鍵字', async () => {
      render(<Dropdown title="測試標題" data={mockData} addInputWithFilter={true} />); // 點擊下拉選單
      fireEvent.click(screen.getByText('測試標題'));

      // 輸入搜尋關鍵字
      const searchInput = screen.getByPlaceholderText('請輸入篩選條件');
      fireEvent.change(searchInput, { target: { value: '選項一' } });

      // 檢查清除按鈕並點擊
      const clearButton = screen.getByTestId('icon-faTimes').closest('button');
      fireEvent.click(clearButton);

      // 檢查搜尋框值是否被清空
      expect(searchInput.value).toBe('');

      // 檢查所有選項是否重新顯示
      await waitFor(() => {
        expect(screen.getByText('選項一')).toBeInTheDocument();
        expect(screen.getByText('選項二')).toBeInTheDocument();
        expect(screen.getByText('選項三')).toBeInTheDocument();
      });
    });

    it('點擊外部應關閉下拉選單', () => {
      render(<Dropdown title="測試標題" data={mockData} />);

      // 點擊下拉選單打開
      fireEvent.click(screen.getByText('測試標題'));
      expect(screen.getByText('選項一')).toBeInTheDocument();

      // 模擬點擊外部
      fireEvent.mouseDown(document);

      // 檢查下拉選單是否關閉
      expect(screen.queryByText('選項一')).not.toBeInTheDocument();
    });
    it('使用鍵盤導航應正確切換選項', async () => {
      const onSelect = vi.fn();
      render(<Dropdown title="測試標題" data={mockData} onSelect={onSelect} />);

      // 點擊下拉選單打開
      const dropdown = screen.getByText('測試標題');
      fireEvent.click(dropdown);

      // 等待下拉選單顯示
      await screen.findByText('選項一');

      // 按鍵盤箭頭選中選項
      fireEvent.keyDown(dropdown, { key: 'ArrowDown' });

      // 按Enter鍵選擇
      fireEvent.keyDown(dropdown, { key: 'Enter' });

      // 檢查選擇回調
      expect(onSelect).toHaveBeenCalledWith('1');
    });
  });

  // 邊界值測試
  describe('邊界值測試', () => {
    it('傳入空數據陣列時應顯示預設訊息', () => {
      render(<Dropdown title="測試標題" data={[]} />);

      // 點擊下拉選單
      fireEvent.click(screen.getByText('測試標題'));

      // 應顯示預設的無數據訊息
      expect(screen.getByText('查無資料')).toBeInTheDocument();
    });

    it('禁用狀態下點擊不應打開下拉選單', () => {
      render(<Dropdown title="測試標題" data={mockData} disabled={true} />);

      // 檢查元素是否有禁用樣式
      const dropdownElement = screen.getByText('測試標題').closest('div');
      expect(dropdownElement).toHaveClass('cursor-not-allowed');

      // 點擊下拉選單
      fireEvent.click(screen.getByText('測試標題'));

      // 選項不應該顯示
      expect(screen.queryByText('選項一')).not.toBeInTheDocument();
    });

    it('搜尋結果為空時應顯示無匹配訊息', async () => {
      render(<Dropdown title="測試標題" data={mockData} addInputWithFilter={true} />);

      // 點擊下拉選單
      fireEvent.click(screen.getByText('測試標題'));

      // 輸入不存在的搜尋關鍵字
      const searchInput = screen.getByPlaceholderText('請輸入篩選條件');
      fireEvent.change(searchInput, { target: { value: '不存在的選項' } });

      // 檢查無匹配訊息
      await waitFor(() => {
        expect(screen.getByText('查無資料')).toBeInTheDocument();
      });
    });

    it('當下拉列表位置不足時應向上展開', () => {
      // 模擬元素位置檢查
      const originalGetBoundingClientRect = Element.prototype.getBoundingClientRect;
      Element.prototype.getBoundingClientRect = vi.fn(() => ({
        bottom: window.innerHeight - 10, // 距離底部只有10px
        height: 30,
        top: window.innerHeight - 40,
        left: 0,
        right: 100,
        width: 100,
      }));

      const mockScrollContainer = document.createElement('div');
      document.body.appendChild(mockScrollContainer);

      render(<Dropdown title="測試標題" data={mockData} scrollContainer={mockScrollContainer} />);

      // 點擊下拉選單
      fireEvent.click(screen.getByText('測試標題'));

      // 恢復原始方法
      Element.prototype.getBoundingClientRect = originalGetBoundingClientRect;

      // 檢查下拉列表是否向上展開
      const dropdownList = screen.getByText('選項一').closest('[data-testid="dropdown-list"]');
      expect(dropdownList).toHaveStyle('bottom: 100%');
    });
  });
});
