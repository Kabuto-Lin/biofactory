/**
 * @page snb002Q
 * @description 數據分析頁面 (snb002Q)
 *
 * 功能:
 * - 提供三個下拉選單篩選條件 (時間區間、異常型態、區域)
 * - 下拉選單變更時，自動觸發查詢，更新所有圖表
 * - 顯示三個儀表板圖表
 * - 顯示時間軸趨勢圖表 (獨立查詢)
 * - 頁面載入時，執行初始查詢
 *
 * @example
 * <snb002Q />
 */
import React, { useState, useEffect } from 'react';
import DashboardCharts from '../../components/analytics/DashboardCharts';
import TrendChart from '../../components/analytics/TrendChart';
import {
  getInitData,
  getEventCount,
  getCamLocationCount,
  getCamLocationEventCount,
  getTimeline,
  getTimelineList,
} from '../../services/api';

const Snb002Q = () => {
  // 下拉選單資料
  const [opData, setOpData] = useState({
    timeQL: [],
    alerttypeQL: [],
    camlocationQL: [],
  });

  // 上方三個下拉選單的篩選條件
  const [filters, setFilters] = useState({
    timeRange: '24', // 預設: 近24小時
    eventType: '', // 預設: 全部
    area: '', // 預設: 全部
  });

  // 儀表板資料狀態
  const [dashboardData, setDashboardData] = useState({
    eventCount: [],
    locationCount: [],
    locationEventCount: [],
  });

  const [loading, setLoading] = useState(false);

  // 趨勢圖表資料狀態
  const [trendData, setTrendData] = useState({
    timeline: [],
    list: [],
  });

  const [trendLoading, setTrendLoading] = useState(false);

  // 初始化：取得下拉選單資料
  useEffect(() => {
    const fetchInitData = async () => {
      try {
        const response = await getInitData();
        if (response && response.opData) {
          setOpData(response.opData);
        }
      } catch (error) {
        console.error('取得下拉選單資料失敗:', error);
      }
    };
    fetchInitData();
  }, []);

  // 取得儀表板資料
  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const params = {
        time_range: filters.timeRange,
        alerttype: filters.eventType,
        camlocation: filters.area,
      };

      // 並行呼叫三個 API
      const [eventCountRes, locationCountRes, locationEventRes] = await Promise.all([
        getEventCount(params),
        getCamLocationCount(params),
        getCamLocationEventCount(params),
      ]);

      // 正規化資料結構
      const normalize = (res) => {
        // 如果有 data 屬性且是陣列，返回 data (API 資料)
        if (res && res.data && Array.isArray(res.data)) return res.data;

        // 檢查是否是 API 錯誤
        if (res && res.res_code && res.res_code !== 200) {
          console.error('API Error:', res.res_msg);
          return [];
        }

        console.warn('Unknown data format:', res);
        return [];
      };

      const normalizedData = {
        eventCount: normalize(eventCountRes),
        locationCount: normalize(locationCountRes),
        locationEventCount: normalize(locationEventRes),
      };

      setDashboardData(normalizedData);
    } catch (error) {
      console.error('取得儀表板資料失敗:', error);
    } finally {
      setLoading(false);
    }
  };

  // 頁面初始載入與篩選條件變更時執行查詢
  useEffect(() => {
    fetchDashboardData();
  }, [filters]);

  // 取得趨勢圖表資料（由 TrendChart 呼叫）
  const fetchTrendData = async (params) => {
    setTrendLoading(true);
    try {
      // 並行呼叫兩個 API
      const [timelineRes, listRes] = await Promise.all([
        getTimeline(params),
        getTimelineList(params),
      ]);

      // 正規化資料結構
      const normalize = (res) => {
        // 如果有 data 屬性且是陣列，返回 data (API 資料)
        if (res && res.data) return res.data;

        // 檢查是否是 API 錯誤
        if (res && res.res_code && res.res_code !== 200) {
          console.error('API Error:', res.res_msg);
          return [];
        }

        console.warn('Unknown data format:', res);
        return [];
      };

      const normalizedTimeline = normalize(timelineRes);
      const normalizedList = normalize(listRes);

      // Timeline 資料需要額外處理（取出 Timeline 陣列）
      const timelineData = normalizedTimeline.TIMELINE;

      setTrendData({
        timeline: timelineData,
        list: normalizedList,
      });
    } catch (error) {
      console.error('取得趨勢資料失敗:', error);
      setTrendData({
        timeline: [],
        list: [],
      });
    } finally {
      setTrendLoading(false);
    }
  };

  // 下拉選單變更事件
  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value });
  };

  return (
    <div className="w-full max-w-[1530px] mx-auto mt-4 p-3 lg:p-6 bg-panel border border-border rounded-lg shadow-md">
      
      {/* 上方查詢條件 */}
      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 lg:items-end mb-6">
        {/* 時間區間下拉 */}
        <div className="flex items-center gap-2">
          <label className="font-extrabold text-ink whitespace-nowrap">時間區間：</label>
          <select
            value={filters.timeRange}
            onChange={(e) => handleFilterChange('timeRange', e.target.value)}
            className="text-[1.02rem] bg-white text-ink border border-border rounded-sm px-3 py-1.5 min-w-[120px] flex-1 lg:flex-none"
          >
            {opData?.timeQL?.map((option) => (
              <option key={option.KEY} value={option.KEY}>
                {option.DESC}
              </option>
            ))}
          </select>
        </div>

        {/* 區域下拉 */}
        <div className="flex items-center gap-2">
          <label className="font-extrabold text-ink whitespace-nowrap">區域：</label>
          <select
            value={filters.area}
            onChange={(e) => handleFilterChange('area', e.target.value)}
            className="text-[1.02rem] bg-white text-ink border border-border rounded-sm px-3 py-1.5 min-w-[120px] flex-1 lg:flex-none"
          >
            <option value="">全部</option>
            {opData?.camlocationQL?.map((option) => (
              <option key={option.KEY} value={option.KEY}>
                {option.DESC}
              </option>
            ))}
          </select>
        </div>

        {/* 異常型態下拉 */}
        <div className="flex items-center gap-2">
          <label className="font-extrabold text-ink whitespace-nowrap">異常：</label>
          <select
            value={filters.eventType}
            onChange={(e) => handleFilterChange('eventType', e.target.value)}
            className="text-[1.02rem] bg-white text-ink border border-border rounded-sm px-3 py-1.5 min-w-[120px] flex-1 lg:flex-none"
          >
            <option value="">全部</option>
            {opData?.alerttypeQL?.map((option) => (
              <option key={option.KEY} value={option.KEY}>
                {option.DESC}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 儀表板圖表 (三個圖表) */}
      <DashboardCharts data={dashboardData} loading={loading} />

      {/* 時間軸趨勢圖表 (獨立查詢)*/}
      <TrendChart
        trendData={trendData}
        trendLoading={trendLoading}
        onSearch={fetchTrendData}
        opData={opData}
      />
    </div>
  );
};

export default Snb002Q;
