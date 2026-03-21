// src/pages/ReservationListPage.tsx - MODIFIED: 串接 Reservations API

import React, { useState, useEffect } from "react"; 

// 輔助函數：將 JSON 陣列轉換為 CSV 字串
const convertToCsv = (data: Reservation[]): string => {
    if (data.length === 0) return "";
    
    // 1. 定義標題列 (CSV Header)
    const headers = ["姓名", "身分證", "電話", "日期", "時段", "套餐", "狀態"];
    
    // 2. 將標題列轉為 CSV 格式 (用逗號分隔)
    const headerRow = headers.join(',');
    
    // 3. 轉換數據行
    const dataRows = data.map(item => [
        item.name,
        item.idNumber,
        item.phone,
        item.date,
        item.timeSlot,
        item.packageType,
        item.status
    ].map(field => `"${field}"`).join(',')); // 用雙引號包裹字段，防止內容中的逗號出錯
    
    // 4. 合併標題和數據行，用換行符 (\n) 分隔
    return [headerRow, ...dataRows].join('\n');
};

// --- 介面和假資料定義 ---
type ReservationStatus = '已預約' | '已報到' | '已取消';

interface Reservation {
    id: number;
    name: string;
    idNumber: string; 
    phone: string;
    date: string; 
    timeSlot: string;
    packageType: string;
    status: ReservationStatus;
}

// 假資料已移至後端 Service，這裡只需要選項定義
const TIME_SLOT_OPTIONS = [
    { value: "8:00-10:00", label: "8:00 - 10:00" },
    { value: "10:00-12:00", label: "10:00 - 12:00" },
    { value: "13:00-15:00", label: "13:00 - 15:00" },
];

const STATUS_OPTIONS: ReservationStatus[] = ['已預約', '已報到', '已取消'];
const ALL_STATUSES: ReservationStatus[] = ['已預約', '已報到', '已取消'];
const EXPORT_STATUS_OPTIONS = ALL_STATUSES;

// API 端點
const API_ENDPOINT = 'http://localhost:3000/api/reservations'; 

interface ModifyModalProps {
    isOpen: boolean;
    reservation: Reservation | null;
    currentStatus: ReservationStatus;
    onStatusChange: (newStatus: ReservationStatus) => void;
    onSave: (id: number, newStatus: ReservationStatus) => void;
    onClose: () => void;
}

const ModifyModal: React.FC<ModifyModalProps> = ({ 
    isOpen, 
    reservation, 
    currentStatus, 
    onStatusChange, 
    onSave, 
    onClose 
}) => {
    if (!isOpen || !reservation) return null;
    const handleSave = () => { onSave(reservation.id, currentStatus); };
    return (
        <div className="modal-backdrop" style={{ 
            position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', 
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 
        }}>
            <div className="modal-content" style={{
                backgroundColor: '#ffffff', padding: '30px', borderRadius: '12px',
                maxWidth: '450px', width: '90%', boxShadow: '0 5px 15px rgba(0,0,0,0.3)',
            }}>
                <h3 style={{ fontSize: '1.4rem', color: '#1f2937', marginBottom: '20px', borderBottom: '1px solid #e5e7eb', paddingBottom: '10px' }}>
                    修改預約狀態
                </h3>
                <p style={{ marginBottom: '10px' }}>
                    預約人: {reservation.name} ({reservation.idNumber})
                </p>
                <p style={{ marginBottom: '20px' }}>
                    時段: {reservation.date} / {reservation.timeSlot} / {reservation.packageType} 套餐
                </p>
                <div className="form-field" style={{ marginBottom: '30px' }}>
                    <label className="form-label" htmlFor="statusSelect" style={{ fontWeight: 600, display: 'block', marginBottom: '5px' }}>
                        選擇新狀態：
                    </label>
                    <select
                        id="statusSelect"
                        value={currentStatus}
                        onChange={(e) => onStatusChange(e.target.value as ReservationStatus)}
                        className="form-select"
                        style={{ width: '100%' }}
                    >
                        {STATUS_OPTIONS.map((status) => (
                            <option key={status} value={status}>{status}</option>
                        ))}
                    </select>
                </div>
                <div className="form-actions-center" style={{ gap: '15px' }}>
                    <button className="primary-button" onClick={handleSave}>
                        儲存修改
                    </button>
                    <button className="secondary-button" onClick={onClose}>
                        取消
                    </button>
                </div>
            </div>
        </div>
    );
};
// --- 修改狀態彈窗元件結束 ---


