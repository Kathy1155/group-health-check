import { useNavigate } from "react-router-dom";
import hospitalLogo from "../assets/hospital-logo.png";

function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="home-page">
      <section className="home-hero">
        <div className="home-hero-left">
          <div className="home-brand">
            <img src={hospitalLogo} alt="醫院 logo" className="home-brand-logo" />
            <div>
              <p className="home-brand-title">團體健檢預約</p>
              <p className="home-brand-subtitle">員工線上預約服務</p>
            </div>
          </div>

          <h1 className="home-title">團體健檢預約</h1>

          <p className="home-description">
            輸入企業提供的團體代碼，完成身分驗證後，即可選擇院區、健檢方案與可預約時段。
            系統會即時確認名額，協助你快速完成預約資料送出。
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
            請先準備公司通知的團體代碼與個人身分資料，驗證成功後即可進入預約流程。
          </p>
        </div>

        <aside className="home-info-panel" aria-label="預約流程">
          <h2>預約流程</h2>

          <div className="home-info-list">
            <div className="home-info-item">
              <span>01</span>
              <div>
                <h3>輸入團體代碼</h3>
                <p>確認所屬企業與預約資格，完成信箱驗證碼驗證。</p>
              </div>
            </div>

            <div className="home-info-item">
              <span>02</span>
              <div>
                <h3>選擇院區與方案</h3>
                <p>依企業開放內容選擇健檢院區與適合的檢查方案。</p>
              </div>
            </div>

            <div className="home-info-item">
              <span>03</span>
              <div>
                <h3>選擇日期時段</h3>
                <p>查看可預約時段與剩餘名額，選擇適合的健檢時間。</p>
              </div>
            </div>

            <div className="home-info-item">
              <span>04</span>
              <div>
                <h3>填寫資料並預約成立</h3>
                <p>填寫個人健康資料，送出後取得預約編號。</p>
              </div>
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}

export default HomePage;
