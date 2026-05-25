import { useState } from "react";
import { useNavigate } from "react-router-dom";
import tpechLogo from "../assets/tpech-logo-mark.png";

type Role = "business" | "center";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "/api";

function HospitalLogo() {
  return (
    <div className="login-logo-mark">
      <img
        src={tpechLogo}
        alt="台北市立聯合醫院 Logo"
        className="login-logo-img"
      />
    </div>
  );
}

export default function LoginPage() {
  const [account, setAccount] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role | "">("");
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!account.trim() || !password.trim()) return;

    if (!role) {
      setErrorMessage("請先選擇要登入的後台");
      return;
    }

    try {
      setIsLoading(true);

      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          staffEmail: account.trim(),
          password: password.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data.message || "登入失敗，請確認帳號密碼");
        return;
      }

      const staffRole = data.staff_role;

      const isAllowed =
        staffRole === "Admin" ||
        (role === "business" && staffRole === "Business") ||
        (role === "center" && staffRole === "HealthExamination");

      if (!isAllowed) {
        setErrorMessage("此帳號沒有該後台的登入權限");
        return;
      }

    localStorage.setItem("staffUser", JSON.stringify(data));
    localStorage.setItem("employeeDisplayName", data.staff_name);
    localStorage.setItem("role", staffRole);
    localStorage.setItem("loginEntry", role);

    if (role === "business") {
      navigate("/admin/business");
    } else if (role === "center") {
      navigate("/admin/center");
    }
    } catch (error) {
      setErrorMessage("無法連線到伺服器，請確認後端是否已啟動");
    } finally {
      setIsLoading(false);
    }
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
              placeholder="請輸入員工 Email"
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
              className={`login-custom-select ${
                roleDropdownOpen ? "open" : ""
              }`}
              onClick={() => setRoleDropdownOpen((prev) => !prev)}
            >
              <span>
                {role === "business"
                  ? "業務中心"
                  : role === "center"
                    ? "健檢中心"
                    : "請選擇部門"}
              </span>
              <span className="login-select-arrow">
                {roleDropdownOpen ? "⌃" : "⌄"}
              </span>
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

          {errorMessage && <p className="login-error-text">{errorMessage}</p>}

          <button
            className="login-submit-button"
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? "登入中..." : "進入系統"}
          </button>
        </form>
      </section>
    </div>
  );
}