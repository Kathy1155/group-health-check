// src/App.tsx (修正後 - 僅為結構微調)
// ⚠️ 注意: 不需要從這裡移除 Routes 或 Link 的 import，因為它們仍然是 App 組件內部的必要元件

import { Routes, Route, Link } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import GroupListPage from './pages/GroupListPage';
import GroupDetailPage from './pages/GroupDetailPage';
import ReservationOverviewPage from './pages/ReservationOverviewPage';

function App() {
  return (
    // ⚠️ 備註: 這裡不再需要 BrowserRouter，因為它已移到 main.tsx
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '1rem' }}>
      <header style={{ marginBottom: '1rem' }}>
        <h1>團體健檢預約系統 - 業務中心後台</h1>
        <nav style={{ fontSize: '0.9rem' }}>
          {/* 確認 Link 元件的路徑是正確的 */}
          <Link to="/groups">團體管理</Link> |{' '}
          <Link to="/reservations">預約總覽</Link>
        </nav>
      </header>

      <Routes>
        {/* 確保根路徑 "/" 渲染了有效的元件 */}
        <Route path="/" element={<LoginPage />} /> 
        <Route path="/groups" element={<GroupListPage />} />
        <Route path="/groups/:id" element={<GroupDetailPage />} />
        <Route path="/reservations" element={<ReservationOverviewPage />} />
      </Routes>
    </div>
  );
}

export default App;