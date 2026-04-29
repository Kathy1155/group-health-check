import React, { useEffect, useMemo, useState } from "react";

const API_ENDPOINT = "http://localhost:3000/api/timeslots";
const BRANCH_API_ENDPOINT = "http://localhost:3000/api/branches";
const PACKAGE_API_ENDPOINT = "http://localhost:3000/api/packages";

type LoadingStatus = "loading" | "success" | "error";

interface TimeSlot {
  slotId: number;
  date: string;
  timeSlot: string;
  packageType: string;
  packageId: number | string | null;
  branchName: string;
  branchId: number | string | null;
  quota: number;
  reservedCount?: number;
  remaining?: number;
  status?: string;
}

interface Branch {
  branchId: number;
  branchName: string;
}

interface PackageOption {
  packageId: number;
  packageName: string;
  isDisable?: boolean;
}

const TIME_SLOT_OPTIONS = [
  { value: "all", label: "所有時段" },
  { value: "08:00-10:00", label: "08:00 - 10:00" },
  { value: "10:00-12:00", label: "10:00 - 12:00" },
  { value: "13:00-15:00", label: "13:00 - 15:00" },
  { value: "15:00-17:00", label: "15:00 - 17:00" },
];

const MAX_QUOTA = 200;

const formatDate = (date: Date) => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
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

const normalizeTimeSlot = (value: string) =>
  value.replace(/:00(?=[:-])/g, "").replace(/:00$/g, "").trim();

const getReservedCount = (slot: TimeSlot) => Number(slot.reservedCount ?? 0);

const getRemainingCount = (slot: TimeSlot) =>
  Number(slot.remaining ?? Number(slot.quota ?? 0) - getReservedCount(slot));

const parseSlotEndDateTime = (slot: TimeSlot) => {
  const rawTimeSlot = String(slot.timeSlot ?? "");
  const endPart = rawTimeSlot.split("-")[1]?.trim();

  if (!slot.date || !endPart) return null;

  const dateText = String(slot.date).slice(0, 10);
  const endTimeText = endPart.length === 5 ? `${endPart}:00` : endPart;
  const dateTime = new Date(`${dateText}T${endTimeText}`);

  if (Number.isNaN(dateTime.getTime())) return null;

  return dateTime;
};

const isSlotEnded = (slot: TimeSlot) => {
  if (slot.status === "ended") return true;

  const endDateTime = parseSlotEndDateTime(slot);
  if (!endDateTime) return false;

  return endDateTime.getTime() <= Date.now();
};

