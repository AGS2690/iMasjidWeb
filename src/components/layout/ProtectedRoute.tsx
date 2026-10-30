import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { PageLoader } from '../common/PageLoader';

interface ProtectedRouteProps {
  permission?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ permission }) => {
  const { isAuthenticated, hasRoles, isLoading, hasPermission } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <PageLoader message="Authenticating session..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // If user is authenticated but has no roles, restrict to 403 Forbidden page
  if (!hasRoles && location.pathname !== '/forbidden') {
    return <Navigate to="/forbidden" replace />;
  }

  // If user has roles and visits /forbidden, redirect them to dashboard
  if (hasRoles && location.pathname === '/forbidden') {
    return <Navigate to="/dashboard" replace />;
  }

  // Check specific permission if configured
  if (permission && !hasPermission(permission)) {
    return <Navigate to="/forbidden" replace />;
  }

  return <Outlet />;
};
