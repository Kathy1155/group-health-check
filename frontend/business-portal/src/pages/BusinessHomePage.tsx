// src/pages/BusinessHomePage.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const BusinessHomePage: React.FC = () => {
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState('XXX');

  useEffect(() => {
    // 從 localStorage 讀回登入時存的名稱
    const stored = localStorage.getItem('employeeDisplayName');
    if (stored && stored.trim()) {
      setDisplayName(stored.trim());
    }
  }, []);

  const handleLogout = () => {
    // 登出時順便清掉名稱（可選）
    localStorage.removeItem('employeeDisplayName');
    navigate('/');
  };

  return (
    <div className="page-container">
      <div className="page-card">
        <h2 className="page-title">功能選擇界面</h2>

        <p className="page-welcome">{displayName}，歡迎您～～</p>

        <div className="vertical-button-group">
          <button
            type="button"
            className="primary-button"
            onClick={() => navigate('/business/groups/new')}
          >
            新增團體資料
          </button>

          <button
            type="button"
            className="primary-button"
            onClick={() => navigate('/business/package-branches')}
          >
            指定套餐院區
          </button>

          <button
            type="button"
            className="primary-button"
            onClick={() => navigate('/business/roster/upload')}
          >
            上傳團體名冊
          </button>
        </div>
        <div className="logout-center">
            <button
                type="button"
                className="text-link-button"
                onClick={handleLogout}
            >
                登出
            </button>
        </div>

      </div>
    </div>
  );
};

export default BusinessHomePage;
