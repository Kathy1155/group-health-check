import { Routes, Route, Navigate } from "react-router-dom";
import AdminLayout from "./layouts/AdminLayout";
import LoginPage from "./pages/LoginPage";
import HomeRedirectPage from "./pages/HomeRedirectPage";
import ForbiddenPage from "./pages/ForbiddenPage";
import BusinessHomePage from "./pages/business/BusinessHomePage";
import GroupCreatePage from "./pages/business/GroupCreatePage";
import PackageBranchSettingPage from "./pages/business/PackageBranchSettingPage";
import RosterUploadPage from "./pages/business/RosterUploadPage";
import DefaultHomePage from "./pages/center/DefaultHomePage";
import TimeSlotSettingPage from "./pages/center/TimeSlotSettingPage";
import TimeSlotViewPage from "./pages/center/TimeSlotViewPage";
import ReservationListPage from "./pages/center/ReservationListPage";
import GroupSearchPage from "./pages/business/GroupSearchPage";
import GroupEditPage from "./pages/business/GroupEditPage";
import ProtectedRoute from "./routes/ProtectedRoute";



export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/admin/login" replace />} />
      <Route path="/admin/login" element={<LoginPage />} />
      <Route path="/admin/home" element={<HomeRedirectPage />} />
      <Route path="/admin/forbidden" element={<ForbiddenPage />} />

      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Navigate to="/admin/home" replace />} />

        <Route path="business"
          element={
            <ProtectedRoute allow={["Business", "Admin"]}>
              <BusinessHomePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="business/groups/new"
          element={
            <ProtectedRoute allow={["Business", "Admin"]}>
              <GroupCreatePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="business/groups/search"
          element={
            <ProtectedRoute allow={["Business", "Admin"]}>
              <GroupSearchPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="business/groups/edit/:id"
          element={
            <ProtectedRoute allow={["Business", "Admin"]}>
              <GroupEditPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="business/package-branches"
          element={
            <ProtectedRoute allow={["Business", "Admin"]}>
              <PackageBranchSettingPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="business/roster/upload"
          element={
            <ProtectedRoute allow={["Business", "Admin"]}>
              <RosterUploadPage />
            </ProtectedRoute>
          }
        />

        <Route path="center"
          element={
            <ProtectedRoute allow={["HealthExamination", "Admin"]}>
              <DefaultHomePage />
            </ProtectedRoute>
          }
        />
        <Route path="center/timeslots"
          element={
            <ProtectedRoute allow={["HealthExamination", "Admin"]}>
              <TimeSlotSettingPage />
            </ProtectedRoute>
          }
        />
        <Route path="center/timeslots/view"
          element={
            <ProtectedRoute allow={["HealthExamination", "Admin"]}>
              <TimeSlotViewPage />
            </ProtectedRoute>
          }
        />
        <Route path="center/reservations"
          element={
            <ProtectedRoute allow={["HealthExamination", "Admin"]}>
              <ReservationListPage />
            </ProtectedRoute>
          }
        />
</Route>

      <Route path="*" element={<Navigate to="/admin/login" replace />} />
    </Routes>
  );
}
