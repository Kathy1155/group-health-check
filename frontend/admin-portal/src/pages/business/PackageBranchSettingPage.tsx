import { useUnsavedChangesWarning } from '../../hooks/useUnsavedChangesWarning';
import { useState } from 'react';

type Branch = '仁愛院區' | '中興院區' | '和平院區' | '忠孝院區';
type PackageStatus = 'active' | 'inactive';

interface PackageSetting {
  branches: Branch[];
  status: PackageStatus;
}

// 套餐顯示文字 → 後端代碼（固定）
const PACKAGE_CODES: Record<string, string> = {
  'A套餐': 'A',
  'B套餐': 'B',
  'C套餐': 'C',
  'D套餐': 'D',
  'E套餐': 'E',
};

const ALL_PACKAGES = Object.keys(PACKAGE_CODES);
const ALL_BRANCHES: Branch[] = ['仁愛院區', '中興院區', '和平院區', '忠孝院區'];

const PackageBranchSettingPage: React.FC = () => {
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedPackage, setSelectedPackage] = useState<string>('A套餐');
  const [branches, setBranches] = useState<Branch[]>([]);
  const [status, setStatus] = useState<PackageStatus>('active');
  const [initial, setInitial] = useState<PackageSetting | null>(null);

  const isDirty =
    step === 2 &&
    !!initial &&
    (initial.status !== status ||
      initial.branches.length !== branches.length ||
      initial.branches.some((b) => !branches.includes(b)));

  useUnsavedChangesWarning(isDirty);

  const handleNext = async (e: React.FormEvent) => {
  e.preventDefault();

  const code = PACKAGE_CODES[selectedPackage];
  if (!code) {
    alert('套餐代碼不存在');
    return;
  }

  try {
    const res = await fetch(`/api/packages/${code}/settings`);

    if (res.ok) {
      const data = await res.json();
      setBranches(data.branches ?? []);
      setStatus(data.status ?? 'active');
      setInitial({
        branches: data.branches ?? [],
        status: data.status ?? 'active',
      });
    } else if (res.status === 404) {
      // 從沒設定過的套餐 → 用預設值
      setBranches([]);
      setStatus('active');
      setInitial({ branches: [], status: 'active' });
    } else {
      const text = await res.text();
      console.error('讀取設定失敗', res.status, text);
      alert('讀取套餐設定失敗');
      return;
    }

    setStep(2);
  } catch (err) {
    console.error('連線失敗', err);
    alert('無法連線到後端，請確認後端是否啟動');
  }
};


  const toggleBranch = (branch: Branch) => {
    setBranches((prev) =>
      prev.includes(branch)
        ? prev.filter((b) => b !== branch)
        : [...prev, branch],
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    const code = PACKAGE_CODES[selectedPackage];
    if (!code) {
      alert('套餐代碼不存在');
      return;
    }

    const payload = {
      branches,
      status,
    };

    try {
      const res = await fetch(`/api/packages/${code}/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text();
        console.error('儲存失敗：', res.status, text);
        alert('儲存失敗，請稍後再試');
        return;
      }

      alert(`套餐 ${selectedPackage} 設定儲存成功`);
      setInitial({ branches, status });

      setStep(1);
    } catch (err) {
      console.error('連線失敗：', err);
      alert('無法連線到後端，請確認後端是否啟動');
    }
  };

  const handleBack = () => {
    setStep(1);
  };

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
                  value={selectedPackage}
                  onChange={(e) => setSelectedPackage(e.target.value)}
                >
                  {ALL_PACKAGES.map((pkg) => (
                    <option key={pkg} value={pkg}>
                      {pkg}
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

        {step === 2 && (
          <form className="page-form" onSubmit={handleSave}>
            <div className="form-row single">
              <div className="form-field">
                <div className="form-label">
                  套餐名稱：{selectedPackage}
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="form-field">
                <div className="form-label">施作院區：</div>
                <div className="checkbox-column">
                  {ALL_BRANCHES.map((branch) => (
                    <label key={branch} className="checkbox-item">
                      <input
                        type="checkbox"
                        checked={branches.includes(branch)}
                        onChange={() => toggleBranch(branch)}
                      />
                      {branch}
                    </label>
                  ))}
                </div>
              </div>

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
