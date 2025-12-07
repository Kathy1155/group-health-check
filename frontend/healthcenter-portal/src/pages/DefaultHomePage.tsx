// src/DefaultHomePage.tsx
import { useNavigate } from 'react-router-dom';

// 假設這裡從 Context 或 API 拿到使用者名稱
const USER_NAME = '陳醫師'; // 您的假想使用者名稱

// 功能按鈕配置 (您可以根據您的路由來修改 to 的路徑)
const featureButtons = [
  { label: '設定每日時段名額', to: 'time-slot', className: 'primary-button' },
  { label: '時段名額查詢', to: 'time-slot-view', className: 'primary-button' },
  { label: '預約狀況查詢及修改', to: 'reservation', className: 'primary-button' },
];

function DefaultHomePage() {
  const navigate = useNavigate();
  const handleLogout = () => {
    navigate('/'); 
  };

  const handleFeatureClick = (path: string) => {
    navigate(path);
  };

  return (
    // 使用 .page-container 讓卡片居中
    <div className="page-container">
      {/* 使用 .page-card 統一卡片樣式 */}
      <div className="page-card" style={{ textAlign: 'center' }}>
        
        {/* 頁面標題 */}
        <h2 className="page-title" style={{ fontSize: '1.8rem', marginBottom: '8px' }}>
          功能選擇介面
        </h2>
        
        {/* 歡迎訊息 */}
        <p style={{ fontSize: '1.1rem', color: '#6b7280', marginBottom: '32px' }}>
          {USER_NAME} - 歡迎您 ~
        </p>

        {/* 主要功能按鈕群組 */}
        <div 
          // 這是為了讓按鈕垂直排列並居中，間距為 12px
          style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '12px', 
            alignItems: 'center',
            marginBottom: '32px' 
          }}
        >
          {featureButtons.map((btn) => (
            <button
              key={btn.label}
              type="button"
              // 讓按鈕固定寬度，視覺上更整齊
              className={btn.className}
              style={{ width: '240px' }} 
              onClick={() => handleFeatureClick(btn.to)}
            >
              {btn.label}
            </button>
          ))}
        </div>

        {/* 登出按鈕 (小型，使用文字樣式) */}
        <button
          type="button"
          // 使用文字按鈕的樣式，並移除預設邊框和背景
          style={{
            background: 'none',
            border: 'none',
            color: '#4b5563',
            fontSize: '1rem',
            cursor: 'pointer',
            padding: '4px 0',
            textDecoration: 'none',
          }}
          onClick={handleLogout}
        >
          登出
        </button>

      </div>
    </div>
  );
}

export default DefaultHomePage;