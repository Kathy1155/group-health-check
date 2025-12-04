// src/pages/LoginPage.tsx

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// 接收 title (標題) 和 successPath (登入成功後跳轉的路徑)
interface LoginPageProps {
    title: string;
    successPath: string;
}

function LoginPage({ title, successPath }: LoginPageProps) {
  const [account, setAccount] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    // 登入邏輯（使用假資料）
    if (account.trim() && password.trim()) {
      navigate(successPath);
    }
  };

  return (
    // 樣式來自 App.css
    <div className="login-page">
      <div className="login-card">
        <h2 className="login-title">{title}</h2> 

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
            {/* 樣式來自 App.css */}
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