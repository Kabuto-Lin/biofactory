import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import QuModal, { QuBtn, QuModalContext } from '../../src/components/QuModal';
import React, { useContext } from 'react';

// 模擬 FontAwesome 元件
vi.mock('@fortawesome/react-fontawesome', () => ({
  FontAwesomeIcon: vi.fn(({ icon, className }) => (
    <span className={className} data-testid={`font-awesome-${icon}`}></span>
  )),
}));

// 模擬圖標
vi.mock('@fortawesome/free-solid-svg-icons', () => ({
  faCaretDown: 'faCaretDown',
}));

// 模擬 Sweetalert2
import Swal from 'sweetalert2';
vi.mock('sweetalert2', () => ({
  default: {
    fire: vi.fn(() => Promise.resolve()),
  },
}));

// 設置全局 Swal 變量以便測試能夠正確檢查
global.Swal = { fire: vi.fn(() => Promise.resolve()) };

// 模擬 createPortal
vi.mock('react-dom', () => ({
  createPortal: vi.fn((children) => children),
}));

// 模擬根元素
beforeEach(() => {
  // 創建根元素以供 createPortal 使用
  const root = document.createElement('div');
  root.id = 'root';
  document.body.appendChild(root);
});

afterEach(() => {
  // 清除根元素
  const root = document.getElementById('root');
  if (root) {
    document.body.removeChild(root);
  }
  vi.clearAllMocks();
});

describe('QuModal 元件', () => {
  // 基本 UI 測試
  describe('基本 UI 渲染', () => {
    it('當 show 為 true 時應該顯示彈窗', () => {
      const setShow = vi.fn();
      const ModalContent = () => <div data-testid="modal-content">測試內容</div>;

      render(
        <QuModal show={true} setShow={setShow} sender="test">
          <ModalContent />
        </QuModal>,
      );

      // 檢查彈窗是否顯示
      const modalContent = screen.getByTestId('modal-content');
      expect(modalContent).toBeInTheDocument();
      expect(modalContent.textContent).toBe('測試內容');

      // 檢查彈窗是否可見
      const modalContainer = modalContent.closest('div[class*="bg-[#1b1b1b8f]"]');
      expect(modalContainer).toHaveClass('opacity-100', 'visible');
      expect(modalContainer).not.toHaveClass('opacity-0', 'invisible');
    });
    it('當 show 為 false 時應該隱藏彈窗', () => {
      const setShow = vi.fn();
      const ModalContent = () => <div data-testid="modal-content">測試內容</div>;

      render(
        <QuModal show={false} setShow={setShow} sender="test">
          <ModalContent />
        </QuModal>,
      );

      // 檢查彈窗是否隱藏
      const modalContainer = screen.getByText('測試內容').closest('div[class*="bg-[#1b1b1b8f]"]');
      expect(modalContainer).toHaveClass('opacity-0', 'invisible');
      expect(modalContainer).not.toHaveClass('opacity-100', 'visible');
    });
  });

  // 功能測試
  describe('功能測試', () => {
    it('點擊彈窗背景應關閉彈窗', () => {
      const setShow = vi.fn();
      const onClose = vi.fn();
      render(
        <QuModal show={true} setShow={setShow} onClose={onClose} sender="test">
          <div>測試內容</div>
        </QuModal>,
      );

      // 獲取彈窗背景並點擊
      const modalBackground = screen.getByText('測試內容').closest('div[class*="bg-[#1b1b1b8f]"]');
      fireEvent.click(modalBackground);

      // 檢查是否調用了 setShow 和 onClose
      expect(setShow).toHaveBeenCalledWith(false);
      expect(onClose).toHaveBeenCalled();
    });

    it('點擊彈窗內容不應關閉彈窗', () => {
      const setShow = vi.fn();
      const onClose = vi.fn();
      render(
        <QuModal show={true} setShow={setShow} onClose={onClose} sender="test">
          <div data-testid="modal-content">測試內容</div>
        </QuModal>,
      );

      // 獲取彈窗內容並點擊
      const modalContent = screen.getByTestId('modal-content');
      fireEvent.click(modalContent);

      // 檢查是否沒有調用 setShow 和 onClose
      expect(setShow).not.toHaveBeenCalled();
      expect(onClose).not.toHaveBeenCalled();
    });
  });

  // 邊界值測試
  describe('邊界值測試', () => {
    it('應正確處理 onClose 為 undefined 的情況', () => {
      const setShow = vi.fn();
      // 不傳遞 onClose 參數
      render(
        <QuModal show={true} setShow={setShow} sender="test">
          <div>測試內容</div>
        </QuModal>,
      );

      // 獲取彈窗背景並點擊
      const modalBackground = screen.getByText('測試內容').closest('div[class*="bg-[#1b1b1b8f]"]');
      fireEvent.click(modalBackground);

      // 檢查是否只調用了 setShow
      expect(setShow).toHaveBeenCalledWith(false);
      // 不應出現錯誤
    });
    it('應正確處理 children 為 null 的情況', () => {
      const setShow = vi.fn();
      // 傳遞 null 作為 children
      render(<QuModal show={true} setShow={setShow} sender="test" children={null} />);

      // 測試不應崩潰
      expect(true).toBe(true);
    });
  });
});