// --- 主要元件 ReservationListPage ---
function ReservationListPage() {
  const [date, setDate] = useState("");
  const [timeSlot, setTimeSlot] = useState("");
  const [customTime, setCustomTime] = useState("");
  const [packageType, setPackageType] = useState("");
  const [reservationStatus, setReservationStatus] = useState("all"); 

  // 預約清單狀態 (現在從 API 載入)
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loadingStatus, setLoadingStatus] = useState<'loading' | 'success' | 'error'>('loading');

  const [searchResults, setSearchResults] = useState<Reservation[] | null>(null);
  const [exportFilter, setExportFilter] = useState<ReservationStatus[]>(ALL_STATUSES);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReservation, setEditingReservation] = useState<Reservation | null>(null);
  const [tempStatus, setTempStatus] = useState<ReservationStatus>('已預約'); 
  
  const handleExportFilterChange = (status: ReservationStatus, isChecked: boolean) => {
    setExportFilter(prev => {
        if (isChecked) {
            return [...prev, status];
        } else {
            return prev.filter(s => s !== status);
        }
    });
  };

  // --- 頁面載入時：發送 GET 請求獲取所有預約 ---
  const fetchReservations = async () => {
    try {
        const response = await fetch(API_ENDPOINT);
        if (!response.ok) {
            throw new Error(`無法載入預約資料 (HTTP ${response.status})`);
        }
        const data: Reservation[] = await response.json(); 
        setReservations(data);
        setLoadingStatus('success');
    } catch (error) {
        console.error("載入預約資料失敗:", error);
        setLoadingStatus('error');
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []); 

  // 重新載入數據的工具函數 (用於修改後更新清單)
  const refetchData = () => {
    setLoadingStatus('loading');
    fetchReservations();
    // 清空查詢結果，讓使用者重新查詢
    setSearchResults(null);
  }
  
  // 搜尋邏輯 (使用 loaded reservations 數據進行篩選)
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault(); 
    if (!date) { alert("請選擇查詢日期"); return; }
    
    // ... (篩選邏輯保持不變)
    const effectiveTimeSlot = timeSlot === "other" ? customTime : timeSlot;
    const effectivePackage = packageType;
    const effectiveStatus = reservationStatus;

    const results = reservations.filter(res => {
        if (res.date !== date) return false;
        if (timeSlot && timeSlot !== 'all' && res.timeSlot !== effectiveTimeSlot) return false;
        if (packageType && packageType !== 'all' && res.packageType !== effectivePackage) return false;
        if (effectiveStatus !== 'all' && res.status !== effectiveStatus) return false;
        return true;
    });

    setSearchResults(results);
  };
  
  // 匯出功能 (保持不變)
