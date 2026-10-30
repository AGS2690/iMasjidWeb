import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { LocaleProvider } from './context/LocaleContext';
import { ToastContainer } from './components/common/ToastContainer';
import { PageLoader } from './components/common/PageLoader';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { MainLayout } from './components/layout/MainLayout';

// Lazy-loaded route components for optimized bundle splitting & faster initial load
const LoginPage = lazy(() => import('./pages/auth/LoginPage').then((m) => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage').then((m) => ({ default: m.RegisterPage })));
const ForbiddenPage = lazy(() => import('./pages/auth/ForbiddenPage').then((m) => ({ default: m.ForbiddenPage })));
const DashboardPage = lazy(() => import('./pages/dashboard/DashboardPage').then((m) => ({ default: m.DashboardPage })));
const UsersPage = lazy(() => import('./pages/users/UsersPage').then((m) => ({ default: m.UsersPage })));
const RolesPage = lazy(() => import('./pages/roles/RolesPage').then((m) => ({ default: m.RolesPage })));
const MenusPage = lazy(() => import('./pages/menus/MenusPage').then((m) => ({ default: m.MenusPage })));
const ActionsPage = lazy(() => import('./pages/actions/ActionsPage').then((m) => ({ default: m.ActionsPage })));
const SettingsPage = lazy(() => import('./pages/settings/SettingsPage').then((m) => ({ default: m.SettingsPage })));
const AuditLogsPage = lazy(() => import('./pages/audit-logs/AuditLogsPage').then((m) => ({ default: m.AuditLogsPage })));
const ProfilePage = lazy(() => import('./pages/profile/ProfilePage').then((m) => ({ default: m.ProfilePage })));
const ChangePasswordPage = lazy(() => import('./pages/profile/ChangePasswordPage').then((m) => ({ default: m.ChangePasswordPage })));

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <LocaleProvider>
        <ToastProvider>
          <AuthProvider>
            <BrowserRouter>
              <Suspense fallback={<PageLoader />}>
              <Routes>
                {/* Public routes */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<RegisterPage />} />
                <Route path="/register" element={<Navigate to="/signup" replace />} />

                {/* Protected 403 Forbidden route for users without roles */}
                <Route path="/forbidden" element={<ForbiddenPage />} />

                {/* Protected portal routes */}
                <Route element={<ProtectedRoute />}>
                  <Route element={<MainLayout />}>
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/change-password" element={<ChangePasswordPage />} />
                    <Route path="/profile/change-password" element={<Navigate to="/change-password" replace />} />

                    {/* Administration Module */}
                    <Route path="/admin/users" element={<UsersPage />} />
                    <Route path="/admin/roles" element={<RolesPage />} />
                    <Route path="/admin/menus" element={<MenusPage />} />
                    <Route path="/admin/actions" element={<ActionsPage />} />

                    {/* Settings & System Module */}
                    <Route path="/system/settings" element={<SettingsPage />} />
                    <Route path="/system/audit-logs" element={<AuditLogsPage />} />

                    {/* Fallback alias routes */}
                    <Route path="/users" element={<Navigate to="/admin/users" replace />} />
                    <Route path="/roles" element={<Navigate to="/admin/roles" replace />} />
                    <Route path="/menus" element={<Navigate to="/admin/menus" replace />} />
                    <Route path="/actions" element={<Navigate to="/admin/actions" replace />} />
                    <Route path="/settings" element={<Navigate to="/system/settings" replace />} />
                    <Route path="/audit-logs" element={<Navigate to="/system/audit-logs" replace />} />
                  </Route>
                </Route>

                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </Suspense>
            <ToastContainer />
          </BrowserRouter>
        </AuthProvider>
      </ToastProvider>
      </LocaleProvider>
    </ThemeProvider>
  );
};
