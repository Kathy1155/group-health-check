import React, { useState } from "react";


function ReservationListPage() {
  const [date, setDate] = useState("");
  const [timeSlot, setTimeSlot] = useState("");
  const [customTime, setCustomTime] = useState("");
  const [packageType, setPackageType] = useState("");
  const [quota, setQuota] = useState("");

  const handleSearch = () => {
    if (!date || !timeSlot || !packageType) {
      alert("請輸入搜尋條件");
      return;
    }

    const payload = {
      date,
      timeSlot: timeSlot === "other" ? customTime : timeSlot,
      packageType,
      quota,
    };

    console.log("search payload = ", payload);

    // TODO: call backend API
    // fetch(`/api/reservation/list?date=${date}&slot=${payload.timeSlot}&pkg=${packageType}`)
    //   .then(res => res.json())
    //   .then(data => console.log(data));

    alert("搜尋完成，請查看 Console Log");
  };

  return (
    <div className="container">
      <h1 className="title">預約狀況查詢</h1>

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
          />
        </div>

        {/* 套餐 */}
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

        <div className="buttonRow">
          <button className="primaryBtn" onClick={handleSearch}>
            查詢
          </button>
          <button className="dangerBtn" onClick={() => window.location.reload()}>
            重設
          </button>
        </div>
      </div>
    </div>
  );
}

export default ReservationListPage;
