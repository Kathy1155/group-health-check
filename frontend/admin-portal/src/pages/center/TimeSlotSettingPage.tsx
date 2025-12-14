import React, { useState } from "react";

const API_ENDPOINT = '/api/timeslots'; 

function TimeSlotSettingPage() {
  const [date, setDate] = useState("");
  const [timeSlot, setTimeSlot] = useState("");
  const [customTime, setCustomTime] = useState("");
  const [packageType, setPackageType] = useState("");
  const [quota, setQuota] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClear = () => {
    setDate("");
    setTimeSlot("");
    setCustomTime("");
    setPackageType("");
    setQuota("");
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !timeSlot || !packageType || !quota) {
      alert("請完整填寫資料");
      return;
    }

    const payload = {
      date,
      timeSlot: timeSlot === "other" ? customTime : timeSlot,
      packageType,
      quota: parseInt(quota, 10),
    };

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`資料設定失敗 (${response.status})`);
      }

      alert("時段名額已成功設定！");
      handleClear();
    } catch (err) {
      setError(err instanceof Error ? err.message : '發生未知錯誤');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="healthcenter-scope">
      <div className="page-container">
        <div className="page-card">
          <h2 className="page-title">設定每日時段名額</h2>

          <form className="page-form" onSubmit={handleSubmit}>
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
                        required
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
                                required
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
                                required={timeSlot === "other"}
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
                                required
                            />
                            {p} 套餐
                            </label>
                        ))}
                    </div>
                </div>
            </div>

            {/* 名額（人數） - 單欄位 */}
            <div className="form-row single">
                <div className="form-field form-field-narrow"> 
                    <label className="form-label" htmlFor="quota">名額（人數）：</label>
                    <input
                        id="quota"
                        type="number"
                        min="1"
                        value={quota}
                        onChange={(e) => setQuota(e.target.value)}
                        className="form-input"
                        style={{ maxWidth: '100px', textAlign: 'right' }} 
                        required
                    />
                </div>
            </div>

            {/* 按鈕 */}
            <div className="form-actions-center gap">
                <button 
                    type="submit"
                    className="primary-button"
                    disabled={isLoading} // 提交中禁用按鈕
                >
                    {isLoading ? '提交中...' : '設定'}
                </button>
                <button 
                    type="button"
                    onClick={handleClear}
                    className="secondary-button"
                    disabled={isLoading}
                >
                    清除表單
                </button>
            </div>

          </form>

          {error && (
            <p style={{ color: '#dc2626', marginTop: '16px', textAlign: 'center' }}>
              ⚠️ 錯誤：{error}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default TimeSlotSettingPage;
