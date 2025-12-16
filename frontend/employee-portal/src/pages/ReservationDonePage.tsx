import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { resendReservationConfirmationEmail } from "../api/notificationsApi";

type DonePageState = {
  reservationNo: string;
  groupName: string;
  branchId: number;
  packageId: number;
  date: string;
  slot: string;
  personalInfo: {
    groupCode: string;
    name: string;
    idNumber: string;
    phone: string;
  };
};

const ReservationDonePage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const state = location.state as DonePageState | null;

  // 沒有上一頁帶來的 state：給一個簡單 fallback
  if (!state) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <h1 style={{ marginBottom: "1rem" }}>預約結果</h1>
        <p style={{ fontSize: "1.1rem", marginBottom: "1.5rem" }}>
          已完成預約流程。如需再次預約，請回首頁重新操作。
        </p>
        <button
          className="btn btn-primary"
          onClick={() => navigate("/")}
          style={{ marginTop: "1rem" }}
        >
          回首頁
        </button>
      </div>
    );
  }

  const { reservationNo, groupName, date, slot, personalInfo } = state;

  // 重寄驗證信的 UI 狀態
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  const onResend = async () => {
    setSending(true);
    setSent(false);
    setSendError(null);

    try {
      await resendReservationConfirmationEmail({
        reservationNo,
        groupName,
        name: personalInfo.name,
        idNumber: personalInfo.idNumber,
        phone: personalInfo.phone,
        date,
        slot,
      });
      setSent(true);
    } catch (e) {
      console.error(e);
      setSendError("重新寄送失敗，請稍後再試。");
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <h1 style={{ marginBottom: "1rem" }}>預約完成！</h1>

      {/* 預約摘要資訊區塊 */}
      <div
        style={{
          maxWidth: "520px",
          margin: "0 auto 1.5rem",
          textAlign: "left",
          lineHeight: 1.7,
          fontSize: "1rem",
          border: "1px solid #ddd",
          borderRadius: "8px",
          padding: "1rem 1.25rem",
          backgroundColor: "#fafafa",
        }}
      >
        <div>
          <strong>預約編號：</strong>
          {reservationNo}
        </div>
        <div>
          <strong>團體名稱：</strong>
          {groupName}
        </div>
        <div>
          <strong>受檢者姓名：</strong>
          {personalInfo.name}
        </div>
        <div>
          <strong>身分證字號：</strong>
          {personalInfo.idNumber}
        </div>
        <div>
          <strong>聯絡電話：</strong>
          {personalInfo.phone}
        </div>
        <div>
          <strong>預約日期：</strong>
          {date}
        </div>
        <div>
          <strong>預約時段：</strong>
          {slot}
        </div>
      </div>

      {/* 說明文字 */}
      <p style={{ fontSize: "1.1rem", marginBottom: "1rem" }}>
        您的預約資料已提交。✅
        <br />
        請記得前往您的 Email 收取「驗證信件」，並完成驗證後才算正式完成預約。
      </p>

      {/* 重寄驗證信 */}
      <div style={{ marginBottom: "1.5rem" }}>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={onResend}
          disabled={sending}
        >
          {sending ? "寄送中..." : "重新寄送驗證信"}
        </button>

        {sent && (
          <p style={{ marginTop: "0.75rem", color: "green" }}>
            已重新寄送驗證信（請看後端終端機 log）
          </p>
        )}

        {sendError && (
          <p style={{ marginTop: "0.75rem", color: "crimson" }}>
            {sendError}
          </p>
        )}
      </div>

      <hr style={{ margin: "2rem 0" }} />

      <h2 style={{ marginBottom: "1rem" }}>健檢前注意事項</h2>

      <div
        style={{
          maxWidth: "680px",
          margin: "0 auto",
          textAlign: "left",
          lineHeight: "1.7",
          fontSize: "1rem",
        }}
      >
        <ul style={{ paddingLeft: "1.2rem" }}>
          <li>健檢前一天晚上 12 點後請勿進食（可少量喝水）。</li>
          <li>檢查當天早上請勿吃早餐、喝含糖飲料或咖啡。</li>
          <li>如有「慢性病用藥」，請依醫師指示是否要照常服用。</li>
          <li>若有重大疾病、心臟相關不適，請提前告知健檢中心。</li>
          <li>穿著輕便服裝，避免金屬飾品（可能干擾 X 光或儀器）。</li>
          <li>女性若可能懷孕，需提前告知並避免 X 光相關檢查。</li>
          <li>攜帶身分證件與健保卡，以利報到作業。</li>
          <li>若有過敏史（藥物或食物），請於現場告知醫護人員。</li>
        </ul>
      </div>

      <p style={{ marginTop: "2rem", fontSize: "0.95rem", color: "#555" }}>
        若有任何問題，請聯絡您的團體窗口或健檢中心。
      </p>

      <button
        className="btn btn-primary"
        onClick={() => navigate("/")}
        style={{ marginTop: "1.5rem" }}
      >
        回首頁
      </button>
    </div>
  );
};

export default ReservationDonePage;