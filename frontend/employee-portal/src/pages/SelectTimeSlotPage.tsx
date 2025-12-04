import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { fetchTimeslots, type TimeslotDto } from "../api/timeslotsApi";

// 從 Step2 帶過來的資料型別
type SlotPageState = {
  group: {
    id: number;
    code: string;
    name: string;
    contactName: string;
    idNumber: string;
  };
  branchId: number;
  packageId: number;
};

function SelectTimeSlotPage() {
  const [date, setDate] = useState("");
  const [slot, setSlot] = useState("");

  // 從後端撈回來的可預約時段
  const [slots, setSlots] = useState<TimeslotDto[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotsError, setSlotsError] = useState<string | null>(null);

  const location = useLocation();
  const navigate = useNavigate();

  const state = location.state as SlotPageState | null;

  console.log("SelectTimeSlotPage location.state = ", state);

  // 如果沒有從上一頁帶到資料（直接打網址進來），請使用者重走流程
  if (!state) {
    return <p>沒有從上一頁帶到資料，請重新從首頁開始預約。</p>;
  }

  const { group, branchId, packageId } = state;

  // 當日期改變時，向後端查詢可預約時段
  useEffect(() => {
    if (!date) {
      setSlots([]);
      setSlotsError(null);
      return;
    }

    setLoadingSlots(true);
    setSlotsError(null);

    fetchTimeslots(branchId, packageId, date)
      .then((data) => {
        setSlots(data);
        if (data.length === 0) {
          setSlotsError("此日期目前沒有可預約時段。");
        }
      })
      .catch((err) => {
        console.error(err);
        setSlotsError("載入可預約時段失敗，請稍後再試。");
      })
      .finally(() => {
        setLoadingSlots(false);
        // 日期變更時清空原本選擇的時段
        setSlot("");
      });
  }, [date, branchId, packageId]);

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();

    if (!date || !slot) return;

    // 之後可加：呼叫後端保留名額 API（POST /reservations 或 /timeslots/hold）
    // 先把目前已經選好的資訊一起帶到填寫資料那一頁
    navigate("/fill-profile", {
      state: {
        group,
        branchId,
        packageId,
        date,
        slot,
      },
    });
  };

  const handlePrev = () => {
    // 回到上一頁（保留 state）
    navigate(-1);
    // 如果你堅持用 path 也可以：
    // navigate("/select-branch-package", { state });
  };

  // 依據目前狀態決定下拉選單第一行的提示文字
  const renderSlotPlaceholder = () => {
    if (!date) return "請先選日期";
    if (loadingSlots) return "載入中...";
    if (slotsError && slots.length === 0) return slotsError;
    return "請選擇時段";
  };

  return (
    <form onSubmit={handleNext} className="page-form">
      <h2>步驟 3：選擇日期與時段</h2>

      {/* 日期選擇（使用 HTML5 Date Picker） */}
      <div style={{ marginTop: "1rem" }}>
        <label>
          日期：
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            style={{ marginLeft: "0.5rem", padding: "0.4rem" }}
          />
        </label>
      </div>

      {/* 時段選擇（改成用後端回傳的 slots） */}
      <div style={{ marginTop: "1rem" }}>
        <label>
          時段：
          <select
            value={slot}
            onChange={(e) => setSlot(e.target.value)}
            required
            disabled={!date || loadingSlots || slots.length === 0}
            style={{ marginLeft: "0.5rem", padding: "0.4rem" }}
          >
            <option value="">{renderSlotPlaceholder()}</option>
            {slots.map((s) => (
              <option key={s.slotId} value={s.time}>
                {s.time}（剩餘 {s.remaining} 位）
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* 若有錯誤訊息，顯示在下方（方便 debug / 使用者知道狀況） */}
      {slotsError && date && (
        <p style={{ color: "darkred", marginTop: "0.5rem" }}>{slotsError}</p>
      )}

      {/* 下方按鈕列 */}
      <div className="form-footer">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={handlePrev}
        >
          上一步
        </button>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={!date || !slot}
        >
          下一步
        </button>
      </div>
    </form>
  );
}

export default SelectTimeSlotPage;