function TimeSlotViewPage() {
  const [branchId, setBranchId] = useState("");
  const [packageId, setPackageId] = useState("");
  const [searchDate, setSearchDate] = useState("");
  const [searchTimeSlot, setSearchTimeSlot] = useState("all");

  const [branches, setBranches] = useState<Branch[]>([]);
  const [packages, setPackages] = useState<PackageOption[]>([]);
  const [loadedTimeSlots, setLoadedTimeSlots] = useState<TimeSlot[]>([]);
  const [searchResults, setSearchResults] = useState<TimeSlot[] | null>(null);

  const [loadingStatus, setLoadingStatus] = useState<LoadingStatus>("loading");
  const [errorMessage, setErrorMessage] = useState("");

  const [editingSlot, setEditingSlot] = useState<TimeSlot | null>(null);
  const [editQuota, setEditQuota] = useState("");
  const [isSavingQuota, setIsSavingQuota] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const loadInitData = async () => {
    try {
      setLoadingStatus("loading");
      setErrorMessage("");

      const [timeSlotRes, branchRes, packageRes] = await Promise.all([
        fetch(API_ENDPOINT),
        fetch(BRANCH_API_ENDPOINT),
        fetch(PACKAGE_API_ENDPOINT),
      ]);

      if (!timeSlotRes.ok) {
        throw new Error(`無法載入時段資料 (HTTP ${timeSlotRes.status})`);
      }

      if (!branchRes.ok) {
        throw new Error(`無法載入院區資料 (HTTP ${branchRes.status})`);
      }

      if (!packageRes.ok) {
        throw new Error(`無法載入套餐資料 (HTTP ${packageRes.status})`);
      }

      const timeSlotData: TimeSlot[] = await timeSlotRes.json();
      const branchData: Branch[] = await branchRes.json();
      const packageData: PackageOption[] = await packageRes.json();

      setLoadedTimeSlots(timeSlotData);
      setBranches(branchData);
      setPackages(packageData.filter((item) => !item.isDisable));
      setLoadingStatus("success");
    } catch (error) {
      console.error("載入資料失敗:", error);
      setErrorMessage(error instanceof Error ? error.message : "載入資料失敗");
      setLoadingStatus("error");
    }
  };

  useEffect(() => {
    loadInitData();
  }, []);

  const getDateTag = (date: string) => {
    if (date === DATES.today) {
      return <span className="status-tag status-confirmed">今天</span>;
    }

    if (date === DATES.tomorrow) {
      return <span className="status-tag status-booked">明天</span>;
    }

    if (date === DATES.dayAfterTomorrow) {
      return (
        <span
          className="status-tag"
          style={{ background: "#fef3c7", color: "#b45309" }}
        >
          後天
        </span>
      );
    }

    return null;
  };

  const getStatusText = (slot: TimeSlot) => {
    if (isSlotEnded(slot)) return "已結束";
    if (slot.status === "closed") return "已關閉";
    if (slot.status === "full") return "已額滿";
    return "開放中";
  };

  const sortSlots = (items: TimeSlot[]) => {
    return [...items].sort((a, b) => {
      const dateCompare = String(a.date).localeCompare(String(b.date));
      if (dateCompare !== 0) return dateCompare;

      const timeCompare = normalizeTimeSlot(a.timeSlot).localeCompare(
        normalizeTimeSlot(b.timeSlot),
      );
      if (timeCompare !== 0) return timeCompare;

      const branchCompare = String(a.branchName ?? "").localeCompare(
        String(b.branchName ?? ""),
      );
      if (branchCompare !== 0) return branchCompare;

      return String(a.packageType ?? "").localeCompare(
        String(b.packageType ?? ""),
      );
    });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    if (!branchId || !packageId || !searchDate) {
      alert("請完整選擇院區、套餐與日期");
      return;
    }

    const effectiveTimeSlot = searchTimeSlot === "all" ? null : searchTimeSlot;

    const results = loadedTimeSlots.filter((slot) => {
      const branchMatch = String(slot.branchId) === String(branchId);
      const packageMatch = String(slot.packageId) === String(packageId);
      const dateMatch = slot.date === searchDate;
      const timeMatch =
        effectiveTimeSlot === null ||
        normalizeTimeSlot(slot.timeSlot) === normalizeTimeSlot(effectiveTimeSlot);

      return branchMatch && packageMatch && dateMatch && timeMatch;
    });

    setSearchResults(sortSlots(results));
  };

  const filteredPreviewData = useMemo(() => {
    const items = loadedTimeSlots.filter((item) => {
      const dateMatch =
        item.date === DATES.today ||
        item.date === DATES.tomorrow ||
        item.date === DATES.dayAfterTomorrow;

      const branchMatch = !branchId || String(item.branchId) === String(branchId);
      const packageMatch =
        !packageId || String(item.packageId) === String(packageId);

      return dateMatch && branchMatch && packageMatch;
    });

    return sortSlots(items);
  }, [loadedTimeSlots, branchId, packageId]);

  const openEditModal = (slot: TimeSlot) => {
    if (isSlotEnded(slot)) {
      alert("此時段已結束，不能再修改名額");
      return;
    }

    setEditingSlot(slot);
    setEditQuota(String(slot.quota));
  };

  const closeEditModal = () => {
    if (isSavingQuota) return;
    setEditingSlot(null);
    setEditQuota("");
  };

  const applySlotUpdate = (slotId: number, updates: Partial<TimeSlot>) => {
    const updateOne = (slot: TimeSlot): TimeSlot => {
      if (Number(slot.slotId) !== Number(slotId)) return slot;
      return { ...slot, ...updates };
    };

    setLoadedTimeSlots((prev) => prev.map(updateOne));
    setSearchResults((prev) => (prev ? prev.map(updateOne) : prev));
  };

  const handleUpdateQuota = async () => {
    if (!editingSlot) return;

    if (isSlotEnded(editingSlot)) {
      alert("此時段已結束，不能再修改名額");
      return;
    }

    const nextQuota = Number(editQuota);
    const reservedCount = getReservedCount(editingSlot);

    if (!Number.isInteger(nextQuota) || nextQuota < 1) {
      alert("名額必須是大於等於 1 的整數");
      return;
    }

    if (nextQuota > MAX_QUOTA) {
      alert(`名額不可超過 ${MAX_QUOTA} 人`);
      return;
    }

    if (nextQuota < reservedCount) {
      alert(`名額不可小於已預約人數，目前已預約 ${reservedCount} 人`);
      return;
    }

    try {
      setIsSavingQuota(true);

      const response = await fetch(`${API_ENDPOINT}/${editingSlot.slotId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quota: nextQuota }),
      });

      const result = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(result?.message || `更新名額失敗 (${response.status})`);
      }

      const updatedSlot = result?.data;

      const nextReservedCount = Number(
        updatedSlot?.slotReservedCount ?? editingSlot.reservedCount ?? 0,
      );
      const nextStatus = String(
        updatedSlot?.slotStatus ?? editingSlot.status ?? "open",
      );

      applySlotUpdate(editingSlot.slotId, {
        quota: nextQuota,
        reservedCount: nextReservedCount,
        remaining: nextQuota - nextReservedCount,
        status: nextStatus,
      });

      closeEditModal();
      alert("時段名額更新成功");
    } catch (error) {
      console.error("更新名額失敗:", error);
      alert(error instanceof Error ? error.message : "更新名額失敗");
    } finally {
      setIsSavingQuota(false);
    }
  };

  const handleToggleSlotStatus = async (slot: TimeSlot) => {
    if (isSlotEnded(slot)) {
      alert("已結束的時段不可修改狀態");
      return;
    }

    const nextStatus = slot.status === "closed" ? "open" : "closed";
    const actionText = nextStatus === "closed" ? "關閉" : "重新開放";

    const ok = window.confirm(
      `確定要${actionText}這個時段嗎？\n\n${slot.branchName}｜${slot.packageType}｜${slot.date}｜${normalizeTimeSlot(
        slot.timeSlot,
      )}`,
    );

    if (!ok) return;

    try {
      setIsUpdatingStatus(true);

      const response = await fetch(`${API_ENDPOINT}/${slot.slotId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });

      const result = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(result?.message || "更新時段狀態失敗");
      }

      const updatedStatus = String(result?.data?.slotStatus ?? nextStatus);

      applySlotUpdate(slot.slotId, {
        status: updatedStatus,
      });

      alert(`${actionText}成功`);
    } catch (error) {
      console.error("更新時段狀態失敗:", error);
      alert(error instanceof Error ? error.message : "更新時段狀態失敗");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const renderTimeSlotTable = (items: TimeSlot[], showDateTag = false) => {
    return (
      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>院區</th>
              <th>套餐</th>
              <th>日期</th>
              <th>時段</th>
              <th>總名額</th>
              <th>已預約</th>
              <th>剩餘</th>
              <th>狀態</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const ended = isSlotEnded(item);
              const closed = item.status === "closed";

              return (
                <tr key={item.slotId}>
                  <td>{item.branchName}</td>
                  <td>{item.packageType}</td>
                  <td>
                    {item.date} {showDateTag && getDateTag(item.date)}
                  </td>
                  <td>{normalizeTimeSlot(item.timeSlot)}</td>
                  <td>{item.quota}</td>
                  <td>{getReservedCount(item)}</td>
                  <td>{getRemainingCount(item)}</td>
                  <td>{getStatusText(item)}</td>
                  <td>
                    <div className="result-action-stack">
                      <button
                        type="button"
                        className="secondary-button"
                        onClick={() => openEditModal(item)}
                        disabled={ended}
                        title={ended ? "已結束的時段不能修改名額" : "編輯名額"}
                        style={{ cursor: ended ? "not-allowed" : "pointer" }}
                      >
                        {ended ? "不可編輯" : "編輯名額"}
                      </button>

                      <button
                        type="button"
                        className="secondary-button"
                        onClick={() => handleToggleSlotStatus(item)}
                        disabled={ended || isUpdatingStatus}
                        title={ended ? "已結束的時段不可修改狀態" : ""}
                        style={{
                          cursor: ended || isUpdatingStatus ? "not-allowed" : "pointer",
                        }}
                      >
                        {closed ? "重新開放" : "關閉時段"}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="page-container healthcenter-scope healthcenter-form-page">
      <div className="page-card">
        <h2 className="page-title">時段剩餘名額查詢</h2>

        <form className="page-form" onSubmit={handleSearch}>
          <div className="form-row">
            <div className="form-field form-field-narrow">
              <label className="form-label" htmlFor="branchId">
                院區：
              </label>
              <select
                id="branchId"
                value={branchId}
                onChange={(e) => setBranchId(e.target.value)}
                className="form-select"
                required
                disabled={loadingStatus === "loading"}
              >
                <option value="">請選擇院區</option>
                {branches.map((branch) => (
                  <option key={branch.branchId} value={branch.branchId}>
                    {branch.branchName}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-field form-field-narrow">
              <label className="form-label" htmlFor="packageId">
                套餐：
              </label>
              <select
                id="packageId"
                value={packageId}
                onChange={(e) => setPackageId(e.target.value)}
                className="form-select"
                required
                disabled={loadingStatus === "loading"}
              >
                <option value="">請選擇套餐</option>
                {packages.map((pkg) => (
                  <option key={pkg.packageId} value={pkg.packageId}>
                    {pkg.packageName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-field form-field-narrow">
              <label className="form-label" htmlFor="searchDate">
                查詢日期：
              </label>
              <input
                id="searchDate"
                type="date"
                value={searchDate}
                onChange={(e) => setSearchDate(e.target.value)}
                className="form-input"
                required
                disabled={loadingStatus === "loading"}
              />
            </div>

            <div className="form-field form-field-narrow">
              <label className="form-label" htmlFor="searchTime">
                時段選擇：
              </label>
              <select
                id="searchTime"
                value={searchTimeSlot}
                onChange={(e) => setSearchTimeSlot(e.target.value)}
                className="form-select"
                disabled={loadingStatus === "loading"}
              >
                {TIME_SLOT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-field form-field-narrow">
              <div className="form-actions-center">
                <button
                  type="submit"
                  className="primary-button full-width-button"
                  disabled={loadingStatus === "loading"}
                >
                  查詢
                </button>
              </div>
            </div>
          </div>
        </form>

        {loadingStatus === "loading" && <p className="form-hint">資料載入中...</p>}

        {loadingStatus === "error" && (
          <p className="form-hint">
            載入失敗：{errorMessage || "請檢查後端服務是否運行。"}
          </p>
        )}

        {searchResults !== null && (
          <>
            <hr className="section-divider" />
            <h3 className="result-title">查詢結果</h3>

            {searchResults.length > 0 ? (
              renderTimeSlotTable(searchResults)
            ) : (
              <p className="form-hint">查無符合條件的時段名額。</p>
            )}
          </>
        )}

        <hr className="section-divider" />

        <h3 className="result-title">近三天名額概況</h3>

        {loadingStatus === "success" &&
          (filteredPreviewData.length > 0 ? (
            renderTimeSlotTable(filteredPreviewData, true)
          ) : (
            <p className="form-hint">近三日沒有已設定的時段名額。</p>
          ))}
      </div>

      {editingSlot && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <h3 className="modal-title">編輯時段名額</h3>

            <p className="modal-subtext">
              {editingSlot.branchName}｜{editingSlot.packageType}｜
              {editingSlot.date}｜{normalizeTimeSlot(editingSlot.timeSlot)}
            </p>

            <div className="modal-summary-row">
              <div className="modal-summary-item">
                <p className="modal-summary-label">目前總名額</p>
                <p className="modal-summary-value total">{editingSlot.quota}</p>
              </div>

              <div className="modal-summary-item">
                <p className="modal-summary-label">已預約</p>
                <p className="modal-summary-value booked">
                  {getReservedCount(editingSlot)}
                </p>
              </div>

              <div className="modal-summary-item">
                <p className="modal-summary-label">目前剩餘</p>
                <p className="modal-summary-value remaining">
                  {getRemainingCount(editingSlot)}
                </p>
              </div>
            </div>

            <div className="form-field">
              <label className="form-label" htmlFor="editQuota">
                新名額：
              </label>
              <input
                id="editQuota"
                type="number"
                min={Math.max(1, getReservedCount(editingSlot))}
                max={MAX_QUOTA}
                value={editQuota}
                onChange={(e) => setEditQuota(e.target.value)}
                className="form-input"
                disabled={isSavingQuota}
              />
              <p className="form-hint">
                新名額不可小於已預約人數：{getReservedCount(editingSlot)} 人，
                且不可超過 {MAX_QUOTA} 人。
              </p>
            </div>

            <div className="form-actions-center gap">
              <button
                type="button"
                className="primary-button"
                onClick={handleUpdateQuota}
                disabled={isSavingQuota}
              >
                {isSavingQuota ? "儲存中..." : "儲存"}
              </button>

              <button
                type="button"
                className="secondary-button"
                onClick={closeEditModal}
                disabled={isSavingQuota}
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TimeSlotViewPage;