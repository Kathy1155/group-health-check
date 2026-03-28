import React, { useState } from "react";

const API_ENDPOINT = "http://localhost:3000/api/timeslots";

function TimeSlotSettingPage() {
  const [date, setDate] = useState("");
  const [timeSlot, setTimeSlot] = useState("");
  const [packageType, setPackageType] = useState("");
  const [quota, setQuota] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClear = () => {
    setDate("");
    setTimeSlot("");
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
      timeSlot,
      packageType,
      quota: parseInt(quota, 10),
    };

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(API_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`資料設定失敗 (${response.status})`);
      }

      alert("時段名額已成功設定！");
      handleClear();
    } catch (err) {
      setError(err instanceof Error ? err.message : "發生未知錯誤");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="page-container healthcenter-scope healthcenter-form-page">
      <div className="page-card">
        <h2 className="page-title">設定每日時段名額</h2>

        <form className="page-form" onSubmit={handleSubmit}>
          <div className="form-row single">
            <div className="form-field">
              <label className="form-label" htmlFor="date">
                日期：
              </label>
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

          <div className="form-row">
            <div className="form-field">
              <label className="form-label">時段：</label>
              <div className="radio-group radio-group-column">
                {["08:00-10:00", "10:00-12:00", "13:00-15:00", "15:00-17:00"].map(
                  (slot) => (
                    <label key={slot}>
                      <input
                        type="radio"
                        name="time"
                        value={slot}
                        onChange={(e) => setTimeSlot(e.target.value)}
                        checked={timeSlot === slot}
                        required
                      />
                      {slot}
                    </label>
                  ),
                )}
              </div>
            </div>

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

          <div className="form-row single">
            <div className="form-field form-field-narrow">
              <label className="form-label" htmlFor="quota">
                名額（人數）：
              </label>
              <input
                id="quota"
                type="number"
                min="1"
                value={quota}
                onChange={(e) => setQuota(e.target.value)}
                className="form-input"
                required
              />
            </div>
          </div>

          <div className="form-actions-center gap">
            <button type="submit" className="primary-button" disabled={isLoading}>
              {isLoading ? "提交中..." : "設定"}
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

        {error && <p className="form-hint">錯誤：{error}</p>}
      </div>
    </div>
  );
}

export default TimeSlotSettingPage;