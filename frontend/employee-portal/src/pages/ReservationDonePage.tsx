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

  // 重寄驗證信的 UI 狀態
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  const onResend = async (payload: {
    reservationNo: string;
    groupName: string;
    name: string;
    idNumber: string;
    phone: string;
    date: string;
    slot: string;
  }) => {
    setSending(true);
    setSent(false);
    setSendError(null);

    try {
      await resendReservationConfirmationEmail(payload);
      setSent(true);
    } catch (e) {
      console.error(e);
      setSendError("重新寄送失敗，請稍後再試。");
    } finally {
      setSending(false);
    }
  };

  // 沒有上一頁帶來的 state：給一個簡單 fallback
  if (!state) {
    return (
      <div className="page-form">
        <h2 style={{ textAlign: "center" }}>預約結果</h2>
        <p style={{ textAlign: "center" }}>
          已完成預約流程。如需再次預約，請回首頁重新操作。
        </p>

        <div className="form-footer">
          <button className="btn btn-primary" type="button" onClick={() => navigate("/")}>
            回首頁
          </button>
        </div>
      </div>
    );
  }

  const { reservationNo, groupName, date, slot, personalInfo } = state;

  return (
    <div className="page-form">
      {/* 標題 */}
      <h2 className="done-title">預約完成</h2>

      {/* 摘要卡片 */}
      <div className="done-card">
        <div className="done-row">
          <span className="done-label">預約編號</span>
          <span className="done-value">{reservationNo}</span>
        </div>
        <div className="done-row">
          <span className="done-label">團體名稱</span>
          <span className="done-value">{groupName}</span>
        </div>
        <div className="done-row">
          <span className="done-label">受檢者姓名</span>
          <span className="done-value">{personalInfo.name}</span>
        </div>
        <div className="done-row">
          <span className="done-label">身分證字號</span>
          <span className="done-value">{personalInfo.idNumber}</span>
        </div>
        <div className="done-row">
          <span className="done-label">聯絡電話</span>
          <span className="done-value">{personalInfo.phone}</span>
        </div>
        <div className="done-row">
          <span className="done-label">預約日期</span>
          <span className="done-value">{date}</span>
        </div>
        <div className="done-row">
          <span className="done-label">預約時段</span>
          <span className="done-value">{slot}</span>
        </div>
      </div>

      {/* 說明文字 */}
      <div className="done-message">
        <p style={{ margin: 0 }}>
          您的預約資料已提交。
          <br />
          請記得前往您的 Email 收取「驗證信件」，並完成驗證後才算正式完成預約。
        </p>

        {sent && (
          <p className="done-success" style={{ marginTop: 10 }}>
            已重新寄送驗證信（可查看後端終端機 log）
          </p>
        )}

        {sendError && (
          <p className="done-error" style={{ marginTop: 10 }}>
            {sendError}
          </p>
        )}
      </div>

      {/* 注意事項 */}
      <h3 style={{ marginTop: 18 }}>健檢前注意事項</h3>
      <div className="done-notes">
        <ul>
          <li>健檢前一天晚上 12 點後請勿進食（可少量喝水）。</li>
          <li>檢查當天早上請勿吃早餐、喝含糖飲料或咖啡。</li>
          <li>如有慢性病用藥，請依醫師指示是否要照常服用。</li>
          <li>若有重大疾病、心臟相關不適，請提前告知健檢中心。</li>
          <li>穿著輕便服裝，避免金屬飾品（可能干擾 X 光或儀器）。</li>
          <li>女性若可能懷孕，需提前告知並避免 X 光相關檢查。</li>
          <li>攜帶身分證件與健保卡，以利報到作業。</li>
          <li>若有過敏史（藥物或食物），請於現場告知醫護人員。</li>
        </ul>
      </div>

      <p className="done-footer-hint">
        若有任何問題，請聯絡您的團體窗口或健檢中心。
      </p>

      {/* Footer 按鈕 */}
      <div className="form-footer">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => navigate("/")}
          disabled={sending}
        >
          回首頁
        </button>

        <button
          type="button"
          className="btn btn-primary"
          onClick={() =>
            onResend({
              reservationNo,
              groupName,
              name: personalInfo.name,
              idNumber: personalInfo.idNumber,
              phone: personalInfo.phone,
              date,
              slot,
            })
          }
          disabled={sending}
        >
          {sending ? "寄送中..." : "重新寄送驗證信"}
        </button>
      </div>
    </div>
  );
};

export default ReservationDonePage;