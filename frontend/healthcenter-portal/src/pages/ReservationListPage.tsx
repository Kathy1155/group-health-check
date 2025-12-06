// src/pages/ReservationListPage.tsx - MODIFIED: 整合 DailyReportPage 功能

import React, { useState } from "react";

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

const initialReservations: Reservation[] = [
    { id: 1, name: '林小安', idNumber: 'A123456789', phone: '0912-345-678', date: '2025-12-08', timeSlot: '8:00-10:00', packageType: 'A', status: '已預約' },
    { id: 2, name: '張育庭', idNumber: 'B987654321', phone: '0922-333-222', date: '2025-12-08', timeSlot: '10:00-12:00', packageType: 'B', status: '已報到' },
    { id: 3, name: '陳小華', idNumber: 'C100000000', phone: '0933-111-000', date: '2025-12-09', timeSlot: '8:00-10:00', packageType: 'A', status: '已取消' },
    { id: 4, name: '王大明', idNumber: 'D111222333', phone: '0944-555-666', date: '2025-12-09', timeSlot: '13:00-15:00', packageType: 'C', status: '已預約' },
    { id: 5, name: '李美美', idNumber: 'E999888777', phone: '0955-999-888', date: '2025-12-10', timeSlot: '8:00-10:00', packageType: 'D', status: '已預約' },
];

const TIME_SLOT_OPTIONS = [
    { value: "8:00-10:00", label: "8:00 - 10:00" },
    { value: "10:00-12:00", label: "10:00 - 12:00" },
    { value: "13:00-15:00", label: "13:00 - 15:00" },
];

const STATUS_OPTIONS: ReservationStatus[] = ['已預約', '已報到', '已取消'];


// --- 修改狀態彈窗元件 (保持不變) ---
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
                    📝 修改預約狀態
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


// --- 主要元件 ReservationListPage ---
function ReservationListPage() {
  const [date, setDate] = useState("");
  const [timeSlot, setTimeSlot] = useState("");
  const [customTime, setCustomTime] = useState("");
  const [packageType, setPackageType] = useState("");
  const [reservationStatus, setReservationStatus] = useState("all"); 

  const [reservations, setReservations] = useState<Reservation[]>(initialReservations);
  const [searchResults, setSearchResults] = useState<Reservation[] | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReservation, setEditingReservation] = useState<Reservation | null>(null);
  const [tempStatus, setTempStatus] = useState<ReservationStatus>('已預約'); 
  const ALL_STATUSES: ReservationStatus[] = ['已預約', '已報到', '已取消'];
  const [exportFilter, setExportFilter] = useState<ReservationStatus[]>(ALL_STATUSES);
  // 匯出狀態選項 (用於 Checkboxes)
  const EXPORT_STATUS_OPTIONS = ALL_STATUSES;

  // 搜尋邏輯 (保持不變)
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault(); 
    if (!date) { alert("請選擇查詢日期"); return; }
    
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
  
// 匯出功能 - 針對當前查詢結果
const handleExport = () => {
    
    if (!searchResults || searchResults.length === 0) {
        alert("沒有查詢結果可以匯出。請先執行查詢。");
        return;
    }

    // 過濾當前查詢結果中，符合 exportFilter 狀態的資料
    const dataToExport = searchResults.filter(res => exportFilter.includes(res.status));
    
    // 檢查是否有選中的狀態
    if (exportFilter.length === 0) {
        alert("請選擇至少一個預約狀態進行匯出。");
        return;
    }

    if (dataToExport.length > 0) {
        alert(`正在匯出 ${dataToExport.length} 筆（狀態為: ${exportFilter.join('、')}）的 CSV 檔案...`);
        // 實際應用中，後端會根據這裡的篩選條件來產生報表
    } else {
        alert(`當前查詢結果中，找不到符合您選擇的狀態 (${exportFilter.join('、')}) 的資料可以匯出。`);
    }
};

