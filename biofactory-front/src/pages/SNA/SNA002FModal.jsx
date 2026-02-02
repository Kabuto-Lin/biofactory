import { useState } from 'react';
import Button from '../../components/Button';
import { faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';

const SNA002FModal = ({ isOpen, onClose, onConfirm, availablePersons }) => {
  const [selectedPersons, setSelectedPersons] = useState([]);

  // 全選/取消全選
  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedPersons(availablePersons.map((p) => p.PASS_NO));
    } else {
      setSelectedPersons([]);
    }
  };

  // 單一勾選
  const handleSelect = (passNo, checked) => {
    if (checked) {
      setSelectedPersons((prev) => [...prev, passNo]);
    } else {
      setSelectedPersons((prev) => prev.filter((x) => x !== passNo));
    }
  };

  // 確定
  const handleConfirm = () => {
    onConfirm(selectedPersons);
    setSelectedPersons([]);
    onClose();
  };

  // 取消
  const handleCancel = () => {
    setSelectedPersons([]);
    onClose();
  };

  if (!isOpen) return null;

  const isAllSelected =
    availablePersons.length > 0 && selectedPersons.length === availablePersons.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 背景遮罩 */}
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={handleCancel} />

      {/* Modal 本體 */}
      <div className="relative bg-white rounded-lg shadow-xl w-[500px] max-h-[80vh] flex flex-col">
        {/* 標題 */}
        <div className="bg-blue-600 text-white px-4 py-3 rounded-t-lg font-medium text-lg">
          通報人員選單
        </div>

        {/* 表格 */}
        <div className="flex-1 overflow-auto">
          <table className="w-full border-collapse">
            <thead className="bg-gray-100 sticky top-0">
              <tr className="border-b-2 border-blue-600">
                <th className="px-4 py-3 text-left w-12">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="w-4 h-4"
                  />
                </th>
                <th className="px-4 py-3 text-center text-blue-700 font-medium">姓名</th>
                <th className="px-4 py-3 text-center text-blue-700 font-medium">部門/職稱</th>
              </tr>
            </thead>
            <tbody>
              {availablePersons.map((person, index) => (
                <tr
                  key={person.PASS_NO}
                  className={`border-b border-gray-200 hover:bg-gray-50 ${
                    index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                  }`}
                >
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedPersons.includes(person.PASS_NO)}
                      onChange={(e) => handleSelect(person.PASS_NO, e.target.checked)}
                      className="w-4 h-4"
                    />
                  </td>
                  <td className="px-4 py-3 text-center text-gray-700">{person.PASS_NA}</td>
                  <td className="px-4 py-3 text-center text-gray-700">{person.CODE_TXT}</td>
                </tr>
              ))}

              {availablePersons.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-4 py-6 text-center text-gray-500">
                    查無可新增的通報人員
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 底部按鈕 */}
        <div className="flex justify-center gap-4 px-4 py-4 border-t">
          <Button
            leftIcon={faTimes}
            label="取消"
            className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2"
            onClick={handleCancel}
          />
          <Button
            leftIcon={faCheck}
            label="確定"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2"
            onClick={handleConfirm}
          />
        </div>
      </div>
    </div>
  );
};

export default SNA002FModal;
