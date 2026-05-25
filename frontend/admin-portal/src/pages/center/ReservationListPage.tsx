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
  branchName?: string;
}

interface BranchItem {
  branchId: number;
  branchName: string;
}

interface PackageItem {
  packageId: number;
  packageCode: string;
  packageName: string;
  isDisable: boolean;
}

const TIME_SLOT_OPTIONS = [
  { value: "08:00-10:00", label: "8:00 - 10:00" },
  { value: "10:00-12:00", label: "10:00 - 12:00" },
  { value: "13:00-15:00", label: "13:00 - 15:00" },
  { value: "15:00-17:00", label: "15:00 - 17:00" },
];

const STATUS_OPTIONS: ReservationStatus[] = ["已預約", "已報到", "已取消"];
const ACTIVE_RESERVATION_STATUSES: ReservationStatus[] = ["已預約", "已報到"];
const DEFAULT_VISIBLE_STATUS_OPTIONS: ReservationStatus[] = ["已預約", "已報到"];

const RESERVATION_API_ENDPOINT = "/api/reservations";
const PACKAGE_API_ENDPOINT = "/api/packages";
const BRANCH_API_ENDPOINT = "/api/branches";
const BRANCH_PACKAGE_API_ENDPOINT = "/api/branches";

const toggleAll = <T,>(current: T[], allOptions: T[]) => {
  return current.length === allOptions.length ? [] : allOptions;
};

const toggleSingle = <T,>(current: T[], value: T, checked: boolean) => {
  if (checked) {
    return current.includes(value) ? current : [...current, value];
  }

  return current.filter((item) => item !== value);
};

const escapeCsvField = (field: string) => `"${String(field ?? "").replace(/"/g, '""')}"`;

