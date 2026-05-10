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
  const [packages, setPackages] = useState<PackageItem[]>([]);
  const [branches, setBranches] = useState<BranchItem[]>([]);

  const [loadingPage, setLoadingPage] = useState(true);
  const [loadingSetting, setLoadingSetting] = useState(false);
  const [saving, setSaving] = useState(false);

  const [selectedPackageId, setSelectedPackageId] = useState<number | "">("");
  const [selectedBranchIds, setSelectedBranchIds] = useState<number[]>([]);
  const [status, setStatus] = useState<PackageStatus>("active");
  const [initial, setInitial] = useState<InitialState>(null);
  const [savedMessage, setSavedMessage] = useState("");
  const [packageDropdownOpen, setPackageDropdownOpen] = useState(false);

  const isDirty =
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

        if (normalizedPackages.length > 0) {
          setSelectedPackageId(normalizedPackages[0].packageId);
        }
      } catch (error) {
        console.error("loadInitialData error:", error);
        alert("初始化資料失敗，請確認後端與資料庫是否正常");
      } finally {
        if (mounted) setLoadingPage(false);
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

  const selectedPackageLabel = selectedPackage
    ? `${selectedPackage.packageName}${selectedPackage.isDisable ? "（已停用）" : ""}`
    : "請選擇套餐";

  const loadPackageSetting = async (packageId: number) => {
    try {
      setLoadingSetting(true);
      setSavedMessage("");

      const data: any = await fetchPackageBranches(packageId);

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
    } catch (error) {
      console.error("loadPackageSetting error:", error);
      alert(
        error instanceof Error
          ? `讀取套餐設定失敗：${error.message}`
          : "讀取套餐設定失敗",
      );
    } finally {
      setLoadingSetting(false);
    }
  };

  useEffect(() => {
    if (selectedPackageId === "" || loadingPage) return;
    loadPackageSetting(Number(selectedPackageId));
  }, [selectedPackageId, loadingPage]);

  const handleSelectPackage = (packageId: number) => {
    setSelectedPackageId(packageId);
    setPackageDropdownOpen(false);
    setSavedMessage("");
  };

  const toggleBranch = (branchId: number) => {
    setSavedMessage("");

    setSelectedBranchIds((prev) =>
      prev.includes(branchId)
        ? prev.filter((id) => id !== branchId)
        : [...prev, branchId],
    );
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (selectedPackageId === "") {
      alert("請先選擇套餐");
      return;
    }

    try {
      setSaving(true);
      setSavedMessage("");

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

      setSavedMessage("套餐設定已同步更新到預約系統");
    } catch (error) {
      console.error("handleSave error:", error);
      alert(error instanceof Error ? `儲存失敗：${error.message}` : "儲存失敗");
    } finally {
      setSaving(false);
    }
  };

  if (loadingPage) {
    return (
      <div className="page-container business-scope package-branch-page">
        <div className="page-card">
          <p className="form-hint">資料載入中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container business-scope package-branch-page">
      <div className="page-card">
        <form className="package-setting-form" onSubmit={handleSave}>
          <section className="package-setting-section package-select-section">
            <label className="package-setting-label">目前套餐</label>

            <div className="package-custom-select-wrap">
              <button
                type="button"
                className={`package-custom-select ${
                  packageDropdownOpen ? "open" : ""
                }`}
                onClick={() => setPackageDropdownOpen((prev) => !prev)}
                disabled={loadingSetting || saving || packages.length === 0}
              >
                <span>{selectedPackageLabel}</span>
                <span className="package-select-arrow">
                  {packageDropdownOpen ? "⌃" : "⌄"}
                </span>
              </button>

              {packageDropdownOpen && (
                <div className="package-custom-menu">
                  {packages.map((pkg) => {
                    const active = selectedPackageId === pkg.packageId;

                    return (
                      <button
                        key={pkg.packageId}
                        type="button"
                        className={active ? "active" : ""}
                        onClick={() => handleSelectPackage(pkg.packageId)}
                      >
                        {pkg.packageName}
                        {pkg.isDisable ? "（已停用）" : ""}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {loadingSetting && (
              <p className="form-hint">正在讀取套餐施作院區設定...</p>
            )}
          </section>

          <section className="package-setting-section">
            <div className="group-list-section-title">請選擇可施作院區</div>

            <div className="package-branch-grid">
              {branches.map((branch) => (
                <label key={branch.branchId} className="package-branch-card">
                  <input
                    type="checkbox"
                    checked={selectedBranchIds.includes(branch.branchId)}
                    onChange={() => toggleBranch(branch.branchId)}
                    disabled={loadingSetting || saving}
                  />
                  <span>{branch.branchName}</span>
                </label>
              ))}
            </div>
          </section>

          <section className="package-setting-section">
            <label className="package-setting-label">套餐狀態</label>

            <div className="package-status-row">
              <label>
                <input
                  type="radio"
                  value="active"
                  checked={status === "active"}
                  onChange={() => {
                    setStatus("active");
                    setSavedMessage("");
                  }}
                  disabled={loadingSetting || saving}
                />
                啟用
              </label>

              <label>
                <input
                  type="radio"
                  value="inactive"
                  checked={status === "inactive"}
                  onChange={() => {
                    setStatus("inactive");
                    setSavedMessage("");
                  }}
                  disabled={loadingSetting || saving}
                />
                停用
              </label>
            </div>
          </section>

          <div className="package-setting-actions">
            <button
              type="submit"
              className="primary-button"
              disabled={saving || loadingSetting || selectedPackageId === ""}
            >
              {saving ? "儲存中..." : "儲存"}
            </button>

            {savedMessage && <p className="package-saved-message">{savedMessage}</p>}

            {!savedMessage && isDirty && (
              <p className="package-unsaved-message">目前有尚未儲存的變更</p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default PackageBranchSettingPage;