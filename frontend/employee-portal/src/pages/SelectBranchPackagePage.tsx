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

  if (!state?.group || !state?.idNumber) {
    console.error("缺少必要 state:", state);

    return (
      <div className="page-form">
        <h2>預約流程中斷</h2>
        <p>缺少必要資料，請從首頁重新開始預約。</p>
        <button type="button" onClick={() => navigate("/")}>
          回首頁
        </button>
      </div>
    );
  }

  const group = state.group;
  const idNumber = state.idNumber;

  const [options, setOptions] = useState<GroupOptionDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedBranchId, setSelectedBranchId] = useState<number | "">("");
  const [selectedPackageId, setSelectedPackageId] = useState<number | null>(
    null
  );

  useEffect(() => {
    const groupId = Number(group.id);

    if (Number.isNaN(groupId)) {
      setError("團體資料不完整，無法載入院區與套餐資料");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    fetchGroupOptions(groupId)
      .then((data: GroupOptionDto) => {
        setOptions(data);
        setLoading(false);
      })
      .catch((err: unknown) => {
        console.error(err);
        setError("無法取得院區與套餐資料");
        setLoading(false);
      });
  }, [group]);

  if (loading) return <p>載入中...</p>;
  if (error) return <p>{error}</p>;
  if (!options) return <p>沒有資料</p>;

  const branches = options.branches;

  const currentBranch =
    selectedBranchId === ""
      ? undefined
      : branches.find(
          (b: GroupOptionDto["branches"][number]) =>
            String(b.branchId) === String(selectedBranchId)
        );

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedBranchId || !selectedPackageId) return;

    const selectedBranch = branches.find(
      (b) => String(b.branchId) === String(selectedBranchId)
    );

    const selectedPackage = selectedBranch?.packages.find(
      (p) => Number(p.packageId) === Number(selectedPackageId)
    );

    navigate("/select-slot", {
      state: {
        group,
        idNumber,
        branchId: Number(selectedBranchId),
        branchName: selectedBranch?.branchName ?? "",
        packageId: Number(selectedPackageId),
        packageName: selectedPackage?.packageName ?? "",
      },
    });
  };

  const handlePrev = () => {
    navigate(-1);
  };

  return (
    <form onSubmit={handleNext} className="sbp-form">
      <h2>步驟 2：選擇院區與健檢套餐</h2>
      <p>團體名稱：{group.name}</p>

      <div className="sbp-layout">
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
                <option key={String(b.branchId)} value={String(b.branchId)}>
                  {b.branchName}
                </option>
              ))}
            </select>
          </label>

          <p className="sbp-description">
            請先選擇欲前往的院區，下方會依院區顯示可施作的健檢套餐。
          </p>
        </div>

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

            {currentBranch && currentBranch.packages.length === 0 && (
              <p className="sbp-hint">此院區目前沒有可預約的健檢套餐。</p>
            )}

            {currentBranch &&
              currentBranch.packages.map((p) => {
                const active = Number(selectedPackageId) === Number(p.packageId);

                return (
                  <button
                    key={String(p.packageId)}
                    type="button"
                    className={[
                      "sbp-package-btn",
                      "sbp-package-btn--available",
                      active ? "sbp-package-btn--active" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    onClick={() => setSelectedPackageId(Number(p.packageId))}
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