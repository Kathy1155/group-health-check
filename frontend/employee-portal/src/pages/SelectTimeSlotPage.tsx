import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaRegCalendarAlt } from "react-icons/fa";
import { fetchTimeslots, type TimeslotDto } from "../api/timeslotsApi";
import { holdReservation } from "../api/reservationsApi";

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

function formatDateValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatDateLabel(dateValue: string) {
  if (!dateValue) return "年/月/日";

  const [year, month, day] = dateValue.split("-");

  return `${Number(year)}年${Number(month)}月${Number(day)}日`;
}

const todayValue = formatDateValue(new Date());

function SelectTimeSlotPage() {
  const [date, setDate] = useState("");
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(() => new Date());
  const [selectedSlotId, setSelectedSlotId] = useState<number | null>(null);
  const [slot, setSlot] = useState("");

  const [slots, setSlots] = useState<TimeslotDto[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotsError, setSlotsError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

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
      <div className="reservation-page">
        <div className="reservation-page-header">
          <span className="page-badge">流程中斷</span>
          <h1>資料遺失</h1>
          <p>請從首頁重新開始預約流程。</p>
        </div>

        <div className="reservation-card">
          <div className="reservation-card-header">
            <h2>無法繼續預約</h2>
            <p>系統沒有取得院區、套餐或團體資料。</p>
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

  const { group, idNumber, branchId, branchName, packageId, packageName } =
    state;

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

  const handleNext = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!date || !slot || selectedSlotId == null) return;

    try {
      setSubmitting(true);
      setSlotsError(null);

      const result = await holdReservation({
        groupCode: group.code,
        idNumber,
        slotId: selectedSlotId,
      });

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
          reservationId: result.reservationId,
          expiresAt: result.expiresAt,
        },
      });
    } catch (error: any) {
      console.error(error);
      const errorMessage = String(error?.message || "");
      const isSlotFull =
        errorMessage === "TIME_SLOT_FULL" ||
        errorMessage === "Internal server error" ||
        errorMessage === "HOLD_RESERVATION_FAILED";

      const message =
        errorMessage === "ACTIVE_PENDING_RESERVATION"
          ? "你目前已有尚未完成確認的預約，請先到信箱點擊確認或取消；若未處理，名額會在 10 分鐘後自動釋放。"
          : isSlotFull
            ? "這個時段剛剛已被其他人預約，請重新選擇其他時段。"
            : errorMessage || "暫時保留名額失敗，請重新選擇時段。";

      setSlotsError(message);
      if (isSlotFull) {
        setSelectedSlotId(null);
        setSlot("");
        fetchTimeslots(branchId, packageId, date)
          .then(setSlots)
          .catch((err) => console.error(err));
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handlePrev = () => {
    navigate(-1);
  };

  const calendarDays = useMemo(() => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    return [
      ...Array.from({ length: firstDay }, () => null),
      ...Array.from({ length: daysInMonth }, (_, index) => {
        const day = index + 1;
        const value = formatDateValue(new Date(year, month, day));

        return { day, value };
      }),
    ];
  }, [calendarMonth]);

  const calendarMonthLabel = `${calendarMonth.getFullYear()}年${
    calendarMonth.getMonth() + 1
  }月`;

  const changeCalendarMonth = (offset: number) => {
    setCalendarMonth(
      (current) => new Date(current.getFullYear(), current.getMonth() + offset, 1),
    );
  };

  const handleDateSelect = (nextDate: string) => {
    setDate(nextDate);
    setSelectedSlotId(null);
    setSlot("");
    setCalendarOpen(false);
  };

  const renderSlotPlaceholder = () => {
    if (!date) return "請先選日期";
    if (loadingSlots) return "載入中...";
    if (slotsError && slots.length === 0) return slotsError;
    return "請選擇時段";
  };

  return (
    <div className="reservation-page">
      <div className="reservation-page-header">
        <span className="page-badge">Step 3</span>
        <h1>選擇健檢日期與時段</h1>
        <p>
          請選擇欲前往健檢的日期，
          <span className="text-line">系統會依照院區與套餐設定。</span>
          <span className="text-line">顯示該日期可預約的時段與剩餘名額。</span>
        </p>
      </div>

      <form onSubmit={handleNext} className="reservation-card slot-card">
        <div className="reservation-card-header">
          <h2>時段預約資料</h2>
          <p>請確認團體、院區與套餐資訊後，再選擇日期與時段。</p>
        </div>

        <div className="slot-content">
          <section className="slot-summary-panel">
            <h3>目前預約項目</h3>

            <div className="summary-list">
              <div className="summary-item">
                <span>團體名稱</span>
                <strong>{group.name}</strong>
              </div>

              <div className="summary-item">
                <span>預約院區</span>
                <strong>{branchName}</strong>
              </div>

              <div className="summary-item">
                <span>健檢套餐</span>
                <strong>{packageName}</strong>
              </div>
            </div>
          </section>

          <section className="slot-select-panel">
            <div className="form-row">
              <label htmlFor="date">健檢日期</label>
              <div className="date-input-wrap">
                <button
                  id="date"
                  type="button"
                  className={date ? "date-input-button" : "date-input-button placeholder"}
                  onClick={() => setCalendarOpen((open) => !open)}
                  aria-expanded={calendarOpen}
                >
                  <span>{formatDateLabel(date)}</span>
                  <FaRegCalendarAlt className="date-input-icon" aria-hidden />
                </button>

                {calendarOpen && (
                  <div className="date-calendar-panel">
                    <div className="date-calendar-header">
                      <button
                        type="button"
                        aria-label="上一個月"
                        onClick={() => changeCalendarMonth(-1)}
                      >
                        ‹
                      </button>
                      <strong>{calendarMonthLabel}</strong>
                      <button
                        type="button"
                        aria-label="下一個月"
                        onClick={() => changeCalendarMonth(1)}
                      >
                        ›
                      </button>
                    </div>

                    <div className="date-calendar-weekdays">
                      {["日", "一", "二", "三", "四", "五", "六"].map((day) => (
                        <span key={day}>{day}</span>
                      ))}
                    </div>

                    <div className="date-calendar-grid">
                      {calendarDays.map((item, index) =>
                        item ? (
                          <button
                            type="button"
                            key={item.value}
                            className={[
                              "date-calendar-day",
                              item.value === date ? "selected" : "",
                              item.value === todayValue ? "today" : "",
                            ]
                              .filter(Boolean)
                              .join(" ")}
                            onClick={() => handleDateSelect(item.value)}
                          >
                            <span>{item.day}</span>
                            {item.value === todayValue && <small>今天</small>}
                          </button>
                        ) : (
                          <span key={`empty-${index}`} />
                        ),
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="form-row">
              <label htmlFor="slot">健檢時段</label>
              <select
                id="slot"
                value={selectedSlotId ?? ""}
                onChange={(e) => {
                  const id = Number(e.target.value);
                  const selected = slots.find((s) => Number(s.slotId) === id);

                  setSelectedSlotId(id);
                  setSlot(selected ? formatSlotTime(selected.time) : "");
                }}
                required
                disabled={
                  !date || loadingSlots || slots.length === 0 || submitting
                }
              >
                <option value="">{renderSlotPlaceholder()}</option>
                {slots.map((s) => (
                  <option key={s.slotId} value={s.slotId}>
                    {formatSlotTime(s.time)}（剩餘 {s.remaining} 位）
                  </option>
                ))}
              </select>
            </div>

            {slotsError && date && <p className="form-error">{slotsError}</p>}

            <div className="reservation-tip slot-tip">
              按下下一步後，系統會為您保留此時段 10 分鐘，請於時間內完成資料填寫並送出預約。
            </div>
          </section>
        </div>

        <div className="form-footer">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handlePrev}
            disabled={submitting}
          >
            上一步
          </button>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={!date || !slot || selectedSlotId == null || submitting}
          >
            {submitting ? "處理中..." : "下一步"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default SelectTimeSlotPage;
