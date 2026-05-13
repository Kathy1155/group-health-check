import { Navigate } from "react-router-dom";

type ProtectedRouteProps = {
  children: React.ReactNode;
  allow: ("Business" | "HealthExamination" | "Admin")[];
};

export default function ProtectedRoute({
  children,
  allow,
}: ProtectedRouteProps) {
  const role = localStorage.getItem("role");
  console.log("目前角色：", role, "允許角色：", allow);

  if (!role) {
    return <Navigate to="/admin/login" replace />;
  }

  if (!allow.includes(role as any)) {
    return <Navigate to="/admin/forbidden" replace />;
  }

  return <>{children}</>;
}