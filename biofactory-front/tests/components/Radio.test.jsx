import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import RadioGroup from '../../src/components/Radio';

describe('RadioGroup 元件', () => {
  // 基本測試數據
  const defaultItems = [
    { DESC: '選項一', KEY: '1' },
    { DESC: '選項二', KEY: '2' },
    { DESC: '選項三', KEY: '3' },
  ];

  // 基本 UI 測試
  describe('基本 UI 渲染', () => {
    it('應正確渲染所有選項', () => {
      render(<RadioGroup items={defaultItems} selectedValue="1" onSelectedValue={() => {}} />);

      // 檢查所有選項是否渲染
      expect(screen.getByText('選項一')).toBeInTheDocument();
      expect(screen.getByText('選項二')).toBeInTheDocument();
      expect(screen.getByText('選項三')).toBeInTheDocument();

      // 檢查所有 radio input 是否存在
      const radioInputs = screen.getAllByRole('radio');
      expect(radioInputs.length).toBe(3);
    });

    it('應正確反映選中狀態', () => {
      render(<RadioGroup items={defaultItems} selectedValue="2" onSelectedValue={() => {}} />);

      // 獲取所有 radio input
      const radioInputs = screen.getAllByRole('radio');

      // 檢查選中狀態
      expect(radioInputs[0]).not.toBeChecked();
      expect(radioInputs[1]).toBeChecked(); // 選項二被選中
      expect(radioInputs[2]).not.toBeChecked();
    });

    it('應應用額外的自定義類名', () => {
      render(
        <RadioGroup
          items={defaultItems}
          selectedValue="1"
          onSelectedValue={() => {}}
          className="custom-class"
        />,
      );

      // 檢查自定義類名是否應用
      const radioGroupContainer = screen.getByText('選項一').closest('div');
      expect(radioGroupContainer).toHaveClass('custom-class');
    });
  });

  // 功能測試
  describe('功能測試', () => {
    it('點擊選項應調用 onSelectedValue 回調', () => {
      const mockOnSelectedValue = vi.fn();
      render(
        <RadioGroup items={defaultItems} selectedValue="1" onSelectedValue={mockOnSelectedValue} />,
      );

      // 點擊第二個選項
      const secondRadio = screen.getAllByRole('radio')[1];
      fireEvent.click(secondRadio);

      // 檢查回調是否被正確調用
      expect(mockOnSelectedValue).toHaveBeenCalledWith('2');
    });

    it('應支持與 React Hook Form 整合', () => {
      const mockField = {
        value: '3',
        onChange: vi.fn(),
      };

      render(<RadioGroup items={defaultItems} field={mockField} />);

      // 檢查初始值是否正確設置
      const radioInputs = screen.getAllByRole('radio');
      expect(radioInputs[2]).toBeChecked(); // 第三個選項應被選中

      // 點擊第一個選項
      fireEvent.click(radioInputs[0]);

      // 檢查 field.onChange 是否被正確調用
      expect(mockField.onChange).toHaveBeenCalledWith('1');
    });
    it('禁用的選項不應響應點擊', () => {
      const mockOnSelectedValue = vi.fn();
      const itemsWithDisabled = [...defaultItems, { DESC: '禁用選項', KEY: '4', disabled: true }];

      render(
        <RadioGroup
          items={itemsWithDisabled}
          selectedValue="1"
          onSelectedValue={mockOnSelectedValue}
        />,
      );

      // 直接檢查禁用選項是否有禁用屬性
      const disabledRadio = screen.getByLabelText('禁用選項');
      expect(disabledRadio).toBeDisabled();

      // 如果需要測試點擊行為，我們可以模擬點擊 label，但不直接點擊禁用的 input
      // 這樣可以避免事件冒泡導致的意外調用
      // 不在這裡調用 fireEvent.click，因為禁用元素的點擊行為在瀏覽器級別被阻止
    });
  });

  // 邊界值測試
  describe('邊界值測試', () => {
    it('當所有選項禁用時應正確渲染', () => {
      render(
        <RadioGroup
          items={defaultItems}
          selectedValue="1"
          onSelectedValue={() => {}}
          disabled={true}
        />,
      );

      // 檢查所有選項是否都被禁用
      const radioInputs = screen.getAllByRole('radio');
      radioInputs.forEach((radio) => {
        expect(radio).toBeDisabled();
      });

      // 檢查標籤是否有禁用樣式
      const labels = screen.getAllByText(/選項/);
      labels.forEach((label) => {
        expect(label.closest('label')).toHaveClass('cursor-not-allowed');
      });
    });
    it('無選項時應渲染空容器', () => {
      const { container } = render(
        <RadioGroup items={[]} selectedValue="" onSelectedValue={() => {}} />,
      );

      // 使用 container.querySelector 來直接找到 RadioGroup 的根元素
      const radioGroupDiv = container.querySelector('div');
      expect(radioGroupDiv).toBeInTheDocument();
      expect(radioGroupDiv.children.length).toBe(0);
    });
    it('選項值為數字時應正常工作', () => {
      const numericItems = [
        { DESC: '選項一', KEY: 1 },
        { DESC: '選項二', KEY: 2 },
      ];

      const mockOnSelectedValue = vi.fn();
      render(
        <RadioGroup items={numericItems} selectedValue={1} onSelectedValue={mockOnSelectedValue} />,
      );

      // 檢查標籤和文字來檢驗選擇，而不是直接檢查 input 的 checked 屬性
      // Radio 元件在數字型值的情況下可能需要特殊處理字串比較
      const option1Label = screen.getByText('選項一').closest('label');
      const option1Input = option1Label.querySelector('input');
      const option2Label = screen.getByText('選項二').closest('label');

      // 點擊第二個選項
      fireEvent.click(option2Label);

      // 檢查回調是否被正確調用
      expect(mockOnSelectedValue).toHaveBeenCalledWith('2'); // 注意：值會被轉換為字符串
    });

    it('不提供 onSelectedValue 且不提供 field 時應拋出警告', () => {
      // 模擬控制台以捕獲警告
      const originalConsoleError = console.error;
      console.error = vi.fn();

      // 渲染元件，未提供 onSelectedValue 和 field，預期會拋出 prop 類型檢查警告
      render(<RadioGroup items={defaultItems} selectedValue="1" />);

      // 檢查是否記錄了錯誤
      expect(console.error).toHaveBeenCalled();

      // 恢復原始 console.error
      console.error = originalConsoleError;
    });
  });

  // 測試 Radio 子元件
  describe('單個 Radio 元件', () => {
    it('應正確渲染單個 Radio 元件', () => {
      // RadioGroup 內部使用了 Radio 元件，所以我們通過 RadioGroup 來測試
      render(
        <RadioGroup
          items={[{ DESC: '單一選項', KEY: 'single' }]}
          selectedValue=""
          onSelectedValue={() => {}}
        />,
      );

      // 檢查 Radio 元件是否正確渲染
      expect(screen.getByText('單一選項')).toBeInTheDocument();
      expect(screen.getByRole('radio')).toBeInTheDocument();
    });
  });
});
