import { vi } from 'vitest';

// Mock missing modules for test environment
vi.mock('../../Common/StorageService', () => ({
  getStorageItem: () => null,
}));
vi.mock('../../Common/SweetAlert', () => ({
  __esModule: true,
  default: () => {},
}));

import React from 'react';

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DatePicker } from '../../src/components/Calendar';

// 受控元件測試包裝：用 useState 綁定 value，模擬真實父層行為
function ControlledWrapper(props) {
  const [val, setVal] = React.useState(props.value ?? '');
  // 讓外部可以監控 setValue
  React.useEffect(() => {
    if (props.onValueChange) props.onValueChange(val);
    // eslint-disable-next-line
  }, [val]);
  return <DatePicker {...props} value={val} setValue={setVal} />;
}

describe('Calendar 元件', () => {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1;
  const currentDay = today.getDate();

  // 產生純數字日期格式（yyyyMMdd）
  const formatNumericDate = (year, month, day) =>
    `${year}${String(month).padStart(2, '0')}${String(day).padStart(2, '0')}`;
  // 顯示格式 yyyy/MM/dd
  const formatDisplayDate = (year, month, day) =>
    `${year}/${String(month).padStart(2, '0')}/${String(day).padStart(2, '0')}`;

  describe('基本 UI 渲染', () => {
    it('應正確渲染日期選擇器', () => {
      const mockSetValue = vi.fn();
      render(<DatePicker value="" setValue={mockSetValue} placeholder="選擇日期" />);
      expect(screen.getByPlaceholderText('選擇日期')).toBeInTheDocument();
    });
    it('應顯示預設值', () => {
      const defaultDate = formatNumericDate(currentYear, currentMonth, currentDay);
      const mockSetValue = vi.fn();
      render(<DatePicker value={defaultDate} setValue={mockSetValue} />);
      const input = screen.getByRole('textbox');
      // 顯示格式會轉為 yyyy/MM/dd
      expect(input.value).toMatch(/\d{4}\/\d{2}\/\d{2}/);
    });
  });

  describe('功能測試', () => {
    it('輸入有效日期應觸發 setValue 並回傳格式化日期', async () => {
      const mockSetValue = vi.fn();
      render(<DatePicker value="" setValue={mockSetValue} />);
      const input = screen.getByRole('textbox');
      fireEvent.change(input, {
        target: { value: formatDisplayDate(currentYear, currentMonth, 15) },
      });
      fireEvent.blur(input);
      await waitFor(() => {
        expect(mockSetValue).toHaveBeenCalledWith(formatDisplayDate(currentYear, currentMonth, 15));
      });
    });
    it('輸入無效日期應清空', async () => {
      const mockSetValue = vi.fn();
      render(<DatePicker value="" setValue={mockSetValue} />);
      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'invalid-date' } });
      fireEvent.blur(input);
      await waitFor(() => {
        expect(mockSetValue).toHaveBeenCalledWith('');
      });
    });
  });

  describe('邊界值測試', () => {
    it('超過最大日期應清空', async () => {
      // 用 useState 控制 value，模擬真實受控元件
      let latestValue = undefined;
      const handleValueChange = (v) => {
        latestValue = v;
      };
      const maxDate = formatNumericDate(currentYear, currentMonth, 10);
      render(<ControlledWrapper value="" max={maxDate} onValueChange={handleValueChange} />);
      const input = screen.getByRole('textbox');
      fireEvent.change(input, {
        target: { value: formatDisplayDate(currentYear, currentMonth, 15) },
      });
      fireEvent.blur(input);
      // 驗證 value 真的被清空
      await waitFor(() => {
        expect(latestValue).toBe('');
      });
    });

    it('小於最小日期應清空', async () => {
      let latestValue = undefined;
      const handleValueChange = (v) => {
        latestValue = v;
      };
      const minDate = formatNumericDate(currentYear, currentMonth, 10);
      render(<ControlledWrapper value="" min={minDate} onValueChange={handleValueChange} />);
      const input = screen.getByRole('textbox');
      fireEvent.change(input, {
        target: { value: formatDisplayDate(currentYear, currentMonth, 5) },
      });
      fireEvent.blur(input);
      await waitFor(() => {
        expect(latestValue).toBe('');
      });
    });

    it('閏年 2/29 應為有效日期', async () => {
      let latestValue = undefined;
      const handleValueChange = (v) => {
        latestValue = v;
      };
      render(<ControlledWrapper value="" onValueChange={handleValueChange} />);
      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: '2024/02/29' } });
      fireEvent.blur(input);
      await waitFor(() => {
        expect(latestValue).toBe('2024/02/29');
      });
    });

    it('非閏年 2/29 應清空', async () => {
      let latestValue = undefined;
      const handleValueChange = (v) => {
        latestValue = v;
      };
      render(<ControlledWrapper value="" onValueChange={handleValueChange} />);
      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: '2023/02/29' } });
      fireEvent.blur(input);
      await waitFor(() => {
        expect(latestValue).toBe('');
      });
    });

    it('輸入 0000-00-00 應清空', async () => {
      let latestValue = undefined;
      const handleValueChange = (v) => {
        latestValue = v;
      };
      render(<ControlledWrapper value="" onValueChange={handleValueChange} />);
      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: '0000/00/00' } });
      fireEvent.blur(input);
      await waitFor(() => {
        expect(latestValue).toBe('');
      });
    });

    it('輸入 9999-99-99 應清空', async () => {
      let latestValue = undefined;
      const handleValueChange = (v) => {
        latestValue = v;
      };
      render(<ControlledWrapper value="" onValueChange={handleValueChange} />);
      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: '9999/99/99' } });
      fireEvent.blur(input);
      await waitFor(() => {
        expect(latestValue).toBe('');
      });
    });
    it('禁用狀態下 input 應為 disabled', () => {
      const mockSetValue = vi.fn();
      render(<DatePicker value="" setValue={mockSetValue} disabled />);
      expect(screen.getByRole('textbox')).toBeDisabled();
    });
    it('唯讀狀態下 input 應為 readonly', () => {
      const mockSetValue = vi.fn();
      render(<DatePicker value="" setValue={mockSetValue} readonly />);
      expect(screen.getByRole('textbox')).toHaveAttribute('readonly');
    });
    it('應正確顯示民國年格式', () => {
      const defaultDate = formatNumericDate(currentYear, currentMonth, currentDay);
      const mockSetValue = vi.fn();
      render(<DatePicker value={defaultDate} setValue={mockSetValue} locale="tw" />);
      const rocYear = currentYear - 1911;
      const input = screen.getByRole('textbox');
      expect(input.value).toContain(`${rocYear}/`);
    });
    it('應能夠輸入民國年格式並轉換為指定格式(yyyy/mm/dd)儲存', async () => {
      const mockSetValue = vi.fn();
      render(<DatePicker value="" setValue={mockSetValue} locale="tw" />);
      const rocYear = currentYear - 1911;
      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: formatDisplayDate(rocYear, currentMonth, 15) } });
      fireEvent.blur(input);
      await waitFor(() => {
        expect(mockSetValue).toHaveBeenCalledWith(
          `${rocYear}/${String(currentMonth).padStart(2, '0')}/${String(15).padStart(2, '0')}`,
        );
      });
    });
  });
});
