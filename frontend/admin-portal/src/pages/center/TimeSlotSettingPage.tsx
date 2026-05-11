import React, { useEffect, useState } from "react";

const API_ENDPOINT = "http://localhost:3000/api/timeslots";
const BRANCH_API_ENDPOINT = "http://localhost:3000/api/branches";
const PACKAGE_API_ENDPOINT = "http://localhost:3000/api/packages";
const BRANCH_PACKAGE_API_ENDPOINT ="http://localhost:3000/api/branches";

function TimeSlotSettingPage() {
  const [branchId, setBranchId] = useState("");
  const [packageId, setPackageId] = useState("");
  const [availablePackageIds, setAvailablePackageIds] = useState<number[]>([]);    //目前選到的院區可以設定哪些套餐
  const [isLoadingBranchPackages, setIsLoadingBranchPackages] = useState(false);   //正在讀取的這個院區的套餐資料
  const [branches, setBranches] = useState<
    { branchId: number; branchName: string }[]
  >([]);

  const [packages, setPackages] = useState<
    { packageId: number; packageName: string; isDisable?: boolean }[]
  >([]);

  const [date, setDate] = useState("");
  const [timeSlot, setTimeSlot] = useState("");
  const [quota, setQuota] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isInitLoading, setIsInitLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadInitData = async () => {
      try {
        setIsInitLoading(true);

        const [branchRes, packageRes] = await Promise.all([
          fetch(BRANCH_API_ENDPOINT),
          fetch(PACKAGE_API_ENDPOINT),
        ]);

        if (!branchRes.ok) {
          throw new Error(`院區資料載入失敗 (${branchRes.status})`);
        }
        if (!packageRes.ok) {
          throw new Error(`套餐資料載入失敗 (${packageRes.status})`);
        }

        const branchData = await branchRes.json();
        const packageData = await packageRes.json();

        setBranches(branchData);
        setPackages(packageData.filter((item: any) => !item.isDisable));
      } catch (err) {
        setError(err instanceof Error ? err.message : "初始化資料載入失敗");
      } finally {
        setIsInitLoading(false);
      }
    };

    loadInitData();
  }, []);

  useEffect(() => {
  if (!branchId) {
    setAvailablePackageIds([]);
    setPackageId("");
    return;
  }

  const loadAvailablePackages = async () => {
    try {
      setIsLoadingBranchPackages(true);
      setPackageId("");
      setAvailablePackageIds([]);

      const response = await fetch(
        `${BRANCH_PACKAGE_API_ENDPOINT}/${branchId}/packages`,
      );

      if (!response.ok) {
        throw new Error(`院區可設定套餐載入失敗 (${response.status})`);
      }

      const data = await response.json();

      const ids = (Array.isArray(data) ? data : data?.data ?? [])
        .filter((item: any) => {
          const status =
            item.branchPackageStatus ??
            item.status ??
            item.branch_package_status ??
            "open";

          return status === "open";
        })
        .map((item: any) => Number(item.packageId ?? item.package_id))
        .filter((id: number) => Number.isInteger(id) && id > 0);

      setAvailablePackageIds(ids);
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : "院區可設定套餐載入失敗");
      setAvailablePackageIds([]);
    } finally {
      setIsLoadingBranchPackages(false);
    }
  };

    loadAvailablePackages();
  }, [branchId]);

  const handleClear = () => {
    setBranchId("");
    setPackageId("");
    setAvailablePackageIds([]);
    setDate("");
    setTimeSlot("");
    setQuota("");
    setError(null);
  };

  const todayText = new Date().toISOString().slice(0, 10);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!branchId || !packageId || !date || !timeSlot || !quota) {
      alert("請完整填寫資料");
      return;
    }

    if (!availablePackageIds.includes(Number(packageId))) {
      alert("此院區不可設定此套餐，請重新選擇套餐");
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const selectedDate = new Date(`${date}T00:00:00`);

    if (selectedDate < today) {
      alert("不能設定已經過去的日期");
      return;
    }

    const payload = {
      branchId: Number(branchId),
      packageId: Number(packageId),
      date,
      timeSlot,
      quota: parseInt(quota, 10),
    };

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(API_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);

      const message =
        errorData?.message ||
        `資料設定失敗 (${response.status})`;

      throw new Error(Array.isArray(message) ? message.join("、") : message);
    }

      alert("時段名額已成功設定！");
      handleClear();
    } catch (err) {
      alert(err instanceof Error ? err.message : "發生未知錯誤");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="page-container healthcenter-scope healthcenter-form-page">
      <div className="page-card">
        <h2 className="page-title">設定每日時段名額</h2>

        {isInitLoading ? (
          <p className="form-hint">資料載入中...</p>
        ) : (
          <form className="page-form" onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-field">
                <label className="form-label" htmlFor="branchId">
                  院區：
                </label>
                <select
                  id="branchId"
                  value={branchId}
                  onChange={(e) => {
                    setBranchId(e.target.value);
                    setPackageId("");
                  }}
                  className="form-select"
                  required
                >
                  <option value="">請選擇院區</option>
                  {branches.map((branch) => (
                    <option key={branch.branchId} value={branch.branchId}>
                      {branch.branchName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-field">
                <label className="form-label" htmlFor="packageId">
                  套餐：
                </label>
                <select
                  id="packageId"
                  value={packageId}
                  onChange={(e) => setPackageId(e.target.value)}
                  className="form-select"
                  required
                  disabled={!branchId || isLoadingBranchPackages}
                >
                  <option value="">
                    {!branchId
                      ? "請先選擇院區"
                      : isLoadingBranchPackages
                        ? "套餐載入中..."
                        : "請選擇套餐"}
                  </option>

                  {packages.map((pkg) => {
                    const canSelect = availablePackageIds.includes(Number(pkg.packageId));

                    return (
                      <option
                        key={pkg.packageId}
                        value={pkg.packageId}
                        disabled={!canSelect}
                      >
                        {pkg.packageName}
                        {!canSelect ? "（此院區不可設定）" : ""}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>

          <div className="form-row">
            <div className="form-field">
              <label className="form-label" htmlFor="date">
                日期：
              </label>
              <input
                id="date"
                type="date"
                value={date}
                min={todayText}
                onChange={(e) => setDate(e.target.value)}
                className="form-input"
                required
              />
            </div>

            <div className="form-field">
              <label className="form-label" htmlFor="quota">
                名額（人數）：
              </label>
              <input
                id="quota"
                type="number"
                min="1"
                value={quota}
                onChange={(e) => setQuota(e.target.value)}
                className="form-input"
                required
              />
            </div>
          </div>

          <div className="form-row single">
            <div className="form-field">
              <label className="form-label">時段：</label>
              <div className="radio-group radio-group-column">
                {[
                  "08:00-10:00",
                  "10:00-12:00",
                  "13:00-15:00",
                  "15:00-17:00",
                ].map((slot) => (
                  <label key={slot}>
                    <input
                      type="radio"
                      name="time"
                      value={slot}
                      onChange={(e) => setTimeSlot(e.target.value)}
                      checked={timeSlot === slot}
                      required
                    />
                    {slot}
                  </label>
                ))}
              </div>
            </div>
          </div>

            <div className="form-actions-center gap">
              <button type="submit" className="primary-button" disabled={isLoading}>
                {isLoading ? "提交中..." : "設定"}
              </button>
              <button
                type="button"
                onClick={handleClear}
                className="secondary-button"
                disabled={isLoading}
              >
                清除表單
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default TimeSlotSettingPage;