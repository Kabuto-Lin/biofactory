import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import Marquee from '../../src/components/Marquee';
import { vi } from 'vitest';

describe('Marquee 組件', () => {
  // 測試：正確渲染跑馬燈內容
  it('正確渲染跑馬燈內容', () => {
    const mockData = [
      { NEWS_NO: 1, NEWS_DATE: '2023-01-01', NEWS_TITLE: '新聞標題1' },
      { NEWS_NO: 2, NEWS_DATE: '2023-01-02', NEWS_TITLE: '新聞標題2' },
    ];

    render(<Marquee data={mockData} currentIndex={0} setCurrentIndex={vi.fn()} />);

    expect(screen.getByText('[2023-01-01] 新聞標題1')).toBeInTheDocument();
    expect(screen.getByText('[2023-01-02] 新聞標題2')).toBeInTheDocument();
  });

  // 測試：跑馬燈自動滾動功能
  it('跑馬燈自動滾動功能', () => {
    vi.useFakeTimers();
    const mockData = [
      { NEWS_NO: 1, NEWS_DATE: '2023-01-01', NEWS_TITLE: '新聞標題1' },
      { NEWS_NO: 2, NEWS_DATE: '2023-01-02', NEWS_TITLE: '新聞標題2' },
    ];
    const setCurrentIndex = vi.fn();

    render(<Marquee data={mockData} currentIndex={0} setCurrentIndex={setCurrentIndex} />);

    act(() => {
      vi.advanceTimersByTime(5000); // 模擬 5 秒
    });

    // 驗證 setCurrentIndex 被調用
    expect(setCurrentIndex).toHaveBeenCalled();

    // 驗證 setCurrentIndex 的行為
    const updateFunction = setCurrentIndex.mock.calls[0][0]; // 獲取傳遞的函數
    const newIndex = updateFunction(0); // 執行函數，模擬 prevIndex = 0
    expect(newIndex).toBe(1); // 驗證結果

    vi.useRealTimers();
  });

  // 測試：鼠標懸停時暫停滾動
  it('鼠標懸停時暫停滾動', () => {
    vi.useFakeTimers();
    const mockData = [
      { NEWS_NO: 1, NEWS_DATE: '2023-01-01', NEWS_TITLE: '新聞標題1' },
      { NEWS_NO: 2, NEWS_DATE: '2023-01-02', NEWS_TITLE: '新聞標題2' },
    ];
    const setCurrentIndex = vi.fn();

    render(<Marquee data={mockData} currentIndex={0} setCurrentIndex={setCurrentIndex} />);
    const marqueeElement = screen.getByTestId('marquee-container'); // 使用 getByTestId

    fireEvent.mouseEnter(marqueeElement); // 模擬鼠標懸停
    act(() => {
      vi.advanceTimersByTime(5000); // 模擬 5 秒
    });

    expect(setCurrentIndex).not.toHaveBeenCalled(); // 驗證滾動暫停
    vi.useRealTimers();
  });

  // 測試：點擊跑馬燈項目觸發 onClick
  it('點擊跑馬燈項目觸發 onClick', () => {
    const mockData = [{ NEWS_NO: 1, NEWS_DATE: '2023-01-01', NEWS_TITLE: '新聞標題1' }];
    const handleClick = vi.fn();

    render(
      <Marquee data={mockData} currentIndex={0} setCurrentIndex={vi.fn()} onClick={handleClick} />,
    );

    fireEvent.click(screen.getByText('[2023-01-01] 新聞標題1'));
    expect(handleClick).toHaveBeenCalled(); // 驗證點擊事件
  });

  // 測試：當數據為空時不應崩潰
  it('當數據為空時不應崩潰', () => {
    render(<Marquee data={[]} currentIndex={0} setCurrentIndex={vi.fn()} />);
    expect(screen.queryByText(/\[.*\]/)).toBeNull(); // 驗證無內容渲染
  });
});
