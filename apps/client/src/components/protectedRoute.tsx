import { Navigate, Outlet } from "react-router-dom";

import { useAuthStore } from "../store/authStore";

export function ProtectedRoute() {
  const { isAuthenticated, isCheckingAuth } = useAuthStore();

  if (isCheckingAuth) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
