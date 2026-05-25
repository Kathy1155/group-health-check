import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const RESERVATION_API_ENDPOINT = "/api/reservations";
const TIMESLOT_API_ENDPOINT = "/api/timeslots";
const BRANCH_API_ENDPOINT = "/api/branches";

type ReservationItem = {
  id?: number;
  reservationId?: number;
  name?: string;
  date?: string;
  reservationDate?: string;
  timeSlot?: string;
  packageType?: string;
  branchName?: string;
  status?: string;
};

type TimeSlotItem = {
  slotId?: number;
  date?: string;
  slotDate?: string;
  timeSlot?: string;
  quota?: number;
  reservedCount?: number;
  remaining?: number;
  status?: string;
  branchName?: string;
  packageType?: string;
};

type BranchOption = {
  branch_id?: number;
  branchId?: number;
  branch_name?: string;
  branchName?: string;
};

const featureButtons = [
  {
    label: "設定每日時段名額",
    description: "新增每日各院區、套餐與時段名額",
    to: "/admin/center/timeslots",
  },
  {
    label: "時段名額查詢",
    description: "查詢剩餘名額、修改名額或關閉時段",
    to: "/admin/center/timeslots/view",
  },
  {
    label: "預約清單",
    description: "查看預約名單與修改預約狀態",
    to: "/admin/center/reservations",
  },
];

