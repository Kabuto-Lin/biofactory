/**
 * @component DashboardCharts
 * @description 數據分析頁面的儀表板圖表元件
 *
 * 功能:
 * - 顯示三個圖表: 各項異常次數、各區域異常發生次數、各異常於不同區域次數(堆疊)
 * - 所有圖表為直式長條圖
 * - 顏色配置依照 API 規格
 *
 * @param {Object} filters - 篩選條件 { timeRange, eventType, area }
 *
 * @example
 * <DashboardCharts filters={{ timeRange: '24', eventType: '', area: '' }} />
 */
import React from 'react';
import PropTypes from 'prop-types';
import { Bar } from 'react-chartjs-2';
import { COMMON_OPTIONS } from '../../utils/chartConfig';

const DashboardCharts = ({ data, loading }) => {
  const { eventCount = [], locationCount = [], locationEventCount = [] } = data;

  if (loading) {
    return <div className="text-center py-10 text-ink-soft">載入中...</div>;
  }

  // 檢查是否有資料
  if (eventCount.length === 0 && locationCount.length === 0 && locationEventCount.length === 0) {
    return <div className="text-center py-10 text-ink-soft">暫無資料</div>;
  }

  // Chart 1: 各項異常次數
  const chart1Data = {
    labels: eventCount.map((item) => item.ALERTTYPENAME || ''),
    datasets: [
      {
        data: eventCount.map((item) => item.ALERTCOUNT || 0),
        backgroundColor: eventCount.map((item) => item.ALERTTYPECOLOR || '#ccc'), // API 直接回傳 Hex Code
        borderRadius: 4,
      },
    ],
  };

  // Chart 2: 各區域異常發生次數
  const chart2Data = {
    labels: locationCount.map((item) => item.CAMLOCATION || ''),
    datasets: [
      {
        data: locationCount.map((item) => item.ALERTCOUNT || 0),
        backgroundColor: locationCount.map((item) => item.COLOR || '#ccc'), // API 回傳 COLOR
        borderRadius: 4,
      },
    ],
  };

  // Chart 3: 各異常於不同區域次數 (堆疊)
  // 資料結構: [{ CAMLOCATION, detail: [{ ALERTTYPENAME, ALERTTYPECOLOR, CAMLOCATION, sort }] }]

  // 1. 取得所有區域 (X軸)
  const locations = locationEventCount.map((item) => item.CAMLOCATION);

  // 2. 取得所有異常類型 (Datasets)
  const allAlertTypes = new Set();
  const alertTypeColors = {}; // 紀錄顏色

  locationEventCount.forEach((locationItem) => {
    if (locationItem.DETAIL) {
      locationItem.DETAIL.forEach((detailItem) => {
        allAlertTypes.add(detailItem.ALERTTYPENAME);
        alertTypeColors[detailItem.ALERTTYPENAME] = detailItem.ALERTTYPECOLOR;
      });
    }
  });

  const alertTypes = Array.from(allAlertTypes);

  const chart3Data = {
    labels: locations,
    datasets: alertTypes.map((typeName) => {
      return {
        label: typeName,
        data: locations.map((loc) => {
          // 找到該區域的資料
          const locationData = locationEventCount.find((item) => item.CAMLOCATION === loc);
          if (!locationData || !locationData.DETAIL) return 0;

          // 找到該異常類型的數量
          const detailItem = locationData.DETAIL.find((d) => d.ALERTTYPENAME === typeName);
          return detailItem ? detailItem.ALERTCOUNT : 0;
        }),
        backgroundColor: alertTypeColors[typeName] || '#ccc',
      };
    }),
  };

  // 圖表配置 - 直式長條圖
  const verticalBarOptions = {
    ...COMMON_OPTIONS,
    plugins: {
      ...COMMON_OPTIONS.plugins,
      legend: {
        display: false,
      },
    },
  };

  const stackedOptions = {
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

  return (
    <div className="flex flex-col lg:flex-row gap-6 mb-6">
      {/* Chart 1: 各項異常次數 */}
      <ChartCard title="各項異常次數">
        {eventCount.length > 0 ? (
          <Bar data={chart1Data} options={verticalBarOptions} />
        ) : (
          <div className="flex items-center justify-center h-full text-ink-soft">暫無數據</div>
        )}
      </ChartCard>

      {/* Chart 2: 各區域異常發生次數 */}
      <ChartCard title="各區域異常發生次數">
        {locationCount.length > 0 ? (
          <Bar data={chart2Data} options={verticalBarOptions} />
        ) : (
          <div className="flex items-center justify-center h-full text-ink-soft">暫無數據</div>
        )}
      </ChartCard>

      {/* Chart 3: 各異常於不同區域次數（堆疊） */}
      <ChartCard title="各異常於不同區域次數（堆疊）">
        {locationEventCount.length > 0 && chart3Data.datasets.length > 0 ? (
          <Bar data={chart3Data} options={stackedOptions} />
        ) : (
          <div className="flex items-center justify-center h-full text-ink-soft">暫無數據</div>
        )}
      </ChartCard>
    </div>
  );
};

/**
 * 圖表卡片容器元件
 */
const ChartCard = ({ title, children }) => (
  <div className="bg-white border border-border rounded-md shadow-soft p-3.5 w-full lg:min-w-[320px] lg:flex-1 lg:max-w-[430px]">
    <h4 className="font-black text-ink-soft mb-2">{title}</h4>
    <div className="h-[200px] relative">{children}</div>
  </div>
);

ChartCard.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};

DashboardCharts.propTypes = {
  data: PropTypes.shape({
    eventCount: PropTypes.array,
    locationCount: PropTypes.array,
    locationEventCount: PropTypes.array,
  }).isRequired,
  loading: PropTypes.bool,
};

export default DashboardCharts;
