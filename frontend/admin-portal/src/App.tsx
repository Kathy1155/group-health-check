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



export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/admin/login" replace />} />
      <Route path="/admin/login" element={<LoginPage />} />
      <Route path="/admin/home" element={<HomeRedirectPage />} />
      <Route path="/admin/403" element={<ForbiddenPage />} />

      <Route path="/admin" element={<AdminLayout />}>
        {/* 業務中心頁面 */}
        <Route path="business" element={<BusinessHomePage />} />
        <Route path="business/groups/new" element={<GroupCreatePage />} />
        <Route path="business/package-branches" element={<PackageBranchSettingPage />} />
        <Route path="business/roster/upload" element={<RosterUploadPage />} />

        <Route path="center" element={<DefaultHomePage />} />
        <Route path="center/timeslots" element={<TimeSlotSettingPage />} />
        <Route path="center/timeslots/view" element={<TimeSlotViewPage />} />
        <Route path="center/reservations" element={<ReservationListPage />} />


      </Route>

      <Route path="*" element={<Navigate to="/admin/login" replace />} />
    </Routes>
  );
}
