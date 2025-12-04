import { useNavigate } from "react-router-dom";

function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="page-form">
      <h1 style={{ marginBottom: "1rem" }}>團體健檢預約入口</h1>

      <p style={{ marginBottom: "1.5rem", color: "#555" }}>
        歡迎使用本院團體健檢預約系統。請選擇欲進行的操作。
      </p>

      <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem" }}>
        <button
          className="btn btn-primary"
          onClick={() => navigate("/reserve")}
        >
          開始預約
        </button>

        <button
          className="btn btn-secondary"
          onClick={() => navigate("/reservation-lookup")}
        >
          查詢預約
        </button>
      </div>

      <hr />

      <section style={{ marginTop: "1.5rem", textAlign: "left" }}>
        <h3>健檢流程說明</h3>
        <ol style={{ marginTop: "0.5rem", paddingLeft: "1.2rem" }}>
          <li>輸入團體代碼與身分證字號，確認您的團體與名冊身份。</li>
          <li>選擇欲前往之院區與健檢套餐。</li>
          <li>選擇健檢日期與時段。</li>
          <li>填寫基本資料與個人病史，送出預約。</li>
        </ol>

        <p style={{ marginTop: "1rem", color: "#666", fontSize: "0.9rem" }}>
          如有任何問題，請洽貴公司團體聯絡人或健檢中心。
        </p>
      </section>
    </div>
  );
}

export default HomePage;