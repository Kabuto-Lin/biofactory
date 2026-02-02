/* 程式名稱: SNA001F - 通報人員設定作業
  系統代號: SNA
*/

import { useEffect, useState } from 'react';
import Button from '../../components/Button';
import Table from '../../components/Table';
import { useForm, Controller } from 'react-hook-form';
import { faMagnifyingGlass, faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2'; 
import { fetchData } from '../../services/api';

const SNA001F = () => {
  // 後端 Controller 是 apiSNA001FController，路由是 api/[controller]
  const progApi = 'api/apiSNA001F'; 
  
  const title = '通報人員設定作業';

  // 主表欄位
  const masterColumns = [
    { header: '事件名稱', field: 'ALERTTYPENAME', width: 'min-w-[200px]' },
    { header: '通報人員', field: 'ALERTPASSNO_LIST', width: 'min-w-[300px]' },
  ];

  const [searchData, setSearchData] = useState([]); // 主表資料 (備用)
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [alertTypeOptions, setAlertTypeOptions] = useState([]); // 查詢下拉選單
  const [showSearchModal, setShowSearchModal] = useState(false); // 查詢視窗狀態

  const methods = useForm({
    defaultValues: {
      ALERTTYPE: '', 
      masterData: [], // [建議] 這裡預設一個空陣列
      pageSize: 150,
      currentPage: 1,
      sortFields: null,
      sortDirections: null,
      reportKind: 0,
    },
  });
  const { handleSubmit, control, getValues, setValue } = methods;

  // 錯誤提示
  const showError = (msg) => {
    Swal.fire({
      icon: 'error',
      title: '錯誤',
      text: msg || '發生錯誤，請稍後再試',
    });
  };

  // 初始化：下拉 + 預設資料
  const fetchInitData = async () => {
    try {
      console.log('開始呼叫 Init API...');
      const result = await fetchData(`${progApi}/Init`, 'GET');
      console.log('Init API 回應:', result);

      if (result?.searchData) {
        Object.entries(result.searchData).forEach(([key, value]) => {
          setValue(key, value);
        });
      }

      if (result?.opData && result.opData.alerttype_Q1) {
        setAlertTypeOptions(result.opData.alerttype_Q1);
      }

      // 顯示所有資料
      if (result?.masterData) {
        console.log('設定 masterData:', result.masterData);
        setSearchData(result.masterData);
        
        // [關鍵] 同步寫入 form，Table 元件會讀取這裡
        setValue('masterData', result.masterData); 
      } else {
        await fetchAllData();
      }
    } catch (err) {
      console.log('Init API 錯誤:', err.message);
      showError(err.message);
    }
  };

  // 取得所有資料
  const fetchAllData = async () => {
    try {
      const datas = { ALERTTYPE: '' };
      const result = await fetchData(`${progApi}/Search`, 'POST', datas);
      
      const finalData = result.masterData || [];
      setSearchData(finalData);
      
      // [關鍵] 同步寫入 form
      setValue('masterData', finalData);
    } catch (err) {
      console.log('取得所有資料錯誤:', err.message);
      showError(err.message);
    }
  };

  // 查詢
  const fetchSearchData = async (formData) => {
    try {
      const alerttype = formData?.ALERTTYPE ?? getValues('ALERTTYPE') ?? '';
      const datas = { ALERTTYPE: alerttype || '' };

      const result = await fetchData(`${progApi}/Search`, 'POST', datas);
      
      const finalData = result.masterData || [];
      setSearchData(finalData);
      
      // [關鍵] 同步寫入 form
      setValue('masterData', finalData);
      
      setCurrentPage(1);
    } catch (err) {
      console.log('Search API 錯誤:', err.message);
      showError(err.message);
    }
  };

  useEffect(() => {
    fetchInitData();
  }, []);

  const handlePageChange = (page, newItemsPerPage) => {
    setCurrentPage(page);
    setItemsPerPage(newItemsPerPage);
  };

  return (
    <div className="w-full h-full bg-white p-5">
      {/* 標題區塊 */}
      <div className="px-6 mb-4 border-b pb-2">
        <h2 className="text-2xl font-bold text-gray-800">
          {title}
        </h2>
      </div>

      {/* 按鈕面板 */}
      <div className="flex items-center gap-2 px-6 py-3 border-b">
        <Button
          leftIcon={faPlus}
          label="新增"
          className="bg-green-500 hover:bg-green-600 text-white"
          onClick={() => alert('SNA001F 目前僅提供查詢功能，未開放新增。')}
        />
        <Button
          leftIcon={faTrash}
          label="刪除"
          className="bg-red-500 hover:bg-red-600 text-white"
          onClick={() => alert('SNA001F 目前僅提供查詢功能，未開放刪除。')}
        />
        <Button
          leftIcon={faMagnifyingGlass}
          label="查詢"
          className="bg-blue-500 hover:bg-blue-600 text-white"
          onClick={() => setShowSearchModal(true)} 
        />
      </div>

      <div className="flex flex-col gap-4 w-full px-6 py-4">
        {/* 資料表區塊 */}
        <div className="overflow-y-auto">
          <Table
            // 用 name，不能用 tableName！
            name="masterData" 
            
            methods={methods}
            columns={masterColumns}
            
            
            data={searchData} 
            setValue={setValue}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            isShowDefaultButton={false} 
            itemsPerPage={itemsPerPage}
            handlePageChange={handlePageChange}
          />
        </div>
      </div>

      {/* 查詢視窗 Modal */}
      {showSearchModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg" style={{ width: '400px' }}>
            <div className="flex justify-between items-center p-4 border-b bg-gray-50 rounded-t-lg">
              <h3 className="text-lg font-semibold text-gray-800">查詢視窗</h3>
              <button
                onClick={() => setShowSearchModal(false)}
                className="text-gray-400 hover:text-gray-600 text-xl font-bold"
              >✕</button>
            </div>
            <div className="p-6">
              <div className="mb-8">
                <div className="flex items-center mb-3">
                  <label className="text-lg font-medium text-gray-700 w-20">通報事件</label>
                  <Controller
                    name="ALERTTYPE"
                    control={control}
                    render={({ field }) => (
                      <select
                        {...field}
                      
                        value={field.value || ''}
                        className="flex-1 ml-4 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">-- 請選擇 --</option>
                        {alertTypeOptions.map((option) => (
                          <option key={option.KEY} value={option.KEY}>
                            {option.DESC}
                          </option>
                        ))}
                      </select>
                    )}
                  />
                </div>
              </div>
              <div className="border-t border-gray-200 mb-6"></div>
              <div className="flex gap-3 justify-center">
                <Button
                  label="✓ 確定"
                  className="bg-teal-500 hover:bg-teal-600 text-white px-6 py-2 min-w-[80px]"
                  onClick={handleSubmit((data) => {
                    fetchSearchData(data);
                    setShowSearchModal(false);
                  })}
                />
                <Button
                  label="✕ 取消"
                  className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 min-w-[80px]"
                  onClick={() => setShowSearchModal(false)}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SNA001F;