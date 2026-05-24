import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { resendReservationConfirmationEmail } from "../api/notificationsApi";

type DonePageState = {
  reservationId: number;
  reservationNo: string;
  emailSent?: boolean;
  emailConfirmExpiresAt?: string;
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

  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [resendCooldownUntil, setResendCooldownUntil] = useState<number | null>(
    null
  );
  const [resendRemainingSeconds, setResendRemainingSeconds] = useState(0);

  useEffect(() => {
    if (!resendCooldownUntil) return;

    const updateRemainingTime = () => {
      const diff = Math.max(
        0,
        Math.floor((resendCooldownUntil - Date.now()) / 1000)
      );
      setResendRemainingSeconds(diff);
    };

    updateRemainingTime();

    const timer = window.setInterval(updateRemainingTime, 1000);

    return () => window.clearInterval(timer);
  }, [resendCooldownUntil]);

  useEffect(() => {
    if (!state) return;

    const displaySlot = formatSlot(state.slot);
    const key = `reservation:${state.personalInfo.idNumber}:${state.personalInfo.birthday}`;

    const mockLookupResult = {
      name: state.personalInfo.name,
      groupName: state.groupName,
      branchName: state.branchName,
      packageName: state.packageName,
      date: state.date,
      slot: displaySlot,
      status: "已預約",
    };

    localStorage.setItem(key, JSON.stringify(mockLookupResult));
  }, [state]);

  if (!state) {
    return (
      <div className="reservation-page">
        <div className="reservation-page-header">
          <span className="page-badge">預約結果</span>
          <h1>已完成預約流程</h1>
          <p>如需再次預約，請回首頁重新操作。</p>
        </div>

        <div className="reservation-card done-card">
          <div className="done-actions">
            <button
              className="btn btn-primary"
              type="button"
              onClick={() => navigate("/")}
            >
              回首頁
            </button>
          </div>
        </div>
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

  const onResend = async () => {
    setSending(true);
    setSent(false);
    setSendError(null);

    try {
      const result = await resendReservationConfirmationEmail({
        reservationId: state.reservationId,
        reservationNo,
        groupName,
        name: personalInfo.name,
        idNumber: personalInfo.idNumber,
        phone: personalInfo.phone,
        date,
        slot: displaySlot,
      });

      setSent(true);
      if (result.emailConfirmExpiresAt) {
        navigate("/done", {
          replace: true,
          state: {
            ...state,
            emailConfirmExpiresAt: result.emailConfirmExpiresAt,
          },
        });
      }
      setResendCooldownUntil(Date.now() + 5 * 60 * 1000);
      setResendRemainingSeconds(5 * 60);
    } catch (e) {
      console.error(e);
      setSendError("重新寄送失敗，請稍後再試。");
    } finally {
      setSending(false);
    }
  };

  const resendButtonText = sending
    ? "寄送中..."
    : resendRemainingSeconds > 0
    ? `重新寄送確認信（${String(
        Math.floor(resendRemainingSeconds / 60)
      ).padStart(2, "0")}:${String(resendRemainingSeconds % 60).padStart(
        2,
        "0"
      )}）`
    : "重新寄送確認信";

  return (
    <div className="reservation-page">
      <div className="done-hero">
        <h1 className="done-title">
          <span className="done-check">✓</span>
          預約成立
        </h1>
        <p>
          您的預約資料已建立完成。
          <br />
          請前往 Email 確認信件，完成最終預約確認。
        </p>
      </div>

      <div className="reservation-card done-card">
        <div className="reservation-card-header">
          <h2>預約資訊</h2>
          <p>請保存預約編號，並確認以下資料是否正確。</p>
        </div>

        <div className="done-content">
          <section className="done-info-grid">
            <div className="done-info-item done-info-highlight">
              <span>預約編號</span>
              <strong>{reservationNo}</strong>
            </div>

            <div className="done-info-item">
              <span>團體名稱</span>
              <strong>{groupName}</strong>
            </div>

            <div className="done-info-item">
              <span>預約院區</span>
              <strong>{branchName}</strong>
            </div>

            <div className="done-info-item">
              <span>健檢套餐</span>
              <strong>{packageName}</strong>
            </div>

            <div className="done-info-item">
              <span>受檢者姓名</span>
              <strong>{personalInfo.name}</strong>
            </div>

            <div className="done-info-item">
              <span>身分證字號</span>
              <strong>{personalInfo.idNumber}</strong>
            </div>

            <div className="done-info-item">
              <span>聯絡電話</span>
              <strong>{personalInfo.phone}</strong>
            </div>

            <div className="done-info-item">
              <span>預約日期</span>
              <strong>{date}</strong>
            </div>

            <div className="done-info-item">
              <span>預約時段</span>
              <strong>{displaySlot}</strong>
            </div>
          </section>

          <section className="done-email-notice">
            <h3>Email 確認提醒</h3>
            <p>
              {state.emailSent === false
                ? "預約資料已建立，但確認信剛剛寄送失敗。請使用下方按鈕重新寄送。"
                : "預約資料已建立，但仍需於 10 分鐘內透過確認信完成最後確認。若未收到信件，可使用下方按鈕重新寄送。"}
            </p>

            <button
              type="button"
              className="btn btn-secondary"
              onClick={onResend}
              disabled={sending || resendRemainingSeconds > 0}
            >
              {resendButtonText}
            </button>

            {sent && <p className="done-success-text">已重新寄送確認信。</p>}

            {sendError && <p className="form-error">{sendError}</p>}
          </section>

          <section className="done-notice-card">
            <h3>健檢前注意事項</h3>

            <ul>
              <li className="notice-danger">
                健檢前一天下午 5 點後恕無法取消預約，如需異動請提前處理。
              </li>
              <li>健檢前一天晚上 12 點後請勿進食，可少量喝水。</li>
              <li>檢查當天早上請勿吃早餐、喝含糖飲料或咖啡。</li>
              <li>如有慢性病用藥，請依醫師指示是否照常服用。</li>
              <li>若有重大疾病或心臟相關不適，請提前告知健檢中心。</li>
              <li>穿著輕便服裝，避免金屬飾品。</li>
              <li>女性若可能懷孕，請提前告知。</li>
              <li>攜帶身分證件與健保卡，以利報到。</li>
              <li>若有過敏史，請現場主動告知醫護人員。</li>
            </ul>
          </section>
        </div>

        <div className="done-actions">
          <button
            className="btn btn-primary"
            type="button"
            onClick={() => navigate("/")}
          >
            回首頁
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReservationDonePage;
