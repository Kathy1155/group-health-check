import { useState } from "react";
import { useNavigate } from "react-router-dom";

function GroupCodePage() {
  // 使用者輸入
  const [groupCode, setGroupCode] = useState("");
  const [idNumber, setIdNumber] = useState("");

  // 錯誤 / 警告訊息
  const [groupError, setGroupError] = useState<string | null>(null);
  const [employeeWarning, setEmployeeWarning] = useState<string | null>(null);

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

    if (hasError) return; // 有錯就先不要往下呼叫後端

    // 2. 模擬呼叫後端驗證團體與員工
    // TODO: 之後接上後端 API 時，把下面這段假資料改成真正的 fetch / axios
    const mockResponse = mockValidate(groupCode, idNumber);
    const { groupValid, employeeInList } = mockResponse;

    // 3. 根據「後端回傳結果」設定錯誤/警告文字
    if (!groupValid) {
      setGroupError("查無此團體代碼，請確認是否輸入正確或洽窗口。");
      return; // 團體代碼無效就直接擋掉，不往下走
    }

    if (!employeeInList) {
      setEmployeeWarning("您不在團體名冊中，請確認資料或洽聯絡人。");
      return;
    }

    // 4. 都通過才導到下一步
    navigate("/select-branch-package");
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
          />
        </label>
        {/* 團體代碼錯誤訊息（紅字） */}
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
          />
        </label>
        {/* 員工名冊警告文字（可以用橘色視為警告） */}
        {employeeWarning && (
          <p style={{ color: "darkorange", marginTop: "4px" }}>
            {employeeWarning}
          </p>
        )}
      </div>

      {/* 按鈕區塊 */}
      <div className="form-footer">
        <button type="submit" className="btn btn-primary">
          下一步
        </button>
      </div>


    </form>
  );
}

/**
 * 假的驗證函式，只是為了讓你現在測試前端邏輯、顯示錯誤訊息。
 * 之後要接後端時，把這整個函式刪掉，改成呼叫真正的 API。
 */
function mockValidate(groupCode: string, idNumber: string) {
  // 假設：團體代碼 "AAAAAAAAAA" 是不存在的
  const groupValid = groupCode !== "AAAAAAAAAA";

  // 假設：身分證 "BBBBBBBBBB" 不在名冊
  const employeeInList = idNumber !== "BBBBBBBBBB";

  return { groupValid, employeeInList };
}

export default GroupCodePage;