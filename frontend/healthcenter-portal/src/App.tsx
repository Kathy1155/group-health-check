// src/App.tsx (健檢中心獨立專案)

import { Routes, Route, Navigate } from 'react-router-dom'; // 引入 Navigate 用於重定向
import './App.css';
// import './index.css';

// 健檢中心元件
import LoginPage from './pages/LoginPage';
import CheckupCenterLayout from './pages/CheckupCenterLayout'; 
import TimeSlotSettingPage from './pages/TimeSlotSettingPage'; 
import TimeSlotViewPage from './pages/TimeSlotViewPage';
import ReservationListPage from './pages/ReservationListPage'; 
import DefaultHomePage from './pages/DefaultHomePage'; 

function App() {
  
  // 健檢中心的登入成功後，預設導航到 DefaultHomePage
  // 登入成功後，會被導航到 /center/
  const CHECKUP_DEFAULT_PATH = "/center"; 

  return (
    <Routes>
      {/* 登入頁面：作為起始頁 (使用 /) */}
      <Route 
        path="/" 
        element={<LoginPage title="健檢中心員工登入" successPath={CHECKUP_DEFAULT_PATH} />} 
      />
      
      {/* 登入後共用 layout：所有功能頁面都在此架構內 */}
      <Route path="/center" element={<CheckupCenterLayout />}>
        
        {/* 1. 設置 index 路由，使其成為 /center 的默認頁面 */}
        {/* 當路徑是 /center/ 時，顯示 DefaultHomePage */}
        <Route index element={<DefaultHomePage />} /> 

        {/* 2. 時段與預約管理 */}
        <Route path="time-slot" element={<TimeSlotSettingPage />} />
        <Route path="time-slot-view" element={<TimeSlotViewPage />} />
        <Route path="reservation" element={<ReservationListPage />} />
        

        {/* 4. 處理未匹配到的路由：導航回默認首頁 */}
        {/* 這樣任何不正確的子路徑都會導航回功能選擇介面 */}
        <Route path="*" element={<Navigate to="/center" replace />} />
      </Route>

      {/* 處理不正確的頂層路由，例如有人輸入 /xyz，將其導航回登入頁 */}
      <Route path="*" element={<Navigate to="/" replace />} />

    </Routes>
  );
}

export default App;