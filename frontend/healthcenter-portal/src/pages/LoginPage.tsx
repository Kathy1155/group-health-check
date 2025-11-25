import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function LoginPage() {
  const [account, setAccount] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    // 之後串後端 /auth/login
    if (account.trim() && password.trim()) {
      // 登入成功後導向功能選擇頁面
      navigate('/selection'); // 假設功能選擇頁面路徑為 '/selection'
    }
  };

  return (
    <div style={{ 
        maxWidth: 400, 
        margin: '50px auto', 
        padding: '30px', 
        border: '1px solid #ccc', 
        borderRadius: '8px', 
        boxShadow: '0 4px 8px rgba(0,0,0,0.1)' 
    }}>
      <h2 style={{ textAlign: 'center', marginBottom: '30px' }}>健檢員工登入</h2> 

      <form onSubmit={handleLogin}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>輸入員工代碼：</label>
          <input
            type="text"
            value={account}
            onChange={(e) => setAccount(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box', border: '1px solid #ddd', borderRadius: '4px' }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>密碼：</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box', border: '1px solid #ddd', borderRadius: '4px' }}
          />
        </div>

        <div style={{ textAlign: 'center', marginTop: '30px' }}>
          <button 
            type="submit" 
            style={{ 
                padding: '10px 40px', 
                backgroundColor: '#0056b3', 
                color: 'white', 
                border: 'none', 
                borderRadius: '4px', 
                cursor: 'pointer',
                fontSize: '16px' 
            }}
          >
            登入
          </button>
        </div>
        
        <div style={{ textAlign: 'right', marginTop: '10px' }}>
            <a href="#" style={{ fontSize: '0.9em', color: '#0056b3', textDecoration: 'none' }}>忘記密碼</a>
        </div>
      </form>
    </div>
  );
}

export default LoginPage;