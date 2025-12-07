// src/pages/LoginPage.tsx - 修正後的版本

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// *** 修正: 將 MOCK_ACCOUNTS 放在函數外部（全域可見） ***
const MOCK_ACCOUNTS = {
    // 格式: 員工代碼: 密碼
    'HC2501': 'demo1234', 
    'HC2603': 'demo4321', 
};

// 接收 title (標題) 和 successPath (登入成功後跳轉的路徑)
interface LoginPageProps {
    title: string;
    successPath: string;
}

function LoginPage({ title, successPath }: LoginPageProps) {
  const [account, setAccount] = useState('');
  const [password, setPassword] = useState('');
  
  // *** 修正: 確保 setLoginError 狀態被正確初始化 ***
  const [loginError, setLoginError] = useState<string | null>(null); 
  
  const navigate = useNavigate();

const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null); 

    const trimmedAccount = account.trim();
    const trimmedPassword = password.trim();

    // 登入邏輯（使用假資料）
    
    // 1. 檢查鍵是否存在於 MOCK_ACCOUNTS 中
    if (trimmedAccount in MOCK_ACCOUNTS) {
      
      // 2. 關鍵修正：使用類型斷言 (Type Assertion) 確保 TypeScript 接受這個索引
      // 我們告訴 TypeScript: trimmedAccount 肯定屬於 MOCK_ACCOUNTS 的鍵類型
      const accountKey = trimmedAccount as keyof typeof MOCK_ACCOUNTS;

      // 檢查密碼是否匹配
      if (MOCK_ACCOUNTS[accountKey] === trimmedPassword) {
        // 驗證成功，導航到指定路徑
        navigate(successPath);
      } else {
        // 密碼錯誤
        setLoginError("員工代碼或密碼錯誤，請重新輸入。");
      }
      
    } else {
      // 員工代碼不存在
      setLoginError("員工代碼或密碼錯誤，請重新輸入。");
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
              onChange={(e) => setAccount(e.target.value.toUpperCase())} // 自動轉大寫
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
          
          {/* 錯誤訊息顯示 */}
          {loginError && (
              <p style={{ color: '#dc2626', fontSize: '0.9rem', textAlign: 'center', margin: '15px 0' }}>
                  {loginError}
              </p>
          )}

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