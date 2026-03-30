import React, { useEffect, useState } from "react";

const API_ENDPOINT = "http://localhost:3000/api/timeslots";
const BRANCH_API_ENDPOINT = "http://localhost:3000/api/branches";
const PACKAGE_API_ENDPOINT = "http://localhost:3000/api/packages";

function TimeSlotSettingPage() {
  const [branchId, setBranchId] = useState("");
  const [packageId, setPackageId] = useState("");

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

  const handleClear = () => {
    setBranchId("");
    setPackageId("");
    setDate("");
    setTimeSlot("");
    setQuota("");
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!branchId || !packageId || !date || !timeSlot || !quota) {
      alert("請完整填寫資料");
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
        const text = await response.text();
        throw new Error(text || `資料設定失敗 (${response.status})`);
      }

      alert("時段名額已成功設定！");
      handleClear();
    } catch (err) {
      setError(err instanceof Error ? err.message : "發生未知錯誤");
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
                  onChange={(e) => setBranchId(e.target.value)}
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
                >
                  <option value="">請選擇套餐</option>
                  {packages.map((pkg) => (
                    <option key={pkg.packageId} value={pkg.packageId}>
                      {pkg.packageName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row single">
              <div className="form-field">
                <label className="form-label" htmlFor="date">
                  日期：
                </label>
                <input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="form-input"
                  required
                />
              </div>
            </div>

            <div className="form-row">
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

              <div className="form-field form-field-narrow">
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

        {error && <p className="form-hint">錯誤：{error}</p>}
      </div>
    </div>
  );
}

export default TimeSlotSettingPage;