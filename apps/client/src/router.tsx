import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Home } from './pages/home';
import { DesignSystem } from './pages/designSystem';
import { ProtectedRoute } from './components/protectedRoute';

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/design" element={<DesignSystem />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Home />} />
        </Route>

        {/* Catch-all redirect to Home or Design */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