function getTodayText() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const date = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${date}`;
}

function normalizeDate(value?: string) {
  if (!value) return "";
  return String(value).slice(0, 10);
}

function normalizeStatus(status?: string) {
  const text = status ?? "";

  if (text === "已取消" || text === "cancelled" || text === "canceled") {
    return "cancelled";
  }

  if (text === "已報到" || text === "checked_in") {
    return "checkedIn";
  }

  if (
    text === "已確認" ||
    text === "已預約" ||
    text === "confirmed" ||
    text === "reserved"
  ) {
    return "confirmed";
  }

  if (text === "待確認" || text === "pending") {
    return "pending";
  }

  return "other";
}

function DefaultHomePage() {
  const navigate = useNavigate();

  const [reservations, setReservations] = useState<ReservationItem[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlotItem[]>([]);
  const [branches, setBranches] = useState<BranchOption[]>([]);
  const [selectedBranchName, setSelectedBranchName] = useState(
    () => localStorage.getItem("healthDashboardBranch") || "",
  );
  const [isLoading, setIsLoading] = useState(true);

  const todayText = getTodayText();
  const branchOptions = branches
    .map((branch) => branch.branch_name ?? branch.branchName ?? "")
    .filter(Boolean);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setIsLoading(true);

        const [reservationResponse, timeSlotResponse, branchResponse] =
          await Promise.all([
            fetch(RESERVATION_API_ENDPOINT),
            fetch(TIMESLOT_API_ENDPOINT),
            fetch(BRANCH_API_ENDPOINT),
          ]);

        if (!reservationResponse.ok) {
          throw new Error(`預約資料載入失敗 (${reservationResponse.status})`);
        }

        if (!timeSlotResponse.ok) {
          throw new Error(`時段資料載入失敗 (${timeSlotResponse.status})`);
        }

        if (!branchResponse.ok) {
          throw new Error(`院區資料載入失敗 (${branchResponse.status})`);
        }

        const reservationData = await reservationResponse.json();
        const timeSlotData = await timeSlotResponse.json();
        const branchData = await branchResponse.json();

        const reservationList = Array.isArray(reservationData)
          ? reservationData
          : reservationData?.data ?? [];

        const timeSlotList = Array.isArray(timeSlotData)
          ? timeSlotData
          : timeSlotData?.data ?? [];
        
        const branchList = Array.isArray(branchData)
          ? branchData
          : branchData?.data ?? [];

        setReservations(reservationList);
        setTimeSlots(timeSlotList);
        setBranches(branchList);

      } catch (error) {
        console.error("Dashboard 載入失敗:", error);
        alert(error instanceof Error ? error.message : "Dashboard 載入失敗");
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const todayReservations = useMemo(() => {
    return reservations.filter((item) => {
      const date = normalizeDate(item.date ?? item.reservationDate);
      const branchName = item.branchName ?? "";

      return date === todayText && branchName === selectedBranchName;
    });
  }, [reservations, todayText, selectedBranchName]);

  const todayTimeSlots = useMemo(() => {
    return timeSlots.filter((item) => {
      const date = normalizeDate(item.date ?? item.slotDate);
      const branchName = item.branchName ?? "";

      return date === todayText && branchName === selectedBranchName;
    });
  }, [timeSlots, todayText, selectedBranchName]);

  const summary = useMemo(() => {
    const confirmed = todayReservations.filter(
      (item) => normalizeStatus(item.status) === "confirmed",
    ).length;

    const pending = todayReservations.filter(
      (item) => normalizeStatus(item.status) === "pending",
    ).length;

    const checkedIn = todayReservations.filter(
      (item) => normalizeStatus(item.status) === "checkedIn",
    ).length;

    const cancelled = todayReservations.filter(
      (item) => normalizeStatus(item.status) === "cancelled",
    ).length;

    return {
      total: todayReservations.length,
      confirmed,
      pending,
      checkedIn,
      cancelled,
    };
  }, [todayReservations]);

  const timeSlotSummary = useMemo(() => {
    const map = new Map<
      string,
      {
        timeSlot: string;
        quota: number;
        reserved: number;
        remaining: number;
      }
    >();

    todayTimeSlots.forEach((slot) => {
      const timeSlot = slot.timeSlot ?? "未設定時段";
      const quota = Number(slot.quota ?? 0);
      const reserved = Number(slot.reservedCount ?? 0);
      const remaining = Number(
        slot.remaining ?? Math.max(quota - reserved, 0),
      );

      const current = map.get(timeSlot) ?? {
        timeSlot,
        quota: 0,
        reserved: 0,
        remaining: 0,
      };

      current.quota += quota;
      current.reserved += reserved;
      current.remaining += remaining;

      map.set(timeSlot, current);
    });

    return Array.from(map.values()).sort((a, b) =>
      a.timeSlot.localeCompare(b.timeSlot),
    );
  }, [todayTimeSlots]);

  const branchSummary = useMemo(() => {
    const map = new Map<string, number>();

    todayReservations.forEach((reservation) => {
      const branchName = reservation.branchName ?? "未標示院區";
      map.set(branchName, (map.get(branchName) ?? 0) + 1);
    });

    return Array.from(map.entries())
      .map(([branchName, count]) => ({ branchName, count }))
      .sort((a, b) => b.count - a.count);
  }, [todayReservations]);

  const warningItems = useMemo(() => {
    const fullSlotCount = todayTimeSlots.filter((slot) => {
      const quota = Number(slot.quota ?? 0);
      const remaining = Number(
        slot.remaining ?? Math.max(quota - Number(slot.reservedCount ?? 0), 0),
      );

      return quota > 0 && remaining <= 0;
    }).length;

    const closedSlotCount = todayTimeSlots.filter(
      (slot) => slot.status === "closed" || slot.status === "已關閉",
    ).length;

    const warnings = [];

    if (summary.pending > 0) {
      warnings.push(`${summary.pending} 筆預約尚未確認`);
    }

    if (fullSlotCount > 0) {
      warnings.push(`${fullSlotCount} 個時段已額滿`);
    }

    if (closedSlotCount > 0) {
      warnings.push(`${closedSlotCount} 個時段目前為關閉狀態`);
    }

    if (summary.cancelled > 0) {
      warnings.push(`今日已有 ${summary.cancelled} 筆取消預約`);
    }

    return warnings;
  }, [summary, todayTimeSlots]);

  return (
    <div className="page-container healthcenter-scope healthcenter-dashboard-page">
      <div className="dashboard-hero">
        <div>
          <p className="dashboard-kicker">今日預約概況</p>
          <h2 className="dashboard-title">健檢中心專員，歡迎回到系統</h2>
          <p className="dashboard-subtitle">
            今日日期：{todayText}
          </p>
        </div>
      </div>
          <section className="dashboard-branch-card">
            <div>
              <p className="dashboard-branch-label">目前查看院區</p>
              <h3>{selectedBranchName || "請先選擇院區"}</h3>
            </div>

            <div className="dashboard-branch-actions">
              <select
                value={selectedBranchName}
                onChange={(e) => {
                  setSelectedBranchName(e.target.value);
                  localStorage.setItem("healthDashboardBranch", e.target.value);
                }}
              >
                <option value="">請選擇院區</option>
                {branchOptions.map((branchName) => (
                  <option key={branchName} value={branchName}>
                    {branchName}
                  </option>
                ))}
              </select>

              <button
                type="button"
                className="dashboard-refresh-button"
                onClick={() => window.location.reload()}
              >
                重新整理
              </button>
            </div>
          </section>

        {isLoading ? (
          <p className="form-hint">Dashboard 資料載入中...</p>
        ) : !selectedBranchName ? (
          <section className="dashboard-panel">
            <p className="dashboard-empty-text">
              請先選擇要查看的院區，系統會顯示該院區今日預約與時段名額。
            </p>
          </section>
        ) : (
        <>
          <div className="dashboard-stat-grid">
            <div className="dashboard-stat-card">
              <span className="dashboard-stat-label">今日總預約</span>
              <strong className="dashboard-stat-value">{summary.total}</strong>
            </div>

            <div className="dashboard-stat-card">
              <span className="dashboard-stat-label">已確認</span>
              <strong className="dashboard-stat-value">{summary.confirmed}</strong>
            </div>

            <div className="dashboard-stat-card">
              <span className="dashboard-stat-label">待確認</span>
              <strong className="dashboard-stat-value">{summary.pending}</strong>
            </div>

            <div className="dashboard-stat-card">
              <span className="dashboard-stat-label">已取消</span>
              <strong className="dashboard-stat-value">{summary.cancelled}</strong>
            </div>
          </div>

          <div className="dashboard-content-grid">
            <section className="dashboard-panel">
              <div className="dashboard-panel-header">
                <h3>今日時段名額</h3>
                <span>依時段統計</span>
              </div>

              {timeSlotSummary.length === 0 ? (
                <p className="dashboard-empty-text">今日尚未設定時段名額。</p>
              ) : (
                <div className="dashboard-slot-list">
                  {timeSlotSummary.map((slot) => (
                    <div key={slot.timeSlot} className="dashboard-slot-item">
                      <div>
                        <strong>{slot.timeSlot}</strong>
                        <p>
                          總名額 {slot.quota}，已預約 {slot.reserved}
                        </p>
                      </div>

                      <span
                        className={
                          "dashboard-slot-badge " +
                          (slot.remaining <= 0
                            ? "danger"
                            : slot.remaining <= 3
                              ? "warning"
                              : "normal")
                        }
                      >
                        剩餘 {slot.remaining}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="dashboard-panel">
              <div className="dashboard-panel-header">
                <h3>今日各院區預約</h3>
                <span>依院區統計</span>
              </div>

              {branchSummary.length === 0 ? (
                <p className="dashboard-empty-text">今日尚無預約資料。</p>
              ) : (
                <div className="dashboard-branch-list">
                  {branchSummary.map((item) => (
                    <div key={item.branchName} className="dashboard-branch-item">
                      <span>{item.branchName}</span>
                      <strong>{item.count} 筆</strong>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          <section className="dashboard-panel dashboard-warning-panel">
            <div className="dashboard-panel-header">
              <h3>今日提醒</h3>
              <span>需要留意的狀態</span>
            </div>

            {warningItems.length === 0 ? (
              <p className="dashboard-empty-text">目前沒有需要特別提醒的項目。</p>
            ) : (
              <ul className="dashboard-warning-list">
                {warningItems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            )}
          </section>

          <section className="dashboard-quick-section">
            <h3>快捷功能</h3>

            <div className="dashboard-quick-grid">
              {featureButtons.map((btn) => (
                <button
                  key={btn.label}
                  type="button"
                  className="dashboard-quick-card"
                  onClick={() => navigate(btn.to)}
                >
                  <strong>{btn.label}</strong>
                  <span>{btn.description}</span>
                </button>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}

export default DefaultHomePage;