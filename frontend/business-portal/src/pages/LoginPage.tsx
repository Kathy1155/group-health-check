import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function LoginPage() {
  const [account, setAccount] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    // TODO：之後改成呼叫後端驗證
    if (account.trim() && password.trim()) {
      const code = account.trim();

      // 暫時用員工代碼當顯示名稱，先存到 localStorage
      // 之後如果後端有回傳員工姓名，就改成存真正的名字即可
      localStorage.setItem('employeeDisplayName', code);

      // 登入成功 → 導向功能選擇界面
      navigate('/business');
    }
  };




  return (
    <div className="login-page">
      <div className="login-card">
        <h2 className="login-title">業務中心員工登入</h2>

        <form className="login-form" onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label" htmlFor="account">
              輸入員工代碼：
            </label>
            <input
              id="account"
              className="form-input"
              value={account}
              onChange={(e) => setAccount(e.target.value)}
              placeholder="請輸入員工代碼"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">
              密碼：
            </label>
            <input
              id="password"
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="請輸入密碼"
              required
            />
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

export default LoginPage;
