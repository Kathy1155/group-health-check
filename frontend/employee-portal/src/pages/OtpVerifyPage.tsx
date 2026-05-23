import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import type { ClipboardEvent, KeyboardEvent } from "react";
import { verifyOtp } from "../api/verificationsApi";
import type { GroupDto } from "../api/groupsApi";

type LocationState = {
  verificationId: string;
  expiresAt: number;
  group: GroupDto;
  idNumber: string;
  groupCode: string;
};

export default function OtpVerifyPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState | undefined;

  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (!state?.expiresAt) return;

    const updateRemainingTime = () => {
      const diff = Math.max(
        0,
        Math.floor((state.expiresAt - Date.now()) / 1000),
      );

      setRemainingSeconds(diff);
      setIsExpired(diff <= 0);
    };

    updateRemainingTime();

    const timer = window.setInterval(updateRemainingTime, 1000);

    return () => window.clearInterval(timer);
  }, [state?.expiresAt]);

  const formattedTime = useMemo(() => {
    const minutes = Math.floor(remainingSeconds / 60)
      .toString()
      .padStart(2, "0");
    const seconds = (remainingSeconds % 60).toString().padStart(2, "0");
    return `${minutes}:${seconds}`;
  }, [remainingSeconds]);

  const otpDigits = Array.from({ length: 6 }, (_, index) => otp[index] ?? "");

  const updateOtpDigit = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const nextDigits = otpDigits.slice();
    nextDigits[index] = digit;
    setOtp(nextDigits.join("").slice(0, 6));

    if (digit && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const handleOtpKeyDown = (
    index: number,
    event: KeyboardEvent<HTMLInputElement>,
  ) => {
    if (event.key === "Backspace" && !otpDigits[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  const handleOtpPaste = (event: ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    const pasted = event.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    setOtp(pasted);

    const nextIndex = Math.min(pasted.length, 5);
    document.getElementById(`otp-${nextIndex}`)?.focus();
  };

  if (!state?.verificationId || !state.group || !state.idNumber) {
    return (
      <div className="reservation-page">
        <div className="reservation-page-header">
          <span className="page-badge">Email 驗證</span>
          <h1>驗證資料遺失</h1>
          <p>請返回首頁，重新開始團體健檢預約流程。</p>
        </div>

        <div className="reservation-card">
          <div className="reservation-card-header">
            <h2>無法進行驗證</h2>
            <p>系統沒有取得驗證資料，可能是重新整理或直接開啟此頁造成。</p>
          </div>

          <div className="form-footer">
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => navigate("/")}
            >
              回首頁
            </button>
          </div>
        </div>
      </div>
    );
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const data = await verifyOtp(state.verificationId, otp);

      sessionStorage.setItem("verificationToken", data.verificationToken);

      navigate("/select-branch-package", {
        state: {
          group: state.group,
          idNumber: state.idNumber,
          groupCode: state.groupCode,
        },
      });
    } catch {
      setError("驗證失敗，請確認驗證碼是否正確或是否已過期。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reservation-page">
      <div className="reservation-page-header">
        <span className="page-badge">Step 2</span>
        <h1>Email 驗證碼確認</h1>
        <p>
          系統已寄送一次性驗證碼至名冊登記的信箱，
          <br />
          請於有效時間內完成驗證後繼續預約流程。
        </p>
      </div>

      <form onSubmit={onSubmit} className="reservation-card otp-card">
        <div className="reservation-card-header">
          <div>
            <h2>輸入驗證碼</h2>
            <p>請查看信箱中的驗證碼，並輸入 6 位數字完成身分確認。</p>
          </div>
        </div>

        <div className="form-stack">
          <div className={isExpired ? "otp-countdown expired" : "otp-countdown"}>
            {isExpired
              ? "驗證碼已過期"
              : `驗證碼剩餘時間：${formattedTime}`}
          </div>

          <div className="form-row">
            <label>驗證碼</label>
            <div className="otp-input-grid" aria-label="6 位數驗證碼">
              {otpDigits.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  value={digit}
                  onChange={(e) => updateOtpDigit(index, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(index, e)}
                  onPaste={handleOtpPaste}
                  maxLength={1}
                  disabled={loading || isExpired}
                  inputMode="numeric"
                  aria-label={`驗證碼第 ${index + 1} 碼`}
                />
              ))}
            </div>
            {error && <p className="form-error">{error}</p>}
          </div>

          <div className="reservation-tip">
            驗證碼有時間限制，若已過期請返回上一步重新寄送驗證碼。
          </div>
        </div>

        <div className="form-footer">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate(-1)}
            disabled={loading}
          >
            返回
          </button>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading || otp.length !== 6 || isExpired}
          >
            {loading ? "驗證中..." : isExpired ? "驗證碼已過期" : "確認"}
          </button>
        </div>
      </form>
    </div>
  );
}