describe('QuBtn 元件', () => {
  // 基本 UI 測試
  describe('基本 UI 渲染', () => {
    it('使用預設按鈕時應正確渲染', () => {
      render(
        <QuBtn sender="test">
          <div>彈窗內容</div>
        </QuBtn>,
      );

      // 檢查按鈕是否渲染
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      expect(button).toHaveClass('bg-primary');

      // 檢查 FontAwesome 圖標是否存在
      const icon = screen.getByTestId('font-awesome-faCaretDown');
      expect(icon).toBeInTheDocument();
    });

    it('使用自定義按鈕時應正確渲染', () => {
      render(
        <QuBtn sender="test" btnElement={<button data-testid="custom-btn">自定義按鈕</button>}>
          <div>彈窗內容</div>
        </QuBtn>,
      );

      // 檢查自定義按鈕是否渲染
      const customButton = screen.getByTestId('custom-btn');
      expect(customButton).toBeInTheDocument();
      expect(customButton.textContent).toBe('自定義按鈕');
    });
  });

  // 功能測試
  describe('功能測試', () => {
    it('點擊按鈕應顯示彈窗', async () => {
      const quModalingEvent = vi.fn();
      render(
        <QuBtn sender="test" quModalingEvent={quModalingEvent}>
          <div data-testid="modal-content">彈窗內容</div>
        </QuBtn>,
      );

      // 獲取按鈕並點擊
      const button = screen.getByRole('button');
      fireEvent.click(button);

      // 檢查是否調用了 quModalingEvent
      expect(quModalingEvent).toHaveBeenCalled();

      // 檢查彈窗是否顯示
      await waitFor(() => {
        const modalContent = screen.getByTestId('modal-content');
        expect(modalContent).toBeInTheDocument();
      });
    });

    it('應正確處理 quModalingEvent 中的參數', async () => {
      // 模擬 quModalingEvent 設置初始值
      const quModalingEvent = vi.fn((args) => {
        args.initialValue = { testValue: 'test' };
      });

      // 創建一個使用 QuModalContext 的測試組件
      const TestComponent = () => {
        const context = useContext(QuModalContext);
        return (
          <div data-testid="context-value">
            {context.initialValue && JSON.stringify(context.initialValue)}
          </div>
        );
      };

      render(
        <QuBtn sender="test" quModalingEvent={quModalingEvent}>
          <TestComponent />
        </QuBtn>,
      );

      // 獲取按鈕並點擊
      const button = screen.getByRole('button');
      fireEvent.click(button);

      // 檢查 context 是否包含正確的初始值
      await waitFor(() => {
        const contextValue = screen.getByTestId('context-value');
        expect(contextValue.textContent).toContain('testValue');
        expect(contextValue.textContent).toContain('test');
      });
    });
  });

  // 邊界值測試
  describe('邊界值測試', () => {
    it('當 quModalingEvent 返回 cancel: true 時不應顯示彈窗', async () => {
      // 模擬 quModalingEvent 設置 cancel: true
      const quModalingEvent = vi.fn((args) => {
        args.cancel = true;
        args.message = '操作已取消';
      });

      render(
        <QuBtn sender="test" quModalingEvent={quModalingEvent}>
          <div data-testid="modal-content">彈窗內容</div>
        </QuBtn>,
      );

      // 獲取按鈕並點擊
      const button = screen.getByRole('button');
      fireEvent.click(button);

      // 檢查 Sweetalert2.fire 是否被調用
      const fireSpy = vi.spyOn(Swal, 'fire');
      await waitFor(() => {
        expect(fireSpy).toHaveBeenCalledWith({
          title: '操作已取消',
          icon: 'warning',
        });
      });
      fireSpy.mockRestore();

      // 確保彈窗沒有顯示
      expect(screen.queryByTestId('modal-content')).not.toBeInTheDocument();
    });

    it('應正確傳遞 optionalControls 到 Context', async () => {
      const optionalControls = { testOption: 'test' };

      // 創建一個使用 QuModalContext 的測試組件
      const TestComponent = () => {
        const context = useContext(QuModalContext);
        return (
          <div data-testid="optional-controls">{JSON.stringify(context.optionalControls)}</div>
        );
      };

      render(
        <QuBtn sender="test" optionalControls={optionalControls}>
          <TestComponent />
        </QuBtn>,
      );

      // 獲取按鈕並點擊
      const button = screen.getByRole('button');
      fireEvent.click(button);

      // 檢查 context 是否包含正確的 optionalControls
      await waitFor(() => {
        const controlsElement = screen.getByTestId('optional-controls');
        expect(controlsElement.textContent).toContain('testOption');
        expect(controlsElement.textContent).toContain('test');
      });
    });
  });
});
