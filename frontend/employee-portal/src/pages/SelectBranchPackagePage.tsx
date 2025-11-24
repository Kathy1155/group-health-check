import { useState } from "react";
import { useNavigate } from "react-router-dom";

// 八個院區
const branches = [
  "忠孝",
  "仁愛",
  "和平婦幼",
  "中興",
  "陽明",
  "松德",
  "林森中醫",
];

// 套餐對應的院區
const packageMapping: Record<string, string[]> = {
  A: ["忠孝", "仁愛", "和平婦幼"],
  B: ["忠孝", "仁愛", "中興", "陽明"],
  C: ["和平婦幼", "松德", "林森中醫", "仁愛"],
  D: ["仁愛", "中興", "陽明", "松德", "林森中醫"],
  E: ["忠孝", "和平婦幼", "中興", "林森中醫"],
};

const packages = ["A", "B", "C", "D", "E"];

function SelectBranchPackagePage() {
  const [branch, setBranch] = useState("");
  const [pkg, setPkg] = useState("");
  const navigate = useNavigate();

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (!branch || !pkg) return;
    navigate("/select-slot");
  };

  const handlePrev = () => {
    // 回到步驟一（團體代碼）
    navigate("/");
  };

  const isPackageAvailable = (p: string, b: string) =>
    !!b && packageMapping[p].includes(b);

  return (
    <form onSubmit={handleNext} className="sbp-form">
      <h2>步驟 2：選擇院區與健檢套餐</h2>

      <div className="sbp-layout">
        {/* 左邊：院區選擇 */}
        <div className="sbp-left">
          <label className="sbp-label">
            院區：
            <select
              value={branch}
              onChange={(e) => {
                setBranch(e.target.value);
                setPkg(""); // 換院區時清空套餐
              }}
              className="sbp-select"
              required
            >
              <option value="">請選擇院區</option>
              {branches.map((b) => (
                <option key={b} value={b}>
                  {b}
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
              {branch ? `目前院區：${branch}` : "尚未選擇院區"}
            </span>
          </div>

          <div className="sbp-packages">
            {!branch && (
              <p className="sbp-hint">請先在左側選擇院區。</p>
            )}

            {packages.map((p) => {
              const available = isPackageAvailable(p, branch);
              const active = pkg === p;

              return (
                <button
                  key={p}
                  type="button"
                  disabled={!available}
                  className={[
                    "sbp-package-btn",
                    available ? "sbp-package-btn--available" : "sbp-package-btn--disabled",
                    active ? "sbp-package-btn--active" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  onClick={() => available && setPkg(p)}
                >
                  <div className="sbp-package-main">{p} 套餐</div>
                  <div className="sbp-package-sub">
                    {available ? "" : "院區未提供此套餐"}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

    <div className="form-footer">
      <button type="button" className="btn btn-secondary" onClick={handlePrev}>
        上一步
      </button>
      <button type="submit" className="btn btn-primary" disabled={!branch || !pkg}>
        下一步
      </button>
    </div>


    </form>
  );
}

export default SelectBranchPackagePage;