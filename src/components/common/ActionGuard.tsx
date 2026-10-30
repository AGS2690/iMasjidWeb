import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useLocation } from 'react-router-dom';

interface ActionGuardProps {
  action?: string;
  permission?: string;
  route?: string;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export const ActionGuard: React.FC<ActionGuardProps> = ({
  action,
  permission,
  route,
  fallback = null,
  children,
}) => {
  const { hasPermission, isActionAuthorized } = useAuth();
  const location = useLocation();

  if (permission && hasPermission(permission)) {
    return <>{children}</>;
  }

  if (action) {
    const isAllowed = isActionAuthorized(action, route || location.pathname);
    if (isAllowed) {
      return <>{children}</>;
    }
  }

  return <>{fallback}</>;
};
