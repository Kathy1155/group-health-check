import React, { useEffect, useMemo, useState } from "react";
import { useUnsavedChangesWarning } from "../../hooks/useUnsavedChangesWarning";
import {
  fetchBranches,
  fetchPackageBranches,
  fetchPackages,
  savePackageBranches,
} from "../../api/packageBranchApi";

type PackageStatus = "active" | "inactive";

type PackageItem = {
  packageId: number;
  packageCode: string;
  packageName: string;
  isDisable: boolean;
};

type BranchItem = {
  branchId: number;
  branchName: string;
};

type InitialState = {
  selectedBranchIds: number[];
  status: PackageStatus;
} | null;

const PackageBranchSettingPage: React.FC = () => {
  const [step, setStep] = useState<1 | 2>(1);

  const [packages, setPackages] = useState<PackageItem[]>([]);
  const [branches, setBranches] = useState<BranchItem[]>([]);

  const [loadingPage, setLoadingPage] = useState(true);
  const [loadingSetting, setLoadingSetting] = useState(false);
  const [saving, setSaving] = useState(false);

  const [selectedPackageId, setSelectedPackageId] = useState<number | "">("");
  const [selectedBranchIds, setSelectedBranchIds] = useState<number[]>([]);
  const [status, setStatus] = useState<PackageStatus>("active");
  const [initial, setInitial] = useState<InitialState>(null);

  const isDirty =
    step === 2 &&
    initial !== null &&
    (initial.status !== status ||
      initial.selectedBranchIds.length !== selectedBranchIds.length ||
      initial.selectedBranchIds.some((id) => !selectedBranchIds.includes(id)));

  useUnsavedChangesWarning(isDirty);

  useEffect(() => {
    let mounted = true;

    const loadInitialData = async () => {
      try {
        setLoadingPage(true);

        const [packageData, branchData] = await Promise.all([
          fetchPackages(),
          fetchBranches(),
        ]);

        if (!mounted) return;

        const normalizedPackages: PackageItem[] = (packageData ?? []).map(
          (item: any) => ({
            packageId: Number(item.packageId),
            packageCode: String(item.packageCode ?? ""),
            packageName: String(item.packageName ?? ""),
            isDisable: Boolean(item.isDisable),
          }),
        );

        const normalizedBranches: BranchItem[] = (branchData ?? []).map(
          (item: any) => ({
            branchId: Number(item.branchId),
            branchName: String(item.branchName ?? ""),
          }),
        );

        setPackages(normalizedPackages);
        setBranches(normalizedBranches);

        // 預設選第一個套餐（若有資料）
        if (normalizedPackages.length > 0) {
          setSelectedPackageId(normalizedPackages[0].packageId);
        }
      } catch (error) {
        console.error("loadInitialData error:", error);
        alert("初始化資料失敗，請確認後端與資料庫是否正常");
      } finally {
        if (mounted) {
          setLoadingPage(false);
        }
      }
    };

    loadInitialData();

    return () => {
      mounted = false;
    };
  }, []);

  const selectedPackage = useMemo(() => {
    if (selectedPackageId === "") return undefined;
    return packages.find((item) => item.packageId === Number(selectedPackageId));
  }, [packages, selectedPackageId]);

  const toggleBranch = (branchId: number) => {
    setSelectedBranchIds((prev) =>
      prev.includes(branchId)
        ? prev.filter((id) => id !== branchId)
        : [...prev, branchId],
    );
  };

  const handleNext = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (selectedPackageId === "") {
      alert("請先選擇套餐");
      return;
    }

    try {
      setLoadingSetting(true);

      const data: any = await fetchPackageBranches(Number(selectedPackageId));

      const normalizedSelectedBranchIds = (data?.selectedBranchIds ?? []).map(
        (id: any) => Number(id),
      ) as number[];

      const nextStatus: PackageStatus =
        data?.status === "inactive" ? "inactive" : "active";

      setSelectedBranchIds(normalizedSelectedBranchIds);
      setStatus(nextStatus);
      setInitial({
        selectedBranchIds: normalizedSelectedBranchIds,
        status: nextStatus,
      });

      setStep(2);
    } catch (error) {
      console.error("handleNext error:", error);
      alert(
        error instanceof Error
          ? `讀取套餐設定失敗：${error.message}`
          : "讀取套餐設定失敗",
      );
    } finally {
      setLoadingSetting(false);
    }
  };

  const handleBack = () => {
    setStep(1);
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (selectedPackageId === "") {
      alert("請先選擇套餐");
      return;
    }

    try {
      setSaving(true);

      const result: any = await savePackageBranches(Number(selectedPackageId), {
        selectedBranchIds,
        status,
      });

      const normalizedSelectedBranchIds = (result?.selectedBranchIds ?? []).map(
        (id: any) => Number(id),
      ) as number[];

      const nextStatus: PackageStatus =
        result?.status === "inactive" ? "inactive" : "active";

      setSelectedBranchIds(normalizedSelectedBranchIds);
      setStatus(nextStatus);
      setInitial({
        selectedBranchIds: normalizedSelectedBranchIds,
        status: nextStatus,
      });

      alert("儲存成功");
    } catch (error) {
      console.error("handleSave error:", error);
      alert(
        error instanceof Error ? `儲存失敗：${error.message}` : "儲存失敗",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loadingPage) {
    return (
      <div className="page-container">
        <div className="page-card">
          <h2 className="page-title">指定套餐院區界面</h2>
          <p>資料載入中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-card">
        <h2 className="page-title">指定套餐院區界面</h2>

        {step === 1 && (
          <form className="page-form" onSubmit={handleNext}>
            <div className="form-row single">
              <div className="form-field form-field-narrow">
                <label className="form-label" htmlFor="packageSelect">
                  請選擇欲設定之套餐：
                </label>

                <select
                  id="packageSelect"
                  className="form-select"
                  value={selectedPackageId}
                  onChange={(e) =>
                    setSelectedPackageId(
                      e.target.value ? Number(e.target.value) : "",
                    )
                  }
                >
                  {packages.length === 0 && <option value="">目前沒有套餐資料</option>}

                  {packages.map((pkg) => (
                    <option key={pkg.packageId} value={pkg.packageId}>
                      {pkg.packageName}
                      {pkg.isDisable ? "（已停用）" : ""}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-actions-center">
              <button
                type="submit"
                className="primary-button full-width-button"
                disabled={loadingSetting || selectedPackageId === ""}
              >
                {loadingSetting ? "讀取中..." : "下一步"}
              </button>
            </div>
          </form>
        )}

        {step === 2 && (
          <form className="page-form" onSubmit={handleSave}>
            <div className="form-row single">
              <div className="form-field">
                <div className="form-label">目前套餐</div>
                <div className="readonly-box">
                  {selectedPackage?.packageName ?? "未選擇套餐"}
                </div>
              </div>
            </div>

            <div className="form-row single">
              <div className="form-field">
                <span className="form-label">套餐狀態</span>
                <div className="radio-group">
                  <label>
                    <input
                      type="radio"
                      value="active"
                      checked={status === "active"}
                      onChange={() => setStatus("active")}
                    />
                    啟用
                  </label>

                  <label>
                    <input
                      type="radio"
                      value="inactive"
                      checked={status === "inactive"}
                      onChange={() => setStatus("inactive")}
                    />
                    停用
                  </label>
                </div>
              </div>
            </div>

            <div className="form-row single">
              <div className="form-field">
                <div className="form-label">請選擇可施作院區</div>
                <div className="branch-grid">
                  {branches.map((branch) => (
                    <label key={branch.branchId} className="branch-checkbox">
                      <input
                        type="checkbox"
                        checked={selectedBranchIds.includes(branch.branchId)}
                        onChange={() => toggleBranch(branch.branchId)}
                      />
                      <span>{branch.branchName}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <p className="form-hint">
              {isDirty ? "目前有尚未儲存的變更" : "目前設定已同步"}
            </p>

            <div className="form-actions-center gap">
              <button
                type="button"
                className="secondary-button"
                onClick={handleBack}
                disabled={saving}
              >
                上一步
              </button>

              <button type="submit" className="primary-button" disabled={saving}>
                {saving ? "儲存中..." : "儲存"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default PackageBranchSettingPage;