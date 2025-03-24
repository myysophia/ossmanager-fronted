import { StorageConfig, StorageConfigInput } from '../api/types';
import apiClient from '../api/axios';
import { ApiResponse, PageResponse } from '../api/types';

/**
 * 存储配置服务
 */
export class StorageConfigService {
  /**
   * 获取所有存储配置
   */
  static async getAllStorageConfigs(): Promise<StorageConfig[]> {
    console.log('调用 getAllStorageConfigs');
    try {
      interface StorageConfigListResponse {
        items: StorageConfig[];
        total: number;
      }

      const response = await apiClient.get<StorageConfigListResponse>('/oss/configs');
      
      console.log('API响应数据:', response.data);
      
      const responseData = response.data;
      if (!responseData || typeof responseData !== 'object') {
        throw new Error('API响应格式错误');
      }

      if (!responseData.items || !Array.isArray(responseData.items)) {
        console.error('API响应结构:', {
          hasResponseData: !!responseData,
          responseData: responseData,
          hasItems: !!responseData.items,
          isArray: Array.isArray(responseData.items),
          itemsContent: responseData.items
        });
        throw new Error('API响应items字段格式错误');
      }

      console.log('解析后的存储配置列表:', responseData.items);
      return responseData.items;
    } catch (error) {
      console.error('获取存储配置失败:', error);
      throw error;
    }
  }

  /**
   * 获取单个存储配置
   */
  static async getStorageConfig(id: number): Promise<StorageConfig> {
    console.log('调用 getStorageConfig, id:', id);
    try {
      interface SingleConfigResponse {
        code: number;
        message: string;
        data: StorageConfig;
      }

      const response = await apiClient.get<SingleConfigResponse>(`/oss/configs/${id}`);
      
      if (!response.data?.data) {
        throw new Error('获取配置失败');
      }
      
      return response.data.data;
    } catch (error) {
      console.error('获取单个配置失败:', error);
      throw error;
    }
  }

  /**
   * 创建存储配置
   */
  static async createStorageConfig(config: StorageConfigInput): Promise<StorageConfig> {
    console.log('调用 createStorageConfig, config:', config);
    try {
      interface CreateConfigResponse {
        code: number;
        message: string;
        data: StorageConfig;
      }

      const response = await apiClient.post<CreateConfigResponse>('/oss/configs', config);
      
      if (!response.data?.data) {
        throw new Error('创建配置失败');
      }
      
      return response.data.data;
    } catch (error) {
      console.error('创建配置失败:', error);
      throw error;
    }
  }

  /**
   * 更新存储配置
   */
  static async updateStorageConfig(id: number, config: Partial<StorageConfigInput>): Promise<StorageConfig> {
    console.log('调用 updateStorageConfig, id:', id, 'config:', config);
    try {
      interface UpdateConfigResponse {
        code: number;
        message: string;
        data: StorageConfig;
      }

      const response = await apiClient.put<UpdateConfigResponse>(`/oss/configs/${id}`, config);
      
      if (!response.data?.data) {
        throw new Error('更新配置失败');
      }
      
      return response.data.data;
    } catch (error) {
      console.error('更新配置失败:', error);
      throw error;
    }
  }

  /**
   * 删除存储配置
   */
  static async deleteStorageConfig(id: number): Promise<void> {
    console.log('调用 deleteStorageConfig, id:', id);
    try {
      interface DeleteConfigResponse {
        code: number;
        message: string;
        data: null;
      }

      const response = await apiClient.delete<DeleteConfigResponse>(`/oss/configs/${id}`);
      
      if (!response.data) {
        throw new Error('删除配置失败');
      }
      
      console.log('删除配置成功');
    } catch (error) {
      console.error('删除配置失败:', error);
      throw error;
    }
  }
} 