import { Routes, Route, useLocation } from "react-router-dom";
import HomePage from "./pages/HomePage";
import GroupCodePage from "./pages/GroupCodePage";
import SelectBranchPackagePage from "./pages/SelectBranchPackagePage";
import SelectTimeSlotPage from "./pages/SelectTimeSlotPage";
import FillProfilePage from "./pages/FillProfilePage";
import ReservationDonePage from "./pages/ReservationDonePage";
import ReservationLookupPage from "./pages/ReservationLookupPage";
import OtpVerifyPage from "./pages/OtpVerifyPage";
import ReservationActionResultPage from "./pages/ReservationActionResultPage";
import ScrollToTop from "./components/ScrollToTop";
import "./App.css";

function App() {
  const location = useLocation();

  // OTP 是團體代碼驗證流程的一部分，所以也要算在流程內
  const stepPaths = [
    "/reserve",
    "/otp",
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

  // OTP 頁面視為第 1 步「團體代碼」的一部分
  if (location.pathname === "/otp") {
    currentStepIndex = 0;
  }

  // 完成頁視為最後一步
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
      <ScrollToTop />

      <header className="app-header">
        <h1 className="app-title">線上預約</h1>

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

                const color = isCurrent
                  ? "#2563eb"
                  : isDone
                    ? "#0f2742"
                    : "#8a9aad";

                return (
                  <span
                    key={step.path}
                    style={{
                      color,
                      fontWeight: isCurrent ? 800 : 500,
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
        <Route path="/" element={<HomePage />} />
        <Route path="/reserve" element={<GroupCodePage />} />
        <Route path="/otp" element={<OtpVerifyPage />} />
        <Route
          path="/select-branch-package"
          element={<SelectBranchPackagePage />}
        />
        <Route path="/select-slot" element={<SelectTimeSlotPage />} />
        <Route path="/fill-profile" element={<FillProfilePage />} />
        <Route path="/done" element={<ReservationDonePage />} />
        <Route
          path="/reservation-action-result"
          element={<ReservationActionResultPage />}
        />
        <Route path="/reservation-lookup" element={<ReservationLookupPage />} />
      </Routes>
    </div>
  );
}

export default App;