import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchGroupByCode } from "../api/groupsApi";
import type { GroupDto } from "../api/groupsApi";
import { requestOtp } from "../api/verificationsApi";

function GroupCodePage() {
  // 使用者輸入
  const [groupCode, setGroupCode] = useState("");
  const [idNumber, setIdNumber] = useState("");

  // 錯誤 / 警告訊息
  const [groupError, setGroupError] = useState<string | null>(null);
  const [employeeWarning, setEmployeeWarning] = useState<string | null>(null);

  // 新增：OTP 請求中狀態（避免連點）
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleNext = async (e: React.FormEvent) => {
    e.preventDefault();

    // 每次送出前先清空錯誤
    setGroupError(null);
    setEmployeeWarning(null);

    // 1. 前端基本驗證：長度一定要 10 碼
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

      // 2-2. 員工名冊目前仍用前端假驗證（之後可改成呼叫後端）
      const employeeInList = mockValidateEmployee(idNumber);

      if (!employeeInList) {
        setEmployeeWarning("您不在團體名冊中，請確認資料或洽聯絡人。");
        return;
      }

      // 3. 改成：先向後端請求寄送 OTP
      // 注意：如果你後端已加 globalPrefix('api')，且前端 .env 是 .../api，這裡才能打得到
      const { verificationId } = await requestOtp({
        groupCode,
        idNumber,
      });

      // 4. 導到 OTP 頁，並把必要資訊帶過去
      // OTP 頁驗證成功後，才放行進 SelectBranchPackagePage
      navigate("/otp", {
        state: {
          verificationId,
          group,
          idNumber,
          groupCode,
        },
      });
    } catch (error) {
      console.error(error);
      // 這裡不要暴露太精準（避免被枚舉），給使用者通用訊息
      setGroupError("資料驗證失敗或系統忙碌，請稍後再試。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleNext} className="page-form">
      <h2>步驟 1：輸入團體代碼 / 身分證字號</h2>

      {/* 團體代碼輸入欄位 */}
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

      {/* 身分證字號輸入欄位 */}
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

      {/* 按鈕區塊 */}
      <div className="form-footer">
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? "寄送驗證碼中..." : "下一步"}
        </button>
      </div>
    </form>
  );
}

/**
 * 假的「員工名冊驗證」函式，
 * 之後要接後端時，把這整個換掉就好。
 */
function mockValidateEmployee(idNumber: string) {
  // 假設：身分證 "BBBBBBBBBB" 不在名冊
  const employeeInList = idNumber !== "BBBBBBBBBB";
  return employeeInList;
}

export default GroupCodePage;