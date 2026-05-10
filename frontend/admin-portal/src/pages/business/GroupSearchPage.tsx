import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchGroups, type GroupDetailDto } from "../../api/groupsApi";

type ReservationStatusView = {
  text: string;
  className: string;
};

const getReservationStatus = (group: GroupDetailDto): ReservationStatusView => {
  if (group.status === "inactive") {
    return {
      text: "停用",
      className: "inactive",
    };
  }

  if (!group.reservationStartDate || !group.reservationEndDate) {
    return {
      text: "未設定",
      className: "unset",
    };
  }

  const today = new Date();
  const start = new Date(`${group.reservationStartDate}T00:00:00`);
  const end = new Date(`${group.reservationEndDate}T23:59:59`);

  if (today < start) {
    const days = Math.ceil(
      (start.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
    );

    return {
      text: `尚未開始 ${days} 天`,
      className: "upcoming",
    };
  }

  if (today > end) {
    return {
      text: "已結束",
      className: "expired",
    };
  }

  const remainingDays = Math.ceil(
    (end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (remainingDays <= 30) {
    return {
      text: `剩餘 ${remainingDays} 天`,
      className: "warning",
    };
  }

  const remainingMonths = Math.max(1, Math.floor(remainingDays / 30));

  return {
    text: `約剩餘 ${remainingMonths} 個月`,
    className: "active",
  };
};

const GroupSearchPage: React.FC = () => {
  const navigate = useNavigate();

  const [keyword, setKeyword] = useState("");
  const [groups, setGroups] = useState<GroupDetailDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let alive = true;

    const loadGroups = async () => {
      try {
        setLoading(true);
        setLoadError("");

        const data = await fetchGroups();

        if (!alive) return;

        setGroups(data);
      } catch (err) {
        console.error("讀取團體列表失敗：", err);

        if (!alive) return;

        setLoadError("無法讀取團體列表，請確認後端與資料庫是否已啟動。");
      } finally {
        if (alive) {
          setLoading(false);
        }
      }
    };

    loadGroups();

    return () => {
      alive = false;
    };
  }, []);

  const filteredGroups = useMemo(() => {
    const normalizedKeyword = keyword.trim().toUpperCase();

    if (!normalizedKeyword) return groups;

    return groups.filter((group) => {
      const code = group.groupCode.toUpperCase();
      const name = group.groupName.toUpperCase();

      return code.includes(normalizedKeyword) || name.includes(normalizedKeyword);
    });
  }, [groups, keyword]);

  return (
    <div className="page-container business-scope group-search-page">
      <div className="page-card">
        <h2 className="page-title">查詢/編輯團體資料</h2>

        <section className="group-list-panel">
          <div className="group-list-search-row">
            <div className="group-list-search-box">
              <span className="search-icon">⌕</span>
              <input
                className="group-list-search-input"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="輸入團體代碼或公司名稱："
              />
            </div>

            <button type="button" className="group-list-search-button">
              搜尋
            </button>
          </div>

          {loading && (
            <div className="group-list-message">團體資料載入中...</div>
          )}

          {loadError && !loading && (
            <div className="group-list-message error">{loadError}</div>
          )}

          {!loading && !loadError && (
            <>
            <div className="group-list-section-title">團體列表</div>
            
            <div className="group-list-table-card">
              <table className="group-list-table">
                <thead>
                  <tr>
                    <th className="action-column"></th>
                    <th>團體代碼</th>
                    <th>公司名稱</th>
                    <th>團體預約狀態</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredGroups.length === 0 ? (
                    <tr>
                      <td colSpan={4}>
                        <div className="group-list-empty">
                          找不到符合條件的團體資料
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredGroups.map((group) => {
                      const status = getReservationStatus(group);

                      return (
                        <tr key={group.id}>
                          <td className="action-column">
                            <button
                              type="button"
                              className="edit-group-button"
                              onClick={() =>
                                navigate(`/admin/business/groups/edit/${group.id}`, {
                                  state: { groupData: group },
                                })
                              }
                            >
                              <span>╱</span>
                              編輯
                            </button>
                          </td>

                          <td className="group-code-cell">{group.groupCode}</td>

                          <td className="group-name-cell">{group.groupName}</td>

                          <td>
                            <div className="reservation-status-cell">
                              <span
                                className={`reservation-status-pill ${status.className}`}
                              >
                                {status.text}
                              </span>

                              <span className="reservation-deadline">
                                DEADLINE:{" "}
                                {group.reservationEndDate || "未設定"}
                              </span>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
};

export default GroupSearchPage;