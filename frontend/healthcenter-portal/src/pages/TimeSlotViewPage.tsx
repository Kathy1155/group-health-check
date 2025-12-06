// src/pages/TimeSlotViewPage.tsx - MODIFIED FOR DATE FILTERING

import React, { useState } from 'react';

// --- 日期工具函數 ---
const formatDate = (date: Date) => {
    // 格式化為 YYYY/MM/DD (與 MOCK_DATA 格式匹配)
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}/${month}/${day}`;
};

const getDatesForView = () => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const dayAfterTomorrow = new Date(today);
    dayAfterTomorrow.setDate(today.getDate() + 2);

    return {
        today: formatDate(today),
        tomorrow: formatDate(tomorrow),
        dayAfterTomorrow: formatDate(dayAfterTomorrow),
    };
};

const DATES = getDatesForView();

// 假資料：模擬已設定的時段名額
const MOCK_DATA = [
    // 使用今天的日期進行模擬
    { date: DATES.today, time: '8:00-10:00', package: 'A 套餐', quota: 20 },
    { date: DATES.today, time: '10:00-12:00', package: 'B 套餐', quota: 15 },
    // 使用明天的日期進行模擬
    { date: DATES.tomorrow, time: '8:00-10:00', package: 'C 套餐', quota: 30 },
    { date: DATES.tomorrow, time: '13:00-15:00', package: 'A 套餐', quota: 10, note: '新增時段' },
    // 使用後天的日期進行模擬
    { date: DATES.dayAfterTomorrow, time: '8:00-10:00', package: 'D 套餐', quota: 25 },
    // 其他日期，將被過濾掉
    { date: '2025/01/01', time: '8:00-10:00', package: 'X 套餐', quota: 5 },
];

// 模擬時段選項
const TIME_SLOT_OPTIONS = [
    { value: "all", label: "所有時段" },
    { value: "8:00-10:00", label: "8:00 - 10:00" },
    { value: "10:00-12:00", label: "10:00 - 12:00" },
    { value: "13:00-15:00", label: "13:00 - 15:00" },
];

// 過濾並獲取今天、明天和後天的資料
const filteredData = MOCK_DATA.filter(item => 
    item.date === DATES.today || 
    item.date === DATES.tomorrow || 
    item.date === DATES.dayAfterTomorrow
);
// ... (QueryResult 介面保持不變，略)
interface QueryResult {
    totalQuota: number;
    currentBooked: number;
    remaining: number;
    date: string;
    timeSlot: string;
}

function TimeSlotViewPage() {
    const [searchDate, setSearchDate] = useState('');
    const [searchTimeSlot, setSearchTimeSlot] = useState('all');
    
    // 查詢結果和彈窗狀態
    const [queryResult, setQueryResult] = useState<QueryResult | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    // ... (handleSearch 和 closeModal 保持不變，略)
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();

        if (!searchDate) {
            alert('請選擇查詢日期');
            return;
        }

        // 模擬從後端獲取數據
        const mockResult: QueryResult = {
            date: searchDate,
            timeSlot: searchTimeSlot === 'all' ? '所有時段' : searchTimeSlot,
            totalQuota: 50, // 模擬總名額
            currentBooked: 35, // 模擬當前預約人數
            remaining: 50 - 35, // 計算剩餘人數
        };
        
        setQueryResult(mockResult);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setQueryResult(null); // 清除結果
    };

    // 判斷日期標籤
    const getDateTag = (date: string) => {
        if (date === DATES.today) return <span style={{ color: '#10b981', fontWeight: 600 }}>今天</span>;
        if (date === DATES.tomorrow) return <span style={{ color: '#2563eb', fontWeight: 600 }}>明天</span>;
        if (date === DATES.dayAfterTomorrow) return <span style={{ color: '#f59e0b', fontWeight: 600 }}>後天</span>;
        return null;
    };

    // ----------------------------------------------------
    // Modal 元件 (保持不變，略)
    const Modal = ({ isOpen, result, onClose }: { isOpen: boolean, result: QueryResult | null, onClose: () => void }) => {
        if (!isOpen || !result) return null;

        return (
            <div className="modal-backdrop" style={{ 
                position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', 
                display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 
            }}>
                <div className="modal-content" style={{
                    backgroundColor: '#ffffff', padding: '30px', borderRadius: '12px',
                    maxWidth: '400px', width: '90%', boxShadow: '0 5px 15px rgba(0,0,0,0.3)',
                    textAlign: 'center'
                }}>
                    <h3 style={{ fontSize: '1.4rem', color: '#1f2937', marginBottom: '15px' }}>
                        📅 {result.date} 時段查詢結果
                    </h3>
                    <p style={{ fontWeight: 600, color: '#374151', marginBottom: '20px' }}>
                        時段：{result.timeSlot}
                    </p>

                    <div style={{ display: 'flex', justifyContent: 'space-around', margin: '20px 0', borderTop: '1px solid #e5e7eb', paddingTop: '20px' }}>
                        <div style={{ flex: 1, padding: '0 10px' }}>
                            <p style={{ fontSize: '0.8rem', color: '#6b7280' }}>總名額</p>
                            <p style={{ fontSize: '1.2rem', fontWeight: 700, color: '#2563eb' }}>{result.totalQuota}</p>
                        </div>
                        <div style={{ borderLeft: '1px solid #e5e7eb', flex: 1, padding: '0 10px' }}>
                            <p style={{ fontSize: '0.8rem', color: '#6b7280' }}>已預約</p>
                            <p style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ef4444' }}>{result.currentBooked}</p>
                        </div>
                        <div style={{ borderLeft: '1px solid #e5e7eb', flex: 1, padding: '0 10px' }}>
                            <p style={{ fontSize: '0.8rem', color: '#6b7280' }}>剩餘</p>
                            <p style={{ fontSize: '1.2rem', fontWeight: 700, color: '#10b981' }}>{result.remaining}</p>
                        </div>
                    </div>

                    <button className="primary-button" onClick={onClose} style={{ marginTop: '15px' }}>
                        關閉
                    </button>
                </div>
            </div>
        );
    };


    // ----------------------------------------------------
    // JSX 渲染部分
    // ----------------------------------------------------
    return (
        <div className="page-container">
            <div className="page-card">
                <h2 className="page-title">時段剩餘名額查詢</h2>
                
                {/* 查詢表單 (保持不變，略) */}
                <form className="page-form" onSubmit={handleSearch} style={{ marginBottom: '30px' }}>
                    <div className="form-row" style={{ gap: '20px', alignItems: 'flex-end' }}>
                        
                        {/* 查詢日期 */}
                        <div className="form-field form-field-narrow" style={{ maxWidth: 'unset' }}>
                            <label className="form-label" htmlFor="searchDate">查詢日期：</label>
                            <input
                                id="searchDate"
                                type="date"
                                value={searchDate}
                                onChange={(e) => setSearchDate(e.target.value)}
                                className="form-input"
                                required
                            />
                        </div>

                        {/* 查詢時段 */}
                        <div className="form-field form-field-narrow" style={{ maxWidth: 'unset' }}>
                            <label className="form-label" htmlFor="searchTime">時段選擇：</label>
                            <select
                                id="searchTime"
                                value={searchTimeSlot}
                                onChange={(e) => setSearchTimeSlot(e.target.value)}
                                className="form-select"
                            >
                                {TIME_SLOT_OPTIONS.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* 搜尋按鈕 */}
                        <div style={{ alignSelf: 'flex-end', paddingTop: '5px' }}>
                            <button 
                                type="submit"
                                className="primary-button"
                                style={{ padding: '0.55rem 1.6rem' }}
                            >
                                查詢
                            </button>
                        </div>
                    </div>
                </form>

                <hr style={{ border: 'none', borderTop: '1px solid #e5e7eb', margin: '20px 0' }} />

                {/* 今日/明日/後天 名額一覽表 */}
                <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '15px' }}>
                    近三天時段名額一覽
                </h3>
                
                {filteredData.length > 0 ? (
                    <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                                <th style={{ padding: '12px 8px' }}>日期</th>
                                <th style={{ padding: '12px 8px' }}>時段</th>
                                <th style={{ padding: '12px 8px' }}>套餐</th>
                                <th style={{ padding: '12px 8px', textAlign: 'center' }}>名額</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredData.map((item, index) => (
                                <tr key={index} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                    <td style={{ padding: '8px' }}>
                                        {item.date} {getDateTag(item.date)} {/* 顯示標籤 */}
                                    </td>
                                    <td style={{ padding: '8px' }}>{item.time}</td>
                                    <td style={{ padding: '8px' }}>{item.package}</td>
                                    <td style={{ padding: '8px', textAlign: 'center' }}>{item.quota}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p style={{ textAlign: 'center', color: '#6b7280', padding: '20px' }}>
                        近三日沒有已設定的時段名額。
                    </p>
                )}
            </div>
            
            {/* 彈出視窗元件 */}
            <Modal 
                isOpen={isModalOpen} 
                result={queryResult} 
                onClose={closeModal} 
            />
        </div>
    );
}

export default TimeSlotViewPage;