import React, { useState, useEffect, useRef } from 'react';
import CameraWall from '../../components/monitor/CameraWall';
import AnalysisPanel from '../../components/monitor/AnalysisPanel';
import EventPanel from '../../components/monitor/EventPanel';
import CameraDetailModal from '../../components/monitor/CameraDetailModal';
import EventDetailModal from '../../components/monitor/EventDetailModal';
import {
  getCamLocations,
  getCamInfo,
  getAlertTypeCount,
  getAlertCount,
  getAlertList,
  updateAlertStatus,
  checkRefreshFlag,
  resetRefreshFlag,
} from '../../services/api';

const Snb001Q = () => {
  const [selectedCamera, setSelectedCamera] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);

  // API 資料狀態
  const [locations, setLocations] = useState([]);
  const [cameras, setCameras] = useState([]);
  const [alertTypeStats, setAlertTypeStats] = useState([]);
  const [alertCounts, setAlertCounts] = useState([]);
  const [alertList, setAlertList] = useState([]);

  // UI 狀態
  const [loading, setLoading] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [showAbnormalOnly, setShowAbnormalOnly] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // 使用 ref 來儲存計時器，以便清除
  const refreshIntervalRef = useRef(null);

  // 通用 API 資料獲取函數
  const fetchApiData = async (apiFunc, setter, errorMsg) => {
    try {
      const response = await apiFunc();
      if (response.res_code === 200) {
        // 支援自訂資料提取邏輯
        const data = response.data || [];
        setter(data);
      }
    } catch (error) {
      console.error(`${errorMsg}:`, error);
    }
  };

  // 取得區域下拉資料
  const fetchLocations = async () => {
    try {
      const response = await getCamLocations();
      const data = response.opData.camlocationQL || [];
      setLocations(data);
    } catch (error) {
      console.error(`${errorMsg}:`, error);
    }
  };

  // 取得攝影機資料
  const fetchCameras = () =>
    fetchApiData(
      () =>
        getCamInfo({
          camlocation: selectedLocation,
          alert: showAbnormalOnly ? '無異常' : '',
        }),
      setCameras,
      '取得攝影機資料失敗',
    );

  // 取得事件種類統計
  const fetchAlertTypeStats = () =>
    fetchApiData(getAlertTypeCount, setAlertTypeStats, '取得事件種類統計失敗');

  // 取得事件通報數量
  const fetchAlertCounts = () =>
    fetchApiData(getAlertCount, setAlertCounts, '取得事件通報數量失敗');

  // 取得事件通報列表
  const fetchAlertList = () => fetchApiData(getAlertList, setAlertList, '取得事件通報列表失敗');

  // 畫面更新函數（保留查詢條件）
  const refreshPage = async () => {
    if (isRefreshing) {
      // console.log('更新已在進行中，跳過本次更新');
      return;
    }

    try {
      setIsRefreshing(true);
      console.log('開始更新畫面...');

      // 並行呼叫所有需要更新的 API（保留查詢條件）
      await Promise.all([
        fetchCameras(), // 使用當前的 selectedLocation 和 showAbnormalOnly
        fetchAlertTypeStats(),
        fetchAlertCounts(),
        fetchAlertList(),
      ]);

      console.log('畫面更新完成');
    } catch (error) {
      console.error('畫面更新失敗:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // 重置更新標記
  const resetFlag = async () => {
    try {
      const response = await resetRefreshFlag({ refreshpageYN: 'N' });
      if (response.res_code === 200) {
        console.log('Flag 重置成功');
      } else {
        console.error('Flag 重置失敗:', response.res_msg);
      }
    } catch (error) {
      console.error('重置 flag 發生錯誤:', error);
    }
  };

  // 初始化載入所有資料
  useEffect(() => {
    const initData = async () => {
      setLoading(true);
      await Promise.all([
        fetchLocations(),
        fetchCameras(),
        fetchAlertTypeStats(),
        fetchAlertCounts(),
        fetchAlertList(),
      ]);
      setLoading(false);
    };
    initData();
  }, []);

  // 當篩選條件改變時重新取得攝影機資料
  useEffect(() => {
    if (!loading) {
      fetchCameras();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedLocation, showAbnormalOnly]);

  // 定期輪詢檢查是否需要更新畫面（每 5 秒）
  useEffect(() => {
    const checkAndRefresh = async () => {
      try {
        const response = await checkRefreshFlag();
        if (response.res_code === 200 && response.data && response.data.length > 0) {
          // 檢查返回的標記，格式為 [{ "REFRESHPAGEYN": "Y" }]
          const flag = response.data[0];
          if (flag && flag.REFRESHPAGEYN === 'Y') {
            console.log('偵測到更新標記，開始更新畫面');
            await refreshPage();
            await resetFlag();
          }
        }
      } catch (error) {
        console.error('檢查更新失敗:', error);
        // 輪詢過程中發生錯誤不中斷輪詢，僅記錄
      }
    };

    // 初次載入完成後才開始輪詢
    if (!loading) {
      // 設定每 5 秒執行一次
      refreshIntervalRef.current = setInterval(checkAndRefresh, 5000);

      // 清除函數：組件卸載時清除計時器
      return () => {
        if (refreshIntervalRef.current) {
          clearInterval(refreshIntervalRef.current);
          console.log('已清除畫面更新輪詢計時器');
        }
      };
    }
  }, [loading, selectedLocation, showAbnormalOnly]); // 依賴查詢條件，確保 refreshPage 使用最新的條件

  // 修改事件狀態
  const handleUpdateAlertStatus = async (alertno) => {
    // 如果有事件編號，呼叫 API 修改事件狀態
    try {
      await updateAlertStatus(alertno);
    } catch (error) {
      console.error('修改事件狀態失敗:', error);
    }
  };

  const handleCameraClick = async (camera) => {
    setSelectedCamera(camera);
    handleUpdateAlertStatus(camera.ALERTNO);
  };

  const handleEventClick = (event) => {
    setSelectedEvent(event);
    handleUpdateAlertStatus(event.ALERTNO);
  };

  const handleLocationChange = (location) => {
    setSelectedLocation(location);
  };

  const handleAbnormalFilterChange = (abnormalOnly) => {
    setShowAbnormalOnly(abnormalOnly);
  };

  const handlePlayEvent = (camera) => {
    console.log('Play event for camera:', camera.CAMNAME);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl text-primary">載入中...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row items-start justify-center gap-6 p-0 pt-4 ml-4">
      {/* Left: Camera Wall */}
      <CameraWall
        cameras={cameras}
        locations={locations}
        selectedLocation={selectedLocation}
        showAbnormalOnly={showAbnormalOnly}
        onCameraClick={handleCameraClick}
        onLocationChange={handleLocationChange}
        onAbnormalFilterChange={handleAbnormalFilterChange}
      />

      {/* Right: Panels */}
      <aside className="flex flex-col gap-4 w-full lg:w-[27vw] min-w-[500px] mt-4 lg:mt-0 mr-4">
        <AnalysisPanel alertTypeStats={alertTypeStats} />
        <EventPanel
          alertCounts={alertCounts}
          alertList={alertList}
          onEventClick={handleEventClick}
        />
      </aside>

      {/* Modals */}
      <CameraDetailModal
        camera={selectedCamera}
        isOpen={!!selectedCamera}
        onClose={() => setSelectedCamera(null)}
        onPlayEvent={handlePlayEvent}
      />

      <EventDetailModal
        event={selectedEvent}
        isOpen={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
      />
    </div>
  );
};

export default Snb001Q;
