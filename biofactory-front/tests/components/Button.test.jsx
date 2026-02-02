import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { faUser, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import Button from '../../src/components/Button';

describe('Button Component', () => {
  // 測試基本渲染
  describe('基本渲染', () => {
    it('應該正確渲染帶有標籤的按鈕', () => {
      render(<Button label="測試按鈕" />);
      expect(screen.getByText('測試按鈕')).toBeInTheDocument();
    });

    it('按鈕應該是可點擊的並觸發 onClick 事件', () => {
      const handleClick = vi.fn();
      render(<Button label="點擊測試" onClick={handleClick} />);

      fireEvent.click(screen.getByText('點擊測試'));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  // 測試圖標功能
  describe('圖標功能', () => {
    it('應該渲染帶有左側圖標的按鈕', () => {
      render(<Button label="左圖標" leftIcon={faUser} />);

      // FontAwesomeIcon 會渲染成 SVG，所以我們檢查 SVG 是否存在
      const buttonElement = screen.getByText('左圖標');
      const svgElement = buttonElement.parentElement.querySelector('svg');
      expect(svgElement).toBeInTheDocument();

      // 確保文字在圖標右側
      const buttonContent = buttonElement.parentElement.textContent;
      expect(buttonContent.trim()).toMatch(/左圖標/);
    });

    it('應該渲染帶有右側圖標的按鈕', () => {
      render(<Button label="右圖標" rightIcon={faArrowRight} />);

      const buttonElement = screen.getByText('右圖標');
      const svgElement = buttonElement.parentElement.querySelector('svg');
      expect(svgElement).toBeInTheDocument();

      // 確保文字在圖標左側
      const buttonContent = buttonElement.parentElement.textContent;
      expect(buttonContent.trim()).toMatch(/右圖標/);
    });

    it('當只有圖標沒有文字時應該正確渲染', () => {
      const { container } = render(<Button leftIcon={faUser} />);
      const svgElement = container.querySelector('svg');
      expect(svgElement).toBeInTheDocument();

      // 按鈕不應該有文字內容（除了可能的空格）
      const buttonElement = container.querySelector('button');
      expect(buttonElement.textContent.trim()).toBe('');
    });
  });

  // 測試自定義樣式
  describe('樣式與類名', () => {
    it('應該應用自定義 className', () => {
      const { container } = render(<Button label="樣式按鈕" className="test-custom-class" />);
      const buttonElement = container.querySelector('button');
      expect(buttonElement).toHaveClass('test-custom-class');
    });

    it('禁用按鈕時應該有正確的樣式類', () => {
      const { container } = render(<Button label="禁用按鈕" disabled />);
      const buttonElement = container.querySelector('button');

      expect(buttonElement).toHaveClass('cursor-not-allowed');
      expect(buttonElement).toHaveClass('bg-tertiary');
      expect(buttonElement).not.toHaveClass('text-white');
      expect(buttonElement).toBeDisabled();
    });

    it('啟用按鈕時應該有正確的樣式類', () => {
      const { container } = render(<Button label="啟用按鈕" />);
      const buttonElement = container.querySelector('button');

      expect(buttonElement).toHaveClass('cursor-pointer');
      expect(buttonElement).toHaveClass('text-white');
      expect(buttonElement).not.toHaveClass('cursor-not-allowed');
      expect(buttonElement).not.toBeDisabled();
    });
  });

  // 測試通知標記
  describe('通知標記', () => {
    it('設置 notification 為 true 時應該顯示紅點', () => {
      const { container } = render(<Button label="通知按鈕" notification />);
      const notificationDot = container.querySelector('.bg-red-600');
      expect(notificationDot).toBeInTheDocument();
    });

    it('未設置 notification 時不應該顯示紅點', () => {
      const { container } = render(<Button label="無通知按鈕" />);
      const notificationDot = container.querySelector('.bg-red-600');
      expect(notificationDot).not.toBeInTheDocument();
    });
  });

  // 測試 ref 轉發
  describe('Ref 轉發', () => {
    it('按鈕應該正確接受並應用 ref', () => {
      const ref = { current: null };
      render(<Button label="Ref 按鈕" ref={ref} />);

      expect(ref.current).not.toBeNull();
      expect(ref.current.tagName).toBe('BUTTON');
    });
  });

  // 測試邊界情況
  describe('邊界情況', () => {
    it('沒有提供任何 props 時應該不報錯', () => {
      expect(() => render(<Button />)).not.toThrow();
    });

    it('同時提供左右圖標時應該優先顯示左圖標', () => {
      render(<Button leftIcon={faUser} rightIcon={faArrowRight} label="雙圖標" />);

      // 檢查按鈕內容是否符合左圖標的布局
      const labelElement = screen.getByText('雙圖標');
      expect(labelElement).toHaveClass('pl-2'); // 左圖標時標籤有 pl-2 類
      expect(labelElement).not.toHaveClass('pr-2'); // 右圖標時標籤有 pr-2 類
    });

    it('禁用時按鈕不應觸發點擊事件', () => {
      const handleClick = vi.fn();
      render(<Button label="禁用點擊" onClick={handleClick} disabled />);

      fireEvent.click(screen.getByText('禁用點擊'));
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  // 測試響應式行為
  describe('響應式行為', () => {
    it('在大屏幕上顯示文字和圖標', () => {
      const { container } = render(<Button leftIcon={faUser} label="響應式" />);
      const labelElement = screen.getByText('響應式');

      // 標籤存在且沒有被隱藏
      expect(labelElement).toBeInTheDocument();
      expect(labelElement).toHaveClass('pl-2');
    });

    it('標籤元素在小屏幕上有隱藏類', () => {
      const { container } = render(<Button leftIcon={faUser} label="隱藏標籤" />);
      const labelElement = screen.getByText('隱藏標籤');

      // 檢查是否有用於小屏幕隱藏的類
      expect(labelElement).toHaveClass('max-lg:hidden');
    });
  });
});
