import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const mockBranches = ['台北院區', '新莊院區'];
const mockPackages = ['一般健檢', '高階健檢', '心血管套餐'];

function SelectBranchPackagePage() {
  const [branch, setBranch] = useState('');
  const [pkg, setPkg] = useState('');
  const navigate = useNavigate();

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/select-slot');
  };

  return (
    <form onSubmit={handleNext}>
      <h2>步驟 2：選擇院區與健檢套餐</h2>

      <div>
        <label>
          院區：
          <select value={branch} onChange={(e) => setBranch(e.target.value)} required>
            <option value="">請選擇院區</option>
            {mockBranches.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        </label>
      </div>

      <div>
        <label>
          健檢套餐：
          <select value={pkg} onChange={(e) => setPkg(e.target.value)} required>
            <option value="">請選擇套餐</option>
            {mockPackages.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </label>
      </div>

      <button type="submit">下一步</button>
    </form>
  );
}

export default SelectBranchPackagePage;