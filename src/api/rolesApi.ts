import { apiClient } from './client';
import { ApiResponse, RoleResponse, PermissionDto, RoleMenuDetailsResponse } from '../types';

export const rolesApi = {
  getRoles: async () => {
    const res = await apiClient.get<ApiResponse<RoleResponse[]>>('/roles');
    return res.data;
  },

  getRoleById: async (id: string) => {
    const res = await apiClient.get<ApiResponse<RoleResponse>>(`/roles/${id}`);
    return res.data;
  },

  getAllPermissions: async () => {
    const res = await apiClient.get<ApiResponse<PermissionDto[]>>('/roles/permissions');
    return res.data;
  },

  createRole: async (payload: { name: string; description?: string; permissionCodes?: string[] }) => {
    const res = await apiClient.post<ApiResponse<RoleResponse>>('/roles', payload);
    return res.data;
  },

  updateRole: async (id: string, payload: { name: string; description?: string; isActive?: boolean }) => {
    const res = await apiClient.put<ApiResponse<RoleResponse>>(`/roles/${id}`, payload);
    return res.data;
  },

  deleteRole: async (id: string) => {
    const res = await apiClient.delete<ApiResponse>(`/roles/${id}`);
    return res.data;
  },

  updatePermissions: async (id: string, permissionCodes: string[]) => {
    const res = await apiClient.put<ApiResponse>(`/roles/${id}/permissions`, { permissionCodes });
    return res.data;
  },

  getRoleMenus: async (id: string) => {
    const res = await apiClient.get<ApiResponse<RoleMenuDetailsResponse[]>>(`/roles/${id}/menus`);
    return res.data;
  },

  assignRoleMenus: async (id: string, menus: { menuId: string; actionIds: string[] }[]) => {
    const res = await apiClient.put<ApiResponse>(`/roles/${id}/menus`, { menus });
    return res.data;
  },
};
