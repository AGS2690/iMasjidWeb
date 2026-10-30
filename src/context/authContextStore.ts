import { createContext } from 'react';
import { UserDetailsResponse, UserNavMenuResponse } from '../types';

export interface LoginResult {
  success: boolean;
  hasRoles: boolean;
  message?: string;
}

export interface AuthContextType {
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

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
