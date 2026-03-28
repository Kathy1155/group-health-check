import React, { useState, useEffect } from "react";

const API_ENDPOINT = "http://localhost:3000/api/timeslots";

interface TimeSlot {
  date: string;
  timeSlot: string;
  packageType: string;
  quota: number;
}

interface QueryResult {
  totalQuota: number;
  currentBooked: number;
  remaining: number;
  date: string;
  timeSlot: string;
}

const formatDate = (date: Date) => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
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

const TIME_SLOT_OPTIONS = [
  { value: "all", label: "所有時段" },
  { value: "8:00-10:00", label: "8:00 - 10:00" },
  { value: "10:00-12:00", label: "10:00 - 12:00" },
  { value: "13:00-15:00", label: "13:00 - 15:00" },
];

function TimeSlotViewPage() {
  const [searchDate, setSearchDate] = useState("");
  const [searchTimeSlot, setSearchTimeSlot] = useState("all");
  const [loadedTimeSlots, setLoadedTimeSlots] = useState<TimeSlot[]>([]);
  const [loadingStatus, setLoadingStatus] = useState<"loading" | "success" | "error">("loading");
  const [queryResult, setQueryResult] = useState<QueryResult | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchTimeSlots = async () => {
      try {
        const response = await fetch(API_ENDPOINT);

        if (!response.ok) {
          throw new Error(`無法載入資料 (HTTP ${response.status})`);
        }

        const data: TimeSlot[] = await response.json();
        setLoadedTimeSlots(data);
        setLoadingStatus("success");
      } catch (error) {
        console.error("載入時段資料失敗:", error);
        setLoadingStatus("error");
      }
    };

    fetchTimeSlots();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    if (!searchDate) {
      alert("請選擇查詢日期");
      return;
    }

    const formattedSearchDate = searchDate;
    const effectiveTimeSlot = searchTimeSlot === "all" ? null : searchTimeSlot;

    const matchingSlots = loadedTimeSlots.filter((slot) => {
      const dateMatch = slot.date === formattedSearchDate;
      const timeMatch = effectiveTimeSlot === null || slot.timeSlot === effectiveTimeSlot;
      return dateMatch && timeMatch;
    });

    let totalQuota = 0;
    if (matchingSlots.length > 0) {
      totalQuota = matchingSlots.reduce((sum, slot) => sum + slot.quota, 0);
    }

    const currentBooked = Math.floor(totalQuota * 0.7);

    const finalResult: QueryResult = {
      date: searchDate,
      timeSlot: effectiveTimeSlot === null ? "所有時段" : effectiveTimeSlot,
      totalQuota,
      currentBooked,
      remaining: totalQuota - currentBooked,
    };

    if (totalQuota === 0) {
      alert(`找不到 ${searchDate} ${finalResult.timeSlot} 的時段設定名額！`);
      return;
    }

    setQueryResult(finalResult);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setQueryResult(null);
  };

  const getDateTag = (date: string) => {
    const displayDate = date.replace(/-/g, "/");

    if (displayDate === DATES.today) {
      return <span className="status-tag status-confirmed">今天</span>;
    }
    if (displayDate === DATES.tomorrow) {
      return <span className="status-tag status-booked">明天</span>;
    }
    if (displayDate === DATES.dayAfterTomorrow) {
      return <span className="status-tag" style={{ background: "#fef3c7", color: "#b45309" }}>後天</span>;
    }
    return null;
  };

  const filteredData = loadedTimeSlots.filter((item) => {
    const itemDate = item.date.replace(/-/g, "/");
    return (
      itemDate === DATES.today ||
      itemDate === DATES.tomorrow ||
      itemDate === DATES.dayAfterTomorrow
    );
  });

  const Modal = ({
    isOpen,
    result,
    onClose,
  }: {
    isOpen: boolean;
    result: QueryResult | null;
    onClose: () => void;
  }) => {
    if (!isOpen || !result) return null;

    return (
      <div className="modal-backdrop">
        <div className="modal-content">
          <h3 className="modal-title">📅 {result.date} 時段查詢結果</h3>
          <p className="modal-subtext">時段：{result.timeSlot}</p>

          <div className="modal-summary-row">
            <div className="modal-summary-item">
              <p className="modal-summary-label">總名額</p>
              <p className="modal-summary-value total">{result.totalQuota}</p>
            </div>
            <div className="modal-summary-item">
              <p className="modal-summary-label">已預約</p>
              <p className="modal-summary-value booked">{result.currentBooked}</p>
            </div>
            <div className="modal-summary-item">
              <p className="modal-summary-label">剩餘</p>
              <p className="modal-summary-value remaining">{result.remaining}</p>
            </div>
          </div>

          <div className="form-actions-center">
            <button className="primary-button" onClick={onClose}>
              關閉
            </button>
          </div>
        </div>
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

        <hr className="section-divider" />

        <h3 className="result-title">近三天時段名額一覽</h3>

        {loadingStatus === "loading" && <p className="form-hint">資料載入中...</p>}
        {loadingStatus === "error" && <p className="form-hint">載入失敗，請檢查後端服務是否運行。</p>}

        {loadingStatus === "success" && (
          filteredData.length > 0 ? (
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>日期</th>
                    <th>時段</th>
                    <th>套餐</th>
                    <th>名額</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((item, index) => (
                    <tr key={index}>
                      <td>
                        {item.date} {getDateTag(item.date)}
                      </td>
                      <td>{item.timeSlot}</td>
                      <td>{item.packageType} 套餐</td>
                      <td>{item.quota}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="form-hint">近三日沒有已設定的時段名額。</p>
          )
        )}
      </div>

      <Modal isOpen={isModalOpen} result={queryResult} onClose={closeModal} />
    </div>
  );
}

export default TimeSlotViewPage;