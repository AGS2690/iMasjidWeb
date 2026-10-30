import { apiClient } from './client';
import { ApiResponse, PagedResponse, UserResponse, UserDetailsResponse } from '../types';

export const usersApi = {
  getUsers: async (params: { pageNumber?: number; pageSize?: number; searchTerm?: string; role?: string; isActive?: boolean }) => {
    const res = await apiClient.get<ApiResponse<PagedResponse<UserResponse>>>('/users', { params });
    return res.data;
  },

  getUserById: async (id: string) => {
    const res = await apiClient.get<ApiResponse<UserResponse>>(`/users/${id}`);
    return res.data;
  },

  getUserDetails: async (id: string) => {
    const res = await apiClient.get<ApiResponse<UserDetailsResponse>>(`/users/${id}/details`);
    return res.data;
  },

  createUser: async (payload: { firstName: string; lastName: string; userName: string; email: string; phoneNumber?: string; password: string; roleIds?: string[] }) => {
    const res = await apiClient.post<ApiResponse<UserResponse>>('/users', payload);
    return res.data;
  },

  updateUser: async (id: string, payload: { firstName: string; lastName: string; phoneNumber?: string }) => {
    const res = await apiClient.put<ApiResponse<UserResponse>>(`/users/${id}`, payload);
    return res.data;
  },

  deleteUser: async (id: string) => {
    const res = await apiClient.delete<ApiResponse>(`/users/${id}`);
    return res.data;
  },

  toggleStatus: async (id: string) => {
    const res = await apiClient.put<ApiResponse>(`/users/${id}/toggle-status`);
    return res.data;
  },

  assignRoles: async (id: string, roleIds: string[]) => {
    const res = await apiClient.put<ApiResponse>(`/users/${id}/roles`, { roleIds });
    return res.data;
  },
};
