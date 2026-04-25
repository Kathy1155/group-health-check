import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
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
        Math.floor((state.expiresAt - Date.now()) / 1000)
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

  if (!state?.verificationId || !state.group || !state.idNumber) {
    return (
      <div className="reservation-page">
        <div className="reservation-page-header">
          <span className="page-badge">Email 驗證</span>
          <h1>缺少驗證資訊</h1>
          <p>請返回首頁，重新開始團體健檢預約流程。</p>
        </div>

        <div className="reservation-card">
          <div className="reservation-card-header">
            <h2>無法進行驗證</h2>
            <p>系統沒有取得驗證資料，可能是直接進入此頁或流程已中斷。</p>
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
      setError("驗證失敗，請確認驗證碼是否正確或已過期。");
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
            {isExpired ? "驗證碼已過期" : `驗證碼剩餘時間：${formattedTime}`}
          </div>

          <div className="form-row">
            <label htmlFor="otp">驗證碼</label>
            <input
              id="otp"
              value={otp}
              onChange={(e) => {
                const onlyNumbers = e.target.value.replace(/\D/g, "");
                setOtp(onlyNumbers);
              }}
              placeholder="請輸入 6 位數驗證碼"
              maxLength={6}
              disabled={loading || isExpired}
              inputMode="numeric"
            />
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