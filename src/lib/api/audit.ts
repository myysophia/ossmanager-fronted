import apiClient from './axios';
import { ApiResponse, AuditLog, AuditLogQueryParams, PageResponse } from './types';

/**
 * 审计日志相关API服务
 */
export const AuditAPI = {
  /**
   * 获取审计日志列表
   * @param params 查询参数
   * @returns 审计日志列表及分页信息
   */
  getLogs: async (params?: AuditLogQueryParams): Promise<PageResponse<AuditLog>> => {
    const response = await apiClient.get<ApiResponse<PageResponse<AuditLog>>>('/audit/logs', { 
      params,
    });
    return response.data as unknown as PageResponse<AuditLog>;
  },

  /**
   * 导出审计日志
   * @param params 查询参数
   * @returns 导出文件的URL
   */
  exportLogs: async (params?: AuditLogQueryParams): Promise<string> => {
    const response = await apiClient.get<Blob>('/audit/logs/export', {
      params,
      responseType: 'blob',
    });
    
    // 创建一个临时URL指向Blob对象
    const url = window.URL.createObjectURL(response as unknown as Blob);
    
    // 创建一个临时链接并点击下载
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `audit-logs-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    return url;
  },
}; 