const handleExport = () => {
    if (!searchResults || searchResults.length === 0) {
        alert("沒有查詢結果可以匯出。請先執行查詢。");
        return;
    }
    
    // 篩選出符合使用者選擇狀態的數據
    const dataToExport = searchResults.filter(res => exportFilter.includes(res.status));

    if (exportFilter.length === 0) {
        alert("請選擇至少一個預約狀態進行匯出。");
        return;
    }

    if (dataToExport.length === 0) {
        alert("當前查詢結果中，找不到符合您選擇的狀態的資料可以匯出。");
        return;
    }

    // 核心邏輯：將數據轉為 CSV 並觸發下載
    try {
        const csvString = convertToCsv(dataToExport);

        // 創建 Blob 物件 (用於下載的二進制數據)
        const blob = new Blob([new Uint8Array([0xef, 0xbb, 0xbf]), csvString], { type: 'text/csv;charset=utf-8;' });
        // [0xef, 0xbb, 0xbf] 是 UTF-8 BOM，確保 Excel 打開時中文不亂碼

        // 創建下載連結
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        
        // 設定下載檔案名稱
        const dateString = new Date().toLocaleDateString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '');
        a.download = `預約報表_${dateString}.csv`; 
        
        // 模擬點擊下載
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url); // 釋放創建的 URL

        // 提示使用者
        alert(`已成功匯出 ${dataToExport.length} 筆 CSV 檔案到您的電腦。`);

    } catch (e) {
        console.error("CSV 匯出失敗:", e);
        alert("檔案匯出過程中發生錯誤。");
    }
};
  
  // 重設表單 (保持不變)
  const handleReset = () => {
    setDate("");
    setTimeSlot("");
    setCustomTime("");
    setPackageType("");
    setReservationStatus("all");
    setSearchResults(null);
  };

  // 開啟/關閉彈窗 (保持不變)
  const openModifyModal = (reservation: Reservation) => {
    setEditingReservation(reservation);
    setTempStatus(reservation.status as ReservationStatus); 
    setIsModalOpen(true);
  };
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingReservation(null);
  };
  
  // --- 儲存修改後的狀態 (PATCH API) ---
  const handleSaveModification = async (id: number, newStatus: ReservationStatus) => {
    try {
        const response = await fetch(`${API_ENDPOINT}/${id}`, {
            method: 'PATCH', // 使用 PATCH 方法更新狀態
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `狀態更新失敗 (HTTP ${response.status})`);
        }

        // 成功後重新獲取清單，確保數據是最新的
        refetchData(); 
        
        alert(`預約 #${id} 狀態已成功修改為：${newStatus}`);
        closeModal();

    } catch (err) {
        alert(`狀態更新失敗：${err instanceof Error ? err.message : '未知錯誤'}`);
    }
  };

  // --- 取消預約邏輯 (PATCH API) ---
  const handleCancel = async (reservation: Reservation) => {
    const isConfirmed = window.confirm(
        `⚠️您確定要取消 ${reservation.name} 於 ${reservation.date} ${reservation.timeSlot} 的預約嗎？`
    );
    
    if (isConfirmed) {
        try {
            await handleSaveModification(reservation.id, '已取消'); // 重用狀態修改邏輯
        } catch (error) {
            // 錯誤已在 handleSaveModification 內處理
        }
    }
  };

  // 根據狀態設定文字顏色 (保持不變)
  const getStatusColor = (status: ReservationStatus) => {
      switch (status) {
          case '已報到': return '#10b981'; 
          case '已取消': return '#ef4444'; 
          case '已預約': default: return '#2563eb'; 
      }
  };


  // --- JSX 渲染部分 ---
  return (
    <div className="healthcenter-scope">
    <div className="page-container">
      <div className="page-card">
        <h2 className="page-title">預約狀況查詢及修改</h2>
        
        {/* 查詢表單 (保持不變) */}
        <form className="page-form" onSubmit={handleSearch}>
            {/* ... (表單內容保持不變) ... */}
            
            {/* 第一行：日期、時段 */}
            <div className="form-row">
                
                <div className="form-field form-field-narrow">
                    <label className="form-label" htmlFor="date">預約日期：</label>
                    <input
                        id="date"
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="form-input"
                        required
                        disabled={loadingStatus !== 'success'}
                    />
                </div>

                <div className="form-field form-field-narrow">
                    <label className="form-label" htmlFor="timeSlot">時段選擇：</label>
                    <select
                        id="timeSlot"
                        value={timeSlot}
                        onChange={(e) => setTimeSlot(e.target.value)}
                        className="form-select"
                        required
                        disabled={loadingStatus !== 'success'}
                    >
                        <option value="all">所有時段</option>
                        {TIME_SLOT_OPTIONS.map((opt) => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
                        <option value="other">其他 (手動輸入)</option>
                    </select>
                </div>
                
                {timeSlot === "other" && (
                    <div className="form-field form-field-narrow">
                        <label className="form-label" htmlFor="customTime">手動輸入時段：</label>
                        <input id="customTime" type="text" value={customTime} onChange={(e) => setCustomTime(e.target.value)} className="form-input" placeholder="例如：15:00-17:00" required/>
                    </div>
                )}
            </div>

            {/* 第二行：套餐、狀態 */}
            <div className="form-row">
                
                <div className="form-field">
                    <label className="form-label">套餐類型：</label>
                    <div className="radio-group radio-group-column"> 
                        <label><input type="radio" name="pkg" value="all" onChange={() => setPackageType("all")} checked={packageType === "all" || packageType === ""} disabled={loadingStatus !== 'success'}/>所有套餐</label>
                        {["A", "B", "C", "D"].map((p) => (<label key={p}><input type="radio" name="pkg" value={p} onChange={(e) => setPackageType(e.target.value)} checked={packageType === p} disabled={loadingStatus !== 'success'}/>{p} 套餐</label>))}
                    </div>
                </div>

                <div className="form-field form-field-narrow">
                    <label className="form-label" htmlFor="status">預約狀態：</label>
                    <select id="status" value={reservationStatus} onChange={(e) => setReservationStatus(e.target.value)} className="form-select" required disabled={loadingStatus !== 'success'}>
                        <option value="all">所有狀態</option>
                        {STATUS_OPTIONS.map((status) => (<option key={status} value={status}>{status}</option>))}
                    </select>
                </div>

            </div>


            {/* 按鈕 */}
            <div className="form-actions-center gap">
                <button type="submit" className="primary-button" disabled={loadingStatus !== 'success'}>
                    查詢
                </button>
                
                <button type="button" onClick={handleReset} className="secondary-button" disabled={loadingStatus !== 'success'}>
                    重設
                </button>
            </div>
        </form>

        
        {/* 載入/錯誤訊息 */}
        {loadingStatus === 'loading' && <p style={{ textAlign: 'center', marginTop: '30px', color: '#6b7280' }}>預約資料載入中...</p>}
        {loadingStatus === 'error' && <p style={{ textAlign: 'center', marginTop: '30px', color: '#dc2626' }}>❌ 無法連接後端，請檢查服務是否運行。</p>}

        
        {/* 查詢結果顯示區域 */}
        {loadingStatus === 'success' && searchResults && (
            <div style={{ marginTop: '30px', paddingTop: '20px', borderTop: '1px solid #e5e7eb' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 600 }}>🔍 查詢結果 ({searchResults.length} 筆)</h3>
                    
                    {/* 匯出篩選與按鈕 */}
                    <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                        <label className="form-label" style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600 }}>匯出狀態：</label>
                        
                        {/* Checkboxes Group */}
                        <div style={{ display: 'flex', gap: '10px' }}>
                            {EXPORT_STATUS_OPTIONS.map(status => (
                                <label key={status} style={{ display: 'flex', alignItems: 'center', fontSize: '0.9rem' }}>
                                    <input type="checkbox" value={status} checked={exportFilter.includes(status)} onChange={(e) => handleExportFilterChange(status, e.target.checked)} style={{ marginRight: '4px' }}/>
                                    {status}
                                </label>
                            ))}
                        </div>

                        <button type="button" onClick={handleExport} className="secondary-button" disabled={searchResults.length === 0 || exportFilter.length === 0} style={{ marginLeft: '10px' }}>
                            匯出 CSV ({exportFilter.length} 項)
                        </button>
                    </div>
                </div>

                {searchResults.length > 0 ? (
                    <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                                <th style={{ padding: '12px 8px' }}>姓名</th>
                                <th style={{ padding: '12px 8px' }}>身分證 / 電話</th>
                                <th style={{ padding: '12px 8px' }}>時段 (套餐)</th>
                                <th style={{ padding: '12px 8px', textAlign: 'center' }}>狀態</th>
                                <th style={{ padding: '12px 8px', textAlign: 'center' }}>操作</th>
                            </tr>
                        </thead>
                        <tbody>
                            {searchResults.map((res) => (
                                <tr key={res.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                    <td style={{ padding: '8px' }}>{res.name}</td>
                                    <td style={{ padding: '8px', fontSize: '0.9rem' }}>{res.idNumber} / <br/>{res.phone}</td>
                                    <td style={{ padding: '8px', fontSize: '0.9rem' }}>{res.timeSlot} ({res.packageType} 套餐)</td>
                                    <td style={{ padding: '8px', textAlign: 'center', fontWeight: 600, color: getStatusColor(res.status as ReservationStatus) }}>{res.status}</td>
                                    <td style={{ padding: '8px', textAlign: 'center' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', alignItems: 'center' }}>
                                            <button type="button" className="secondary-button" onClick={() => openModifyModal(res)} style={{ padding: '5px 10px', fontSize: '0.85rem' }}>修改狀態</button>
                                            <button type="button" className="secondary-button" onClick={() => handleCancel(res)} style={{ padding: '5px 10px', fontSize: '0.85rem', backgroundColor: res.status === '已取消' ? '#f3f4f6' : '#fef2f2', color: res.status === '已取消' ? '#9ca3af' : '#ef4444', cursor: res.status === '已取消' ? 'not-allowed' : 'pointer'}} disabled={res.status === '已取消'}>取消預約</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p style={{ textAlign: 'center', color: '#6b7280', padding: '20px' }}>找不到符合條件的預約記錄。</p>
                )}
            </div>
        )}
      </div>

      {/* 修改狀態彈窗元件 */}
      <ModifyModal
          isOpen={isModalOpen}
          reservation={editingReservation}
          currentStatus={tempStatus}
          onStatusChange={setTempStatus}
          onSave={handleSaveModification}
          onClose={closeModal}
      />
    </div>
    </div>
  );
}

export default ReservationListPage;