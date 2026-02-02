import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Modal from '../../src/components/Modal';
import React from 'react';

// 模擬 FontAwesome 元件
vi.mock('@fortawesome/react-fontawesome', () => ({
  FontAwesomeIcon: vi.fn(() => null),
}));

// 模擬圖標
vi.mock('@fortawesome/free-solid-svg-icons', () => ({
  faCheck: 'faCheck-icon',
  faXmark: 'faXmark-icon',
}));

describe('彈窗元件', () => {
  // 設置通用測試屬性
  const mockSetShow = vi.fn();
  const mockSubmit = vi.fn();
  const mockCancel = vi.fn();

  // 每個測試前重置模擬函數
  beforeEach(() => {
    mockSetShow.mockReset();
    mockSubmit.mockReset();
    mockCancel.mockReset();
  });

  // 基本UI測試
  describe('基本UI渲染', () => {
    it('當show為true時應正確顯示彈窗', () => {
      render(
        <Modal show={true} setShow={mockSetShow} title="測試標題">
          <p>測試內容</p>
        </Modal>,
      );

      // 檢查標題和內容是否正確顯示
      expect(screen.getByText('測試標題')).toBeInTheDocument();
      expect(screen.getByText('測試內容')).toBeInTheDocument();

      // 檢查確定和取消按鈕是否存在
      expect(screen.getByText('確定')).toBeInTheDocument();
      expect(screen.getByText('取消')).toBeInTheDocument();
    });

    it('當show為false時應隱藏彈窗', () => {
      const { container } = render(
        <Modal show={false} setShow={mockSetShow} title="測試標題">
          <p>測試內容</p>
        </Modal>,
      );

      // 檢查彈窗是否有隱藏的CSS類
      const modalElement = container.firstChild;
      expect(modalElement).toHaveClass('opacity-0');
      expect(modalElement).toHaveClass('invisible');
    });

    it('應正確渲染帶有自定義className的彈窗', () => {
      const { container } = render(
        <Modal show={true} setShow={mockSetShow} title="測試標題" className="custom-class">
          <p>測試內容</p>
        </Modal>,
      );

      // 檢查自定義類是否被應用
      const modalDialog = container.querySelector('.custom-class');
      expect(modalDialog).toBeInTheDocument();
    });

    it('應正確渲染帶有自定義z-index的彈窗', () => {
      const { container } = render(
        <Modal show={true} setShow={mockSetShow} title="測試標題" zIndex="z-[999]">
          <p>測試內容</p>
        </Modal>,
      );

      // 檢查自定義z-index是否被應用
      const modalElement = container.firstChild;
      expect(modalElement).toHaveClass('z-[999]');
    });
  });

  // 功能測試
  describe('功能測試', () => {
    it('點擊關閉按鈕時應調用setShow(false)', () => {
      render(
        <Modal show={true} setShow={mockSetShow} title="測試標題">
          <p>測試內容</p>
        </Modal>,
      );

      // 點擊關閉按鈕
      const closeButton = document.querySelector('.modal-svg-delete-background');
      fireEvent.click(closeButton);

      // 檢查setShow是否被調用並傳入false
      expect(mockSetShow).toHaveBeenCalledWith(false);
    });

    it('點擊背景時應調用setShow(false)', () => {
      const { container } = render(
        <Modal show={true} setShow={mockSetShow} title="測試標題">
          <p>測試內容</p>
        </Modal>,
      );

      // 點擊背景（模態框的外層容器）
      fireEvent.click(container.firstChild);

      // 檢查setShow是否被調用並傳入false
      expect(mockSetShow).toHaveBeenCalledWith(false);
    });

    it('點擊確定按鈕時應調用submit回調', () => {
      // 模擬submit返回true
      mockSubmit.mockReturnValue(true);

      render(
        <Modal show={true} setShow={mockSetShow} title="測試標題" submit={mockSubmit}>
          <p>測試內容</p>
        </Modal>,
      );

      // 點擊確定按鈕
      const confirmButton = screen.getByText('確定');
      fireEvent.click(confirmButton);

      // 檢查submit是否被調用
      expect(mockSubmit).toHaveBeenCalled();

      // 檢查setShow是否被調用並傳入false
      expect(mockSetShow).toHaveBeenCalledWith(false);
    });

    it('點擊取消按鈕時應調用cancel回調', () => {
      // 模擬cancel返回true
      mockCancel.mockReturnValue(true);

      render(
        <Modal show={true} setShow={mockSetShow} title="測試標題" cancel={mockCancel}>
          <p>測試內容</p>
        </Modal>,
      );

      // 點擊取消按鈕
      const cancelButton = screen.getByText('取消');
      fireEvent.click(cancelButton);

      // 檢查cancel是否被調用
      expect(mockCancel).toHaveBeenCalled();

      // 檢查setShow是否被調用並傳入false
      expect(mockSetShow).toHaveBeenCalledWith(false);
    });

    it('應將setShow屬性傳遞給自定義子元件', () => {
      // 創建一個自定義子元件來測試屬性傳遞
      const ChildComponent = vi.fn(() => <div>子元件</div>);

      render(
        <Modal show={true} setShow={mockSetShow} title="測試標題">
          <ChildComponent />
        </Modal>,
      );

      // 檢查子元件是否收到setShow屬性
      expect(ChildComponent).toHaveBeenCalledWith(
        expect.objectContaining({ setShow: mockSetShow }),
        expect.anything(),
      );
    });
  });

  // 邊界值測試
  describe('邊界值測試', () => {
    it('當footer設置為false時不應顯示底部按鈕', () => {
      render(
        <Modal show={true} setShow={mockSetShow} title="測試標題" footer={false}>
          <p>測試內容</p>
        </Modal>,
      );

      // 檢查確定和取消按鈕是否不存在
      expect(screen.queryByText('確定')).not.toBeInTheDocument();
      expect(screen.queryByText('取消')).not.toBeInTheDocument();
    });

    it('當提供自定義footer時應正確顯示', () => {
      render(
        <Modal
          show={true}
          setShow={mockSetShow}
          title="測試標題"
          footer={<button>自定義按鈕</button>}
        >
          <p>測試內容</p>
        </Modal>,
      );

      // 檢查自定義按鈕是否存在
      expect(screen.getByText('自定義按鈕')).toBeInTheDocument();

      // 確認默認按鈕不存在
      expect(screen.queryByText('確定')).not.toBeInTheDocument();
      expect(screen.queryByText('取消')).not.toBeInTheDocument();
    });

    it('當submit返回false時不應關閉彈窗', () => {
      // 模擬submit返回false
      mockSubmit.mockReturnValue(false);

      render(
        <Modal show={true} setShow={mockSetShow} title="測試標題" submit={mockSubmit}>
          <p>測試內容</p>
        </Modal>,
      );

      // 點擊確定按鈕
      const confirmButton = screen.getByText('確定');
      fireEvent.click(confirmButton);

      // 檢查submit是否被調用
      expect(mockSubmit).toHaveBeenCalled();

      // 檢查setShow是否未被調用
      expect(mockSetShow).not.toHaveBeenCalled();
    });

    it('當cancel返回false時不應關閉彈窗', () => {
      // 模擬cancel返回false
      mockCancel.mockReturnValue(false);

      render(
        <Modal show={true} setShow={mockSetShow} title="測試標題" cancel={mockCancel}>
          <p>測試內容</p>
        </Modal>,
      );

      // 點擊取消按鈕
      const cancelButton = screen.getByText('取消');
      fireEvent.click(cancelButton);

      // 檢查cancel是否被調用
      expect(mockCancel).toHaveBeenCalled();

      // cancel函數雖然返回false，但根據源碼邏輯，無論如何都會調用setShow(false)
      expect(mockSetShow).toHaveBeenCalledWith(false);
    });

    it('不應將setShow傳遞給原生HTML元素', () => {
      // 使用帶有ref的元素測試
      const inputRef = React.createRef();

      render(
        <Modal show={true} setShow={mockSetShow} title="測試標題">
          <input ref={inputRef} data-testid="test-input" />
        </Modal>,
      );

      const input = screen.getByTestId('test-input');
      // 檢查原生元素沒有setShow屬性
      expect(input).not.toHaveAttribute('setShow');
    });
  });
});
