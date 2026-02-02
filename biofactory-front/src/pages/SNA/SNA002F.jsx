/* 程式名稱: SNA002F - 溫室區域設定
  系統代號: SNA
*/

import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Toolbar from '../../components/Toolbar';
import Button from '../../components/Button';
import { useForm, Controller } from 'react-hook-form';
import { faSave, faUndo, faArrowLeft, faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';

import Swal from 'sweetalert2';
import { fetchData } from '../../services/api';
import SNA002FModal from './SNA002FModal';

const SNA002F = () => {
  // 假設後端對應的 Controller 是 apiSNA002FController
  const progApi = 'api/apiSNA002F'; 
  const title = '溫室區域設定';

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const alerttype = searchParams.get('alerttype') || '';

  const { control, handleSubmit, setValue, reset, getValues, watch } = useForm({
    defaultValues: {
      EVENT_CODE: '', 
      EVENT_NAME: '', 
      STATUS: 'Y', 
      COLOR: '#000000',
      SORT: '',
      ALERT_PERSONS: [], 
    },
  });

  const [allPersons, setAllPersons] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [availablePersons, setAvailablePersons] = useState([]);
  const [deleteSelection, setDeleteSelection] = useState([]);

  const selectedPassNos = watch('ALERT_PERSONS') || [];
  const selectedPersonList = allPersons.filter((p) => selectedPassNos.includes(p.KEY));

  // 錯誤提示 helper
  const showError = (msg) => {
    Swal.fire({
      icon: 'error',
      title: '錯誤',
      text: msg || '發生錯誤，請稍後再試',
    });
  };

  const fetchInitData = async () => {
    try {
      console.log('SNA002F Init 開始...');

      let url = `${progApi}/Init`;
      if (alerttype) {
        url += `?alerttype=${encodeURIComponent(alerttype)}`;
      }

      const result = await fetchData(url, 'GET');
      console.log('SNA002F Init 回應:', result);

      if (!result) return;

      const { main, detail, personList } = result;

      if (Array.isArray(personList)) {
        setAllPersons(
          personList.map((p) => ({
            KEY: p.PASS_NO,
            DESC: p.PASS_NA,
            TYPE: p.PASS_TYPE,
          })),
        );
      }

      if (Array.isArray(main) && main.length > 0) {
        const m = main[0];
        setValue('EVENT_CODE', m.ALERTTYPE || '');
        setValue('EVENT_NAME', m.ALERTTYPENAME || '');
        setValue('STATUS', m.DISPLAYYN === 'N' ? 'N' : 'Y');
        // [新增] 讀取後端回傳的顏色與排序
        setValue('COLOR', m.ALERTTYPECOLOR || '#000000');
        setValue('SORT', m.SORT || '');
      }

      if (Array.isArray(detail) && detail.length > 0) {
        const selected = detail.map((d) => d.ALERTPASSNO);
        setValue('ALERT_PERSONS', selected);
      }
    } catch (err) {
      console.error('SNA002F Init 錯誤:', err);
      showError(err.message);
    }
  };

  useEffect(() => {
    fetchInitData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmit = async (formData) => {
    try {
      if (!formData.EVENT_CODE || !formData.EVENT_CODE.trim()) {
        alert('事件代碼為必填，請先輸入事件代碼。');
        return;
      }
      if (!formData.EVENT_NAME || !formData.EVENT_NAME.trim()) {
        alert('事件名稱為必填，請先輸入事件名稱。');
        return;
      }

      const payload = {
        ALERTTYPE: formData.EVENT_CODE,
        ALERTTYPENAME: formData.EVENT_NAME,
        DISPLAYYN: formData.STATUS,
        ALERTTYPECOLOR: formData.COLOR,
        SORT: formData.SORT,
        CRT_NO: '',
        CRT_IP: '',
        UPD_NO: '',
        UPD_IP: '',
        ALERT_PERSONS: (formData.ALERT_PERSONS || []).map((passNo) => ({
          ALERTPASSTYPE: '01',
          ALERTPASSNO: passNo,
        })),
      };

      if (!alerttype) {
        const result = await fetchData(`${progApi}/Insert`, 'POST', payload);
        if (result && result.success) {
          alert('新增成功');
          // 注意：這裡假設新增完要留在本頁或跳轉，先設為重整
          window.location.reload(); 
        } else {
          alert(result?.message || '新增失敗');
        }
        return;
      }

      const result = await fetchData(`${progApi}/Edit`, 'POST', payload);
      if (result && result.success) {
        alert('儲存成功');
        window.location.reload();
      } else {
        alert(result?.message || '儲存失敗');
      }
    } catch (err) {
      console.error('SNA002F 送出錯誤:', err);
      showError(err.message);
    }
  };

  const handleAddPerson = async () => {
    try {
      let url = `${progApi}/GetAvailablePersons`;
      if (alerttype) {
        url += `?alerttype=${encodeURIComponent(alerttype)}`;
      }

      const result = await fetchData(url, 'GET');
      
      let list = [];
      if (Array.isArray(result)) {
        list = result;
      } else if (result && Array.isArray(result.data)) {
        list = result.data;
      }

      const currentSelected = getValues('ALERT_PERSONS') || [];
      const filtered = list.filter((p) => !currentSelected.includes(p.PASS_NO));

      setAvailablePersons(filtered);
      setIsModalOpen(true);
    } catch (err) {
      console.error('取得可新增通報人員錯誤:', err);
      showError(err.message);
    }
  };

  const handleModalConfirm = (selectedPassNosFromModal) => {
    const currentPersons = getValues('ALERT_PERSONS') || [];
    const newPersons = [...new Set([...currentPersons, ...selectedPassNosFromModal])];
    setValue('ALERT_PERSONS', newPersons);

    const newPersonsData = availablePersons
      .filter((p) => selectedPassNosFromModal.includes(p.PASS_NO))
      .map((p) => ({
        KEY: p.PASS_NO,
        DESC: p.PASS_NA,
        TYPE: p.PASS_TYPE,
      }));

    setAllPersons((prev) => {
      const existingKeys = new Set(prev.map((x) => x.KEY));
      const toAdd = newPersonsData.filter((x) => !existingKeys.has(x.KEY));
      return [...prev, ...toAdd];
    });

    setDeleteSelection([]);
    setIsModalOpen(false); // 記得關閉 Modal
  };

  const handleDeletePerson = () => {
    const current = getValues('ALERT_PERSONS') || [];
    if (deleteSelection.length === 0) {
      return;
    }
    const newList = current.filter((passNo) => !deleteSelection.includes(passNo));
    setValue('ALERT_PERSONS', newList);
    setDeleteSelection([]);
  };

  return (
    <div className="w-full h-full bg-white p-5">
      {/* 4. [修正] 移除 Toolbar 改用 div 標題 */}
      <div className="px-6 mb-4 border-b pb-2">
        <h2 className="text-2xl font-bold text-gray-800">
          {title}
        </h2>
      </div>

      <div className="flex items-center justify-between px-6 py-3">
        <div className="flex items-center gap-2">
          <Button
            leftIcon={faSave}
            label="儲存"
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2"
            onClick={handleSubmit(onSubmit)}
          />
          <Button
            leftIcon={faUndo}
            label="復原"
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2"
            onClick={() => reset()}
          />
        </div>
        <div className="flex items-center gap-2">
          <Button
            leftIcon={faArrowLeft}
            label="返回"
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2"
            onClick={() => window.history.back()}
          />
        </div>
      </div>

      <div className="px-6 py-6">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div className="relative">
              <label className="absolute -top-2 left-3 bg-white px-1 text-xs text-gray-600">
                事件代碼 <span className="text-red-500">*</span>
              </label>
              <Controller
                control={control}
                name="EVENT_CODE"
                render={({ field }) => (
                  <input
                    {...field}
                    className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                )}
              />
            </div>
            <div className="relative">
              <label className="absolute -top-2 left-3 bg-white px-1 text-xs text-gray-600">
                事件名稱 <span className="text-red-500">*</span>
              </label>
              <Controller
                control={control}
                name="EVENT_NAME"
                render={({ field }) => (
                  <input
                    {...field}
                    className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                )}
              />
            </div>
          </div>

          <div className="mb-8">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-700 min-w-[60px]">狀態</span>
              <Controller
                control={control}
                name="STATUS"
                render={({ field }) => (
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={field.value === 'Y'}
                      onChange={(e) => field.onChange(e.target.checked ? 'Y' : 'N')}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-gray-700">顯示</span>
                  </label>
                )}
              />
            </div>
          </div>

          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <Button
                leftIcon={faPlus}
                label="新增"
                className="bg-blue-500 hover:bg-blue-600 text-white text-sm px-4 py-2"
                onClick={handleAddPerson}
              />
              <Button
                leftIcon={faTrash}
                label="刪除"
                className="bg-red-500 hover:bg-red-600 text-white text-sm px-4 py-2"
                onClick={handleDeletePerson}
              />
            </div>

            <div className="border border-gray-300">
              <div className="bg-blue-600 text-white px-4 py-3 font-medium">通報人員</div>
              <div>
                {selectedPersonList.map((person, index) => (
                  <div
                    key={person.KEY}
                    className={`flex items-center px-4 py-3 hover:bg-gray-50 ${
                      index < selectedPersonList.length - 1 ? 'border-b border-gray-200' : ''
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="w-4 h-4 mr-3"
                      checked={deleteSelection.includes(person.KEY)}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setDeleteSelection((prev) =>
                          checked ? [...prev, person.KEY] : prev.filter((x) => x !== person.KEY),
                        );
                      }}
                    />
                    <span className="text-sm text-gray-700">{person.DESC}</span>
                  </div>
                ))}
                {selectedPersonList.length === 0 && (
                  <div className="px-4 py-3 text-sm text-gray-500">尚未選擇通報人員</div>
                )}
              </div>
            </div>
          </div>
        </form>
      </div>

      <SNA002FModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleModalConfirm}
        availablePersons={availablePersons}
      />
    </div>
  );
};

export default SNA002F;