import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { resendReservationConfirmationEmail } from "../api/notificationsApi";

type DonePageState = {
  reservationNo: string;
  groupName: string;
  branchId: number;
  packageId: number;
  branchName: string;
  packageName: string;
  date: string;
  slot: string;
  personalInfo: {
    groupCode: string;
    name: string;
    idNumber: string;
    birthday: string;
    phone: string;
  };
};

function formatSlot(slot: string) {
  if (!slot) return "";

  const [start, end] = slot.split("-");

  if (!start || !end) return slot;

  return `${start.slice(0, 5)} - ${end.slice(0, 5)}`;
}

const ReservationDonePage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const state = location.state as DonePageState | null;

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

  const {
    reservationNo,
    groupName,
    branchName,
    packageName,
    date,
    slot,
    personalInfo,
  } = state;

  const displaySlot = formatSlot(slot);

useEffect(() => {
  const key = `reservation:${personalInfo.idNumber}:${personalInfo.birthday}`;

  const mockLookupResult = {
    name: personalInfo.name,
    groupName,
    branchName,
    packageName,
    date,
    slot: displaySlot,
    status: "已預約",
  };

  localStorage.setItem(key, JSON.stringify(mockLookupResult));
}, [
  personalInfo.idNumber,
  personalInfo.birthday,
  personalInfo.name,
  groupName,
  branchName,
  packageName,
  date,
  displaySlot,
]);

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
        slot: displaySlot,
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
      <h1
        style={{
          marginBottom: "1rem",
          color: "#1f7a1f",
          fontSize: "2.6rem",
          fontWeight: 700,
        }}
      >
        預約完成！
      </h1>

      <div
        style={{
          maxWidth: "560px",
          margin: "0 auto 1.5rem",
          textAlign: "left",
          lineHeight: 1.8,
          fontSize: "1rem",
          border: "1px solid #ddd",
          borderRadius: "10px",
          padding: "1.25rem 1.5rem",
          backgroundColor: "#fafafa",
          boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
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
          <strong>預約院區：</strong>
          {branchName}
        </div>
        <div>
          <strong>健檢套餐：</strong>
          {packageName}
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
          {displaySlot}
        </div>
      </div>

      <p style={{ fontSize: "1.05rem", marginBottom: "1rem" }}>
        您的預約資料已成功提交。
        <br />
        請記得前往 Email 收取驗證信件並完成驗證。
      </p>

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
            已重新寄送驗證信
          </p>
        )}

        {sendError && (
          <p style={{ marginTop: "0.75rem", color: "crimson" }}>
            {sendError}
          </p>
        )}
      </div>

      <hr style={{ margin: "2rem 0" }} />

      <div
        style={{
          maxWidth: "700px",
          margin: "0 auto",
          textAlign: "left",
          lineHeight: "1.8",
          fontSize: "1rem",
          backgroundColor: "#fafafa",
          border: "1px solid #eee",
          borderRadius: "10px",
          padding: "1.5rem",
        }}
      >
        <h2 style={{ textAlign: "center", marginBottom: "1rem" }}>
          健檢前注意事項
        </h2>

        <ul style={{ paddingLeft: "1.2rem" }}>
          <li>健檢前一天晚上 12 點後請勿進食（可少量喝水）。</li>
          <li>檢查當天早上請勿吃早餐、喝含糖飲料或咖啡。</li>
          <li>如有慢性病用藥，請依醫師指示是否照常服用。</li>
          <li>若有重大疾病或心臟相關不適，請提前告知健檢中心。</li>
          <li>穿著輕便服裝，避免金屬飾品。</li>
          <li>女性若可能懷孕，請提前告知。</li>
          <li>攜帶身分證件與健保卡，以利報到。</li>
          <li>若有過敏史，請現場主動告知醫護人員。</li>
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