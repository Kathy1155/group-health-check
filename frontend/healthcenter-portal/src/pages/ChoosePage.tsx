import { useNavigate } from "react-router-dom";

function ChoosePage() {
  const navigate = useNavigate();

  return (
    <div style={{ textAlign: "center", paddingTop: "50px" }}>
      <h2 style={{ marginBottom: '40px' }}>健檢員工登入後選擇頁面</h2>
      
      <div
        style={{
          width: "400px",
          margin: "0 auto",
          padding: "40px",
          border: "1px solid #ccc",
          borderRadius: "12px",
          boxShadow: '0 4px 8px rgba(0,0,0,0.1)' 
        }}
      >
        <p style={{ fontSize: '1.2em', marginBottom: '40px' }}>XXX，歡迎您~~</p>

        {/* 按鈕：設定每日時段名額 */}
        <button
          onClick={() => navigate("/time-slot")}
          style={{
            width: "80%",
            height: "48px",
            marginBottom: "20px",
            fontSize: "18px",
            backgroundColor: "#0056b3", // 使用深藍色
            color: "white",
            borderRadius: "4px",
            border: "none",
            cursor: "pointer",
            fontWeight: 'bold'
          }}
        >
          設定每日時段名額
        </button>

        <br />

        {/* 按鈕：預約狀況查詢 */}
        <button
          onClick={() => navigate("/reservation")}
          style={{
            width: "80%",
            height: "48px",
            fontSize: "18px",
            backgroundColor: "#0056b3", // 使用深藍色
            color: "white",
            borderRadius: "4px",
            border: "none",
            cursor: "pointer",
            fontWeight: 'bold'
          }}
        >
          預約狀況查詢
        </button>

        {/* 登出連結，樣式與截圖保持一致 */}
        <div 
          onClick={() => navigate('/')} // 導回登入頁面
          style={{ 
            marginTop: "30px", 
            fontSize: "1em", 
            cursor: "pointer",
            color: '#333' // 簡單的文字顏色
          }}
        >
          登出
        </div>
      </div>
    </div>
  );
}

export default ChoosePage;