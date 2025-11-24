import { Routes, Route, useLocation } from 'react-router-dom';
import GroupCodePage from './pages/GroupCodePage';
import SelectBranchPackagePage from './pages/SelectBranchPackagePage';
import SelectTimeSlotPage from './pages/SelectTimeSlotPage';
import FillProfilePage from './pages/FillProfilePage';
import ReservationDonePage from './pages/ReservationDonePage';

function App() {
  const location = useLocation();

  // 定義每一個「表單步驟」對應的路由與標題
  const steps = [
    { path: '/', label: '團體代碼' },
    { path: '/select-branch-package', label: '選院區與套餐' },
    { path: '/select-slot', label: '選日期與時段' },
    { path: '/fill-profile', label: '填寫資料與病史' },
  ];

  // 根據目前所在的路由計算現在是第幾步
  let currentStepIndex = steps.findIndex(
    (step) => step.path === location.pathname
  );

  // 如果在 /done 頁面，一樣視為最後一步完成
  if (location.pathname === '/done') {
    currentStepIndex = steps.length - 1;
  }

  // 找不到就當成第一步
  if (currentStepIndex < 0) {
    currentStepIndex = 0;
  }

  // 進度條百分比（0% ~ 100%）
  const totalSteps = steps.length;
  const progressPercent =
    location.pathname === '/done'
      ? 100
      : (currentStepIndex / (totalSteps - 1)) * 100;

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '1rem' }}>
      <header style={{ marginBottom: '1rem' }}>
        <h1>線上預約</h1>

        {/* 進度條區塊 */}
        <div>
          {/* 上面一條真正的進度條 */}
          <div
            style={{
              height: 8,
              borderRadius: 4,
              backgroundColor: '#eee',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${progressPercent}%`,
                height: '100%',
                backgroundColor: '#4caf50',
                transition: 'width 0.3s ease',
              }}
            />
          </div>

          {/* 下面是每個步驟的文字標籤 */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginTop: 8,
              fontSize: '0.85rem',
            }}
          >
            {steps.map((step, index) => {
              const isCurrent = index === currentStepIndex;
              const isDone = index < currentStepIndex;
              const color = isCurrent
                ? '#4caf50'
                : isDone
                ? '#333'
                : '#888';

              return (
                <span
                  key={step.path}
                  style={{
                    color,
                    fontWeight: isCurrent ? 600 : 400,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {index + 1}. {step.label}
                </span>
              );
            })}
          </div>
        </div>
      </header>

      <Routes>
        <Route path="/" element={<GroupCodePage />} />
        <Route
          path="/select-branch-package"
          element={<SelectBranchPackagePage />}
        />
        <Route path="/select-slot" element={<SelectTimeSlotPage />} />
        <Route path="/fill-profile" element={<FillProfilePage />} />
        <Route path="/done" element={<ReservationDonePage />} />
      </Routes>
    </div>
  );
}

export default App;