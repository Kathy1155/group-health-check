import { useNavigate } from "react-router-dom";

function ChoosePage() {
  const navigate = useNavigate();

  return (
    <div style={{ textAlign: "center", paddingTop: "50px" }}>
      <h1>XXX，歡迎您~~</h1>

      <div
        style={{
          width: "400px",
          margin: "40px auto",
          padding: "40px",
          border: "1px solid #ccc",
          borderRadius: "12px",
        }}
      >
        {/* <p>XXX，歡迎您~~</p> */}

        <button
          onClick={() => navigate("/time-slot")}
          style={{
            width: "250px",
            height: "48px",
            marginBottom: "20px",
            fontSize: "18px",
            backgroundColor: "#005BBB",
            color: "white",
            borderRadius: "8px",
            border: "none",
            cursor: "pointer",
          }}
        >
          設定每日時段名額
        </button>

        <br />

        <button
          onClick={() => navigate("/reservation")}
          style={{
            width: "250px",
            height: "48px",
            fontSize: "18px",
            backgroundColor: "#005BBB",
            color: "white",
            borderRadius: "8px",
            border: "none",
            cursor: "pointer",
          }}
        >
          預約狀況查詢
        </button>

        <div style={{ marginTop: "30px", fontSize: "15px", cursor: "pointer" }}>
          登出
        </div>
      </div>
    </div>
  );
}

export default ChoosePage;
