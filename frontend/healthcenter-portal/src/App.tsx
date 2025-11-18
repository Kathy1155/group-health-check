import { Routes, Route, Link } from 'react-router-dom';

import LoginPage from './pages/LoginPage';
import PackageListPage from './pages/PackageListPage';
import TimeSlotSettingPage from './pages/TimeSlotSettingPage';
import ReservationListPage from './pages/ReservationListPage';
import DailyReportPage from './pages/DailyReportPage';

function App() {
  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '1rem' }}>
      <header style={{ marginBottom: '1rem' }}>
        <h1>健檢中心後台</h1>
        <nav style={{ fontSize: '0.9rem' }}>
          <Link to="/packages">套餐管理</Link> |{' '}
          <Link to="/timeslots">時段名額設定</Link> |{' '}
          <Link to="/reservations">預約查詢</Link> |{' '}
          <Link to="/report">每日受檢報表</Link>
        </nav>
      </header>

      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/packages" element={<PackageListPage />} />
        <Route path="/timeslots" element={<TimeSlotSettingPage />} />
        <Route path="/reservations" element={<ReservationListPage />} />
        <Route path="/report" element={<DailyReportPage />} />
      </Routes>
    </div>
  );
}

export default App;