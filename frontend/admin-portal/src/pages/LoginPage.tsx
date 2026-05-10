import { useState } from "react";
import { useNavigate } from "react-router-dom";

type Role = "business" | "center" ;

function HospitalLogo() {
  return (
    <div className="login-logo-mark">
      <span className="login-logo-h">H</span>
      <span className="login-logo-line red" />
      <span className="login-logo-line blue" />
      <span className="login-logo-line yellow" />
    </div>
  );
}

export default function LoginPage() {
  const [account, setAccount] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role | "">("");
  const navigate = useNavigate();
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    if (!account.trim() || !password.trim()) return;

    if (!role) {
      alert("請先選擇角色");
      return;
    }

    localStorage.setItem("employeeDisplayName", account.trim());
    localStorage.setItem("role", role);

    navigate("/admin/home");
  };

  return (
    <div className="login-page">
      <section className="login-brand-area">
        <HospitalLogo />

        <div className="login-brand-text">
          <h1>團體健檢管理系統</h1>
          <p>GROUP-HEALTH-CHECK</p>
        </div>
      </section>

      <section className="login-card">
        <div className="login-card-header">
          <h2>後台登入</h2>
        </div>

        <form className="login-form" onSubmit={handleLogin}>
          <div className="login-field">
            <label htmlFor="account">帳號</label>
            <input
              id="account"
              value={account}
              onChange={(e) => setAccount(e.target.value)}
              placeholder="請輸入員工帳號"
              required
            />
          </div>

          <div className="login-field">
            <label htmlFor="password">密碼</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="請輸入密碼"
              required
            />
          </div>

          <div className="login-field login-role-field">
            <label>管理權限</label>

            <button
              type="button"
              className={`login-custom-select ${roleDropdownOpen ? "open" : ""}`}
              onClick={() => setRoleDropdownOpen((prev) => !prev)}
            >
              <span>{role === "business" ? "業務中心" : role === "center" ? "健檢中心" : "請選擇部門"}</span>
              <span className="login-select-arrow">{roleDropdownOpen ? "⌃" : "⌄"}</span>
            </button>

            {roleDropdownOpen && (
              <div className="login-custom-menu">
                <button
                  type="button"
                  className={role === "business" ? "active" : ""}
                  onClick={() => {
                    setRole("business");
                    setRoleDropdownOpen(false);
                  }}
                >
                  業務中心
                </button>

                <button
                  type="button"
                  className={role === "center" ? "active" : ""}
                  onClick={() => {
                    setRole("center");
                    setRoleDropdownOpen(false);
                  }}
                >
                  健檢中心
                </button>
              </div>
            )}
          </div>

          <button className="login-submit-button" type="submit">
            進入系統
          </button>
        </form>
      </section>
    </div>
  );
}