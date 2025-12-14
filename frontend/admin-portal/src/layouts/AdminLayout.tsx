import { useMemo, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";

type Role = "business" | "center" | "admin";

function getRole(): Role {
  const raw =
    (localStorage.getItem("role") ||
      localStorage.getItem("adminRole") ||
      localStorage.getItem("userRole") ||
      "") as Role;

  if (raw === "business" || raw === "center" || raw === "admin") return raw;

  // 沒取到就用 URL 推斷，避免你們現在 storage key 還沒統一
  const path = window.location.pathname;
  if (path.includes("/admin/business")) return "business";
  if (path.includes("/admin/center")) return "center";
  return "admin";
}

// function getDisplayName() {
//   return (
//     localStorage.getItem("employeeDisplayName") ||
//     localStorage.getItem("displayName") ||
//     localStorage.getItem("name") ||
//     ""
//   );
// }

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const role = getRole();
 const USER_NAME = '陳醫師';

  const title = useMemo(() => {
    if (role === "business") return "團體健檢預約系統 - 業務中心後台";
    if (role === "center") return "團體健檢預約系統 - 健檢中心後台";
    return "團體健檢預約系統 - 後台";
  }, [role]);

  const navSections = useMemo(() => {
    if (role === "business") {
      return [
        {
          title: "業務中心",
          links: [
            { to: "/admin/business", label: "功能選擇介面" },
            { to: "/admin/business/groups/new", label: "新增團體資料" },
            { to: "/admin/business/package-branches", label: "指定套餐院區" },
            { to: "/admin/business/roster/upload", label: "上傳團體名冊" },
          ],
        },
      ];
    }

    if (role === "center") {
      return [
        {
          title: "健檢中心",
          links: [
            { to: "/admin/center/timeslots", label: "設定每日時段名額" },
            { to: "/admin/center/timeslots/view", label: "時段名額查詢" },
            { to: "/admin/center/reservations", label: "預約清單" },
          ],
        },
      ];
    }

    // admin（之後如果你要做總管理員再擴充）
    return [
      {
        title: "後台",
        links: [
          { to: "/admin", label: "首頁" },
          { to: "/admin/business", label: "業務中心" },
          { to: "/admin/center", label: "健檢中心" },
        ],
      },
    ];
  }, [role]);

  const closeSidebar = () => setSidebarOpen(false);

  const handleLogout = () => {
    setSidebarOpen(false);
    // 只清後台登入相關資訊，避免你們 demo 其它資料被清掉
    localStorage.removeItem("role");
    localStorage.removeItem("adminRole");
    localStorage.removeItem("userRole");
    navigate("/admin/login");
  };

  return (
    <div className="app-shell">
      {sidebarOpen && (
        <div className="sidebar-backdrop" onClick={closeSidebar} />
      )}

      <header className="app-header">
        <div className="sidebar-hover-zone">
          <button
            type="button"
            className="hamburger-button"
            aria-label="開啟功能選單"
            onClick={() => setSidebarOpen((p) => !p)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>

        <h1 className="app-title">{title}</h1>

        {/* 右側歡迎字（可有可無，不影響排版） */}
        {USER_NAME && (
          <div className="welcome-message">{USER_NAME} 歡迎您！</div>
        )}
      </header>

      <aside
        className={`sidebar-flyout ${sidebarOpen ? "open" : ""}`}
        aria-hidden={!sidebarOpen}
      >
        <nav className="sidebar-nav">
          {navSections.map((section, idx) => (
            <div key={idx} className="sidebar-section">
              <h3 className="sidebar-section-title">{section.title}</h3>

              {section.links.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    "sidebar-link" + (isActive ? " active" : "")
                  }
                  onClick={closeSidebar}
                >
                  {link.label}
                </NavLink>
              ))}

              {idx < navSections.length - 1 && (
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
