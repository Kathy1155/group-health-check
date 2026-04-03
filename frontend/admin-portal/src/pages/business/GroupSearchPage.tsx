import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchGroupByCode, type GroupDetailDto } from "../../api/groupsApi";

type GroupStatus = "active" | "inactive";

interface GroupDetail {
  id: number;
  groupName: string;
  groupCode: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  reservationStartDate?: string;
  reservationEndDate?: string;
  availablePackageIds?: number[];
  availablePackages?: {
    packageId: number;
    packageName: string;
  }[];
  status: GroupStatus;
}

const GroupSearchPage: React.FC = () => {
  const navigate = useNavigate();

  const [groupCode, setGroupCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [groupData, setGroupData] = useState<GroupDetail | null>(null);

  const handleSearch = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const trimmedCode = groupCode.trim();
    if (!trimmedCode) {
      alert("請輸入團體代碼");
      return;
    }

    setLoading(true);
    setSearched(false);
    setGroupData(null);

    try {
      const data: GroupDetailDto | null = await fetchGroupByCode(trimmedCode);

      if (!data) {
        setSearched(true);
        setGroupData(null);
        return;
      }

      setGroupData({
        id: data.id,
        groupName: data.groupName ?? "",
        groupCode: data.groupCode,
        contactName: data.contactName,
        contactPhone: data.contactPhone,
        contactEmail: data.contactEmail,
        reservationStartDate: data.reservationStartDate ?? "",
        reservationEndDate: data.reservationEndDate ?? "",
        availablePackageIds: data.availablePackageIds ?? [],
        availablePackages: data.availablePackages ?? [],
        status: data.status ?? "active",
      });
      setSearched(true);
    } catch (err) {
      console.error("查詢失敗：", err);
      alert("無法連線到伺服器，請確認後端是否有啟動");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container business-scope">
      <div className="page-card">
        <h2 className="page-title">查詢 / 編輯團體資料</h2>

        <form className="page-form" onSubmit={handleSearch}>
          <div className="form-row single">
            <div className="form-field form-field-narrow">
              <label className="form-label" htmlFor="groupCodeSearch">
                團體代碼：
              </label>
              <input
                id="groupCodeSearch"
                className="form-input"
                value={groupCode}
                onChange={(e) => setGroupCode(e.target.value.toUpperCase())}
                placeholder="請輸入團體代碼"
              />
            </div>
          </div>

          <div className="form-actions-center">
            <button
              type="submit"
              className="primary-button full-width-button"
              disabled={loading}
            >
              {loading ? "查詢中..." : "查詢"}
            </button>
          </div>
        </form>

        {searched && !groupData && (
          <div style={{ marginTop: 24, textAlign: "center", color: "#dc2626" }}>
            查無此團體資料
          </div>
        )}

        {groupData && (
          <div style={{ marginTop: 32 }}>
            <div
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: 16,
                padding: 24,
                background: "#f9fafb",
              }}
            >
              <h3 style={{ marginTop: 0, marginBottom: 20 }}>查詢結果</h3>

              <div style={{ display: "grid", gap: 12 }}>
                <div><strong>團體名稱：</strong>{groupData.groupName}</div>
                <div><strong>團體代碼：</strong>{groupData.groupCode}</div>
                <div><strong>聯絡人姓名：</strong>{groupData.contactName}</div>
                <div><strong>聯絡人電話：</strong>{groupData.contactPhone}</div>
                <div><strong>聯絡人郵件：</strong>{groupData.contactEmail}</div>
                <div><strong>開放預約開始日：</strong>{groupData.reservationStartDate || "未設定"}</div>
                <div><strong>開放預約截止日：</strong>{groupData.reservationEndDate || "未設定"}</div>
                <div>
                  <strong>可預約套餐：</strong>
                  {groupData.availablePackages && groupData.availablePackages.length > 0
                    ? groupData.availablePackages.map((pkg) => pkg.packageName).join("、")
                    : "未設定"}
                </div>
                <div>
                  <strong>團體狀態：</strong>
                  {groupData.status === "active" ? "啟用" : "停用"}
                </div>
              </div>

              <div className="form-actions-center gap" style={{ marginTop: 24 }}>
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => navigate("/admin/home")}
                >
                  返回
                </button>

                <button
                  type="button"
                  className="primary-button"
                  onClick={() =>
                    navigate(`/admin/business/groups/edit/${groupData.id}`, {
                      state: { groupData },
                    })
                  }
                >
                  編輯資料
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GroupSearchPage;