// src/pages/DailyReportPage.tsx

import React, { useState } from 'react';

// 假資料
const mockReport = [
  {
    name: '林小安',
    idNumber: 'A123456789',
    package: 'A套餐',
    time: '09:00',
  },
  {
    name: '張育庭',
    idNumber: 'B987654321',
    package: 'B套餐',
    time: '10:00',
  },
  {
    name: '陳小華',
    idNumber: 'C100000000',
    package: 'C套餐',
    time: '11:00',
  },
];

function DailyReportPage() {
  const [selectedDate, setSelectedDate] = useState('2025-01-12'); 

  const handleExport = () => {
    alert(`匯出 ${selectedDate} 的報表 CSV...`);
  };

  return (
    <div className="page-container">
      <div className="page-card">
        <h2 className="page-title">每日受檢報表</h2>

        {/* 日期選擇器 */}
        <div className="form-row single" style={{ marginBottom: '20px' }}>
            <div className="form-field form-field-narrow">
                <label className="form-label" htmlFor="reportDate">查詢日期：</label>
                <input
                    id="reportDate"
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="form-input"
                />
            </div>
        </div>

        {/* 報表表格 */}
        {mockReport.length > 0 ? (
            <>
                <table className="data-table">
                    <thead>
                    <tr>
                        <th>姓名</th>
                        <th>身分證</th>
                        <th>套餐</th>
                        <th>預約時段</th>
                    </tr>
                    </thead>

                    <tbody>
                    {mockReport.map((r, idx) => (
                        <tr key={idx}>
                            <td>{r.name}</td>
                            <td>{r.idNumber}</td>
                            <td>{r.package}</td>
                            <td>{r.time}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>

                {/* 按鈕 */}
                <div className="form-actions-center" style={{ marginTop: 25 }}>
                    <button 
                        className="secondary-button" 
                        onClick={handleExport}
                    >
                        匯出 CSV
                    </button>
                </div>
            </>
        ) : (
            <p style={{ textAlign: 'center', color: '#6b7280' }}>該日期無受檢記錄。</p>
        )}
      </div>
    </div>
  );
}

export default DailyReportPage;