const handleExportFilterChange = (status: ReservationStatus, isChecked: boolean) => {
    setExportFilter(prev => {
        if (isChecked) {
            // 如果被選中，加入陣列
            return [...prev, status];
        } else {
            // 如果被取消選中，從陣列中移除
            return prev.filter(s => s !== status);
        }
    });
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

  // 開啟修改彈窗 (保持不變)
  const openModifyModal = (reservation: Reservation) => {
    setEditingReservation(reservation);
    setTempStatus(reservation.status); 
    setIsModalOpen(true);
  };

  // 關閉修改彈窗 (保持不變)
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingReservation(null);
  };
  
  // 儲存修改後的狀態 (保持修正後的版本)
  const handleSaveModification = (id: number, newStatus: ReservationStatus) => {
    const updatedReservations = reservations.map(res => 
        res.id === id ? { ...res, status: newStatus } : res
    ) as Reservation[];
    setReservations(updatedReservations);
    
    if (searchResults) {
        const updatedResults = searchResults.map(res => 
            res.id === id ? { ...res, status: newStatus } : res
        ) as Reservation[]; 
        setSearchResults(updatedResults);
    }
    
    alert(`預約 #${id} 狀態已成功修改為：${newStatus}`);
    closeModal();
  };

  // 取消預約邏輯 (保持修正後的版本)
  const handleCancel = (reservation: Reservation) => {
      const isConfirmed = window.confirm(
          `⚠️ 您確定要取消 ${reservation.name} 於 ${reservation.date} ${reservation.timeSlot} 的預約嗎？`
      );
      
    if (isConfirmed) {
        const updatedReservations = reservations.map(res => 
        res.id === reservation.id 
            ? { ...res, status: '已取消' as ReservationStatus } 
            : res
    );
    
    setReservations(updatedReservations);
          
    if (searchResults) {
        const updatedResults = searchResults.map(res => 
            res.id === reservation.id 
                ? { ...res, status: '已取消' as ReservationStatus }
                : res
        );
        setSearchResults(updatedResults);
    }
    
    alert(`預約 #${reservation.id} 已成功取消。`);
      }
  };

  // 根據狀態設定文字顏色 (保持不變)
  const getStatusColor = (status: ReservationStatus) => {
      switch (status) {
          case '已報到':
              return '#10b981'; 
          case '已取消':
              return '#ef4444'; 
          case '已預約':
          default:
              return '#2563eb'; 
      }
  };


  // --- JSX 渲染部分 ---
  return (
    <div className="page-container">
      <div className="page-card">
        <h2 className="page-title">預約狀況查詢</h2>
        
        {/* 查詢表單 */}
        <form className="page-form" onSubmit={handleSearch}>
            
            {/* 第一行：日期、時段 (保持不變) */}
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
                    >
                        <option value="all">所有時段</option>
                        {TIME_SLOT_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                        <option value="other">其他 (手動輸入)</option>
                    </select>
                </div>
                
                {timeSlot === "other" && (
                    <div className="form-field form-field-narrow">
                        <label className="form-label" htmlFor="customTime">手動輸入時段：</label>
                        <input
                            id="customTime"
                            type="text"
                            value={customTime}
                            onChange={(e) => setCustomTime(e.target.value)}
                            className="form-input"
                            placeholder="例如：15:00-17:00"
                            required
                        />
                    </div>
                )}
            </div>

            {/* 第二行：套餐、狀態 (保持不變) */}
            <div className="form-row">
                
                <div className="form-field">
                    <label className="form-label">套餐類型：</label>
                    <div className="radio-group radio-group-column"> 
                        <label>
                            <input
                                type="radio"
                                name="pkg"
                                value="all"
                                onChange={() => setPackageType("all")}
                                checked={packageType === "all" || packageType === ""}
                            />
                            所有套餐
                        </label>
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

                <div className="form-field form-field-narrow">
                    <label className="form-label" htmlFor="status">預約狀態：</label>
                    <select
                        id="status"
                        value={reservationStatus}
                        onChange={(e) => setReservationStatus(e.target.value)}
                        className="form-select"
                        required
                    >
                        <option value="all">所有狀態</option>
                        {STATUS_OPTIONS.map((status) => (
                            <option key={status} value={status}>{status}</option>
                        ))}
                    </select>
                </div>

            </div>


            {/* 按鈕 - 僅保留查詢和重設 */}
            <div className="form-actions-center gap">
                <button 
                    type="submit"
                    className="primary-button"
                >
                    查詢
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

        
        {/* 查詢結果顯示區域 */}
{searchResults && (
    <div style={{ marginTop: '30px', paddingTop: '20px', borderTop: '1px solid #e5e7eb' }}>
        
        {/* 標題與匯出控制區塊 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 600 }}>
                查詢結果 ({searchResults.length} 筆)
            </h3>
            
            {/* 匯出篩選與按鈕 - 替換為 Checkboxes */}
            <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                <label className="form-label" style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600 }}>
                    匯出狀態：
                </label>
                
                {/* Checkboxes Group */}
                <div style={{ display: 'flex', gap: '10px' }}>
                    {EXPORT_STATUS_OPTIONS.map(status => (
                        <label key={status} style={{ display: 'flex', alignItems: 'center', fontSize: '0.9rem' }}>
                            <input
                                type="checkbox"
                                value={status}
                                checked={exportFilter.includes(status)}
                                onChange={(e) => handleExportFilterChange(status, e.target.checked)}
                                style={{ marginRight: '4px' }}
                            />
                            {status}
                        </label>
                    ))}
                </div>

                <button 
                    type="button"
                    onClick={handleExport}
                    className="secondary-button"
                    // 當前無結果時或沒有選擇任何狀態時，按鈕禁用
                    disabled={searchResults.length === 0 || exportFilter.length === 0}
                    style={{ marginLeft: '10px' }}
                >
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
                                    <td style={{ padding: '8px', fontSize: '0.9rem' }}>
                                        {res.idNumber} / <br/>{res.phone}
                                    </td>
                                    <td style={{ padding: '8px', fontSize: '0.9rem' }}>
                                        {res.timeSlot} ({res.packageType} 套餐)
                                    </td>
                                    <td style={{ padding: '8px', textAlign: 'center', fontWeight: 600, color: getStatusColor(res.status) }}>
                                        {res.status}
                                    </td>
                                    <td style={{ padding: '8px', textAlign: 'center' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', alignItems: 'center' }}>
                                            <button 
                                                type="button" 
                                                className="secondary-button" 
                                                onClick={() => openModifyModal(res)}
                                                style={{ padding: '5px 10px', fontSize: '0.85rem' }}
                                            >
                                                修改狀態
                                            </button>
                                            <button 
                                                type="button" 
                                                className="secondary-button" 
                                                onClick={() => handleCancel(res)}
                                                style={{ 
                                                    padding: '5px 10px', 
                                                    fontSize: '0.85rem', 
                                                    backgroundColor: res.status === '已取消' ? '#f3f4f6' : '#fef2f2',
                                                    color: res.status === '已取消' ? '#9ca3af' : '#ef4444',
                                                    cursor: res.status === '已取消' ? 'not-allowed' : 'pointer'
                                                }}
                                                disabled={res.status === '已取消'}
                                            >
                                                取消預約
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p style={{ textAlign: 'center', color: '#6b7280', padding: '20px' }}>
                        找不到符合條件的預約記錄。
                    </p>
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
  );
}

export default ReservationListPage;