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
      <div className="reservation-page">
        <div className="reservation-page-header">
          <span className="page-badge">流程中斷</span>
          <h1>預約流程中斷</h1>
          <p>缺少必要資料，請從首頁重新開始預約。</p>
        </div>

        <div className="reservation-card">
          <div className="reservation-card-header">
            <h2>無法繼續預約</h2>
            <p>系統沒有取得團體與身分驗證資料。</p>
          </div>

          <div className="form-footer">
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => navigate("/")}
            >
              回首頁
            </button>
          </div>
        </div>
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

  if (loading) {
    return (
      <div className="reservation-page">
        <div className="reservation-card reservation-status-card">
          載入院區與套餐資料中...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="reservation-page">
        <div className="reservation-card reservation-status-card form-error">
          {error}
        </div>
      </div>
    );
  }

  if (!options) {
    return (
      <div className="reservation-page">
        <div className="reservation-card reservation-status-card">
          沒有資料
        </div>
      </div>
    );
  }

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
    <div className="reservation-page">
      <div className="reservation-page-header">
        <span className="page-badge">Step 2</span>
        <h1>選擇院區與健檢套餐</h1>
        <p>
          請選擇欲前往的健檢院區，系統會依照團體設定，
          <br />
          顯示該院區可預約的健檢套餐。
        </p>
      </div>

      <form onSubmit={handleNext} className="reservation-card branch-card">
        <div className="reservation-card-header">
          <h2>預約項目選擇</h2>
          <p>團體名稱：{group.name}</p>
        </div>

        <div className="branch-package-content">
          <div className="branch-select-panel">
            <div className="form-row">
              <label htmlFor="branch">院區</label>
              <select
                id="branch"
                value={selectedBranchId}
                onChange={(e) => {
                  const value = e.target.value;
                  setSelectedBranchId(value ? Number(value) : "");
                  setSelectedPackageId(null);
                }}
                required
              >
                <option value="">請選擇院區</option>
                {branches.map((b) => (
                  <option key={String(b.branchId)} value={String(b.branchId)}>
                    {b.branchName}
                  </option>
                ))}
              </select>
            </div>

            <div className="reservation-tip branch-tip">
              請先選擇欲前往的院區，右方會依院區顯示可施作的健檢套餐。
            </div>
          </div>

          <div className="package-panel">
            <div className="package-panel-header">
              <div>
                <h3>可選健檢套餐</h3>
                <p>
                  {currentBranch
                    ? `目前院區：${currentBranch.branchName}`
                    : "尚未選擇院區"}
                </p>
              </div>
            </div>

            <div className="package-list">
              {!currentBranch && (
                <p className="package-empty">請先在上方選擇院區。</p>
              )}

              {currentBranch && currentBranch.packages.length === 0 && (
                <p className="package-empty">
                  此院區目前沒有可預約的健檢套餐。
                </p>
              )}

              {currentBranch &&
                currentBranch.packages.map((p) => {
                  const active =
                    Number(selectedPackageId) === Number(p.packageId);

                  return (
                    <button
                      key={String(p.packageId)}
                      type="button"
                      className={
                        active
                          ? "package-option package-option-active"
                          : "package-option"
                      }
                      onClick={() => setSelectedPackageId(Number(p.packageId))}
                    >
                      <span>{p.packageName}</span>
                      <small>{active ? "已選擇" : "點選此套餐"}</small>
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
    </div>
  );
}

export default SelectBranchPackagePage;