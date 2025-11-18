import React, { useState } from 'react';

// 定義資料結構的 TypeScript 介面
interface TimeSlot {
  date: string;
  branch: string;
  quota: number;
}

// 初始模擬資料
const initialMockData: TimeSlot[] = [
  { date: '2025-01-10', branch: '台北院區', quota: 30 },
  { date: '2025-01-10', branch: '新莊院區', quota: 20 },
  { date: '2025-01-11', branch: '台北院區', quota: 28 },
];

const TimeSlotSettingPage: React.FC = () => {
  // 將模擬資料轉換為組件的狀態，使其可變動
  const [data, setData] = useState<TimeSlot[]>(initialMockData);
  
  // 處理名額修改的邏輯
  const handleQuotaChange = (itemToUpdate: TimeSlot) => {
    // 彈出輸入框，並將當前名額轉為字串作為預設值
    const newQuotaString = prompt('請輸入新的名額', itemToUpdate.quota.toString());

    // 檢查使用者是否輸入了內容
    if (newQuotaString !== null && newQuotaString.trim() !== '') {
      const newQuota = parseInt(newQuotaString.trim(), 10);
      
      // 確保輸入的是有效的數字
      if (!isNaN(newQuota) && newQuota >= 0) {
        // 更新狀態
        setData(prevData =>
          prevData.map(item =>
            // 找到需要更新的那一筆資料（使用 date 和 branch 作為唯一鍵）
            item.date === itemToUpdate.date && item.branch === itemToUpdate.branch
              ? { ...item, quota: newQuota } // 更新名額
              : item // 保留其他資料不變
          )
        );
      } else {
        alert('名額必須是有效的數字！');
      }
    }
  };


  return (
    <div>
      <h2>時段名額設定</h2>

      <table border={1} cellPadding={6} style={{ borderCollapse: 'collapse', width: '600px' }}>
        <thead>
          <tr style={{ backgroundColor: '#f2f2f2' }}>
            <th>日期</th>
            <th>院區</th>
            <th>名額</th>
            <th>操作</th>
          </tr>
        </thead>

        <tbody>
          {data.map((item) => (
            <tr key={item.date + item.branch}>
              <td>{item.date}</td>
              <td>{item.branch}</td>
              <td>{item.quota}</td>
              <td>
                <button
                  onClick={() => handleQuotaChange(item)} // 調用修改邏輯
                  style={{ cursor: 'pointer', padding: '5px 10px' }}
                >
                  修改名額
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button style={{ marginTop: 20, padding: '8px 15px' }}>新增日期時段</button>
    </div>
  );
}

export default TimeSlotSettingPage;