// src/pages/TimeSlotViewPage.tsx - MODIFIED: 串接 GET API

import React, { useState, useEffect } from 'react';

// *** 修正 API 端點：與 POST 使用相同的 GET 地址 ***
const API_ENDPOINT = '/api/timeslots'; 

// --- 介面和工具函數 ---

// 必須與後端 DTO 結構一致
interface TimeSlot {
    date: string;
    timeSlot: string;
    packageType: string;
    quota: number;
}

// 查詢結果介面 (用於彈窗)
interface QueryResult {
    totalQuota: number;
    currentBooked: number;
    remaining: number;
    date: string;
    timeSlot: string;
}

// 格式化日期，用於顯示和比對
const formatDate = (date: Date) => {
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

// 模擬時段選項 (用於查詢表單)
const TIME_SLOT_OPTIONS = [
    { value: "all", label: "所有時段" },
    { value: "8:00-10:00", label: "8:00 - 10:00" },
    { value: "10:00-12:00", label: "10:00 - 12:00" },
    { value: "13:00-15:00", label: "13:00 - 15:00" },
];


function TimeSlotViewPage() {
    const [searchDate, setSearchDate] = useState('');
    const [searchTimeSlot, setSearchTimeSlot] = useState('all');
    
    // 儲存從後端載入的真實時段資料
    const [loadedTimeSlots, setLoadedTimeSlots] = useState<TimeSlot[]>([]);
    const [loadingStatus, setLoadingStatus] = useState<'loading' | 'success' | 'error'>('loading');
    
    // 查詢結果和彈窗狀態
    const [queryResult, setQueryResult] = useState<QueryResult | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    
    // ----------------------------------------------------
    // 頁面載入時：發送 GET 請求獲取所有已設定的時段
    // ----------------------------------------------------
    useEffect(() => {
        const fetchTimeSlots = async () => {
            try {
                const response = await fetch(API_ENDPOINT);

                if (!response.ok) {
                    throw new Error(`無法載入資料 (HTTP ${response.status})`);
                }
                
                // NestJS 返回的資料應該是 TimeSlot[] 陣列
                const data: TimeSlot[] = await response.json(); 
                setLoadedTimeSlots(data);
                setLoadingStatus('success');

            } catch (error) {
                console.error("載入時段資料失敗:", error);
                setLoadingStatus('error');
            }
        };

        fetchTimeSlots();
    }, []); // 空依賴陣列表示只在組件 mount 時執行一次
    

    // ----------------------------------------------------
    // 查詢邏輯 (handleSearch)
    // ----------------------------------------------------
const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    if (!searchDate) {
        alert('請選擇查詢日期');
        return;
    }

    // 將查詢日期格式化為 YYYY-MM-DD (因為後端數據是這種格式)
    const formattedSearchDate = searchDate; // 假設 searchDate 狀態已經是 YYYY-MM-DD
    const effectiveTimeSlot = searchTimeSlot === 'all' ? null : searchTimeSlot; // 如果是 'all' 則為 null

    // 1. 從載入的數據中篩選出符合查詢條件的時段
    const matchingSlots = loadedTimeSlots.filter(slot => {
        // 日期必須匹配
        const dateMatch = slot.date === formattedSearchDate;
        
        // 時段匹配 (如果是 'all' 則跳過時段篩選)
        const timeMatch = effectiveTimeSlot === null || slot.timeSlot === effectiveTimeSlot;
        
        return dateMatch && timeMatch;
    });

    // 2. 計算總名額
    let totalQuota = 0;
    if (matchingSlots.length > 0) {
        // 如果有多個時段或套餐匹配 (當查詢 'all' 時)，將所有名額加總
        totalQuota = matchingSlots.reduce((sum, slot) => sum + slot.quota, 0);
    }
    
    // ⚠️ 為了 DEMO 目的：
    // 預約人數 (currentBooked) 目前沒有真實數據源，所以我們仍使用一個簡單的模擬計算。
    // 在實際專案中，這裡應該是呼叫後端 API 獲取該日期/時段的實際預約人數。
    const currentBooked = Math.floor(totalQuota * 0.7); // 假設預約了 70%

    const finalResult: QueryResult = {
        date: searchDate,
        timeSlot: effectiveTimeSlot === null ? '所有時段' : effectiveTimeSlot,
        totalQuota: totalQuota,
        currentBooked: currentBooked,
        remaining: totalQuota - currentBooked,
    };
    
    // 檢查是否有找到設定
    if (totalQuota === 0) {
        alert(`找不到 ${searchDate} ${finalResult.timeSlot} 的時段設定名額！`);
        return;
    }

    setQueryResult(finalResult);
    setIsModalOpen(true); // 開啟彈出視窗
};

    const closeModal = () => {
        setIsModalOpen(false);
        setQueryResult(null); // 清除結果
    };

    // 判斷日期標籤
    const getDateTag = (date: string) => {
        // 後端傳來的日期是 YYYY-MM-DD，需要轉為 YYYY/MM/DD 才能匹配 DATES
        const displayDate = date.replace(/-/g, '/'); 

        if (displayDate === DATES.today) return <span style={{ color: '#10b981', fontWeight: 600 }}>今天</span>;
        if (displayDate === DATES.tomorrow) return <span style={{ color: '#2563eb', fontWeight: 600 }}>明天</span>;
        if (displayDate === DATES.dayAfterTomorrow) return <span style={{ color: '#f59e0b', fontWeight: 600 }}>後天</span>;
        return null;
    };
    
    // 過濾並獲取近三天的資料 (使用從後端載入的資料)
    const filteredData = loadedTimeSlots.filter(item => {
        // 後端資料是 YYYY-MM-DD，DATES 是 YYYY/MM/DD，需要統一格式
        const itemDate = item.date.replace(/-/g, '/');
        return itemDate === DATES.today || 
               itemDate === DATES.tomorrow || 
               itemDate === DATES.dayAfterTomorrow;
    });

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
                
                {/* 查詢表單 (保持不變) */}
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
                                disabled={loadingStatus === 'loading'}
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
                                disabled={loadingStatus === 'loading'}
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
                                disabled={loadingStatus === 'loading'}
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
                
                {loadingStatus === 'loading' && <p style={{ textAlign: 'center', color: '#6b7280', padding: '20px' }}>資料載入中...</p>}
                {loadingStatus === 'error' && <p style={{ textAlign: 'center', color: '#dc2626', padding: '20px' }}>載入失敗，請檢查後端服務是否運行。</p>}
                
                {loadingStatus === 'success' && (
                    filteredData.length > 0 ? (
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
                                        <td style={{ padding: '8px' }}>{item.timeSlot}</td>
                                        <td style={{ padding: '8px' }}>{item.packageType} 套餐</td>
                                        <td style={{ padding: '8px', textAlign: 'center' }}>{item.quota}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p style={{ textAlign: 'center', color: '#6b7280', padding: '20px' }}>
                            近三日沒有已設定的時段名額。
                        </p>
                    )
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