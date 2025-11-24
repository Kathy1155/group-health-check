import { useState } from "react";
import { useNavigate } from "react-router-dom";

const timeSlots = ["08:00", "10:00"];

function SelectTimeSlotPage() {
  const [date, setDate] = useState("");
  const [slot, setSlot] = useState("");
  const navigate = useNavigate();

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    // 之後可加：呼叫後端保留名額 API
    navigate("/fill-profile");
  };

  const handlePrev = () => {
    navigate("/select-branch-package");
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

      {/* 時段選擇 */}
      <div style={{ marginTop: "1rem" }}>
        <label>
          時段：
          <select
            value={slot}
            onChange={(e) => setSlot(e.target.value)}
            required
            style={{ marginLeft: "0.5rem", padding: "0.4rem" }}
          >
            <option value="">請選擇時段</option>
            {timeSlots.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* 下方按鈕列 */}
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