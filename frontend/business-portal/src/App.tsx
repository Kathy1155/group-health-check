import { useState } from 'react';
import {
  Routes,
  Route,
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
} from 'react-router-dom';

import LoginPage from './pages/LoginPage';
import GroupCreatePage from './pages/GroupCreatePage';
import PackageBranchSettingPage from './pages/PackageBranchSettingPage';
import RosterUploadPage from './pages/RosterUploadPage';

function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    setSidebarOpen(false);
    navigate('/');
  };

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="app-shell">
      {sidebarOpen && (
        <div className="sidebar-backdrop" onClick={closeSidebar} />
      )}

      <header className="app-header">
        {/* 左上角三條線 + 側拉選單 */}
        <div className="sidebar-hover-zone">
          <button
            type="button"
            className="hamburger-button"
            aria-label="開啟功能選單"
            onClick={() => setSidebarOpen((prev) => !prev)}
          >
            <span />
            <span />
            <span />
          </button>

          <aside
            className={`sidebar-flyout ${sidebarOpen ? 'open' : ''}`}
            aria-hidden={!sidebarOpen}
          >
            <nav className="sidebar-nav">
              <NavLink
                to="/business/groups/new"
                className={({ isActive }) =>
                  'sidebar-link' + (isActive ? ' active' : '')
                }
                onClick={closeSidebar}
              >
                新增團體資料
              </NavLink>

              <NavLink
                to="/business/package-branches"
                className={({ isActive }) =>
                  'sidebar-link' + (isActive ? ' active' : '')
                }
                onClick={closeSidebar}
              >
                指定套餐院區
              </NavLink>

              <NavLink
                to="/business/roster/upload"
                className={({ isActive }) =>
                  'sidebar-link' + (isActive ? ' active' : '')
                }
                onClick={closeSidebar}
              >
                上傳團體名冊
              </NavLink>

              <div className="sidebar-section-divider" />

              <button
                type="button"
                className="sidebar-link sidebar-logout"
                onClick={handleLogout}
              >
                登出
              </button>
            </nav>
          </aside>
        </div>

        <h1 className="app-title">
          團體健檢預約系統 - 業務中心後台
        </h1>
      </header>

      <main className="app-main">
        <Outlet key={location.pathname} />
      </main>
    </div>
  );
}

function App() {
  return (
    <Routes>
      {/* 登入頁（無 sidebar） */}
      <Route path="/" element={<LoginPage />} />

      {/* 登入後共用 layout */}
      <Route element={<AppLayout />}>
        <Route path="/business" element={<GroupCreatePage />} />
        <Route path="/business/groups/new" element={<GroupCreatePage />} />
        <Route
          path="/business/package-branches"
          element={<PackageBranchSettingPage />}
        />
        <Route
          path="/business/roster/upload"
          element={<RosterUploadPage />}
        />
      </Route>
    </Routes>
  );
}

export default App;
