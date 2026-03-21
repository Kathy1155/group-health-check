import { useNavigate } from "react-router-dom";

const USER_NAME = "陳醫師";

type FeatureButton = {
  label: string;
  to: string;
  className: string;
};

const FEATURE_BUTTONS: FeatureButton[] = [
  {
    label: "設定每日時段名額",
    to: "/center/time-slot",
    className: "primary-button",
  },
  {
    label: "時段名額查詢",
    to: "/center/time-slot-view",
    className: "primary-button",
  },
  {
    label: "預約狀況查詢及修改",
    to: "/center/reservation",
    className: "primary-button",
  },
];

function DefaultHomePage() {
  const navigate = useNavigate();

  return (
    <div className="healthcenter-scope">
      <div className="page-container">
        <div className="page-card" style={{ textAlign: "center" }}>
          <h2
            className="page-title"
            style={{ fontSize: "1.8rem", marginBottom: 8 }}
          >
            功能選擇介面
          </h2>

          <p
            style={{
              fontSize: "1.1rem",
              color: "#6b7280",
              marginBottom: 32,
            }}
          >
            {USER_NAME}，歡迎您
          </p>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 12,
              alignItems: "center",
            }}
          >
            {FEATURE_BUTTONS.map((btn) => (
              <button
                key={btn.to}
                type="button"
                className={btn.className}
                style={{ width: 240 }}
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