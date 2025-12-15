import { useNavigate } from 'react-router-dom';

const USER_NAME = '陳醫師';

const featureButtons = [
  {
    label: '設定每日時段名額',
    to: '/admin/center/timeslots',
    className: 'primary-button',
  },
  {
    label: '時段名額查詢',
    to: '/admin/center/timeslots/view',
    className: 'primary-button',
  },
  {
    label: '預約狀況查詢及修改',
    to: '/admin/center/reservations',
    className: 'primary-button',
  },
];

function DefaultHomePage() {
  const navigate = useNavigate();

  return (
    <div className="healthcenter-scope">
      <div className="page-container">
        <div className="page-card" style={{ textAlign: 'center' }}>
          <h2 className="page-title" style={{ fontSize: '1.8rem', marginBottom: '8px' }}>
            功能選擇介面
          </h2>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              alignItems: 'center',
            }}
          >
            {featureButtons.map((btn) => (
              <button
                key={btn.label}
                type="button"
                className={btn.className}
                style={{ width: '240px' }}
                onClick={() => navigate(btn.to)}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DefaultHomePage;
