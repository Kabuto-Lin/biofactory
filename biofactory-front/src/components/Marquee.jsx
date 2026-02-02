/**
 * @component Marquee
 * @description 跑馬燈元件，支援自動輪播、滑鼠暫停、點擊事件。
 *
 * 主要功能：
 * - 自動每 5 秒輪播一次
 * - 滑鼠移入暫停、移出繼續
 * - 支援點擊事件
 *
 * @param {Array} data - 跑馬燈資料陣列，每筆需有 NEWS_NO, NEWS_DATE, NEWS_TITLE
 * @param {number} currentIndex - 當前顯示的索引
 * @param {Function} setCurrentIndex - 設定索引的函數
 * @param {Function} onClick - 點擊項目時的回調（可選）
 *
 * @returns {JSX.Element} 跑馬燈元件
 *
 * @example
 * <Marquee
 *   data={[{ NEWS_NO: 1, NEWS_DATE: '2025-05-21', NEWS_TITLE: '公告' }]}
 *   currentIndex={0}
 *   setCurrentIndex={setCurrentIndex}
 *   onClick={handleClick}
 * />
 */

function Marquee({ data, currentIndex, setCurrentIndex, onClick = () => {} }) {
  const [isPaused, setIsPaused] = useState(false); // 跑馬燈是否暫停轉動

  //跑馬燈鼠标事件：暂停/恢复
  const handleMouseEnter = () => setIsPaused(true);
  const handleMouseLeave = () => setIsPaused(false);

  // 跑馬燈轉動邏輯
  useEffect(() => {
    if (!isPaused) {
      const interval = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % data.length);
      }, 5000);

      return () => clearInterval(interval); // 清理定时器
    }
  }, [data.length, isPaused]);

  return (
    <div
      className="overflow-hidden h-6 relative w-[300px]"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      data-testid="marquee-container"
    >
      <div
        className="absolute transition-transform duration-1000 ease-in-out"
        style={{
          transform: `translateY(-${currentIndex * 50}%)`,
        }}
      >
        {data?.map((item) => (
          <div
            key={item.NEWS_NO}
            className="h-6 flex items-center text-[#ffd586] text-xl ml-4 cursor-pointer"
            onClick={onClick}
          >
            [{item.NEWS_DATE}] {item.NEWS_TITLE}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Marquee;
