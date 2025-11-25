import { Routes, Route } from 'react-router-dom';

// 引入所有需要的頁面元件
import LoginPage from './pages/LoginPage';
// 引入功能選擇頁面 (假設檔案名為 ChoosePage.tsx)
import ChoosePage from './pages/ChoosePage'; 
import PackageListPage from './pages/PackageListPage'; 
import TimeSlotSettingPage from './pages/TimeSlotSettingPage';
import ReservationListPage from './pages/ReservationListPage';
import DailyReportPage from './pages/DailyReportPage';


function App() {
  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '1rem' }}>
      
      {/* 移除 <header> 和 <nav>，因為您要求登入前不顯示上排的標籤頁。
          現在所有頁面都是獨立的，沒有共用的導航列。 */}
      
      <Routes>
        {/* 1. 根路徑 / : 初始頁面為登入頁面 */}
        <Route path="/" element={<LoginPage />} />
        
        {/* 2. 登入成功後導向功能選擇頁面 (ChoosePage.tsx 應該導向此路徑) */}
        <Route path="/selection" element={<ChoosePage />} />

        {/* 3. 功能一：設定每日時段名額
           - 將路徑改為 /time-slot，與 ChoosePage.tsx 中的 navigate("/time-slot") 一致 */}
        <Route path="/time-slot" element={<TimeSlotSettingPage />} /> 
        
        {/* 4. 功能二：預約狀況查詢
           - 將路徑改為 /reservation，與 ChoosePage.tsx 中的 navigate("/reservation") 一致 */}
        <Route path="/reservation" element={<ReservationListPage />} /> 

        {/* 其他功能頁面 (如果仍需要保留) */}
        <Route path="/packages" element={<PackageListPage />} />
        <Route path="/report" element={<DailyReportPage />} />
      </Routes>
    </div>
  );
}

export default App;