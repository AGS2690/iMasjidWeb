import { apiClient } from './client';
import { ApiResponse, UserNavMenuResponse, MenuTreeNodeResponse, MenuResponse } from '../types';

export const menusApi = {
  getUserNavMenu: async (culture?: string) => {
    const res = await apiClient.get<ApiResponse<UserNavMenuResponse[]>>('/menus/nav', {
      params: culture ? { culture } : {},
    });
    return res.data;
  },

  getMenuTree: async (isActive?: boolean, culture?: string) => {
    const params: Record<string, any> = {};
    if (isActive !== undefined) params.isActive = isActive;
    if (culture) params.culture = culture;
    const res = await apiClient.get<ApiResponse<MenuTreeNodeResponse[]>>('/menus/tree', { params });
    return res.data;
  },

  getAllMenus: async (isActive?: boolean, culture?: string) => {
    const params: Record<string, any> = {};
    if (isActive !== undefined) params.isActive = isActive;
    if (culture) params.culture = culture;
    const res = await apiClient.get<ApiResponse<MenuResponse[]>>('/menus', { params });
    return res.data;
  },

  getMenuById: async (id: string) => {
    const res = await apiClient.get<ApiResponse<MenuResponse>>(`/menus/${id}`);
    return res.data;
  },

  createMenu: async (payload: { title: string; route?: string; icon?: string; parentId?: string; orderIndex?: number; isActive?: boolean; actionIds?: string[] }) => {
    const res = await apiClient.post<ApiResponse<MenuResponse>>('/menus', payload);
    return res.data;
  },

  updateMenu: async (id: string, payload: { title: string; route?: string; icon?: string; parentId?: string; orderIndex?: number; isActive?: boolean }) => {
    const res = await apiClient.put<ApiResponse<MenuResponse>>(`/menus/${id}`, payload);
    return res.data;
  },

  deleteMenu: async (id: string) => {
    const res = await apiClient.delete<ApiResponse>(`/menus/${id}`);
    return res.data;
  },

  assignActions: async (id: string, actionIds: string[]) => {
    const res = await apiClient.post<ApiResponse>(`/menus/${id}/actions`, { actionIds });
    return res.data;
  },
};
