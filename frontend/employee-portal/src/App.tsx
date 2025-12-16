import { Routes, Route, useLocation } from "react-router-dom";
import HomePage from "./pages/HomePage";
import GroupCodePage from "./pages/GroupCodePage";
import SelectBranchPackagePage from "./pages/SelectBranchPackagePage";
import SelectTimeSlotPage from "./pages/SelectTimeSlotPage";
import FillProfilePage from "./pages/FillProfilePage";
import ReservationDonePage from "./pages/ReservationDonePage";
import ReservationLookupPage from "./pages/ReservationLookupPage";  // ← 把這行加回來
import "./App.css";
import OtpVerifyPage from "./pages/OtpVerifyPage";


function App() {
  const location = useLocation();

  // 只有這幾個 path 算是「流程中的步驟」
  const stepPaths = [
    "/reserve",
    "/select-branch-package",
    "/select-slot",
    "/fill-profile",
    "/done",
  ];

  const steps = [
    { path: "/reserve", label: "團體代碼" },
    { path: "/select-branch-package", label: "選院區與套餐" },
    { path: "/select-slot", label: "選日期與時段" },
    { path: "/fill-profile", label: "填寫資料與病史" },
  ];

  const inWizard = stepPaths.includes(location.pathname);

  let currentStepIndex = steps.findIndex(
    (step) => step.path === location.pathname
  );
  if (location.pathname === "/done") {
    currentStepIndex = steps.length - 1;
  }
  if (currentStepIndex < 0) currentStepIndex = 0;

  const totalSteps = steps.length;
  const progressPercent =
    location.pathname === "/done"
      ? 100
      : (currentStepIndex / (totalSteps - 1)) * 100;

  return (
    <div className="app-container">
      <header className="app-header">
        <h1 className="app-title">線上預約</h1>

        {/* 只有在流程中才顯示進度條 */}
        {inWizard && (
          <div className="progress-wrapper">
            <div className="progress-bar-bg">
              <div
                className="progress-bar-fill"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <div className="progress-steps">
              {steps.map((step, index) => {
                const isCurrent = index === currentStepIndex;
                const isDone = index < currentStepIndex;
                const color = isCurrent ? "#4caf50" : isDone ? "#333" : "#888";

                return (
                  <span
                    key={step.path}
                    style={{
                      color,
                      fontWeight: isCurrent ? 600 : 400,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {index + 1}. {step.label}
                  </span>
                );
              })}
            </div>
          </div>
        )}
      </header>

    <Routes>
      <Route path="/otp" element={<OtpVerifyPage />} />
      <Route path="/" element={<HomePage />} />
      <Route path="/reserve" element={<GroupCodePage />} />
      <Route
        path="/select-branch-package"
        element={<SelectBranchPackagePage />}
      />
      <Route path="/select-slot" element={<SelectTimeSlotPage />} />
      <Route path="/fill-profile" element={<FillProfilePage />} />
      <Route path="/done" element={<ReservationDonePage />} />

      {/* 查詢預約頁：之後會接後端 */}
      <Route
        path="/reservation-lookup"
        element={<ReservationLookupPage />}
      />
    </Routes>

    </div>
  );
}

export default App;