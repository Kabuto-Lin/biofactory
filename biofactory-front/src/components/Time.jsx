import { useEffect, useState } from 'react';

/**
 * Time
 * @description 顯示即時時間的 React 函數元件，每秒自動更新。
 * @returns {JSX.Element} 目前時間的字串，格式為 yyyy/MM/dd HH:mm:ss
 *
 * @example
 * <Time />
 * 輸出: 2025/05/21 12:34:56 (會隨時間自動變動)
 */

const Time = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  // 每秒更新 currentTime 狀態
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const year = currentTime.getFullYear();
  const month = String(currentTime.getMonth() + 1).padStart(2, '0');
  const day = String(currentTime.getDate()).padStart(2, '0');
  const hours = String(currentTime.getHours()).padStart(2, '0');
  const minutes = String(currentTime.getMinutes()).padStart(2, '0');
  const seconds = String(currentTime.getSeconds()).padStart(2, '0');
  // 組合成 yyyy/MM/dd HH:mm:ss 格式
  const formattedTime = `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`;
  return <div className="h-full m-auto text-white text-md">{formattedTime}</div>;
};

export default Time;
