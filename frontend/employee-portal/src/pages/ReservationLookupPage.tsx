// src/pages/ReservationLookupPage.tsx
import { useState } from "react";
import {
  lookupReservation,
  type ReservationLookupDto,
} from "../api/reservationsApi";

type LookupResult = ReservationLookupDto;

function ReservationLookupPage() {
  const [idNumber, setIdNumber] = useState("");
  const [birthday, setBirthday] = useState(""); // YYYY-MM-DD

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<LookupResult | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 每次查詢前先清掉狀態
    setError(null);
    setResult(null);

    // 很基本的前端檢查，之後可以再強化
    if (idNumber.length !== 10) {
      setError("請輸入完整 10 碼身分證字號。");
      return;
    }
    if (!birthday) {
      setError("請選擇生日。");
      return;
    }

    setLoading(true);

    try {
      // 呼叫真正後端 API
      const data = await lookupReservation(idNumber, birthday);
      setResult(data);
    } catch (err: any) {
      if (err instanceof Error && err.message === "NOT_FOUND") {
        setError("查無符合條件的預約資料，請確認輸入是否正確。");
      } else {
        setError("查詢失敗，請稍後再試。");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-form">
      <h2>預約查詢</h2>

      <p style={{ fontSize: "0.95rem", color: "#555", marginBottom: "1rem" }}>
        請輸入身分證字號與生日，以查詢您在本院的團體健檢預約資料。
      </p>

      <form onSubmit={handleSubmit} style={{ maxWidth: 420 }}>
        <div style={{ marginBottom: "0.75rem" }}>
          <label>
            身分證字號：
            <input
              value={idNumber}
              onChange={(e) => setIdNumber(e.target.value.toUpperCase())}
              maxLength={10}
              style={{ marginLeft: "0.5rem", padding: "0.35rem" }}
              required
            />
          </label>
        </div>

        <div style={{ marginBottom: "0.75rem" }}>
          <label>
            生日：
            <input
              type="date"
              value={birthday}
              onChange={(e) => setBirthday(e.target.value)}
              style={{ marginLeft: "0.5rem", padding: "0.35rem" }}
              required
            />
          </label>
        </div>

        {error && (
          <p style={{ color: "darkred", marginTop: "0.25rem" }}>{error}</p>
        )}

        <div className="form-footer" style={{ marginTop: "1rem" }}>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "查詢中…" : "開始查詢"}
          </button>
        </div>
      </form>

      {/* 查詢結果卡片區域 */}
      {result && (
        <div
          style={{
            marginTop: "2rem",
            padding: "1.25rem 1.5rem",
            borderRadius: "12px",
            border: "1px solid #e5e7eb",
            background: "#f9fafb",
            maxWidth: 520,
          }}
        >
          <h3 style={{ marginTop: 0, marginBottom: "0.75rem" }}>預約結果</h3>
          <p style={{ margin: 0, lineHeight: 1.7 }}>
            <strong>姓名：</strong>
            {result.name}
            <br />
            <strong>團體名稱：</strong>
            {result.groupName}
            <br />
            <strong>院區：</strong>
            {result.branchName}
            <br />
            <strong>健檢套餐：</strong>
            {result.packageName}
            <br />
            <strong>預約日期：</strong>
            {result.date}
            <br />
            <strong>預約時段：</strong>
            {result.slot}
            <br />
            <strong>預約狀態：</strong>
            {result.status}
          </p>
        </div>
      )}
    </div>
  );
}

export default ReservationLookupPage;