import { useEffect, useMemo, useState } from "react";
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
  idNumber: string;
  branchId: number;
  packageId: number;
};

function toYMDLocal(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function SelectTimeSlotPage() {
  const [date, setDate] = useState("");
  const [slot, setSlot] = useState("");

  // 從後端撈回來的可預約時段
  const [slots, setSlots] = useState<TimeslotDto[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotsError, setSlotsError] = useState<string | null>(null);

  const location = useLocation();
  const navigate = useNavigate();

  const state = location.state as SlotPageState | undefined;

  // ⭐ 防呆：沒有從上一頁正確進來
  if (!state?.group || !state.branchId || !state.packageId) {
    return (
      <div className="page-form">
        <h2>資料遺失</h2>
        <p>請從預約流程重新開始。</p>
        <button type="button" className="btn btn-primary" onClick={() => navigate("/")}>
          回首頁
        </button>
      </div>
    );
  }

  const { group, idNumber, branchId, packageId } = state;

  // ✅ 只能選「明天(不含今天)以後」
  const minDate = useMemo(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return toYMDLocal(tomorrow); // 使用本地時區，避免 ISO 時區問題
  }, []);

  // 當日期改變時，向後端查詢可預約時段
  useEffect(() => {
    // 沒選日期 → 清空
    if (!date) {
      setSlots([]);
      setSlotsError(null);
      setSlot("");
      return;
    }

    // ✅ 防呆：若 somehow 選到過去/今天（小於 minDate），不打 API
    if (date < minDate) {
      setSlots([]);
      setSlot("");
      setSlotsError("不可選擇今天或過去日期，請選擇明天以後的日期。");
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
        setSlots([]);
      })
      .finally(() => {
        setLoadingSlots(false);
        setSlot(""); // 換日期後讓使用者重新選時段
      });
  }, [date, branchId, packageId, minDate]);

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !slot) return;

    // ✅ 最後保險：避免繞過 UI 限制
    if (date < minDate) {
      setSlotsError("不可選擇今天或過去日期，請選擇明天以後的日期。");
      return;
    }

    navigate("/fill-profile", {
      state: {
        group,
        idNumber,
        branchId,
        packageId,
        date,
        slot,
      },
    });
  };

  const handlePrev = () => navigate(-1);

  const renderSlotPlaceholder = () => {
    if (!date) return "請先選日期";
    if (date < minDate) return "請選擇明天以後的日期";
    if (loadingSlots) return "載入中...";
    if (slotsError && slots.length === 0) return slotsError;
    return "請選擇時段";
  };

  return (
    <form onSubmit={handleNext} className="page-form">
      <h2>步驟 3：選擇日期與時段</h2>
      <p>團體名稱：{group.name}</p>

      {/* 日期選擇 */}
      <div style={{ marginTop: "1rem" }}>
        <label>
          日期：
          <input
            type="date"
            value={date}
            min={minDate} // ✅ UI 層限制：只能選明天以後
            onChange={(e) => {
              const next = e.target.value;

              // 換日期就先清掉時段與提示，避免殘留舊狀態
              setSlot("");
              setSlots([]);
              setSlotsError(null);

              if (!next) {
                setDate("");
                return;
              }

              // ✅ 如果選到今天/過去，直接導回 minDate（比清空更友善）
              if (next < minDate) {
                setDate(minDate);
                setSlotsError("不可選擇今天或過去日期，已自動切換為可選的最早日期。");
                return;
              }

              setDate(next);
            }}
            required
            style={{ marginLeft: "0.5rem", padding: "0.4rem" }}
          />
        </label>
      </div>

      {/* 時段選擇 */}
      <div style={{ marginTop: "1rem" }}>
        <label>
          時段：
          <select
            value={slot}
            onChange={(e) => setSlot(e.target.value)}
            required
            disabled={!date || date < minDate || loadingSlots || slots.length === 0}
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

      {/* 錯誤訊息：只要有就顯示（避免 date 被清空時看不到） */}
      {slotsError && (
        <p style={{ color: "darkred", marginTop: "0.5rem" }}>{slotsError}</p>
      )}

      <div className="form-footer">
        <button type="button" className="btn btn-secondary" onClick={handlePrev}>
          上一步
        </button>
        <button type="submit" className="btn btn-primary" disabled={!date || !slot}>
          下一步
        </button>
      </div>
    </form>
  );
}

export default SelectTimeSlotPage;