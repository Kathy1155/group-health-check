import { Navigate } from "react-router-dom";

export default function HomeRedirectPage() {
  const role = localStorage.getItem("role");
  const loginEntry = localStorage.getItem("loginEntry");

  if (role === "Business") return <Navigate to="/admin/business" replace />;
  if (role === "HealthExamination") return <Navigate to="/admin/center" replace />;

  if (role === "Admin") {
    if (loginEntry === "center") return <Navigate to="/admin/center" replace />;
    return <Navigate to="/admin/business" replace />;
  }

  return <Navigate to="/admin/login" replace />;
}
