import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function LoginPage() {
  const [account, setAccount] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    // 之後會呼叫後端 /auth/login
    if (account.trim() && password.trim()) {
      navigate('/groups');
    }
  };

  return (
    <div style={{ maxWidth: 360, margin: '0 auto' }}>
      <h2>業務中心登入</h2>

      <form onSubmit={handleLogin}>
        <div>
          <label>
            帳號：
            <input
              value={account}
              onChange={(e) => setAccount(e.target.value)}
              required
            />
          </label>
        </div>

        <div style={{ marginTop: 12 }}>
          <label>
            密碼：
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
        </div>

        <button style={{ marginTop: 16 }} type="submit">
          登入
        </button>
      </form>
    </div>
  );
}

export default LoginPage;