import { useNavigate } from 'react-router-dom';

const featureButtons = [
  {
    label: '設定每日時段名額',
    to: '/admin/center/timeslots',
  },
  {
    label: '時段名額查詢',
    to: '/admin/center/timeslots/view',
  },
  {
    label: '預約狀況查詢及修改',
    to: '/admin/center/reservations',
  },
];

function DefaultHomePage() {
  const navigate = useNavigate();

  return (
    <div className="page-container healthcenter-scope healthcenter-home-page">
      <div className="page-card">
        <h2 className="page-title">功能選擇介面</h2>

        <div className="action-stack">
          {featureButtons.map((btn) => (
            <button
              key={btn.label}
              type="button"
              className="primary-button full-width-button"
              onClick={() => navigate(btn.to)}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default DefaultHomePage;