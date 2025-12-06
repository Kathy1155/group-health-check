// src/pages/TimeSlotSettingPage.tsx

import React, { useState } from "react";

// *** 請修改此處為您的實際後端 API 位址 ***
const API_ENDPOINT = 'https://jsonplaceholder.typicode.com/posts'; 

function TimeSlotSettingPage() {
  const [date, setDate] = useState("");
  const [timeSlot, setTimeSlot] = useState("");
  const [customTime, setCustomTime] = useState("");
  const [packageType, setPackageType] = useState("");
  const [quota, setQuota] = useState("");
  
  // 新增狀態來處理載入和錯誤訊息
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

    // 建立要發送給後端的資料 Payload
    const payload = {
      date,
      // 根據是否選擇「其他」來決定時段的值
      timeSlot: timeSlot === "other" ? customTime : timeSlot, 
      packageType,
      quota: parseInt(quota, 10), // 將名額轉換為數字
    };

    setIsLoading(true);
    setError(null);
    
    try {
        // 使用 fetch 發送 POST 請求
        const response = await fetch(API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // 如果需要身份驗證，請在這裡加入 'Authorization'
            },
            body: JSON.stringify(payload), // 將資料轉換為 JSON 格式字串
        });

        // 檢查 HTTP 狀態碼是否在 200-299 範圍內
        if (!response.ok) {
            // 嘗試從響應中讀取錯誤訊息（如果後端有提供）
            let errorMessage = '資料設定失敗';
            try {
                const errorData = await response.json();
                errorMessage = errorData.message || errorData.error || errorMessage;
            } catch (jsonError) {
                // 如果無法解析 JSON，使用狀態碼訊息
                errorMessage = `資料設定失敗 (HTTP Status: ${response.status})`;
            }
            throw new Error(errorMessage);
        }

        // 成功處理
        // 假設後端會返回成功的 JSON 訊息
        console.log("API 響應成功：", await response.json()); 
        
        alert("時段名額已成功設定！");
        handleClear(); // 清空表單
        
    } catch (err) {
        // 錯誤處理
        console.error('API 請求發生錯誤:', err);
        const displayError = err instanceof Error ? err.message : '發生未知錯誤';
        setError(displayError);
        // 使用 console.log 替代 alert，避免干擾使用者體驗
        console.log(`設定失敗：${displayError}`);
    } finally {
        setIsLoading(false);
    }
  };

  return (
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

            {/* 錯誤提示 */}
            {error && (
                <p style={{ color: '#dc2626', marginTop: '16px', textAlign: 'center', fontWeight: 500 }}>
                    ⚠️ 錯誤：{error}
                </p>
            )}
        </form>
      </div>
    </div>
  );
}

export default TimeSlotSettingPage;