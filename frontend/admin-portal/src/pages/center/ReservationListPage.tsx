import React, { useEffect, useState } from "react";

type ReservationStatus = "已預約" | "已報到" | "已取消";

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

interface PackageItem {
  packageId: number;
  packageCode: string;
  packageName: string;
  isDisable: boolean;
}

const TIME_SLOT_OPTIONS = [
  { value: "8:00-10:00", label: "8:00 - 10:00" },
  { value: "10:00-12:00", label: "10:00 - 12:00" },
  { value: "13:00-15:00", label: "13:00 - 15:00" },
];

const STATUS_OPTIONS: ReservationStatus[] = ["已預約", "已報到", "已取消"];
const ALL_STATUSES: ReservationStatus[] = ["已預約", "已報到", "已取消"];
const EXPORT_STATUS_OPTIONS = ALL_STATUSES;

const RESERVATION_API_ENDPOINT = "http://localhost:3000/api/reservations";
const PACKAGE_API_ENDPOINT = "http://localhost:3000/api/packages";

const convertToCsv = (data: Reservation[]): string => {
  if (data.length === 0) return "";

  const headers = ["姓名", "身分證", "電話", "日期", "時段", "套餐", "狀態"];
  const headerRow = headers.join(",");

  const dataRows = data.map((item) =>
    [
      item.name,
      item.idNumber,
      item.phone,
      item.date,
      item.timeSlot,
      item.packageType,
      item.status,
    ]
      .map((field) => `"${field}"`)
      .join(","),
  );

  return [headerRow, ...dataRows].join("\n");
};

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
  onClose,
}) => {
  if (!isOpen || !reservation) return null;

  const handleSave = () => {
    onSave(reservation.id, currentStatus);
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <h3 className="modal-title">修改預約狀態</h3>

        <p className="modal-subtext">
          預約人：{reservation.name}（{reservation.idNumber}）
        </p>
        <p className="modal-subtext">
          時段：{reservation.date} / {reservation.timeSlot} / {reservation.packageType}
        </p>

        <div className="modal-field">
          <label className="form-label" htmlFor="statusSelect">
            選擇新狀態：
          </label>
          <select
            id="statusSelect"
            value={currentStatus}
            onChange={(e) => onStatusChange(e.target.value as ReservationStatus)}
            className="form-select"
          >
            {STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        <div className="form-actions-center gap">
          <button className="primary-button" type="button" onClick={handleSave}>
            儲存修改
          </button>
          <button className="secondary-button" type="button" onClick={onClose}>
            取消
          </button>
        </div>
      </div>
    </div>
  );
};

function ReservationListPage() {
  const [date, setDate] = useState("");
  const [timeSlot, setTimeSlot] = useState("");
  const [customTime, setCustomTime] = useState("");
  const [packageType, setPackageType] = useState("all");
  const [reservationStatus, setReservationStatus] = useState("all");

  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [packages, setPackages] = useState<PackageItem[]>([]);

  const [loadingStatus, setLoadingStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );

  const [searchResults, setSearchResults] = useState<Reservation[] | null>(null);
  const [exportFilter, setExportFilter] =
    useState<ReservationStatus[]>(ALL_STATUSES);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReservation, setEditingReservation] = useState<Reservation | null>(
    null,
  );
  const [tempStatus, setTempStatus] = useState<ReservationStatus>("已預約");

  const handleExportFilterChange = (
    status: ReservationStatus,
    isChecked: boolean,
  ) => {
    setExportFilter((prev) => {
      if (isChecked) {
        return [...prev, status];
      }
      return prev.filter((s) => s !== status);
    });
  };

  const fetchReservations = async () => {
    const response = await fetch(RESERVATION_API_ENDPOINT);
    if (!response.ok) {
      throw new Error(`無法載入預約資料 (HTTP ${response.status})`);
    }
    const data: Reservation[] = await response.json();
    return data;
  };

  const fetchPackages = async () => {
    const response = await fetch(PACKAGE_API_ENDPOINT);
    if (!response.ok) {
      throw new Error(`無法載入套餐資料 (HTTP ${response.status})`);
    }

    const data = await response.json();

    const normalizedPackages: PackageItem[] = (data ?? []).map((item: any) => ({
      packageId: Number(item.packageId),
      packageCode: String(item.packageCode ?? ""),
      packageName: String(item.packageName ?? ""),
      isDisable: Boolean(item.isDisable),
    }));

    return normalizedPackages.filter((item) => !item.isDisable);
  };

  const loadPageData = async () => {
    try {
      setLoadingStatus("loading");

      const [reservationData, packageData] = await Promise.all([
        fetchReservations(),
        fetchPackages(),
      ]);

      setReservations(reservationData);
      setPackages(packageData);
      setLoadingStatus("success");
    } catch (error) {
      console.error("載入資料失敗:", error);
      setLoadingStatus("error");
    }
  };

  useEffect(() => {
    loadPageData();
  }, []);

  const refetchData = () => {
    loadPageData();
    setSearchResults(null);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    if (!date) {
      alert("請選擇查詢日期");
      return;
    }

    const effectiveTimeSlot = timeSlot === "other" ? customTime : timeSlot;
    const effectivePackage = packageType;
    const effectiveStatus = reservationStatus;

    const results = reservations.filter((res) => {
      if (res.date !== date) return false;

      if (timeSlot && timeSlot !== "all" && res.timeSlot !== effectiveTimeSlot) {
        return false;
      }

      if (effectivePackage !== "all" && res.packageType !== effectivePackage) {
        return false;
      }

      if (effectiveStatus !== "all" && res.status !== effectiveStatus) {
        return false;
      }

      return true;
    });

    setSearchResults(results);
  };

  const handleExport = () => {
    if (!searchResults || searchResults.length === 0) {
      alert("沒有查詢結果可以匯出。請先執行查詢。");
      return;
    }

    const dataToExport = searchResults.filter((res) =>
      exportFilter.includes(res.status),
    );

    if (exportFilter.length === 0) {
      alert("請選擇至少一個預約狀態進行匯出。");
      return;
    }

    if (dataToExport.length === 0) {
      alert("當前查詢結果中，找不到符合您選擇的狀態的資料可以匯出。");
      return;
    }

    try {
      const csvString = convertToCsv(dataToExport);
      const blob = new Blob([new Uint8Array([0xef, 0xbb, 0xbf]), csvString], {
        type: "text/csv;charset=utf-8;",
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;

      const dateString = new Date()
        .toLocaleDateString("zh-TW", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        })
        .replace(/\//g, "");

      a.download = `預約報表_${dateString}.csv`;

      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      alert(`已成功匯出 ${dataToExport.length} 筆 CSV 檔案到您的電腦。`);
    } catch (e) {
      console.error("CSV 匯出失敗:", e);
      alert("檔案匯出過程中發生錯誤。");
    }
  };

  const handleReset = () => {
    setDate("");
    setTimeSlot("");
    setCustomTime("");
    setPackageType("all");
    setReservationStatus("all");
    setSearchResults(null);
  };

  const openModifyModal = (reservation: Reservation) => {
    setEditingReservation(reservation);
    setTempStatus(reservation.status);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingReservation(null);
  };

  const handleSaveModification = async (
    id: number,
    newStatus: ReservationStatus,
  ) => {
    try {
      const response = await fetch(`${RESERVATION_API_ENDPOINT}/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `狀態更新失敗 (HTTP ${response.status})`);
      }

      refetchData();
      alert(`預約 #${id} 狀態已成功修改為：${newStatus}`);
      closeModal();
    } catch (err) {
      alert(`狀態更新失敗：${err instanceof Error ? err.message : "未知錯誤"}`);
    }
  };

  const handleCancel = async (reservation: Reservation) => {
    const isConfirmed = window.confirm(
      `⚠️您確定要取消 ${reservation.name} 於 ${reservation.date} ${reservation.timeSlot} 的預約嗎？`,
    );

    if (isConfirmed) {
      await handleSaveModification(reservation.id, "已取消");
    }
  };

  const getStatusClassName = (status: ReservationStatus) => {
    switch (status) {
      case "已報到":
        return "status-text-confirmed";
      case "已取消":
        return "status-text-cancelled";
      case "已預約":
      default:
        return "status-text-booked";
    }
  };

  return (
    <div className="page-container healthcenter-scope healthcenter-form-page">
      <div className="page-card">
        <h2 className="page-title">預約狀況查詢及修改</h2>

        <form className="page-form" onSubmit={handleSearch}>
          <div className="form-row">
            <div className="form-field form-field-narrow">
              <label className="form-label" htmlFor="date">
                預約日期：
              </label>
              <input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="form-input"
                required
                disabled={loadingStatus !== "success"}
              />
            </div>

            <div className="form-field form-field-narrow">
              <label className="form-label" htmlFor="timeSlot">
                時段選擇：
              </label>
              <select
                id="timeSlot"
                value={timeSlot}
                onChange={(e) => setTimeSlot(e.target.value)}
                className="form-select"
                required
                disabled={loadingStatus !== "success"}
              >
                <option value="all">所有時段</option>
                {TIME_SLOT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
                <option value="other">其他（手動輸入）</option>
              </select>
            </div>

            {timeSlot === "other" && (
              <div className="form-field form-field-narrow">
                <label className="form-label" htmlFor="customTime">
                  手動輸入時段：
                </label>
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
                    checked={packageType === "all"}
                    disabled={loadingStatus !== "success"}
                  />
                  所有套餐
                </label>

                {packages.map((pkg) => (
                  <label key={pkg.packageId}>
                    <input
                      type="radio"
                      name="pkg"
                      value={pkg.packageName}
                      onChange={(e) => setPackageType(e.target.value)}
                      checked={packageType === pkg.packageName}
                      disabled={loadingStatus !== "success"}
                    />
                    {pkg.packageName}
                  </label>
                ))}
              </div>
            </div>

            <div className="form-field form-field-narrow">
              <label className="form-label" htmlFor="status">
                預約狀態：
              </label>
              <select
                id="status"
                value={reservationStatus}
                onChange={(e) => setReservationStatus(e.target.value)}
                className="form-select"
                required
                disabled={loadingStatus !== "success"}
              >
                <option value="all">所有狀態</option>
                {STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-actions-center gap">
            <button
              type="submit"
              className="primary-button"
              disabled={loadingStatus !== "success"}
            >
              查詢
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="secondary-button"
              disabled={loadingStatus !== "success"}
            >
              重設
            </button>
          </div>
        </form>

        {loadingStatus === "loading" && (
          <p className="form-hint">資料載入中...</p>
        )}
        {loadingStatus === "error" && (
          <p className="form-hint">無法連接後端，請檢查服務是否運行。</p>
        )}

        {loadingStatus === "success" && searchResults && (
          <div className="result-section">
            <div className="result-header">
              <h3 className="result-title">查詢結果（{searchResults.length} 筆）</h3>

              <div className="export-bar">
                <span className="form-label">匯出狀態：</span>

                <div className="export-checkbox-group">
                  {EXPORT_STATUS_OPTIONS.map((status) => (
                    <label key={status} className="export-checkbox-item">
                      <input
                        type="checkbox"
                        value={status}
                        checked={exportFilter.includes(status)}
                        onChange={(e) =>
                          handleExportFilterChange(status, e.target.checked)
                        }
                      />
                      {status}
                    </label>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleExport}
                  className="secondary-button"
                  disabled={searchResults.length === 0 || exportFilter.length === 0}
                >
                  匯出 CSV（{exportFilter.length} 項）
                </button>
              </div>
            </div>

            {searchResults.length > 0 ? (
              <div className="table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>姓名</th>
                      <th>身分證 / 電話</th>
                      <th>時段（套餐）</th>
                      <th>狀態</th>
                      <th>操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {searchResults.map((res) => (
                      <tr key={res.id}>
                        <td>{res.name}</td>
                        <td>
                          {res.idNumber}
                          <br />
                          {res.phone}
                        </td>
                        <td>
                          {res.timeSlot}（{res.packageType}）
                        </td>
                        <td className={getStatusClassName(res.status)}>{res.status}</td>
                        <td>
                          <div className="result-action-stack">
                            <button
                              type="button"
                              className="secondary-button"
                              onClick={() => openModifyModal(res)}
                            >
                              修改狀態
                            </button>

                            <button
                              type="button"
                              className="secondary-button"
                              onClick={() => handleCancel(res)}
                              disabled={res.status === "已取消"}
                            >
                              取消預約
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="form-hint">找不到符合條件的預約記錄。</p>
            )}
          </div>
        )}
      </div>

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