// src/CheckupCenterLayout.tsx

import { useState } from 'react';
import {
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
} from 'react-router-dom';

// 假設登入後我們能取得使用者的名稱
const MOCK_USER_NAME = '陳醫師'; // 您的假想使用者名稱

// 健檢中心導航選單配置
const navLinks = [
    {
      title: '時段與套餐管理',
      links: [
        { to: 'time-slot', label: '設定每日時段名額' },
        { to: 'time-slot-view', label: '時段名額查詢' }
      ],
    },
    {
      title: '預約管理及報表',
      links: [
        { to: 'reservation', label: '預約狀況查詢與匯出報表' },
      ],
    },
];


function CheckupCenterLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    setSidebarOpen(false);
    // 登出後導向登入頁 (根路徑)
    navigate('/'); 
  };

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="app-shell">
      {/* 1. 側邊欄遮罩 (與 Header 平級) */}
      {sidebarOpen && (
        <div className="sidebar-backdrop" onClick={closeSidebar} />
      )}

      <header className="app-header">
        {/* 2. 漢堡按鈕容器 (只包含按鈕，用於控制 Header 內的左側間距) */}
        <div className="hamburger-container"> 
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
        </div>

        <h1 className="app-title">
          健檢預約系統 - 健檢中心後台
        </h1>
        
        {/* 登入後顯示 XXX 歡迎您！ */}
        <div className="welcome-message">
            👋 {MOCK_USER_NAME} 歡迎您！
        </div>
      </header>
      
      {/* 3. 側邊欄本體: 移出 Header，與 Header 容器平級，確保 fixed 定位準確 */}
      <aside
        className={`sidebar-flyout ${sidebarOpen ? 'open' : ''}`}
        aria-hidden={!sidebarOpen}
      >
        <nav className="sidebar-nav">
          {/* 導航區塊 */}
          {navLinks.map((section, sectionIndex) => (
            <div key={sectionIndex} className="sidebar-section">
              <h3 className="sidebar-section-title">{section.title}</h3>
              {section.links.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    'sidebar-link' + (isActive ? ' active' : '')
                  }
                  onClick={closeSidebar}
                >
                  {link.label}
                </NavLink>
              ))}
              {/* 區塊間的分隔線 */}
              {sectionIndex < navLinks.length - 1 && (
                <div className="sidebar-section-divider" />
              )}
            </div>
          ))}
          
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

      <main className="app-main">
        <Outlet key={location.pathname} />
      </main>
    </div>
  );
}

export default CheckupCenterLayout;