import { Routes, Route, Link } from 'react-router-dom';
import GroupCodePage from './pages/GroupCodePage';
import SelectBranchPackagePage from './pages/SelectBranchPackagePage';
import SelectTimeSlotPage from './pages/SelectTimeSlotPage';
import FillProfilePage from './pages/FillProfilePage';
import ReservationDonePage from './pages/ReservationDonePage';

function App() {
  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '1rem' }}>
      <header style={{ marginBottom: '1rem' }}>
        <h1>團體健檢預約系統 - 員工前台</h1>
        <nav style={{ fontSize: '0.9rem' }}>
          <Link to="/">團體代碼</Link> |{' '}
          <Link to="/select-branch-package">選院區與套餐</Link> |{' '}
          <Link to="/select-slot">選日期與時段</Link> |{' '}
          <Link to="/fill-profile">填寫資料與病史</Link>
        </nav>
      </header>

      <Routes>
        <Route path="/" element={<GroupCodePage />} />
        <Route path="/select-branch-package" element={<SelectBranchPackagePage />} />
        <Route path="/select-slot" element={<SelectTimeSlotPage />} />
        <Route path="/fill-profile" element={<FillProfilePage />} />
        <Route path="/done" element={<ReservationDonePage />} />
      </Routes>
    </div>
  );
}

export default App;