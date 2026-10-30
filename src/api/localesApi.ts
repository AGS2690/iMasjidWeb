import { apiClient } from './client';
import { ApiResponse, SupportedLocale } from '../types';

export const localesApi = {
  getSupportedLanguages: async (onlyActive: boolean = true) => {
    const res = await apiClient.get<ApiResponse<SupportedLocale[]>>('/locales/supported-languages', {
      params: { onlyActive },
    });
    return res.data;
  },

  getLocaleById: async (id: string) => {
    const res = await apiClient.get<ApiResponse<SupportedLocale>>(`/locales/${id}`);
    return res.data;
  },

  getLocaleByCulture: async (cultureCode: string) => {
    const res = await apiClient.get<ApiResponse<SupportedLocale>>(`/locales/by-culture/${cultureCode}`);
    return res.data;
  },
};
