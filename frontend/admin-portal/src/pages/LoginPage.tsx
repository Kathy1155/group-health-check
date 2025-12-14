import { useState } from "react";
import { useNavigate } from "react-router-dom";

type Role = "business" | "center" | "admin";

export default function LoginPage() {
  const [account, setAccount] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("business");
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!account.trim() || !password.trim()) return;

    localStorage.setItem("employeeDisplayName", account.trim());
    localStorage.setItem("role", role);

    navigate("/admin/home");
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h2 className="login-title">後台登入</h2>

        <form className="login-form" onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label">帳號：</label>
            <input
              className="form-input"
              value={account}
              onChange={(e) => setAccount(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">密碼：</label>
            <input
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">角色（暫時用來測試）：</label>
            <select
              className="form-select"
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
            >
              <option value="business">業務中心</option>
              <option value="center">健檢中心</option>
              <option value="admin">管理者（全權）</option>
            </select>
          </div>

          <div className="login-actions-center">
            <button className="primary-button" type="submit">
              登入
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
