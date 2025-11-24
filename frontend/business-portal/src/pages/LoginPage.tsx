import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function LoginPage() {
  const [account, setAccount] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    // TODO: 之後接後端 /auth/login 驗證
    if (account.trim() && password.trim()) {
      // 登入成功後導向業務中心 - 新增團體資料
      navigate('/business/groups/new');
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
