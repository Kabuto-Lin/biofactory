import { render, screen, act } from '@testing-library/react';
import Time from '../../src/components/Time';
import { vi } from 'vitest';

const fixedDate = new Date('2025-05-21T12:34:56');

describe('Time 元件', () => {
  beforeAll(() => {
    vi.useFakeTimers();
    vi.setSystemTime(fixedDate);
  });
  afterAll(() => {
    vi.useRealTimers();
  });

  describe('基本 UI 渲染', () => {
    it('應正確渲染當前時間', () => {
      render(<Time />);
      expect(screen.getByText('2025/05/21 12:34:56')).toBeInTheDocument();
    });
  });

  describe('功能測試', () => {
    it('每秒會自動更新時間', () => {
      render(<Time />);
      expect(screen.getByText('2025/05/21 12:34:56')).toBeInTheDocument();
      act(() => {
        vi.advanceTimersByTime(1000);
      });
      expect(screen.getByText('2025/05/21 12:34:57')).toBeInTheDocument();
    });
  });

  describe('邊界值測試', () => {
    it('23:59:59 跳到 00:00:00（跨日）', () => {
      const date = new Date('2025-05-21T23:59:59');
      vi.setSystemTime(date);
      render(<Time />);
      expect(screen.getByText('2025/05/21 23:59:59')).toBeInTheDocument();
      act(() => {
        vi.advanceTimersByTime(1000);
      });
      expect(screen.getByText('2025/05/22 00:00:00')).toBeInTheDocument();
    });

    it('12/31 23:59:59 跳到 01/01 00:00:00（跨年）', () => {
      const date = new Date('2025-12-31T23:59:59');
      vi.setSystemTime(date);
      render(<Time />);
      expect(screen.getByText('2025/12/31 23:59:59')).toBeInTheDocument();
      act(() => {
        vi.advanceTimersByTime(1000);
      });
      expect(screen.getByText('2026/01/01 00:00:00')).toBeInTheDocument();
    });

    it('閏年 2/28 23:59:59 跳到 2/29 00:00:00', () => {
      const date = new Date('2024-02-28T23:59:59');
      vi.setSystemTime(date);
      render(<Time />);
      expect(screen.getByText('2024/02/28 23:59:59')).toBeInTheDocument();
      act(() => {
        vi.advanceTimersByTime(1000);
      });
      expect(screen.getByText('2024/02/29 00:00:00')).toBeInTheDocument();
    });

    it('單位補零（2025/01/01 01:01:01）', () => {
      const date = new Date('2025-01-01T01:01:01');
      vi.setSystemTime(date);
      render(<Time />);
      expect(screen.getByText('2025/01/01 01:01:01')).toBeInTheDocument();
    });
  });
});
