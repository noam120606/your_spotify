import { Navigate, Outlet } from "react-router-dom";

import { MainLayout } from "./mainLayout";
import { useAuthStore } from "../store/authStore";

export function ProtectedRoute() {
  const { isAuthenticated, isCheckingAuth } = useAuthStore();

  if (isCheckingAuth) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <MainLayout>
      <Outlet />
    </MainLayout>
  );
}
