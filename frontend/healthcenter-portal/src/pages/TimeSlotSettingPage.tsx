import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function TimeSlotSettingPage() {
  const navigate = useNavigate();

  const [date, setDate] = useState("");
  const [timeSlot, setTimeSlot] = useState("");
  const [customTime, setCustomTime] = useState("");
  const [packageType, setPackageType] = useState("");
  const [quota, setQuota] = useState("");

  const handleSubmit = () => {
    if (!date || !timeSlot || !packageType || !quota) {
      alert("請完整填寫資料");
      return;
    }

    const payload = {
      date,
      timeSlot: timeSlot === "other" ? customTime : timeSlot,
      packageType,
      quota,
    };

    console.log("submit payload = ", payload);

    // TODO: call backend API
    // fetch("/api/timeslot/set-quota", {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify(payload),
    // });

    alert("已設定成功！");
  };

  const handleClear = () => {
    setDate("");
    setTimeSlot("");
    setCustomTime("");
    setPackageType("");
    setQuota("");
  };

  return (
    <div className="container">
      <h1 className="title">設定每日時段名額</h1>

      <div className="card">
        {/* 日期 */}
        <div className="row">
          <label>日期：</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        {/* 時段 */}
        <div className="row">
          <label>時段：</label>

          <input
            type="radio"
            name="time"
            value="8:00-10:00"
            onChange={(e) => setTimeSlot(e.target.value)}
            checked={timeSlot === "8:00-10:00"}
          />
          8：00～10：00

          <input
            type="radio"
            name="time"
            value="10:00-12:00"
            onChange={(e) => setTimeSlot(e.target.value)}
            checked={timeSlot === "10:00-12:00"}
          />
          10：00～12：00

          <input
            type="radio"
            name="time"
            value="other"
            onChange={() => setTimeSlot("other")}
            checked={timeSlot === "other"}
          />
          其他：
          <input
            type="text"
            disabled={timeSlot !== "other"}
            value={customTime}
            onChange={(e) => setCustomTime(e.target.value)}
            placeholder="例如：13:00-15:00"
          />
        </div>

        {/* 套餐選擇 */}
        <div className="row">
          <label>套餐選擇：</label>

          {["A", "B", "C", "D"].map((p) => (
            <div key={p}>
              <input
                type="radio"
                name="pkg"
                value={p}
                onChange={(e) => setPackageType(e.target.value)}
                checked={packageType === p}
              />
              {p} 套餐
            </div>
          ))}
        </div>

        {/* 名額 */}
        <div className="row">
          <label>人數：</label>
          <select value={quota} onChange={(e) => setQuota(e.target.value)}>
            <option value="">請選擇</option>
            {[...Array(50)].map((_, i) => (
              <option key={i} value={i + 1}>
                {i + 1}
              </option>
            ))}
          </select>
        </div>

        {/* 按鈕 */}
        <div className="buttonRow">
          <button className="primaryBtn" onClick={handleSubmit}>
            設定
          </button>
          <button className="dangerBtn" onClick={handleClear}>
            清除表單
          </button>
        </div>
      </div>
    </div>
  );
}

export default TimeSlotSettingPage;
