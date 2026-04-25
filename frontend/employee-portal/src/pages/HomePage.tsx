import { useNavigate } from "react-router-dom";
import hospitalLogo from "../assets/hospital-logo.png";

function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="home-page">
      <section className="home-hero">
        <div className="home-hero-left">
          <div className="home-brand">
            <img src={hospitalLogo} alt="醫院圖標" className="home-brand-logo" />
            <div>
              <p className="home-brand-subtitle">Group Health Check</p>
              <p className="home-brand-title">團體健檢線上預約系統</p>
            </div>
          </div>

          <span className="page-badge">線上預約服務</span>

          <h1 className="home-title">團體健檢預約入口</h1>

          <p className="home-description">
            歡迎使用本院團體健檢預約系統。請依照流程完成身分驗證、
            院區套餐選擇與健檢時段預約。
          </p>

          <div className="home-actions">
            <button
              className="btn btn-primary home-main-btn"
              onClick={() => navigate("/reserve")}
            >
              開始預約
            </button>

            <button
              className="btn btn-secondary home-main-btn"
              onClick={() => navigate("/reservation-lookup")}
            >
              查詢預約
            </button>
          </div>

          <p className="home-note">
            如資料有誤或無法完成預約，請洽貴公司團體聯絡人或健檢中心。
          </p>
        </div>

        <aside className="home-info-panel">
          <p className="home-info-kicker">Online Reservation</p>
          <h2>預約前請先確認</h2>

          <div className="home-info-list">
            <div className="home-info-item">
              <span>01</span>
              <p>請準備團體代碼與身分證字號。</p>
            </div>

            <div className="home-info-item">
              <span>02</span>
              <p>系統會依團體設定顯示可預約院區與套餐。</p>
            </div>

            <div className="home-info-item">
              <span>03</span>
              <p>完成預約後，請至信箱確認預約通知。</p>
            </div>
          </div>
        </aside>
      </section>

      <section className="home-process-card">
        <div className="section-title-row">
          <div>
            <span className="section-kicker">Reservation Process</span>
            <h2>健檢流程說明</h2>
          </div>
        </div>

        <div className="process-grid">
          <div className="process-item">
            <span className="process-number">01</span>
            <h3>驗證身分</h3>
            <p>輸入團體代碼與身分證字號，確認團體與名冊身分。</p>
          </div>

          <div className="process-item">
            <span className="process-number">02</span>
            <h3>選擇項目</h3>
            <p>選擇欲前往的院區，以及團體可預約的健檢套餐。</p>
          </div>

          <div className="process-item">
            <span className="process-number">03</span>
            <h3>挑選時段</h3>
            <p>依照剩餘名額選擇健檢日期與可預約時段。</p>
          </div>

          <div className="process-item">
            <span className="process-number">04</span>
            <h3>完成預約</h3>
            <p>確認基本資料與個人病史後送出，並至信箱完成確認。</p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default HomePage;