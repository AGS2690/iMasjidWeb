import { apiClient } from './client';
import { ApiResponse, SettingResponse } from '../types';

export const settingsApi = {
  getSettings: async () => {
    const res = await apiClient.get<ApiResponse<SettingResponse[]>>('/api/settings');
    return res.data;
  },

  getSettingByKey: async (key: string) => {
    const res = await apiClient.get<ApiResponse<SettingResponse>>(`/api/settings/${key}`);
    return res.data;
  },

  createSetting: async (payload: { key: string; value: string; description?: string; module?: string; isEncrypted?: boolean }) => {
    const res = await apiClient.post<ApiResponse<SettingResponse>>('/api/settings', payload);
    return res.data;
  },

  updateSetting: async (key: string, payload: { value: string; description?: string; module?: string; isEncrypted?: boolean }) => {
    const res = await apiClient.put<ApiResponse<SettingResponse>>(`/api/settings/${key}`, payload);
    return res.data;
  },

  deleteSetting: async (key: string) => {
    const res = await apiClient.delete<ApiResponse>(`/api/settings/${key}`);
    return res.data;
  },
};
