import { useUnsavedChangesWarning } from '../hooks/useUnsavedChangesWarning';
import { useEffect, useState } from 'react';

type Branch = 'A院區' | 'B院區' | 'C院區' | 'D院區';
type PackageStatus = 'active' | 'inactive';

interface PackageItem {
  code: string; // A, B, C...
  name: string; // A套餐
  status: PackageStatus;
}

interface PackageSetting {
  id: number;
  code: string;
  name: string;
  branches: Branch[];
  status: PackageStatus;
}

const PackageBranchSettingPage: React.FC = () => {
  const [step, setStep] = useState<1 | 2>(1);
  const [packages, setPackages] = useState<PackageItem[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<string>('');
  const [branches, setBranches] = useState<Branch[]>([]);
  const [status, setStatus] = useState<PackageStatus>('active');

  // Start: 未儲存變更提醒（在 step=2 才算有未儲存資料）
  const isDirty = step === 2;
  useUnsavedChangesWarning(isDirty);
  // End

  // Step 1：進頁面時載入所有套餐
  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const res = await fetch('http://localhost:3000/packages');
        if (!res.ok) throw new Error('後端回傳錯誤');
        const data = await res.json();
        setPackages(data);

        if (data.length > 0) {
          setSelectedPackage(data[0].code);
        }
      } catch (err) {
        console.error('載入套餐列表失敗', err);
        alert('無法載入套餐列表，請確認後端是否啟動');
      }
    };

    fetchPackages();
  }, []);

  // Step 1 → Step 2：載入單一套餐設定
  const handleNext = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPackage) return;

    try {
      const res = await fetch(
        `http://localhost:3000/packages/${selectedPackage}/settings`
      );
      if (!res.ok) throw new Error('後端回傳錯誤');

      const data: PackageSetting = await res.json();
      setBranches(data.branches);
      setStatus(data.status);
      setStep(2);
    } catch (err) {
      console.error('載入套餐設定失敗', err);
      alert('無法載入套餐設定');
    }
  };

  // 表單 checkbox 切換院區
  const toggleBranch = (branch: Branch) => {
    setBranches((prev) =>
      prev.includes(branch)
        ? prev.filter((b) => b !== branch)
        : [...prev, branch]
    );
  };

  // Step 2：儲存更新
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch(
        `http://localhost:3000/packages/${selectedPackage}/settings`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            branches,
            status,
          }),
        }
      );

      if (!res.ok) throw new Error('後端回傳錯誤');

      const updated = await res.json();
      console.log('更新成功', updated);
      alert('儲存成功');

      setStep(1);
    } catch (err) {
      console.error('更新套餐設定失敗', err);
      alert('儲存失敗，請稍後再試');
    }
  };

  // Step 2 → Step 1
  const handleBack = () => {
    setStep(1);
  };

  return (
    <div className="page-container">
      <div className="page-card">
        <h2 className="page-title">指定套餐院區界面</h2>

        {/* Step 1：選套餐 */}
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
                  value={selectedPackage}
                  onChange={(e) => setSelectedPackage(e.target.value)}
                >
                  {packages.map((pkg) => (
                    <option key={pkg.code} value={pkg.code}>
                      {pkg.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-actions-center">
              <button type="submit" className="primary-button full-width-button">
                下一步
              </button>
            </div>
          </form>
        )}

        {/* Step 2：設定院區 */}
        {step === 2 && (
          <form className="page-form" onSubmit={handleSave}>
            <div className="form-row single">
              <div className="form-field">
                <div className="form-label">
                  套餐名稱：{packages.find((p) => p.code === selectedPackage)?.name}
                </div>
              </div>
            </div>

            <div className="form-row">
              {/* 勾選院區 */}
              <div className="form-field">
                <div className="form-label">施作院區：</div>
                <div className="checkbox-column">
                  {(['A院區', 'B院區', 'C院區', 'D院區'] as Branch[]).map(
                    (branch) => (
                      <label key={branch} className="checkbox-item">
                        <input
                          type="checkbox"
                          checked={branches.includes(branch)}
                          onChange={() => toggleBranch(branch)}
                        />
                        {branch}
                      </label>
                    )
                  )}
                </div>
              </div>

              {/* 套餐狀態 */}
              <div className="form-field">
                <span className="form-label">套餐狀態：</span>
                <div className="radio-group">
                  <label>
                    <input
                      type="radio"
                      value="active"
                      checked={status === 'active'}
                      onChange={() => setStatus('active')}
                    />
                    啟用
                  </label>

                  <label>
                    <input
                      type="radio"
                      value="inactive"
                      checked={status === 'inactive'}
                      onChange={() => setStatus('inactive')}
                    />
                    停用
                  </label>
                </div>
              </div>
            </div>

            {/* 按鈕區：上一步 + 儲存 */}
            <div className="form-actions-center gap">
              <button
                type="button"
                className="secondary-button"
                onClick={handleBack}
              >
                上一步
              </button>

              <button type="submit" className="primary-button">
                儲存
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default PackageBranchSettingPage;
