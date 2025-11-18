import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function GroupCodePage() {
  const [groupCode, setGroupCode] = useState('');
  const [employeeCode, setEmployeeCode] = useState('');
  const navigate = useNavigate();

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    // 之後這裡會呼叫後端驗證團體與員工
    navigate('/select-branch-package');
  };

  return (
    <form onSubmit={handleNext}>
      <h2>步驟 1：輸入團體代碼 / 員工代碼</h2>
      <div>
        <label>
          團體代碼：
          <input
            value={groupCode}
            onChange={(e) => setGroupCode(e.target.value)}
            required
          />
        </label>
      </div>
      <div>
        <label>
          員工代碼（或身分證）：
          <input
            value={employeeCode}
            onChange={(e) => setEmployeeCode(e.target.value)}
            required
          />
        </label>
      </div>
      <button type="submit">下一步</button>
    </form>
  );
}

export default GroupCodePage;