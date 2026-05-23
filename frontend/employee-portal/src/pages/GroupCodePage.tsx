import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchGroupByCode } from "../api/groupsApi";
import type { GroupDto } from "../api/groupsApi";
import { requestOtp } from "../api/verificationsApi";
import { fetchRosterProfile } from "../api/rosterApi";

function GroupCodePage() {
  const [groupCode, setGroupCode] = useState("");
  const [idNumber, setIdNumber] = useState("");

  const [groupError, setGroupError] = useState<string | null>(null);
  const [employeeWarning, setEmployeeWarning] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleNext = async (e: React.FormEvent) => {
    e.preventDefault();

    setGroupError(null);
    setEmployeeWarning(null);

    let hasError = false;

    if (groupCode.length !== 10) {
      setGroupError("團體代碼需為 10 碼。");
      hasError = true;
    }

    if (idNumber.length !== 10) {
      setEmployeeWarning("身分證字號需為 10 碼。");
      hasError = true;
    }

    if (hasError) return;

    setLoading(true);

    try {
      const group: GroupDto | null = await fetchGroupByCode(groupCode);

      if (!group) {
        setGroupError("查無此團體代碼，請確認是否輸入正確或洽窗口。");
        return;
      }

      const participant = await fetchRosterProfile(groupCode, idNumber);

      if (!participant) {
        setEmployeeWarning("您不在團體名冊中，請確認資料或洽聯絡人。");
        return;
      }

      const { verificationId, expiresAt } = await requestOtp({
        groupCode,
        idNumber,
      });

      navigate("/otp", {
        state: {
          verificationId,
          expiresAt,
          group,
          participant,
          idNumber,
          groupCode,
        },
      });
    } catch (error) {
      console.error(error);
      setGroupError("資料驗證失敗或系統忙碌，請稍後再試。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reservation-page">
      <div className="reservation-page-header">
        <span className="page-badge">Step 1</span>
        <h1>輸入團體代碼與身分證字號</h1>
        <p>
          請輸入公司提供的團體代碼與個人身分證字號，系統將確認您的團體資格，
          並寄送查詢驗證碼至名冊中的信箱。
        </p>
      </div>

      <form onSubmit={handleNext} className="reservation-card">
        <div className="reservation-card-header">
          <div>
            <h2>身份驗證資料</h2>
            <p>請確認輸入資料正確，避免無法查詢團體名冊。</p>
          </div>
        </div>

        <div className="form-stack">
          <div className="form-row">
            <label htmlFor="groupCode">團體代碼</label>
            <input
              id="groupCode"
              value={groupCode}
              onChange={(e) => setGroupCode(e.target.value.toUpperCase())}
              maxLength={10}
              required
              disabled={loading}
              placeholder="請輸入 10 碼團體代碼，例如 AB12345678"
            />
            {groupError && <p className="form-error">{groupError}</p>}
          </div>

          <div className="form-row">
            <label htmlFor="idNumber">身分證字號</label>
            <input
              id="idNumber"
              value={idNumber}
              onChange={(e) => setIdNumber(e.target.value.toUpperCase())}
              maxLength={10}
              required
              disabled={loading}
              placeholder="請輸入 10 碼身分證字號"
            />
            {employeeWarning && (
              <p className="form-warning">{employeeWarning}</p>
            )}
          </div>
        </div>

        <div className="reservation-tip">
          驗證通過後，系統會寄送一次性驗證碼，請至名冊登記的信箱查看。
        </div>

        <div className="form-footer">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate("/")}
            disabled={loading}
          >
            返回
          </button>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "寄送驗證碼中..." : "下一步"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default GroupCodePage;
