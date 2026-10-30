import { apiClient } from './client';
import { ApiResponse, BusinessActionResponse } from '../types';

export const actionsApi = {
  getActions: async (isActive?: boolean) => {
    const res = await apiClient.get<ApiResponse<BusinessActionResponse[]>>('/api/businessactions', {
      params: isActive !== undefined ? { isActive } : {},
    });
    return res.data;
  },

  getActionById: async (id: string) => {
    const res = await apiClient.get<ApiResponse<BusinessActionResponse>>(`/api/businessactions/${id}`);
    return res.data;
  },

  createAction: async (payload: { name: string; code: string; description?: string; isActive?: boolean }) => {
    const res = await apiClient.post<ApiResponse<BusinessActionResponse>>('/api/businessactions', payload);
    return res.data;
  },

  updateAction: async (id: string, payload: { name: string; description?: string; isActive?: boolean }) => {
    const res = await apiClient.put<ApiResponse<BusinessActionResponse>>(`/api/businessactions/${id}`, payload);
    return res.data;
  },

  deleteAction: async (id: string) => {
    const res = await apiClient.delete<ApiResponse>(`/api/businessactions/${id}`);
    return res.data;
  },
};