const convertToCsv = (data: Reservation[]): string => {
  if (data.length === 0) return "";

  const headers = ["院區", "姓名", "身分證", "電話", "日期", "時段", "套餐", "狀態"];
  const headerRow = headers.map(escapeCsvField).join(",");

  const dataRows = data.map((item) =>
    [
      item.branchName ?? "未指定院區",
      item.name,
      item.idNumber,
      item.phone,
      item.date,
      item.timeSlot,
      item.packageType,
      item.status,
    ]
      .map(escapeCsvField)
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
  const [branchName, setBranchName] = useState("all");
  const [packageType, setPackageType] = useState("all");
  const [date, setDate] = useState("");
  const [selectedTimeSlots, setSelectedTimeSlots] = useState<string[]>(
    TIME_SLOT_OPTIONS.map((item) => item.value),
  );
  const [selectedStatuses, setSelectedStatuses] =
  useState<ReservationStatus[]>(DEFAULT_VISIBLE_STATUS_OPTIONS);
  const [isTimeFilterOpen, setIsTimeFilterOpen] = useState(false);
  const [isStatusFilterOpen, setIsStatusFilterOpen] = useState(false);

  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [branches, setBranches] = useState<BranchItem[]>([]);
  const [packages, setPackages] = useState<PackageItem[]>([]);
  const [availablePackageIds, setAvailablePackageIds] = useState<number[]>([]);
  const [isLoadingBranchPackages, setIsLoadingBranchPackages] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );

  const [searchResults, setSearchResults] = useState<Reservation[] | null>(null);
  const [exportFilter, setExportFilter] =
  useState<ReservationStatus[]>(DEFAULT_VISIBLE_STATUS_OPTIONS);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReservation, setEditingReservation] = useState<Reservation | null>(
    null,
  );
  const [tempStatus, setTempStatus] = useState<ReservationStatus>("已預約");

  const isAllTimeSlotsChecked = selectedTimeSlots.length === TIME_SLOT_OPTIONS.length;
  const isAllStatusesChecked = selectedStatuses.length === STATUS_OPTIONS.length;
  const isAllExportStatusesChecked = exportFilter.length === STATUS_OPTIONS.length;

  const timeFilterSummary = isAllTimeSlotsChecked
    ? "全部時段"
    : selectedTimeSlots.length === 0
      ? "未選擇時段"
      : TIME_SLOT_OPTIONS.filter((item) =>
          selectedTimeSlots.includes(item.value),
        )
          .map((item) => item.label)
          .join("、");

  const statusFilterSummary = isAllStatusesChecked
    ? "全部狀態"
    : selectedStatuses.length === 0
      ? "未選擇狀態"
      : selectedStatuses.join("、");

  const fetchReservations = async () => {
    const response = await fetch(RESERVATION_API_ENDPOINT);
    if (!response.ok) {
      throw new Error(`無法載入預約資料 (HTTP ${response.status})`);
    }
    const data = await response.json();

    const normalizedReservations: Reservation[] = (data ?? []).map((item: any) => ({
      id: Number(item.id),
      name: String(item.name ?? ""),
      idNumber: String(item.idNumber ?? ""),
      phone: String(item.phone ?? ""),
      date: String(item.date ?? ""),
      timeSlot: String(item.timeSlot ?? ""),
      packageType: String(item.packageType ?? ""),
      status: item.status as ReservationStatus,
      branchName: item.branchName ? String(item.branchName) : "未指定院區",
    }));

    return normalizedReservations;
  };

  const fetchBranches = async () => {
    const response = await fetch(BRANCH_API_ENDPOINT);
    if (!response.ok) {
      throw new Error(`無法載入院區資料 (HTTP ${response.status})`);
    }

    const data = await response.json();

    const normalizedBranches: BranchItem[] = (data ?? []).map((item: any) => ({
      branchId: Number(item.branchId),
      branchName: String(item.branchName ?? ""),
    }));

    return normalizedBranches.filter((item) => item.branchName);
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

      const [reservationData, branchData, packageData] = await Promise.all([
        fetchReservations(),
        fetchBranches(),
        fetchPackages(),
      ]);

      setReservations(reservationData);
      setBranches(branchData);
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

  useEffect(() => {
    if (branchName === "all") {
      setAvailablePackageIds([]);
      setPackageType("all");
      return;
    }

    const selectedBranch = branches.find(
      (branch) => branch.branchName === branchName,
    );

    if (!selectedBranch) {
      setAvailablePackageIds([]);
      setPackageType("all");
      return;
    }

    const loadAvailablePackages = async () => {
      try {
        setIsLoadingBranchPackages(true);
        setPackageType("all");
        setAvailablePackageIds([]);

        const response = await fetch(
          `${BRANCH_PACKAGE_API_ENDPOINT}/${selectedBranch.branchId}/packages`,
        );

        if (!response.ok) {
          throw new Error(`院區可查詢套餐載入失敗 (HTTP ${response.status})`);
        }

        const data = await response.json();

        const ids = (Array.isArray(data) ? data : data?.data ?? [])
          .filter((item: any) => {
            const status =
              item.branchPackageStatus ??
              item.status ??
              item.branch_package_status ??
              "open";

            return status === "open";
          })
          .map((item: any) => Number(item.packageId ?? item.package_id))
          .filter((id: number) => Number.isInteger(id) && id > 0);

        setAvailablePackageIds(ids);
      } catch (error) {
        console.error("院區可查詢套餐載入失敗:", error);
        alert(error instanceof Error ? error.message : "院區可查詢套餐載入失敗");
        setAvailablePackageIds([]);
        setPackageType("all");
      } finally {
        setIsLoadingBranchPackages(false);
      }
    };

    loadAvailablePackages();
  }, [branchName, branches]);


  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    if (!date) {
      alert("請選擇查詢日期");
      return;
    }

    if (branchName !== "all" && packageType !== "all") {
      const selectedPackage = packages.find(
        (pkg) => pkg.packageName === packageType,
      );

      if (
        selectedPackage &&
        !availablePackageIds.includes(Number(selectedPackage.packageId))
      ) {
        alert("此院區不可查詢此套餐，請重新選擇套餐");
        return;
      }
    }

    if (selectedTimeSlots.length === 0) {
      alert("請至少選擇一個時段");
      return;
    }

    if (selectedStatuses.length === 0) {
      alert("請至少選擇一個預約狀態");
      return;
    }

    const results = reservations.filter((res) => {
      if (branchName !== "all" && res.branchName !== branchName) return false;
      if (packageType !== "all" && res.packageType !== packageType) return false;
      if (res.date !== date) return false;
      if (!selectedTimeSlots.includes(res.timeSlot)) return false;
      if (!selectedStatuses.includes(res.status)) return false;

      return true;
    });

    const sortedResults = [...results].sort((a, b) => {
      const branchCompare = (a.branchName ?? "未指定院區").localeCompare(
        b.branchName ?? "未指定院區",
        "zh-Hant",
      );
      if (branchCompare !== 0) return branchCompare;

      const timeCompare = a.timeSlot.localeCompare(b.timeSlot, "zh-Hant");
      if (timeCompare !== 0) return timeCompare;

      const packageCompare = a.packageType.localeCompare(b.packageType, "zh-Hant");
      if (packageCompare !== 0) return packageCompare;

      return a.name.localeCompare(b.name, "zh-Hant");
    });

    setSearchResults(sortedResults);
  };

  const handleExport = () => {
    if (!searchResults || searchResults.length === 0) {
      alert("沒有查詢結果可以匯出。請先執行查詢。");
      return;
    }

    if (exportFilter.length === 0) {
      alert("請選擇至少一個預約狀態進行匯出。");
      return;
    }

    const dataToExport = searchResults.filter((res) =>
      exportFilter.includes(res.status),
    );

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
  setBranchName("all");
  setPackageType("all");
  setAvailablePackageIds([]);
  setDate("");
  setSelectedTimeSlots(TIME_SLOT_OPTIONS.map((item) => item.value));
  setSelectedStatuses(DEFAULT_VISIBLE_STATUS_OPTIONS);
  setExportFilter(DEFAULT_VISIBLE_STATUS_OPTIONS);
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

  const findActiveDuplicateReservation = (
    currentReservation: Reservation,
  ): Reservation | undefined => {
    return reservations.find(
      (item) =>
        item.id !== currentReservation.id &&
        item.idNumber === currentReservation.idNumber &&
        ACTIVE_RESERVATION_STATUSES.includes(item.status),
    );
  };

  const updateLocalReservationStatus = (id: number, newStatus: ReservationStatus) => {
    setReservations((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item)),
    );

    setSearchResults((prev) =>
      prev
        ? prev.map((item) =>
            item.id === id ? { ...item, status: newStatus } : item,
          )
        : prev,
    );
  };

  const handleSaveModification = async (
    id: number,
    newStatus: ReservationStatus,
  ) => {
    const currentReservation =
      editingReservation ?? reservations.find((item) => item.id === id);

    if (!currentReservation) {
      alert("找不到要修改的預約資料，請重新整理後再試一次");
      return;
    }

    const isChangingCancelledToActive =
      currentReservation.status === "已取消" &&
      ACTIVE_RESERVATION_STATUSES.includes(newStatus);

    if (isChangingCancelledToActive) {
      const duplicateReservation = findActiveDuplicateReservation(currentReservation);

      if (duplicateReservation) {
        alert(
          [
            "此預約人已經有一筆有效預約，不能將已取消紀錄改回有效預約。",
            "",
            `目前有效預約：${duplicateReservation.date} ${duplicateReservation.timeSlot}`,
            `套餐：${duplicateReservation.packageType}`,
            `狀態：${duplicateReservation.status}`,
          ].join("\n"),
        );
        return;
      }
    }

    try {
      const response = await fetch(`${RESERVATION_API_ENDPOINT}/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `狀態更新失敗 (HTTP ${response.status})`);
      }

      updateLocalReservationStatus(id, newStatus);
      alert(`預約 #${id} 狀態已成功修改為：${newStatus}`);
      closeModal();
    } catch (err) {
      alert(`狀態更新失敗：${err instanceof Error ? err.message : "未知錯誤"}`);
    }
  };

  const handleCancel = async (reservation: Reservation) => {
    const isConfirmed = window.confirm(
      `您確定要取消 ${reservation.name} 於 ${reservation.date} ${reservation.timeSlot} 的預約嗎？`,
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
        <h2 className="page-title">預約名單管理</h2>

        <form className="page-form" onSubmit={handleSearch}>
          <div className="form-row">
            <div className="form-field form-field-narrow">
              <label className="form-label" htmlFor="branchName">
                院區：
              </label>
              <select
                id="branchName"
                value={branchName}
                onChange={(e) => {
                  setBranchName(e.target.value);
                  setPackageType("all");
                  setSearchResults(null);
                }}
                className="form-select"
                disabled={loadingStatus !== "success"}
              >
                <option value="all">所有院區</option>
                {branches.map((branch) => (
                  <option key={branch.branchId} value={branch.branchName}>
                    {branch.branchName}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-field form-field-narrow">
              <label className="form-label" htmlFor="packageType">
                套餐類型：
              </label>
              <select
                id="packageType"
                value={packageType}
                onChange={(e) => {
                  setPackageType(e.target.value);
                  setSearchResults(null);
                }}
                className="form-select"
                disabled={
                  loadingStatus !== "success" ||
                  branchName === "all" ||
                  isLoadingBranchPackages
                }
              >
                <option value="all">
                  {branchName === "all"
                    ? "所有套餐"
                    : isLoadingBranchPackages
                      ? "套餐載入中..."
                      : "所有套餐"}
                </option>

                {packages.map((pkg) => {
                  const canSelect =
                    branchName === "all" || availablePackageIds.includes(Number(pkg.packageId));

                  return (
                    <option
                      key={pkg.packageId}
                      value={pkg.packageName}
                      disabled={!canSelect}
                    >
                      {pkg.packageName}
                      {!canSelect ? "（此院區不可查詢）" : ""}
                    </option>
                  );
                })}
              </select>
            </div>

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
          </div>

          <div className="form-row">
            <div className="form-field">
              <label className="form-label">時段選擇：</label>

              <div className={`filter-frame ${isTimeFilterOpen ? "open" : ""}`}>
                <button
                  type="button"
                  className="filter-frame-summary"
                  onClick={() => setIsTimeFilterOpen((prev) => !prev)}
                  disabled={loadingStatus !== "success"}
                >
                  <span>{timeFilterSummary}</span>
                  <span className="filter-frame-arrow">{isTimeFilterOpen ? "收合" : "展開"}</span>
                </button>

                <div className="filter-frame-body">
                  <div className="export-checkbox-group time-slot-grid">
                    <label className="export-checkbox-item">
                      <input
                        type="checkbox"
                        checked={isAllTimeSlotsChecked}
                        onChange={() =>
                          setSelectedTimeSlots((prev) =>
                            toggleAll(
                              prev,
                              TIME_SLOT_OPTIONS.map((item) => item.value),
                            ),
                          )
                        }
                        disabled={loadingStatus !== "success"}
                      />
                      全選
                    </label>

                    {TIME_SLOT_OPTIONS.map((opt) => (
                      <label key={opt.value} className="export-checkbox-item">
                        <input
                          type="checkbox"
                          value={opt.value}
                          checked={selectedTimeSlots.includes(opt.value)}
                          onChange={(e) =>
                            setSelectedTimeSlots((prev) =>
                              toggleSingle(prev, opt.value, e.target.checked),
                            )
                          }
                          disabled={loadingStatus !== "success"}
                        />
                        {opt.label}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="form-field">
              <label className="form-label">預約狀態：</label>

              <div className={`filter-frame ${isStatusFilterOpen ? "open" : ""}`}>
                <button
                  type="button"
                  className="filter-frame-summary"
                  onClick={() => setIsStatusFilterOpen((prev) => !prev)}
                  disabled={loadingStatus !== "success"}
                >
                  <span>{statusFilterSummary}</span>
                  <span className="filter-frame-arrow">{isStatusFilterOpen ? "收合" : "展開"}</span>
                </button>

                <div className="filter-frame-body">
                  <div className="export-checkbox-group status-grid">
                    <label className="export-checkbox-item">
                      <input
                        type="checkbox"
                        checked={isAllStatusesChecked}
                        onChange={() =>
                          setSelectedStatuses((prev) => toggleAll(prev, STATUS_OPTIONS))
                        }
                        disabled={loadingStatus !== "success"}
                      />
                      全選
                    </label>

                    {STATUS_OPTIONS.map((status) => (
                      <label key={status} className="export-checkbox-item">
                        <input
                          type="checkbox"
                          value={status}
                          checked={selectedStatuses.includes(status)}
                          onChange={(e) =>
                            setSelectedStatuses((prev) =>
                              toggleSingle(prev, status, e.target.checked),
                            )
                          }
                          disabled={loadingStatus !== "success"}
                        />
                        {status}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
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
                  <label className="export-checkbox-item">
                    <input
                      type="checkbox"
                      checked={isAllExportStatusesChecked}
                      onChange={() =>
                        setExportFilter((prev) => toggleAll(prev, STATUS_OPTIONS))
                      }
                    />
                    全選
                  </label>

                  {STATUS_OPTIONS.map((status) => (
                    <label key={status} className="export-checkbox-item">
                      <input
                        type="checkbox"
                        value={status}
                        checked={exportFilter.includes(status)}
                        onChange={(e) =>
                          setExportFilter((prev) =>
                            toggleSingle(prev, status, e.target.checked),
                          )
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
                <table className="data-table reservation-list-table">
                  <thead>
                    <tr>
                      <th>院區</th>
                      <th>姓名</th>
                      <th>身分證 / 電話</th>
                      <th>日期 / 時段</th>
                      <th>套餐</th>
                      <th>狀態</th>
                      <th>操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {searchResults.map((res) => (
                      <tr key={res.id}>
                        <td>{res.branchName ?? "未指定院區"}</td>
                        <td>{res.name}</td>
                        <td>
                          {res.idNumber}
                          <br />
                          {res.phone}
                        </td>
                        <td>
                          {res.date}
                          <br />
                          {res.timeSlot}
                        </td>
                        <td>{res.packageType}</td>
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
