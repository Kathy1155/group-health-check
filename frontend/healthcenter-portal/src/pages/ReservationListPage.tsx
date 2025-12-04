// src/pages/ReservationListPage.tsx (修正為使用 CSS Class)

import React, { useState } from "react";

function ReservationListPage() {
  const [date, setDate] = useState("");
  const [timeSlot, setTimeSlot] = useState("");
  const [customTime, setCustomTime] = useState("");
  const [packageType, setPackageType] = useState("");
  // 移除 headcount，因為它沒有被使用且可能造成混亂

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault(); // 阻止表單提交的預設行為

    if (!date || !timeSlot || !packageType) {
      alert("請完整選擇查詢條件");
      return;
    }

    const payload = {
      date,
      timeSlot: timeSlot === "other" ? customTime : timeSlot,
      packageType,
    };

    console.log("search payload (預約狀況查詢)", payload);
    alert("搜尋完成，請查看 Console Log");
  };
  
  const handleExport = () => {
      alert("開始匯出 CSV 檔案...");
  };
  
  const handleReset = () => {
    setDate("");
    setTimeSlot("");
    setCustomTime("");
    setPackageType("");
  };


  return (
    // 使用通用的 page-container 和 page-card 樣式
    <div className="page-container">
      <div className="page-card">
        <h2 className="page-title">預約狀況查詢界面</h2>
        
        <form className="page-form" onSubmit={handleSearch}>
            {/* 日期 - 單欄位 */}
            <div className="form-row single">
                <div className="form-field">
                    <label className="form-label" htmlFor="date">日期：</label>
                    <input
                        id="date"
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="form-input"
                    />
                </div>
            </div>

            {/* 時段 & 套餐 - 雙欄位 */}
            <div className="form-row">
                {/* 時段 */}
                <div className="form-field">
                    <label className="form-label">時段：</label>
                    <div className="radio-group radio-group-column"> 
                        <label>
                            <input
                                type="radio"
                                name="time"
                                value="8:00-10:00"
                                onChange={(e) => { setTimeSlot(e.target.value); setCustomTime(''); }}
                                checked={timeSlot === "8:00-10:00"}
                            />
                            8：00～10：00
                        </label>

                        <label>
                            <input
                                type="radio"
                                name="time"
                                value="10:00-12:00"
                                onChange={(e) => { setTimeSlot(e.target.value); setCustomTime(''); }}
                                checked={timeSlot === "10:00-12:00"}
                            />
                            10：00～12：00
                        </label>

                        <label style={{ display: 'flex', alignItems: 'center' }}>
                            <input
                                type="radio"
                                name="time"
                                value="other"
                                onChange={() => setTimeSlot("other")}
                                checked={timeSlot === "other"}
                            />
                            <span className="form-label-inline">其他：</span>
                            <input
                                type="text"
                                disabled={timeSlot !== "other"}
                                value={customTime}
                                onChange={(e) => setCustomTime(e.target.value)}
                                placeholder="例如：13:00-15:00"
                                className="form-input form-input-narrow"
                            />
                        </label>
                    </div>
                </div>

                {/* 套餐選擇 */}
                <div className="form-field">
                    <label className="form-label">套餐選擇：</label>
                    <div className="radio-group radio-group-column"> 
                        {["A", "B", "C", "D"].map((p) => (
                            <label key={p}>
                            <input
                                type="radio"
                                name="pkg"
                                value={p}
                                onChange={(e) => setPackageType(e.target.value)}
                                checked={packageType === p}
                            />
                            {p} 套餐
                            </label>
                        ))}
                    </div>
                </div>
            </div>


            {/* 按鈕 */}
            <div className="form-actions-center gap">
                <button 
                    type="submit"
                    className="primary-button"
                >
                    查詢
                </button>
                
                <button 
                    type="button"
                    onClick={handleExport}
                    className="secondary-button"
                >
                    匯出
                </button>
                
                <button 
                    type="button"
                    onClick={handleReset}
                    className="secondary-button"
                >
                    重設
                </button>
            </div>
        </form>
      </div>
    </div>
  );
}

export default ReservationListPage;