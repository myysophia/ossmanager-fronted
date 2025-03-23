import apiClient from './axios';
import { ApiResponse, ConfigQueryParams, PageResponse, StorageConfig, StorageConfigInput } from './types';

/**
 * OSS存储配置相关API服务
 */
export const ConfigAPI = {
  /**
   * 获取存储配置列表
   * @param params 查询参数
   * @returns 存储配置列表及分页信息
   */
  getConfigs: async (params?: ConfigQueryParams): Promise<PageResponse<StorageConfig>> => {
    const response = await apiClient.get<ApiResponse<PageResponse<StorageConfig>>>('/oss/configs', { 
      params,
    });
    return response.data as unknown as PageResponse<StorageConfig>;
  },

  /**
   * 获取单个存储配置
   * @param id 配置ID
   * @returns 存储配置详情
   */
  getConfigById: async (id: number): Promise<StorageConfig> => {
    const response = await apiClient.get<ApiResponse<StorageConfig>>(`/oss/configs/${id}`);
    return response.data as unknown as StorageConfig;
  },

  /**
   * 创建存储配置
   * @param config 存储配置信息
   * @returns 创建的存储配置
   */
  createConfig: async (config: StorageConfigInput): Promise<StorageConfig> => {
    const response = await apiClient.post<ApiResponse<StorageConfig>>('/oss/configs', config);
    return response.data as unknown as StorageConfig;
  },

  /**
   * 更新存储配置
   * @param id 配置ID
   * @param config 存储配置信息
   * @returns 更新后的存储配置
   */
  updateConfig: async (id: number, config: StorageConfigInput): Promise<StorageConfig> => {
    const response = await apiClient.put<ApiResponse<StorageConfig>>(`/oss/configs/${id}`, config);
    return response.data as unknown as StorageConfig;
  },

  /**
   * 删除存储配置
   * @param id 配置ID
   */
  deleteConfig: async (id: number): Promise<void> => {
    await apiClient.delete<ApiResponse>(`/oss/configs/${id}`);
  },

  /**
   * 设置默认配置
   * @param id 配置ID
   */
  setDefaultConfig: async (id: number): Promise<void> => {
    await apiClient.put<ApiResponse>(`/oss/configs/${id}/default`);
  },

  /**
   * 测试存储配置连接
   * @param id 配置ID
   * @returns 是否连接成功
   */
  testConnection: async (id: number): Promise<boolean> => {
    try {
      await apiClient.post<ApiResponse>(`/oss/configs/${id}/test`);
      return true;
    } catch (error) {
      return false;
    }
  },
}; 