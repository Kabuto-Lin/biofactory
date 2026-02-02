import { render, screen } from '@testing-library/react';
import Label from '../../src/components/Label';

describe('Label Component', () => {
  // 測試基本渲染
  describe('基本渲染', () => {
    it('應該正確渲染標籤文字', () => {
      render(<Label id="test" label="測試標籤" />);
      expect(screen.getByText('測試標籤')).toBeInTheDocument();
    });

    it('應該正確關聯輸入元素', () => {
      render(
        <Label id="test" label="測試標籤">
          <input id="test" />
        </Label>,
      );
      const label = screen.getByText('測試標籤');
      expect(label).toHaveAttribute('for', 'test');
    });
  });

  // 測試必填提示
  describe('必填提示', () => {
    it('當必填且未填值時應該顯示紅色提示和錯誤文字', () => {
      render(<Label id="test" label="必填標籤" required value="" text="此欄位為必填" />);
      const label = screen.getByText('必填標籤');
      expect(label).toHaveClass('text-red-500');
      expect(
        screen.getByText((content, element) => {
          const hasText = (node) => node.textContent === '必填標籤此欄位為必填';
          const nodeHasText = hasText(element);
          const childrenDontHaveText = Array.from(element.children || []).every(
            (child) => !hasText(child),
          );
          return nodeHasText && childrenDontHaveText;
        }),
      ).toBeInTheDocument(); // 使用回調函數匹配完整文字
    });

    it('當必填且有值時不應該顯示紅色提示或錯誤文字', () => {
      render(<Label id="test" label="必填標籤" required value="已填值" text="此欄位為必填" />);
      const label = screen.getByText('必填標籤');
      expect(label).not.toHaveClass('text-red-500');
      expect(
        screen.queryByText((content, element) => {
          const hasText = (node) => node.textContent === '必填標籤此欄位為必填';
          const nodeHasText = hasText(element);
          const childrenDontHaveText = Array.from(element.children || []).every(
            (child) => !hasText(child),
          );
          return nodeHasText && childrenDontHaveText;
        }),
      ).not.toBeInTheDocument(); // 確保提示不存在
    });
  });

  // 測試邊界情況
  describe('邊界情況', () => {
    it('當未提供任何 props 時應該不報錯', () => {
      expect(() => render(<Label />)).not.toThrow();
    });

    it('當未提供子元素時應該正確渲染標籤', () => {
      render(<Label id="test" label="無子元素標籤" />);
      expect(screen.getByText('無子元素標籤')).toBeInTheDocument();
    });
  });

  // 測試自定義樣式
  describe('自定義樣式', () => {
    it('應該正確應用自定義 className', () => {
      render(<Label id="test" label="自定義樣式" className="custom-class" />);
      const label = screen.getByText('自定義樣式');
      expect(label).toHaveClass('custom-class');
    });
  });

  // 測試與子元素的整合
  describe('與子元素整合', () => {
    it('應該正確渲染子元素並關聯標籤', () => {
      render(
        <Label id="test" label="整合測試">
          <input id="test" />
        </Label>,
      );
      const inputElement = screen.getByLabelText('整合測試');
      expect(inputElement).toBeInTheDocument();
      expect(inputElement).toHaveAttribute('id', 'test');
    });
  });
});
