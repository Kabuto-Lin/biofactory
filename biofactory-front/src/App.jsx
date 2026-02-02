import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Snb001Q from './pages/snb/snb001Q'; // 首頁
import Snb002Q from './pages/snb/snb002Q'; // 數據分析
import SNA001F from './pages/SNA/SNA001F'; // 通報人員設定作業
import SNA002F from './pages/SNA/SNA002F'; // 溫室區域設定
import BackendEventList from './pages/backend/BackendEventList'; // 後台異常事件列表

function App() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Snb001Q />} />
        <Route path="analytics" element={<Snb002Q />} />
        <Route path="backend" element={<BackendEventList />} />
        <Route path="SNA001F" element={<SNA001F />} />
        <Route path="SNA002F" element={<SNA002F />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default App;