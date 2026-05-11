import { useEffect, useMemo, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";

type Role = "business" | "center" | "admin";

function getRole(): Role {
  const path = window.location.pathname;

  if (path.includes("/admin/business")) return "business";
  if (path.includes("/admin/center")) return "center";

  const raw =
    (localStorage.getItem("role") ||
      localStorage.getItem("adminRole") ||
      localStorage.getItem("userRole") ||
      "") as Role;

  if (raw === "business" || raw === "center" || raw === "admin") return raw;

  return "admin";
}

function getDisplayName(role: Role) {
  return (
    localStorage.getItem("employeeDisplayName") ||
    localStorage.getItem("displayName") ||
    localStorage.getItem("name") ||
    (role === "business"
      ? "業務中心專員"
      : role === "center"
      ? "健檢中心管理員"
      : "系統管理員")
  );
}

function formatTime(date: Date) {
  return date.toLocaleString("zh-TW", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

function getPageTitle(pathname: string, role: Role) {
  const map: Record<string, string> = {
    "/admin/business": "系統總覽",
    "/admin/business/groups/new": "新增團體資料",
    "/admin/business/groups/search": "查詢/編輯團體資料",
    "/admin/business/package-branches": "設定套餐施作院區",
    "/admin/business/roster/upload": "上傳團體名冊",

    "/admin/center": "系統總覽",
    "/admin/center/timeslots": "設定每日時段名額",
    "/admin/center/timeslots/view": "時段名額查詢",
    "/admin/center/reservations": "預約清單",
  };

  if (pathname.startsWith("/admin/business/groups/edit")) {
    return "編輯團體資料";
  }

  return map[pathname] || (role === "business" || role === "center" ? "系統總覽" : "後台管理");
}

function HospitalLogo() {
  return (
    <div className="layout-logo-mark">
      <span className="layout-logo-h">H</span>
      <span className="layout-logo-line red" />
      <span className="layout-logo-line blue" />
      <span className="layout-logo-line yellow" />
    </div>
  );
}

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const [currentTime, setCurrentTime] = useState(new Date());
  const [groupMenuOpen, setGroupMenuOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const role = getRole();
  const displayName = getDisplayName(role);
  const pageTitle = getPageTitle(location.pathname, role);

  useEffect(() => {
    const timer = window.setInterval(() => setCurrentTime(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const navSections = useMemo(() => {
    if (role === "business") {
      return {
        sectionTitle: "業務中心功能列表",
        links: [
          { to: "/admin/business/roster/upload", label: "上傳團體名冊", icon: "↥" },
          { to: "/admin/business/package-branches", label: "設定套餐施作院區", icon: "⚙" },
        ],
      };
    }

    if (role === "center") {
      return {
        sectionTitle: "健檢中心功能列表",
        links: [
          { to: "/admin/center/timeslots", label: "設定每日時段名額", icon: "□" },
          { to: "/admin/center/timeslots/view", label: "時段名額查詢", icon: "⌕" },
          { to: "/admin/center/reservations", label: "預約清單", icon: "▤" },
        ],
      };
    }

    return {
      sectionTitle: "後台功能列表",
      links: [
        { to: "/admin/business", label: "業務中心", icon: "B" },
        { to: "/admin/center", label: "健檢中心", icon: "H" },
      ],
    };
  }, [role]);

  const handleLogout = () => {
    localStorage.removeItem("role");
    localStorage.removeItem("adminRole");
    localStorage.removeItem("userRole");
    localStorage.removeItem("employeeDisplayName");
    localStorage.removeItem("displayName");
    localStorage.removeItem("name");

    navigate("/admin/login");
  };

  return (
    <div className={`admin-layout ${mobileMenuOpen ? "mobile-menu-open" : ""}`}>
      {mobileMenuOpen && (
        <button
          type="button"
          className="mobile-sidebar-backdrop"
          onClick={() => setMobileMenuOpen(false)}
          aria-label="關閉選單"
        />
      )}

      <aside className={`admin-sidebar ${mobileMenuOpen ? "open" : ""}`}>
        <button
          type="button"
          className="sidebar-brand sidebar-brand-button"
          onClick={() =>
            navigate(role === "center" ? "/admin/center" : "/admin/business")
          }
        >
          <HospitalLogo />

          <div>
            <div className="sidebar-brand-title">團體健檢管理</div>
            <div className="sidebar-brand-subtitle">GROUP-HEALTH-CHECK</div>
          </div>
        </button>

        <nav className="sidebar-menu">
          <div className="sidebar-section-title">{navSections.sectionTitle}</div>

          {role === "business" && (
            <div className="sidebar-group">
              <button
                type="button"
                className="sidebar-group-button"
                onClick={() => setGroupMenuOpen((prev) => !prev)}
              >
                <span className="sidebar-icon">♙</span>
                <span>團體資料</span>
                <span className="sidebar-chevron">{groupMenuOpen ? "⌄" : "›"}</span>
              </button>

              {groupMenuOpen && (
                <div className="sidebar-submenu">
                  <NavLink
                    to="/admin/business/groups/new"
                    className={({ isActive }) =>
                      "sidebar-sub-link" + (isActive ? " active" : "")
                    }
                  >
                    新增團體資料
                  </NavLink>

                  <NavLink
                    to="/admin/business/groups/search"
                    className={() =>
                      "sidebar-sub-link" +
                      (location.pathname.startsWith("/admin/business/groups/search") ||
                      location.pathname.startsWith("/admin/business/groups/edit")
                        ? " active"
                        : "")
                    }
                  >
                    查詢/編輯團體資料
                  </NavLink>
                </div>
              )}
            </div>
          )}

          {navSections.links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === "/admin/center/timeslots"}
              className={({ isActive }) =>
                "sidebar-main-link" + (isActive ? " active" : "")
              }
            >
              <span className="sidebar-icon">{link.icon}</span>
              <span>{link.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="system-time-box">
            <div className="system-time-icon">○</div>

            <div>
              <div className="system-time-label">系統時間</div>
              <div className="system-time-value">{formatTime(currentTime)}</div>
            </div>
          </div>

          <button type="button" className="logout-button" onClick={handleLogout}>
            ↪ 登出系統
          </button>
        </div>
      </aside>

      <section className="admin-content">
        <header className="admin-topbar">
          <div className="topbar-left">
            <button
              type="button"
              className="mobile-menu-button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="開啟選單"
            >
              ☰
            </button>

            <div className="breadcrumb">
              <span className="breadcrumb-home">▦ 台北市立聯合醫院</span>
              <span className="breadcrumb-divider">›</span>
              <span className="breadcrumb-current">{pageTitle}</span>
            </div>
          </div>

          <div className="user-summary">
            <div className="user-avatar">
              {role === "business" ? "B" : role === "center" ? "H" : "A"}
            </div>
            <div className="user-name">{displayName}</div>
          </div>
        </header>

        <main className="admin-main">
          <Outlet key={location.pathname} />
        </main>
      </section>
    </div>
  );
}