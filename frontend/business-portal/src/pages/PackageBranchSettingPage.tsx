import { useState } from 'react';

type Branch = 'A院區' | 'B院區' | 'C院區' | 'D院區';
type PackageStatus = 'active' | 'inactive';

interface PackageSetting {
  branches: Branch[];
  status: PackageStatus;
}

// 假資料：之後可改為從後端取得
const mockPackageSettings: Record<string, PackageSetting> = {
  A套餐: { branches: ['A院區', 'C院區'], status: 'active' },
  B套餐: { branches: ['B院區'], status: 'inactive' },
  C套餐: { branches: [], status: 'active' },
};

const PackageBranchSettingPage: React.FC = () => {
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedPackage, setSelectedPackage] = useState<string>('A套餐');
  const [branches, setBranches] = useState<Branch[]>([]);
  const [status, setStatus] = useState<PackageStatus>('active');

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();

    const current = mockPackageSettings[selectedPackage];
    setBranches(current?.branches ?? []);
    setStatus(current?.status ?? 'active');
    setStep(2);
  };

  const toggleBranch = (branch: Branch) => {
    setBranches((prev) =>
      prev.includes(branch)
        ? prev.filter((b) => b !== branch)
        : [...prev, branch],
    );
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    const payload: PackageSetting = {
      branches,
      status,
    };

    console.log('暫存送出的資料（指定套餐院區）', {
      packageName: selectedPackage,
      ...payload,
    });

    alert('儲存成功（目前為前端假資料）');
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
                  <option value="A套餐">A套餐</option>
                  <option value="B套餐">B套餐</option>
                  <option value="C套餐">C套餐</option>
                </select>
              </div>
            </div>

            {/* 下一步置中，寬度與欄位一致 */}
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
                    ),
                  )}
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

            {/* 下方有「上一步」＋「儲存」 */}
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
