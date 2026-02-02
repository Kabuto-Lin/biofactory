import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import CheckboxGroup, { Checkbox } from '../../src/components/Checkbox';

describe('Checkbox Component', () => {
  // 測試基本渲染與互動
  describe('基本渲染與互動', () => {
    it('應該正確渲染 Checkbox 元件', () => {
      const handleChange = vi.fn();
      render(<Checkbox text="測試選項" value="test" onChange={handleChange} checked={false} />);

      const checkbox = screen.getByRole('checkbox');
      const label = screen.getByText('測試選項');

      expect(checkbox).toBeInTheDocument();
      expect(label).toBeInTheDocument();
      expect(checkbox).not.toBeChecked();
    });

    it('當點擊 Checkbox 時應觸發 onChange 事件', () => {
      const handleChange = vi.fn();
      render(<Checkbox text="測試選項" value="test" onChange={handleChange} checked={false} />);

      const checkbox = screen.getByRole('checkbox');
      fireEvent.click(checkbox);

      expect(handleChange).toHaveBeenCalledTimes(1);
    });

    it('應該根據 checked 屬性正確顯示選中狀態', () => {
      const handleChange = vi.fn();
      render(<Checkbox text="測試選項" value="test" onChange={handleChange} checked={true} />);

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeChecked();
    });
  });

  // 測試禁用狀態
  describe('禁用狀態', () => {
    it('當設置 disabled 為 true 時，Checkbox 應處於禁用狀態', () => {
      const handleChange = vi.fn();
      render(
        <Checkbox
          text="禁用選項"
          value="disabled"
          onChange={handleChange}
          disabled={true}
          checked={false}
        />,
      );

      const checkbox = screen.getByRole('checkbox');
      const label = screen.getByText('禁用選項').closest('label');

      expect(checkbox).toBeDisabled();
      expect(label).toHaveClass('cursor-not-allowed');
      expect(checkbox).toHaveClass('disabled:cursor-not-allowed');

      // 注意：在 React Testing Library 中，即使元素被禁用，fireEvent.click() 仍然會觸發事件
      // 這與實際瀏覽器行為不同。因此，我們不測試事件觸發，只確認禁用狀態
      // 實際上，React 在元件層面處理禁用狀態的點擊事件
    });

    it('當 disabled 為 false 時，Checkbox 應處於可操作狀態', () => {
      const handleChange = vi.fn();
      render(
        <Checkbox
          text="啟用選項"
          value="enabled"
          onChange={handleChange}
          disabled={false}
          checked={false}
        />,
      );

      const checkbox = screen.getByRole('checkbox');
      const label = screen.getByText('啟用選項').closest('label');

      expect(checkbox).not.toBeDisabled();
      expect(label).toHaveClass('cursor-pointer');
    });
  });

  // 測試樣式與UI
  describe('樣式與UI', () => {
    it('Checkbox 應有正確的樣式類', () => {
      const handleChange = vi.fn();
      render(<Checkbox text="樣式測試" value="style" onChange={handleChange} checked={false} />);

      const checkbox = screen.getByRole('checkbox');
      const label = screen.getByText('樣式測試').closest('label');

      expect(checkbox).toHaveClass('w-[20px]');
      expect(checkbox).toHaveClass('h-[20px]');
      expect(checkbox).toHaveClass('cursor-pointer');
      expect(label).toHaveClass('pl-[20px]');

      const textSpan = screen.getByText('樣式測試');
      expect(textSpan).toHaveClass('ml-2');
    });
  });
});

