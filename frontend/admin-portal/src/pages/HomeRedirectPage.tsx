import { Navigate } from "react-router-dom";

export default function HomeRedirectPage() {
  const role = localStorage.getItem("role");

  if (role === "business") return <Navigate to="/admin/business" replace />;
  if (role === "center") return <Navigate to="/admin/center" replace />;
  if (role === "admin") return <Navigate to="/admin/business" replace />;

  return <Navigate to="/admin/login" replace />;
}
