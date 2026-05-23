import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
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
import hospitalLogo from "./assets/hospital-logo.png";
import "./App.css";

function App() {
  const location = useLocation();
  const navigate = useNavigate();

  const stepPaths = [
    "/reserve",
    "/otp",
    "/select-branch-package",
    "/select-slot",
    "/fill-profile",
    "/done",
  ];

  const steps = [
    { path: "/reserve", label: "身分驗證" },
    { path: "/select-branch-package", label: "院區方案" },
    { path: "/select-slot", label: "日期時段" },
    { path: "/fill-profile", label: "資料填寫" },
  ];

  const inWizard = stepPaths.includes(location.pathname);

  let currentStepIndex = steps.findIndex(
    (step) => step.path === location.pathname,
  );

  if (location.pathname === "/otp") {
    currentStepIndex = 0;
  }

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
        <div className="app-header-top">
          <div className="app-brand">
            <img src={hospitalLogo} alt="醫院 logo" className="app-brand-logo" />
            <div>
              <h1 className="app-title">團體健檢預約</h1>
              <p className="app-subtitle">員工線上預約服務</p>
            </div>
          </div>

          <button
            type="button"
            className="app-home-button"
            onClick={() => navigate("/")}
          >
            回首頁
          </button>
        </div>

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

                return (
                  <span
                    key={step.path}
                    className={
                      isCurrent
                        ? "progress-step progress-step-current"
                        : isDone
                          ? "progress-step progress-step-done"
                          : "progress-step"
                    }
                  >
                    <strong>{index + 1}</strong>
                    {step.label}
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
