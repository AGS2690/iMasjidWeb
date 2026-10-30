import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { UserDetailsResponse, UserNavMenuResponse } from '../types';
import { authApi } from '../api/authApi';
import { menusApi } from '../api/menusApi';

import { useLocale } from './LocaleContext';

export interface LoginResult {
  success: boolean;
  hasRoles: boolean;
  message?: string;
}

interface AuthContextType {
  user: UserDetailsResponse | null;
  navMenus: UserNavMenuResponse[];
  isAuthenticated: boolean;
  hasRoles: boolean;
  isLoading: boolean;
  login: (tokens: { accessToken: string; refreshToken: string }) => Promise<LoginResult>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<UserDetailsResponse | null>;
  refreshNavMenus: () => Promise<UserNavMenuResponse[]>;
  hasPermission: (permissionCode: string) => boolean;
  isActionAuthorized: (actionCode: string, route?: string) => boolean;
}

const normalizeUserProfile = (raw: any): UserDetailsResponse => {
  if (!raw) return raw;
  const u = raw.user || raw;
  return {
    id: u.id || raw.id || '',
    firstName: u.firstName || raw.firstName || '',
    lastName: u.lastName || raw.lastName || '',
    fullName: u.fullName || `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.userName || raw.userName || 'User',
    userName: u.userName || raw.userName || '',
    email: u.email || raw.email || '',
    phoneNumber: u.phoneNumber || raw.phoneNumber,
    isActive: u.isActive ?? raw.isActive ?? true,
    isEmailVerified: u.isEmailVerified ?? raw.isEmailVerified ?? false,
    twoFactorEnabled: u.twoFactorEnabled ?? raw.twoFactorEnabled ?? false,
    lastLoginDate: u.lastLoginDate || raw.lastLoginDate,
    roles: raw.roles || u.roles || [],
    permissions: raw.permissions || u.permissions || [],
  };
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserDetailsResponse | null>(null);
  const [navMenus, setNavMenus] = useState<UserNavMenuResponse[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { currentLocale } = useLocale();

  const refreshNavMenus = useCallback(async (): Promise<UserNavMenuResponse[]> => {
    try {
      const culture = currentLocale?.cultureCode;
      const res = await menusApi.getUserNavMenu(culture);
      const isOk = res.success ?? res.isSuccess;
      if (isOk && res.data) {
        setNavMenus(res.data);
        return res.data;
      }
      return [];
    } catch {
      setNavMenus([]);
      return [];
    }
  }, [currentLocale?.cultureCode]);

  const refreshProfile = useCallback(async (): Promise<UserDetailsResponse | null> => {
    try {
      const res = await authApi.getMe();
      const isOk = res.success ?? res.isSuccess;
      if (isOk && res.data) {
        const normalized = normalizeUserProfile(res.data);
        setUser(normalized);
        return normalized;
      }
      setUser(null);
      return null;
    } catch {
      setUser(null);
      return null;
    }
  }, []);

  const initAuth = useCallback(async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      const profileRes = await authApi.getMe();
      const isOk = profileRes.success ?? profileRes.isSuccess;
      if (isOk && profileRes.data) {
        const normalized = normalizeUserProfile(profileRes.data);
        setUser(normalized);
        if (normalized.roles && normalized.roles.length > 0) {
          await refreshNavMenus();
        }
      } else {
        localStorage.clear();
        setUser(null);
      }
    } catch {
      localStorage.clear();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, [refreshNavMenus]);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  // Re-fetch dynamic navigation menus whenever user switches language in UI
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      refreshNavMenus();
    }
  }, [currentLocale?.cultureCode, refreshNavMenus]);

  const login = async (tokens: { accessToken: string; refreshToken: string }): Promise<LoginResult> => {
    localStorage.setItem('access_token', tokens.accessToken);
    localStorage.setItem('refresh_token', tokens.refreshToken);
    setIsLoading(true);
    try {
      const profileRes = await authApi.getMe();
      const isOk = profileRes.success ?? profileRes.isSuccess;
      if (isOk && profileRes.data) {
        const normalized = normalizeUserProfile(profileRes.data);
        setUser(normalized);

        const userRoles = normalized.roles || [];
        if (userRoles.length === 0) {
          setNavMenus([]);
          return { success: true, hasRoles: false, message: 'No role assigned to user.' };
        }

        await refreshNavMenus();
        return { success: true, hasRoles: true };
      }
      return { success: false, hasRoles: false, message: profileRes.message || 'Failed to fetch user profile.' };
    } catch (err: any) {
      return { success: false, hasRoles: false, message: err.message || 'An error occurred during authentication.' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch {
      // ignore
    } finally {
      localStorage.clear();
      setUser(null);
      setNavMenus([]);
      window.location.href = '/login';
    }
  };

  const isSuperAdmin = user?.roles?.some((r) => r.toUpperCase() === 'SUPERADMIN') ?? false;

  const hasPermission = (permissionCode: string) => {
    if (!user) return false;
    if (isSuperAdmin) return true;
    return user.permissions?.includes(permissionCode) ?? false;
  };

  const isActionAuthorized = (actionCode: string, route?: string) => {
    if (!user) return false;
    if (isSuperAdmin) return true;

    // Check direct permission codes (e.g. "Users.Create", "Roles.Edit")
    if (user.permissions?.includes(actionCode)) return true;

    const targetRoute = route || window.location.pathname;

    // Search menu tree for matching route & authorized action code
    const checkTree = (items: UserNavMenuResponse[]): boolean => {
      for (const item of items) {
        if (item.route && targetRoute.startsWith(item.route)) {
          const acts = item.authorizedActions || item.actions || [];
          if (acts.some((a) => a.toUpperCase() === actionCode.toUpperCase())) {
            return true;
          }
        }
        const children = item.children || item.subMenus || [];
        if (children.length > 0 && checkTree(children)) {
          return true;
        }
      }
      return false;
    };

    if (navMenus && navMenus.length > 0 && checkTree(navMenus)) {
      return true;
    }

    return false;
  };

  const hasRoles = !!user && Array.isArray(user.roles) && user.roles.length > 0;

  return (
    <AuthContext.Provider
      value={{
        user,
        navMenus,
        isAuthenticated: !!user,
        hasRoles,
        isLoading,
        login,
        logout,
        refreshProfile,
        refreshNavMenus,
        hasPermission,
        isActionAuthorized,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
