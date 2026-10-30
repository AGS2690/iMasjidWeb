import { apiClient } from './client';
import {
  ApiResponse,
  TokenDto,
  UserDetailsResponse,
  UserResponse,
  OtpSentResponse,
  SendOtpRequest,
  VerifyOtpRequest,
  ToggleTwoFactorRequest,
  RegisterRequest,
} from '../types';

export const authApi = {
  register: async (data: RegisterRequest) => {
    const res = await apiClient.post<ApiResponse<UserResponse>>('/api/auth/register', data);
    return res.data;
  },

  login: async (credentials: { userNameOrEmail: string; password: string }) => {
    const res = await apiClient.post<ApiResponse<TokenDto>>('/api/auth/login', credentials);
    return res.data;
  },

  sendOtp: async (request: SendOtpRequest) => {
    const res = await apiClient.post<ApiResponse<OtpSentResponse>>('/api/auth/send-otp', {
      userNameOrEmail: request.userNameOrEmail.trim(),
      purpose: request.purpose || 'Login',
    });
    return res.data;
  },

  verifyOtp: async (request: VerifyOtpRequest) => {
    const res = await apiClient.post<ApiResponse<TokenDto>>('/api/auth/verify-otp', {
      userNameOrEmail: request.userNameOrEmail.trim(),
      otp: request.otp.trim(),
      purpose: request.purpose || 'Login',
    });
    return res.data;
  },

  toggleTwoFactor: async (request: ToggleTwoFactorRequest) => {
    const res = await apiClient.post<ApiResponse>('/api/auth/toggle-2fa', request);
    return res.data;
  },

  getMe: async () => {
    const res = await apiClient.get<ApiResponse<UserDetailsResponse>>('/api/auth/me');
    return res.data;
  },

  logout: async () => {
    const res = await apiClient.post<ApiResponse>('/api/auth/logout');
    return res.data;
  },

  changePassword: async (passwords: { currentPassword: string; newPassword: string; confirmPassword: string }) => {
    const res = await apiClient.post<ApiResponse>('/api/auth/change-password', passwords);
    return res.data;
  },
};

