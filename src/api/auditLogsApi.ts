import { apiClient } from './client';
import { ApiResponse, PagedResponse, AuditLogResponse } from '../types';

export const auditLogsApi = {
  getAuditLogs: async (params: { pageNumber?: number; pageSize?: number }) => {
    const res = await apiClient.get<ApiResponse<PagedResponse<AuditLogResponse>>>('/auditlogs', { params });
    return res.data;
  },
};
