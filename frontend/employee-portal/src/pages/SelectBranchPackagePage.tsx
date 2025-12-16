import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { fetchGroupOptions } from "../api/groupOptionsApi";
import type { GroupOptionDto } from "../api/groupOptionsApi";

type GroupInState = {
  id: number;
  code: string;
  name: string;
  contactName: string;
  idNumber: string;
};

type LocationState = {
  group: GroupInState;
  idNumber: string;
  groupCode: string;
};

function SelectBranchPackagePage() {
  const location = useLocation();
  const navigate = useNavigate();

  const state = location.state as LocationState | undefined;
  const group = state?.group;
  const idNumber = state?.idNumber;

  const [options, setOptions] = useState<GroupOptionDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedBranchId, setSelectedBranchId] = useState<number | "">("");
  const [selectedPackageId, setSelectedPackageId] = useState<number | null>(
    null
  );

  // ⭐ 防呆：如果沒有必要 state，直接導回首頁
  useEffect(() => {
    if (!group || !idNumber) {
      navigate("/");
      return;
    }

    fetchGroupOptions(group.id)
      .then((data: GroupOptionDto) => {
        setOptions(data);
        setLoading(false);
      })
      .catch((err: unknown) => {
        console.error(err);
        setError("無法取得院區與套餐資料");
        setLoading(false);
      });
  }, [group, idNumber, navigate]);

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBranchId || !selectedPackageId || !group || !idNumber) return;

    navigate("/select-slot", {
      state: {
        group,
        idNumber,
        branchId: selectedBranchId,
        packageId: selectedPackageId,
      },
    });
  };

  const handlePrev = () => {
    navigate("/");
  };

  if (loading) return <p>載入中...</p>;
  if (error) return <p>{error}</p>;
  if (!options || !group) return <p>沒有資料</p>;

  const branches = options.branches;

  const currentBranch = branches.find(
    (b: GroupOptionDto["branches"][number]) => b.branchId === selectedBranchId
  );

  return (
    <form onSubmit={handleNext} className="sbp-form">
      <h2>步驟 2：選擇院區與健檢套餐</h2>
      <p>團體名稱：{group.name}</p>

      <div className="sbp-layout">
        {/* 左邊：院區選擇 */}
        <div className="sbp-left">
          <label className="sbp-label">
            院區：
            <select
              value={selectedBranchId}
              onChange={(e) => {
                const value = e.target.value;
                setSelectedBranchId(value ? Number(value) : "");
                setSelectedPackageId(null);
              }}
              className="sbp-select"
              required
            >
              <option value="">請選擇院區</option>
              {branches.map((b) => (
                <option key={b.branchId} value={b.branchId}>
                  {b.branchName}
                </option>
              ))}
            </select>
          </label>

          <p className="sbp-description">
            請先選擇欲前往的院區，下方會依院區顯示可施作的健檢套餐。
          </p>
        </div>

        {/* 右邊：套餐按鈕列表 */}
        <div className="sbp-form page-form">
          <div className="sbp-packages-header">
            <span>可選健檢套餐</span>
            <span className="sbp-branch-label">
              {currentBranch
                ? `目前院區：${currentBranch.branchName}`
                : "尚未選擇院區"}
            </span>
          </div>

          <div className="sbp-packages">
            {!currentBranch && (
              <p className="sbp-hint">請先在左側選擇院區。</p>
            )}

            {currentBranch &&
              currentBranch.packages.map((p) => {
                const active = selectedPackageId === p.packageId;

                return (
                  <button
                    key={p.packageId}
                    type="button"
                    className={[
                      "sbp-package-btn",
                      "sbp-package-btn--available",
                      active ? "sbp-package-btn--active" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    onClick={() => setSelectedPackageId(p.packageId)}
                  >
                    <div className="sbp-package-main">{p.packageName}</div>
                    <div className="sbp-package-sub"></div>
                  </button>
                );
              })}
          </div>
        </div>
      </div>

      <div className="form-footer">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={handlePrev}
        >
          上一步
        </button>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={!selectedBranchId || !selectedPackageId}
        >
          下一步
        </button>
      </div>
    </form>
  );
}

export default SelectBranchPackagePage;