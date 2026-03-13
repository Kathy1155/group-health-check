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
      // 2-1. 向後端查詢團體資料
      const group: GroupDto | null = await fetchGroupByCode(groupCode);

      if (!group) {
        setGroupError("查無此團體代碼，請確認是否輸入正確或洽窗口。");
        return;
      }

      // 2-2. 向後端查詢此員工是否存在於該團體名冊
      const participant = await fetchRosterProfile(groupCode, idNumber);

      if (!participant) {
        setEmployeeWarning("您不在團體名冊中，請確認資料或洽聯絡人。");
        return;
      }

      // 3. 向後端請求寄送 OTP
      const { verificationId } = await requestOtp({
        groupCode,
        idNumber,
      });

      // 4. 導到 OTP 頁，並把必要資訊帶過去
      navigate("/otp", {
        state: {
          verificationId,
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
    <form onSubmit={handleNext} className="page-form">
      <h2>步驟 1：輸入團體代碼 / 身分證字號</h2>

      <div>
        <label>
          團體代碼：
          <input
            value={groupCode}
            onChange={(e) => setGroupCode(e.target.value.toUpperCase())}
            maxLength={10}
            required
            disabled={loading}
          />
        </label>
        {groupError && (
          <p style={{ color: "red", marginTop: "4px" }}>{groupError}</p>
        )}
      </div>

      <div style={{ marginTop: "12px" }}>
        <label>
          身分證字號：
          <input
            value={idNumber}
            onChange={(e) => setIdNumber(e.target.value.toUpperCase())}
            maxLength={10}
            required
            disabled={loading}
          />
        </label>
        {employeeWarning && (
          <p style={{ color: "darkorange", marginTop: "4px" }}>
            {employeeWarning}
          </p>
        )}
      </div>

      <div className="form-footer">
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? "寄送驗證碼中..." : "下一步"}
        </button>
      </div>
    </form>
  );
}

export default GroupCodePage;