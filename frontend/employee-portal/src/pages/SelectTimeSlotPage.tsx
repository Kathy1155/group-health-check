import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { fetchTimeslots, type TimeslotDto } from "../api/timeslotsApi";

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
  branchName: string;
  packageId: number;
  packageName: string;
};

function formatSlotTime(time: string) {
  return time
    .split("-")
    .map((part) => part.trim().slice(0, 5))
    .join("-");
}

function SelectTimeSlotPage() {
  const [date, setDate] = useState("");
  const [selectedSlotId, setSelectedSlotId] = useState<number | null>(null);
  const [slot, setSlot] = useState("");

  const [slots, setSlots] = useState<TimeslotDto[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotsError, setSlotsError] = useState<string | null>(null);

  const location = useLocation();
  const navigate = useNavigate();

  const state = location.state as SlotPageState | undefined;

  if (
    !state?.group ||
    !state.branchId ||
    !state.packageId ||
    !state.branchName ||
    !state.packageName
  ) {
    return (
      <div className="page-form">
        <h2>資料遺失</h2>
        <p>請從預約流程重新開始。</p>
        <button type="button" onClick={() => navigate("/")}>
          回首頁
        </button>
      </div>
    );
  }

  const {
    group,
    idNumber,
    branchId,
    branchName,
    packageId,
    packageName,
  } = state;

  useEffect(() => {
    if (!date) {
      setSlots([]);
      setSlotsError(null);
      setSelectedSlotId(null);
      setSlot("");
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
        setSlots([]);
        setSlotsError("載入可預約時段失敗，請稍後再試。");
      })
      .finally(() => {
        setLoadingSlots(false);
        setSelectedSlotId(null);
        setSlot("");
      });
  }, [date, branchId, packageId]);

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();

    if (!date || !slot || selectedSlotId == null) return;

    navigate("/fill-profile", {
      state: {
        group,
        idNumber,
        branchId,
        branchName,
        packageId,
        packageName,
        date,
        slotId: selectedSlotId,
        slot,
      },
    });
  };

  const handlePrev = () => {
    navigate(-1);
  };

  const renderSlotPlaceholder = () => {
    if (!date) return "請先選日期";
    if (loadingSlots) return "載入中...";
    if (slotsError && slots.length === 0) return slotsError;
    return "請選擇時段";
  };

  return (
    <form onSubmit={handleNext} className="page-form">
      <h2>步驟 3：選擇日期與時段</h2>
      <p>團體名稱：{group.name}</p>
      <p>預約院區：{branchName}</p>
      <p>健檢套餐：{packageName}</p>

      <div style={{ marginTop: "1rem" }}>
        <label>
          日期：
          <input
            type="date"
            value={date}
            onChange={(e) => {
              setDate(e.target.value);
              setSelectedSlotId(null);
              setSlot("");
            }}
            required
            style={{ marginLeft: "0.5rem", padding: "0.4rem" }}
          />
        </label>
      </div>

      <div style={{ marginTop: "1rem" }}>
        <label>
          時段：
          <select
            value={selectedSlotId ?? ""}
            onChange={(e) => {
              const id = Number(e.target.value);
              const selected = slots.find((s) => Number(s.slotId) === id);

              setSelectedSlotId(id);
              setSlot(selected ? formatSlotTime(selected.time) : "");
            }}
            required
            disabled={!date || loadingSlots || slots.length === 0}
            style={{ marginLeft: "0.5rem", padding: "0.4rem" }}
          >
            <option value="">{renderSlotPlaceholder()}</option>
            {slots.map((s) => (
              <option key={s.slotId} value={s.slotId}>
                {formatSlotTime(s.time)}（剩餘 {s.remaining} 位）
              </option>
            ))}
          </select>
        </label>
      </div>

      {slotsError && date && (
        <p style={{ color: "darkred", marginTop: "0.5rem" }}>
          {slotsError}
        </p>
      )}

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
          disabled={!date || !slot || selectedSlotId == null}
        >
          下一步
        </button>
      </div>
    </form>
  );
}

export default SelectTimeSlotPage;