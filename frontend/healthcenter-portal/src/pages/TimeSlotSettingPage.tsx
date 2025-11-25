import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // 引入 useNavigate

function TimeSlotSettingPage() {
  const navigate = useNavigate(); // 初始化 navigate
    
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
    <div style={{ maxWidth: 600, margin: '50px auto', padding: '30px' }}>
      
      {/* ★★★ 新增：返回按鈕 ★★★ */}
      <div style={{ marginBottom: '20px', textAlign: 'left' }}>
        <button
          onClick={() => navigate('/selection')} // 導航回功能選擇頁面
          style={{
            padding: '8px 15px',
            backgroundColor: '#6c757d', // 灰色按鈕
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '1em'
          }}
        >
          &larr; 返回主選單
        </button>
      </div>
      {/* ★★★ 新增結束 ★★★ */}

      <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>設定每日時段名額</h1>

      <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
        {/* 日期 */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
          <label style={{ minWidth: '80px' }}>日期：</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            style={{ padding: '5px', border: '1px solid #ddd', borderRadius: '4px' }}
          />
        </div>

        {/* 時段 & 套餐 - 使用 flex 布局模擬截圖左右分欄 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
            
            {/* 時段 */}
            <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '10px' }}>時段：</label>
                <div style={{ marginLeft: '10px' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>
                        <input
                            type="radio"
                            name="time"
                            value="8:00-10:00"
                            onChange={(e) => { setTimeSlot(e.target.value); setCustomTime(''); }}
                            checked={timeSlot === "8:00-10:00"}
                        />
                        8：00～10：00
                    </label>

                    <label style={{ display: 'block', marginBottom: '5px' }}>
                        <input
                            type="radio"
                            name="time"
                            value="10:00-12:00"
                            onChange={(e) => { setTimeSlot(e.target.value); setCustomTime(''); }}
                            checked={timeSlot === "10:00-12:00"}
                        />
                        10：00～12：00
                    </label>

                    <label style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
                        <input
                            type="radio"
                            name="time"
                            value="other"
                            onChange={() => setTimeSlot("other")}
                            checked={timeSlot === "other"}
                        />
                        <span style={{ marginRight: '5px' }}>其他：</span>
                        <input
                            type="text"
                            disabled={timeSlot !== "other"}
                            value={customTime}
                            onChange={(e) => setCustomTime(e.target.value)}
                            placeholder="例如：13:00-15:00"
                            style={{ padding: '4px', width: '120px' }}
                        />
                    </label>
                </div>
            </div>

            {/* 套餐選擇 */}
            <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '10px' }}>套餐選擇：</label>
                <div style={{ marginLeft: '10px' }}>
                    {["A", "B", "C", "D"].map((p) => (
                        <label key={p} style={{ display: 'block', marginBottom: '5px' }}>
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


        {/* 名額（人數） */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '30px' }}>
          <label style={{ minWidth: '80px' }}>人數：</label>
          <input
            type="number"
            min="1"
            value={quota}
            onChange={(e) => setQuota(e.target.value)}
            style={{ padding: '5px', width: '80px', textAlign: 'right', border: '1px solid #ddd', borderRadius: '4px' }}
          />
        </div>

        {/* 按鈕 */}
        <div style={{ textAlign: 'center' }}>
          <button 
            onClick={handleSubmit}
            style={{ 
                padding: '8px 20px', 
                backgroundColor: '#0056b3', 
                color: 'white', 
                border: 'none', 
                borderRadius: '4px', 
                cursor: 'pointer',
                marginRight: '10px'
            }}
          >
            設定
          </button>
          <button 
            onClick={handleClear}
            style={{ 
                padding: '8px 20px', 
                backgroundColor: 'darkred', 
                color: 'white', 
                border: 'none', 
                borderRadius: '4px', 
                cursor: 'pointer'
            }}
          >
            清除表單
          </button>
        </div>
      </div>
    </div>
  );
}

export default TimeSlotSettingPage;