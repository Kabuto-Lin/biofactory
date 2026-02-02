import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { useForm } from 'react-hook-form';
import { COMMON_OPTIONS, AREA_COLORS, ALERT_TYPE_COLORS } from '../../utils/chartConfig';
import Table from '../../components/Table';
import Swal from 'sweetalert2';

const TrendChart = ({ trendData, trendLoading, onSearch, opData }) => {
  const { alerttypeQL, camlocationQL } = opData; // 解構出所需的下拉選單資料

  // 時間軸查詢的獨立狀態
  const [trendFilters, setTrendFilters] = useState({
    area: '',
    eventType: '',
    startDate: getDefaultStartDate(),
    endDate: getDefaultEndDate(),
  });

  const [viewMode, setViewMode] = useState('location'); // 'location' | 'type'

  // Table 資料
  const methods = useForm({
    defaultValues: {
      tableData: [],
    },
  });

  // Table 欄位設定
  const [columns, setColumns] = useState([
    { field: 'CAMLOCATION', header: '區域', css: 'min-w-[100px]', sortable: true },
    {
      field: 'ALERTTYPENAME',
      header: '異常',
      width: '150px',
      sortable: true,
      template: 'custom',
      customRender: (row) => {
        return <span style={{ color: row.ALERTTYPECOLOR }}>{row.ALERTTYPENAME}</span>;
      },
    },
    { field: 'ALERTCOUNT', header: '次數', css: 'min-w-[100px]', sortable: true },
  ]);

  // 初始查詢
  useEffect(() => {
    handleSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 空依賴陣列，只在掛載時執行一次

  // 當 trendData 更新時，更新 Table
  useEffect(() => {
    if (trendData && trendData.list) {
      methods.reset({ tableData: trendData.list });
    }
  }, [trendData]);

  // 查詢按鈕點擊事件
  const handleSearch = () => {
    const params = {
      alerttype: trendFilters.eventType,
      camlocation: trendFilters.area,
      startDate: trendFilters.startDate,
      endDate: trendFilters.endDate,
    };

    // 呼叫父組件的 onSearch 函數
    onSearch(params);
  };

  // 表單欄位變更
  const handleFilterChange = (key, value) => {
    setTrendFilters({ ...trendFilters, [key]: value });
  };

  // 驗證日期範圍(最長7天)
  const validateDateRange = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7;
  };

  // 查詢前驗證
  const handleSearchClick = () => {
    if (!validateDateRange(trendFilters.startDate, trendFilters.endDate)) {
      Swal.fire({
        icon: 'warning',
        title: '查詢期間最長只能7天',
        confirmButtonText: '確定',
        confirmButtonColor: '#2563eb',
      });
      return;
    }
    handleSearch();
  };

  // 整理圖表資料
  const prepareChartData = () => {
    const chartData = trendData?.timeline || [];

    if (!chartData || chartData.length === 0) {
      return {
        labels: [],
        datasets: [],
      };
    }

    // X軸: 日期
    const labels = chartData.map((item) => item.ALERT_DAY);

    let datasets = [];

    if (viewMode === 'location') {
      // 模式 A: 根據區域 (Locations)
      const allLocations = new Set();
      chartData.forEach((day) => {
        if (day.LOCATIONS) {
          day.LOCATIONS.forEach((loc) => allLocations.add(loc.CAMLOCATION));
        }
      });
      const locations = Array.from(allLocations).sort();

      datasets = locations.map((locName) => {
        const dataPoints = chartData.map((day) => {
          const locItems = day.LOCATIONS
            ? day.LOCATIONS.filter((l) => l.CAMLOCATION === locName)
            : [];
          return locItems.reduce((sum, item) => sum + item.ALERTCOUNT, 0);
        });

        return {
          label: locName,
          data: dataPoints,
          backgroundColor: AREA_COLORS[locName] || '#999',
          borderRadius: 4,
        };
      });
    } else {
      // 模式 B: 根據異常型態 (Typecount)
      const allTypes = new Set();
      chartData.forEach((day) => {
        if (day.TYPECOUNT) {
          day.TYPECOUNT.forEach((t) => {
            if (t.ALERTTYPENAME) allTypes.add(t.ALERTTYPENAME);
          });
        }
      });
      const types = Array.from(allTypes).sort();

      datasets = types.map((typeName) => {
        const dataPoints = chartData.map((day) => {
          const typeItems = day.TYPECOUNT
            ? day.TYPECOUNT.filter((t) => t.ALERTTYPENAME === typeName)
            : [];
          return typeItems.reduce((sum, item) => sum + item.ALERTCOUNT, 0);
        });

        // 從傳入的 alerttypeQL 找到對應的 KEY 來取得顏色
        const typeOption = alerttypeQL.find((opt) => opt.DESC === typeName);
        const typeKey = typeOption ? typeOption.KEY : null;
        const color = typeKey ? ALERT_TYPE_COLORS[typeKey] : '#999';

        return {
          label: typeName,
          data: dataPoints,
          backgroundColor: color,
          borderRadius: 4,
        };
      });
    }

    return {
      labels,
      datasets,
    };
  };

  const data = prepareChartData();

  // 圖表配置
  const chartOptions = {
    ...COMMON_OPTIONS,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
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
          stepSize: 1,
        },
      },
    },
  };

  return (
    <div className="bg-white border border-border rounded-md shadow-md p-6 w-full">
      {/* 標題與查詢表單 */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-4 gap-4">
        <h4 className="font-black text-ink-soft text-lg m-0">異常趨勢時間軸</h4>

        {/* 顯示模式切換 */}
        <div className="flex bg-gray-100 rounded-md p-1">
          <button
            onClick={() => setViewMode('location')}
            className={`px-3 py-1  rounded-sm transition-colors ${
              viewMode === 'location'
                ? 'bg-white text-primary shadow-sm font-bold'
                : 'text-ink-soft hover:text-ink'
            }`}
          >
            依區域
          </button>
          <button
            onClick={() => setViewMode('type')}
            className={`px-3 py-1  rounded-sm transition-colors ${
              viewMode === 'type'
                ? 'bg-white text-primary shadow-sm font-bold'
                : 'text-ink-soft hover:text-ink'
            }`}
          >
            依異常型態
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-end mb-4 gap-4">
        {/* 查詢表單 */}
        <div className="flex flex-col lg:flex-row gap-3 lg:gap-4 lg:items-end flex-wrap">
          {/* 起始日期 */}
          <div className="flex items-center gap-2">
            <label className=" font-bold text-ink whitespace-nowrap">起始日期：</label>
            <input
              type="date"
              value={trendFilters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
              className=" bg-white text-ink border border-border rounded-sm px-2 py-1 flex-1 lg:flex-none"
            />
          </div>

          {/* 結束日期 */}
          <div className="flex items-center gap-2">
            <label className="font-bold text-ink whitespace-nowrap">結束日期：</label>
            <input
              type="date"
              value={trendFilters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
              className=" bg-white text-ink border border-border rounded-sm px-2 py-1 flex-1 lg:flex-none"
            />
          </div>

          {/* 區域下拉 */}
          <div className="flex items-center gap-2">
            <label className=" font-bold text-ink whitespace-nowrap">區域：</label>
            <select
              value={trendFilters.area}
              onChange={(e) => handleFilterChange('area', e.target.value)}
              className=" bg-white text-ink border border-border rounded-sm px-2 py-1 min-w-[100px] flex-1 lg:flex-none"
            >
              <option value="">全部</option>
              {camlocationQL.map((option) => (
                <option key={option.KEY} value={option.KEY}>
                  {option.DESC}
                </option>
              ))}
            </select>
          </div>

          {/* 異常型態下拉 */}
          <div className="flex items-center gap-2">
            <label className=" font-bold text-ink whitespace-nowrap">異常：</label>
            <select
              value={trendFilters.eventType}
              onChange={(e) => handleFilterChange('eventType', e.target.value)}
              className=" bg-white text-ink border border-border rounded-sm px-2 py-1 min-w-[120px] flex-1 lg:flex-none"
            >
              <option value="">全部</option>
              {alerttypeQL.map((option) => (
                <option key={option.KEY} value={option.KEY}>
                  {option.DESC}
                </option>
              ))}
            </select>
          </div>

          {/* 查詢按鈕 */}
          <button
            onClick={handleSearchClick}
            className="bg-primary hover:bg-primary-dark text-white font-bold px-4 py-1.5 rounded-sm transition-colors w-full lg:w-auto"
          >
            查詢
          </button>
        </div>
      </div>

      {/* 圖表與列表容器 - lg 以上並排 */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* 圖表區域 - lg:w-2/3 */}
        <div className="flex-3 lg:w-3/4">
          <div className="min-h-[500px] w-full">
            {trendLoading ? (
              <div className="flex items-center justify-center h-full text-ink-soft">載入中...</div>
            ) : data.labels.length > 0 ? (
              <Bar data={data} options={chartOptions} />
            ) : (
              <div className="flex items-center justify-center h-full text-ink-soft">暫無數據</div>
            )}
          </div>
        </div>

        {/* 列表表格區域 - lg:w-1/3 */}
        <div className="flex-1 lg:w-1/4">
          <Table
            name="tableData"
            columns={columns}
            setColumns={setColumns}
            methods={methods}
            isShowDefaultButton={false}
            showPagination={false}
          />
        </div>
      </div>
    </div>
  );
};

/**
 * 取得預設起始日期 (昨天)
 */
function getDefaultStartDate() {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  return date.toISOString().split('T')[0];
}

/**
 * 取得預設結束日期 (今天)
 */
function getDefaultEndDate() {
  const date = new Date();
  return date.toISOString().split('T')[0];
}

export default TrendChart;
