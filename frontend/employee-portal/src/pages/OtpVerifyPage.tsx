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

  // 防呆：避免使用者直接輸入 /otp
  if (!state?.verificationId || !state.group || !state.idNumber) {
    return (
      <div className="page-form">
        <h2>步驟 0：Email 驗證碼</h2>
        <p>缺少驗證資訊，請返回重新開始預約流程。</p>
        <button type="button" onClick={() => navigate("/")}>
          回首頁
        </button>
      </div>
    );
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const data = await verifyOtp(state.verificationId, otp);

      // 先存 token（之後你可在其他 API 呼叫時帶 Authorization）
      sessionStorage.setItem("verificationToken", data.verificationToken);

      // 驗證成功才放行到下一步，並把原本流程需要的 state 接續帶過去
      navigate("/select-branch-package", {
        state: {
          group: state.group,
          idNumber: state.idNumber,
          groupCode: state.groupCode,
        },
      });
    } catch {
      setError("驗證失敗，請確認驗證碼是否正確或已過期");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="page-form">
      <h2>步驟 0：Email 驗證碼</h2>

      <p style={{ marginTop: 0 }}>
        已送出一次性驗證碼，請至信箱收信後輸入。
      </p>

      <p
        style={{
          marginTop: 8,
          marginBottom: 16,
          fontWeight: 700,
          color: isExpired ? "crimson" : "#6d4aff",
        }}
      >
        {isExpired ? `驗證碼已過期` : `驗證碼剩餘時間：${formattedTime}`}
      </p>

      <label>
        驗證碼
        <input
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          placeholder="6 位數"
          maxLength={6}
          disabled={loading}
        />
      </label>

      {error && <p style={{ color: "crimson" }}>{error}</p>}

      <div className="form-footer">
        <button type="button" onClick={() => navigate(-1)} disabled={loading}>
          返回
        </button>

      <button type="submit" disabled={loading || otp.length === 0 || isExpired}>
        {loading ? "驗證中..." : isExpired ? "驗證碼已過期" : "確認"}
      </button>
      </div>
    </form>
  );
}