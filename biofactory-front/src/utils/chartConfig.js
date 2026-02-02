/**
 * @file chartConfig.js
 * @description Chart.js 圖表配置與顏色映射
 */
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
);

/**
 * 通用圖表配置
 */
export const COMMON_OPTIONS = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
  },
  scales: {
    x: {
      grid: {
        display: false,
      },
    },
    y: {
      beginAtZero: true,
    },
  },
};

/**
 * 區域顏色映射
 * 用於時間軸圖表的區域分組顏色
 */
export const AREA_COLORS = {
  '1F': '#1E40AF', // 深藍
  '1F(北)': '#60A5FA', // 淺藍
  '1F(西)': '#34D399', // 薄荷綠
  '1F(東)': '#FB923C', // 橘色
  '1F(南)': '#A855F7', // 紫色
  '2F': '#EC4899', // 粉紅
  B1: '#FBBF24', // 黃色
  B2: '#10B981', // 綠色
  室外: '#6B7280', // 灰色
  鍋爐室: '#EF4444', // 紅色
  槽內: '#06b6d4', // cyan
};

/**
 * 異常類型顏色映射 (根據 API 規格)
 * KEY: API 返回的異常類型 KEY
 * VALUE: Hex 顏色代碼
 */
export const ALERT_TYPE_COLORS = {
  fire: '#ef4444', // 火焰警報 - red
  e_misconduct: '#ec4899', // 異常行為 - pink
  smoke: '#06b6d4', // 煙霧警報 - blue
  PPE: '#22c55e', // 安全裝備缺失 - green
  e_fence: '#fb923c', // 電子圍籬入侵 - orange
};

/**
 * 取得直式長條圖配置
 * @returns {Object} Chart.js options
 */
export const getBarChartOptions = () => {
  return {
    ...COMMON_OPTIONS,
    plugins: {
      ...COMMON_OPTIONS.plugins,
      legend: {
        display: false,
      },
    },
  };
};

/**
 * 取得直式堆疊長條圖配置
 * @returns {Object} Chart.js options
 */
export const getStackedBarOptions = () => {
  return {
    ...COMMON_OPTIONS,
    scales: {
      x: {
        stacked: true,
        grid: {
          display: false,
        },
      },
      y: {
        stacked: true,
        beginAtZero: true,
      },
    },
    plugins: {
      ...COMMON_OPTIONS.plugins,
      legend: {
        display: true,
        position: 'top',
        labels: {
          boxWidth: 12,
          padding: 8,
          font: {
            size: 11,
          },
        },
      },
    },
  };
};

/**
 * 取得時間軸柱狀圖配置
 * @returns {Object} Chart.js options
 */
export const getTimelineBarOptions = () => {
  return {
    ...COMMON_OPTIONS,
    maintainAspectRatio: false,
    plugins: {
      ...COMMON_OPTIONS.plugins,
      legend: {
        display: true,
        position: 'top',
        labels: {
          boxWidth: 12,
          padding: 10,
          font: {
            size: 11,
          },
        },
      },
      tooltip: {
        callbacks: {
          // 自訂 tooltip 格式
          title: (context) => {
            return `時間: ${context[0].label}`;
          },
          label: (context) => {
            return `${context.dataset.label}: ${context.parsed.y} 次`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 10,
          },
          maxRotation: 45,
          minRotation: 45,
        },
      },
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1, // 確保 Y 軸是整數
        },
      },
    },
  };
};
