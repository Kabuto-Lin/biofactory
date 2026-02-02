import React, { useState, useEffect, useMemo } from 'react';
import { getAlertList, fetchData } from '../../services/api'; 
import Button from '../../components/Button';
import { faWrench, faCheck, faTimes, faMagnifyingGlass, faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Swal from 'sweetalert2';

// --- 輔助函式：產生分頁陣列 (如 [1, 2, '...', 9, 10]) ---
const generatePagination = (currentPage, totalPages) => {
  // 如果總頁數很少 (<= 7)，全部顯示
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  // 如果在前面幾頁 (<= 4)：顯示 1 2 3 4 5 ... 10
  if (currentPage <= 4) {
    return [1, 2, 3, 4, 5, '...', totalPages];
  }

  // 如果在後面幾頁 (>= 總頁數-3)：顯示 1 ... 6 7 8 9 10
  if (currentPage >= totalPages - 3) {
    return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  }

  // 如果在中間：顯示 1 ... 4 5 6 ... 10
  return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
};

const BackendEventList = () => {
  // 正確的 API 路徑 (修正過多一個 api 的問題)
  const updateApiUrl = 'api/snb001Q/UpdateAlert'; 

  // --- 狀態管理 ---
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, open: 0, handle: 0 });
  
  // 搜尋與分頁狀態
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // 設定一頁顯示 10 筆

  // 登入者資訊
  const [currentUser, setCurrentUser] = useState({ name: '', id: '' });

  // Modal 相關
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  
  // 編輯表單
  const [formData, setFormData] = useState({
    status: '',
    person: '',
    memo: ''
  });

  // --- 1. 取得登入者資訊 ---
  useEffect(() => {
    try {
      const userDataStr = localStorage.getItem('userData');
      if (userDataStr) {
        const userData = JSON.parse(userDataStr);
        setCurrentUser({
          name: userData.userName || userData.userId || '管理員',
          id: userData.userId || ''
        });
      }
    } catch (e) {
      console.error('解析使用者資訊失敗', e);
    }
  }, []);

  // --- 2. 載入資料 ---
  const fetchList = async () => {
    try {
      setLoading(true);
      const result = await getAlertList();
      const allEvents = Array.isArray(result) ? result : (result.data || []);

      const formattedEvents = allEvents.map(e => {
        // 優先讀取中文名稱
        const statusName = e.alertstatusname || e.ALERTSTATUSNAME || e.alertstatus || '未處理';
        
        return {
          ...e,
          uid: e.alertno || e.ALERTNO,
          typeName: e.alerttypename || e.ALERTTYPENAME || '',
          camName: e.camname || e.CAMNAME || '',
          timeStr: (e.alerttime || e.ALERTTIME || '').replace('T', ' '),
          statusText: statusName,
          // 對應資料庫 pass_na
          personName: e.pass_na || e.PASS_NA || '', 
          // 對應資料庫 memo (修正後端沒傳時為空)
          memo: e.memo || e.MEMO || '',
          
          rawTime: new Date(e.alerttime || e.ALERTTIME)
        };
      });

      // 篩選：不顯示已結案
      const unclosedEvents = formattedEvents
        .filter(e => e.statusText !== '已結案' && e.statusText !== 'close')
        .sort((a, b) => b.rawTime - a.rawTime);

      setEvents(unclosedEvents);

      setStats({
        total: unclosedEvents.length,
        open: unclosedEvents.filter(e => e.statusText === '未處理').length,
        handle: unclosedEvents.filter(e => e.statusText === '處理中').length,
      });

    } catch (error) {
      console.error('取得清單失敗', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  // --- 3. 搜尋與分頁計算 ---
  
  // 搜尋過濾
  const filteredEvents = useMemo(() => {
    if (!searchTerm) return events;
    
    const lowerTerm = searchTerm.toLowerCase();
    return events.filter(e => 
      (e.uid && String(e.uid).toLowerCase().includes(lowerTerm)) ||
      (e.typeName && e.typeName.toLowerCase().includes(lowerTerm)) ||
      (e.camName && e.camName.toLowerCase().includes(lowerTerm)) ||
      (e.statusText && e.statusText.toLowerCase().includes(lowerTerm)) ||
      (e.personName && e.personName.toLowerCase().includes(lowerTerm))
    );
  }, [events, searchTerm]);

  // 當搜尋關鍵字改變時，自動跳回第一頁
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // 計算當前頁面資料
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentEvents = filteredEvents.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredEvents.length / itemsPerPage);

  // --- 4. 動作處理 ---
  const handleOpenModal = (item) => {
    setEditItem(item);
    
    // 如果資料庫沒人，帶入登入者；有人則顯示原資料
    const defaultPerson = item.personName ? item.personName : currentUser.name;

    setFormData({
      status: item.statusText,
      person: defaultPerson, 
      memo: item.memo
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      if (!editItem) return;

      // 狀態代碼轉換 根據資料表eventalert - alertstatus
      let statusCode = '01';
      if (formData.status === '處理中') statusCode = '02';
      if (formData.status === '已結案') statusCode = '03'; 

      const payload = {
        ALERTNO: String(editItem.uid),   
        ALERTSTATUS: statusCode,
        ALERTSTATUSNAME: formData.status,
        PASS_NA: formData.person,
        MEMO: formData.memo
      };

      console.log('正在送出更新:', payload);

      const response = await fetchData(updateApiUrl, 'POST', payload);
      
      // 支援兩種 API 回傳格式 (success 或 res_code)
      if (response && (response.success || response.res_code === 200)) {
        Swal.fire({
          icon: 'success',
          title: '更新成功',
          text: '資料已寫入資料庫',
          timer: 1500,
          showConfirmButton: false
        });

        // 重新撈取最新資料
        await fetchList(); 
        
        setShowModal(false);
        setEditItem(null);
      } else {
        throw new Error(response?.message || response?.res_msg || 'API 回傳失敗');
      }

    } catch (error) {
      console.error('儲存失敗', error);
      Swal.fire({
        icon: 'error',
        title: '儲存失敗',
        text: error.message || '請檢查網路連線'
      });
    }
  };

  // --- 樣式輔助 ---
  const getStatusBadge = (status) => {
    if (status === '未處理') return <span className="inline-block bg-red-100 text-red-600 text-xs px-3 py-1 rounded-full font-bold">未處理</span>;
    if (status === '處理中') return <span className="inline-block bg-yellow-100 text-yellow-600 text-xs px-3 py-1 rounded-full font-bold">處理中</span>;
    return <span className="inline-block bg-green-100 text-green-600 text-xs px-3 py-1 rounded-full font-bold">已結案</span>;
  };

  const getTypeStyle = (type) => {
    if (!type) return 'text-gray-500 font-bold';
    if (type.includes('火')) return 'text-red-600 font-bold';
    if (type.includes('裝備') || type.includes('PPE')) return 'text-green-600 font-bold';
    if (type.includes('異常') || type.includes('行為')) return 'text-purple-600 font-bold';
    if (type.includes('圍籬') || type.includes('入侵')) return 'text-[#ea580c] font-bold';
    if (type.includes('煙')) return 'text-[#0891b2] font-bold';
    if (type.includes('倒地')) return 'text-yellow-600 font-bold';
    return 'text-gray-700 font-bold';
  };

  if (loading) return <div className="p-10 text-center text-lg font-bold text-gray-500">資料載入中...</div>;

  return (
    <div className="w-full max-w-[1530px] mx-auto mt-6 px-4 pb-10">
      <div className="bg-white border border-gray-200 rounded-xl shadow-md overflow-hidden flex flex-col">
        
        {/* Header 區塊 */}
        <div className="px-6 py-5 bg-white border-b border-gray-100 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-1 h-6 bg-blue-600 rounded-full"></div>
            <span className="text-xl font-black text-gray-800 tracking-wide">後台｜未結案異常清單</span>
          </div>

          <div className="flex items-center gap-6">
            {/* 搜尋框 */}
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                <FontAwesomeIcon icon={faMagnifyingGlass} />
              </span>
              <input
                type="text"
                placeholder="搜尋編號、地點、人員..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none w-64 text-sm font-medium transition-all"
              />
            </div>

            {/* 統計 Badge */}
            <div className="flex gap-3">
              <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg border border-blue-100">
                <span className="text-xl font-black">{stats.total}</span><span className="text-xs font-bold opacity-80">未結案</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg border border-red-100">
                <span className="text-xl font-black">{stats.open}</span><span className="text-xs font-bold opacity-80">未處理</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-yellow-50 text-yellow-600 rounded-lg border border-yellow-100">
                <span className="text-xl font-black">{stats.handle}</span><span className="text-xs font-bold opacity-80">處理中</span>
              </div>
            </div>
          </div>
        </div>

        {/* Table 區塊 */}
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-left border-collapse table-fixed">
            <thead>
              <tr className="bg-gray-50 text-gray-500 uppercase text-sm leading-normal border-b border-gray-200">
                <th className="py-4 px-6 text-left font-bold w-[10%]">編號</th>
                <th className="py-4 px-6 text-left font-bold w-[15%]">型態</th>
                <th className="py-4 px-6 text-left font-bold w-[20%]">地點</th>
                <th className="py-4 px-6 text-left font-bold w-[15%]">時間</th>
                <th className="py-4 px-6 text-center font-bold w-[10%]">狀態</th>
                <th className="py-4 px-6 text-left font-bold w-[15%]">通報人員</th>
                <th className="py-4 px-6 text-center font-bold w-[15%]">維護</th>
              </tr>
            </thead>
            <tbody className="text-gray-600 text-sm font-light">
              {currentEvents.map((e, index) => (
                <tr key={e.uid || index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-6 text-left whitespace-nowrap font-medium text-gray-700">{e.uid}</td>
                  <td className={`py-4 px-6 text-left ${getTypeStyle(e.typeName)}`}>{e.typeName}</td>
                  <td className="py-4 px-6 text-left truncate font-medium text-gray-800" title={e.camName}>{e.camName}</td>
                  <td className="py-4 px-6 text-left whitespace-nowrap text-gray-500 font-mono">{e.timeStr}</td>
                  <td className="py-4 px-6 text-center">{getStatusBadge(e.statusText)}</td>
                  <td className="py-4 px-6 text-left truncate text-gray-700 font-medium">
                    {e.personName || <span className="text-gray-300">-</span>}
                  </td>
                  <td className="py-4 px-6 text-center">
                    <Button 
                      leftIcon={faWrench}
                      label="維護進度"
                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-4 py-2 rounded-full font-bold shadow-md transition-all"
                      onClick={() => handleOpenModal(e)}
                    />
                  </td>
                </tr>
              ))}
              
              {currentEvents.length === 0 && (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-gray-400 font-medium">
                    {searchTerm ? `找不到與 "${searchTerm}" 相關的資料` : '目前沒有未結案的資料'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ★ 分頁控制器 (Pagination Control) */}
        {filteredEvents.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
            <span className="text-sm text-gray-500 font-medium">
              顯示第 <span className="font-bold text-gray-800">{indexOfFirstItem + 1}</span> 到 <span className="font-bold text-gray-800">{Math.min(indexOfLastItem, filteredEvents.length)}</span> 筆，共 <span className="font-bold text-gray-800">{filteredEvents.length}</span> 筆
            </span>
            
            <div className="flex items-center gap-2">
              {/* 上一頁 */}
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 rounded-md bg-white border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm font-bold shadow-sm"
              >
                <FontAwesomeIcon icon={faChevronLeft} className="mr-1"/> 上一頁
              </button>
              
              {/* 智慧頁碼群組 */}
              <div className="flex gap-1">
                {generatePagination(currentPage, totalPages).map((page, index) => {
                  if (page === '...') {
                    return <span key={`ellipsis-${index}`} className="px-2 py-1.5 text-gray-400 select-none">...</span>;
                  }
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-1.5 rounded-md text-sm font-bold shadow-sm transition-all border ${
                        currentPage === page
                          ? 'bg-blue-600 text-white border-blue-600 pointer-events-none'
                          : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-100 hover:text-blue-600'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
              </div>

              {/* 下一頁 */}
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 rounded-md bg-white border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm font-bold shadow-sm"
              >
                下一頁 <FontAwesomeIcon icon={faChevronRight} className="ml-1"/>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* --- 維護進度 Modal --- */}
      {showModal && editItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px] animate-fade-in">
          <div className="bg-white w-[550px] rounded-2xl shadow-2xl overflow-hidden transform scale-100 transition-transform">
            <div className="bg-white px-8 py-5 border-b border-gray-100 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-black text-gray-800 flex items-center gap-2">
                  <span className="text-blue-600">|</span> 維護進度 
                  <span className="text-gray-400 font-normal text-base ml-2">通報 #{editItem.uid}</span>
                </h3>
              </div>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none transition-colors">×</button>
            </div>

            <div className="p-8 flex flex-col gap-6 bg-white">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">目前狀態</label>
                  <div className="relative">
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value})}
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all appearance-none font-medium text-gray-700"
                    >
                      <option value="未處理">未處理</option>
                      <option value="處理中">處理中</option>
                      <option value="已結案">已結案</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                      <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">通報人員</label>
                  <input
                    type="text"
                    value={formData.person}
                    onChange={(e) => setFormData({...formData, person: e.target.value})}
                    placeholder="姓名/單位"
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-medium"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">處理備註</label>
                <textarea
                  rows="4"
                  value={formData.memo}
                  onChange={(e) => setFormData({...formData, memo: e.target.value})}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none transition-all text-gray-700"
                  placeholder="請輸入處理情形或備註事項..."
                ></textarea>
              </div>
            </div>

            <div className="bg-gray-50 px-8 py-5 border-t border-gray-100 flex justify-end gap-3">
              <Button 
                leftIcon={faTimes} 
                label="取消" 
                className="bg-white border border-gray-300 text-gray-600 hover:bg-gray-100 hover:text-gray-800 px-6 py-2.5 rounded-lg font-bold transition-all" 
                onClick={() => setShowModal(false)} 
              />
              <Button 
                leftIcon={faCheck} 
                label="確認更新" 
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-2.5 rounded-lg font-bold shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5" 
                onClick={handleSave} 
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BackendEventList;