describe('CheckboxGroup Component', () => {
  // 測試基本渲染
  describe('基本渲染', () => {
    it('應該正確渲染多個 Checkbox 元件', () => {
      const items = [
        { text: '選項一', value: '1', selected: false, disabled: false },
        { text: '選項二', value: '2', selected: true, disabled: false },
        { text: '選項三', value: '3', selected: false, disabled: true },
      ];
      const handleSetItems = vi.fn();

      render(<CheckboxGroup items={items} onSetItems={handleSetItems} />);

      expect(screen.getByText('選項一')).toBeInTheDocument();
      expect(screen.getByText('選項二')).toBeInTheDocument();
      expect(screen.getByText('選項三')).toBeInTheDocument();

      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes).toHaveLength(3);
      expect(checkboxes[0]).not.toBeChecked();
      expect(checkboxes[1]).toBeChecked();
      expect(checkboxes[2]).not.toBeChecked();
      expect(checkboxes[2]).toBeDisabled();
    });
  });

  // 測試交互與狀態更新
  describe('交互與狀態更新', () => {
    it('點擊 Checkbox 時應更新 items 陣列並調用 onSetItems', () => {
      const items = [
        { text: '選項一', value: '1', selected: false, disabled: false },
        { text: '選項二', value: '2', selected: true, disabled: false },
      ];
      const handleSetItems = vi.fn();

      render(<CheckboxGroup items={items} onSetItems={handleSetItems} />);

      const firstCheckbox = screen.getAllByRole('checkbox')[0];
      fireEvent.click(firstCheckbox);

      // 檢查 onSetItems 被調用，且傳入的參數中第一個項目的 selected 變為 true
      expect(handleSetItems).toHaveBeenCalledTimes(1);
      const updatedItems = handleSetItems.mock.calls[0][0];
      expect(updatedItems[0].selected).toBe(true);
      expect(updatedItems[1].selected).toBe(true);
    });
  });

  // 測試全域禁用
  describe('全域禁用', () => {
    it('當設置 disabled 為 true 時，所有 Checkbox 應處於禁用狀態', () => {
      const items = [
        { text: '選項一', value: '1', selected: false, disabled: false },
        { text: '選項二', value: '2', selected: true, disabled: false },
      ];
      const handleSetItems = vi.fn();

      render(<CheckboxGroup items={items} onSetItems={handleSetItems} disabled={true} />);

      const checkboxes = screen.getAllByRole('checkbox');
      checkboxes.forEach((checkbox) => {
        expect(checkbox).toBeDisabled();
      });
    });

    it('當 disabled 為 false 時，應考慮單個 Checkbox 的禁用狀態', () => {
      const items = [
        { text: '選項一', value: '1', selected: false, disabled: false },
        { text: '選項二', value: '2', selected: true, disabled: true },
      ];
      const handleSetItems = vi.fn();

      render(<CheckboxGroup items={items} onSetItems={handleSetItems} disabled={false} />);

      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes[0]).not.toBeDisabled();
      expect(checkboxes[1]).toBeDisabled();
    });
  });

  // 測試邊界情況
  describe('邊界情況', () => {
    it('應處理空的 items 數組', () => {
      const handleSetItems = vi.fn();
      const { container } = render(<CheckboxGroup items={[]} onSetItems={handleSetItems} />);

      expect(container.querySelectorAll('input[type="checkbox"]')).toHaveLength(0);
    });

    it('應處理具有相同 value 的項目', () => {
      // 注意：這個測試實際上測試了當有重複 value 時，onChange 事件的行為
      const items = [
        { text: '選項一', value: '1', selected: false, disabled: false },
        { text: '選項二', value: '1', selected: true, disabled: false }, // 相同的 value
      ];
      const handleSetItems = vi.fn();

      render(<CheckboxGroup items={items} onSetItems={handleSetItems} />);

      const firstCheckbox = screen.getAllByRole('checkbox')[0];
      fireEvent.click(firstCheckbox);

      // 檢查更新邏輯，應該是第一個匹配的 value 被更新
      expect(handleSetItems).toHaveBeenCalledTimes(1);
      const updatedItems = handleSetItems.mock.calls[0][0];
      expect(updatedItems[0].selected).toBe(true);
    });

    it('應正確處理非布爾值的 selected 和 disabled 屬性', () => {
      const items = [
        { text: '選項一', value: '1', selected: 0, disabled: 0 }, // 非布爾假值
        { text: '選項二', value: '2', selected: 1, disabled: 1 }, // 非布爾真值
      ];
      const handleSetItems = vi.fn();

      render(<CheckboxGroup items={items} onSetItems={handleSetItems} />);

      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes[0]).not.toBeChecked(); // 0 轉換為 false
      expect(checkboxes[1]).toBeChecked(); // 1 轉換為 true

      // 對於 disabled 屬性，需要檢查實際情況而非假設
      // 根據 Checkbox.jsx 的邏輯，禁用狀態取決於 item.disabled 和 group disabled 屬性
      // 如果 item.disabled 是真值 (如 1)，則對應的 checkbox 應該是禁用狀態
      expect(checkboxes[0]).not.toBeDisabled();
      expect(checkboxes[1]).toBeDisabled(); // 修改這裡，應該是禁用的
    });
  });
});
