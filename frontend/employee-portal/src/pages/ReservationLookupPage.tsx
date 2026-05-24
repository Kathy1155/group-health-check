import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  lookupReservation,
  type ReservationLookupDto,
} from "../api/reservationsApi";
import { resendReservationConfirmationEmail } from "../api/notificationsApi";

type LookupResult = ReservationLookupDto;

function getStatusClassName(status: string) {
  if (status === "已確認") {
    return "lookup-status lookup-status-active";
  }
  if (status === "已取消") {
    return "lookup-status lookup-status-cancelled";
  }
  return "lookup-status";
}

function ReservationLookupPage() {
  const navigate = useNavigate();
  const resultRef = useRef<HTMLElement | null>(null);

  const [idNumber, setIdNumber] = useState("");
  const [lookupCode, setLookupCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<LookupResult | null>(null);
  const [resending, setResending] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  const [resendError, setResendError] = useState<string | null>(null);

  useEffect(() => {
    if (!result) return;

    resultRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, [result]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError(null);
    setResult(null);
    setResendMessage(null);
    setResendError(null);

    if (idNumber.trim().length !== 10) {
      setError("請輸入 10 碼身分證字號。");
      return;
    }

    if (!lookupCode.trim()) {
      setError("請輸入預約查詢驗證碼。");
      return;
    }

    setLoading(true);

    try {
      const data = await lookupReservation(
        idNumber.trim().toUpperCase(),
        lookupCode.trim().toUpperCase(),
      );
      setResult(data);
    } catch (err) {
      if (err instanceof Error && err.message === "NOT_FOUND") {
        setError("查無符合的預約資料，請確認身分證字號與查詢驗證碼是否正確。");
      } else {
        setError("查詢預約失敗，請稍後再試。");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendConfirmation = async () => {
    if (!result) return;

    setResending(true);
    setResendMessage(null);
    setResendError(null);

    try {
      await resendReservationConfirmationEmail({
        reservationId: result.reservationId,
      });

      setResendMessage("已重新寄送確認信，請至信箱查看。");
    } catch (err) {
      console.error(err);
      setResendError("重新寄送確認信失敗，請稍後再試。");
    } finally {
      setResending(false);
    }
  };

  const canResendConfirmation = result?.status === "待確認";

  return (
    <div className="reservation-page lookup-page">
      <div className="reservation-page-header">
        <span className="page-badge">預約查詢</span>
        <h1>查詢預約</h1>
        <p>
          請輸入身分證字號與確認信中的查詢驗證碼，系統會顯示目前預約狀態與健檢資訊。
        </p>
      </div>

      <div className="reservation-card lookup-card">
        <div className="reservation-card-header">
          <h2>查詢資料</h2>
          <p>驗證資料僅用於查詢您的團體健檢預約，不會顯示給其他使用者。</p>
        </div>

        <form onSubmit={handleSubmit} className="form-stack lookup-form">
          <div className="form-row">
            <label htmlFor="lookup-id-number">身分證字號</label>
            <input
              id="lookup-id-number"
              value={idNumber}
              onChange={(e) => setIdNumber(e.target.value.toUpperCase())}
              maxLength={10}
              placeholder="請輸入 10 碼身分證字號"
              required
            />
          </div>

          <div className="form-row">
            <label htmlFor="lookup-code">預約查詢驗證碼</label>
            <input
              id="lookup-code"
              type="text"
              value={lookupCode}
              onChange={(e) => setLookupCode(e.target.value.toUpperCase())}
              placeholder="請輸入確認信中的查詢驗證碼"
              required
            />
            <p className="form-hint">查詢驗證碼可在預約通知信中找到。</p>
          </div>

          {error && <p className="form-error lookup-error">{error}</p>}

          <div className="form-footer lookup-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate("/")}
            >
              返回
            </button>

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "查詢中..." : "查詢預約"}
            </button>
          </div>
        </form>

        {result && (
          <section className="lookup-result" ref={resultRef}>
            <div className="lookup-result-header">
              <div>
                <h3>預約資訊</h3>
                <p>請確認以下資料是否與您的預約內容一致。</p>
              </div>
              <span className={getStatusClassName(result.status)}>
                {result.status}
              </span>
            </div>

            <div className="summary-list lookup-result-list">
              {[
                { label: "姓名", value: result.name },
                { label: "團體名稱", value: result.groupName },
                { label: "院區", value: result.branchName },
                { label: "健檢套餐", value: result.packageName },
                { label: "日期", value: result.date },
                { label: "時段", value: result.slot },
              ].map((item) => (
                <div className="summary-item" key={item.label}>
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                </div>
              ))}
            </div>

            {canResendConfirmation && (
              <div className="lookup-resend-panel">
                <p>
                  此預約尚未完成 Email 確認。若沒有收到確認信，可以重新寄送。
                </p>

                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleResendConfirmation}
                  disabled={resending}
                >
                  {resending ? "寄送中..." : "重新寄送確認信"}
                </button>

                {resendMessage && (
                  <p className="done-success-text">{resendMessage}</p>
                )}

                {resendError && <p className="form-error">{resendError}</p>}
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}

export default ReservationLookupPage;
