import { apiClient } from './client';
import { ApiResponse, RoleResponse, PermissionDto, RoleMenuDetailsResponse } from '../types';

export const rolesApi = {
  getRoles: async () => {
    const res = await apiClient.get<ApiResponse<RoleResponse[]>>('/api/roles');
    return res.data;
  },

  getRoleById: async (id: string) => {
    const res = await apiClient.get<ApiResponse<RoleResponse>>(`/api/roles/${id}`);
    return res.data;
  },

  getAllPermissions: async () => {
    const res = await apiClient.get<ApiResponse<PermissionDto[]>>('/api/roles/permissions');
    return res.data;
  },

  createRole: async (payload: { name: string; description?: string; permissionCodes?: string[] }) => {
    const res = await apiClient.post<ApiResponse<RoleResponse>>('/api/roles', payload);
    return res.data;
  },

  updateRole: async (id: string, payload: { name: string; description?: string; isActive?: boolean }) => {
    const res = await apiClient.put<ApiResponse<RoleResponse>>(`/api/roles/${id}`, payload);
    return res.data;
  },

  deleteRole: async (id: string) => {
    const res = await apiClient.delete<ApiResponse>(`/api/roles/${id}`);
    return res.data;
  },

  updatePermissions: async (id: string, permissionCodes: string[]) => {
    const res = await apiClient.put<ApiResponse>(`/api/roles/${id}/permissions`, { permissionCodes });
    return res.data;
  },

  getRoleMenus: async (id: string) => {
    const res = await apiClient.get<ApiResponse<RoleMenuDetailsResponse[]>>(`/api/roles/${id}/menus`);
    return res.data;
  },

  assignRoleMenus: async (id: string, menus: { menuId: string; actionIds: string[] }[]) => {
    const res = await apiClient.put<ApiResponse>(`/api/roles/${id}/menus`, { menus });
    return res.data;
  },
};
