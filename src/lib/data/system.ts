import { ApiResponse } from '../api/types';
import apiClient from '../api/axios';

export interface SystemConfig {
  site_name: string;
  description: string;
  logo_url: string;
  max_file_size: number;
  allowed_file_types: string[];
  default_storage_config_id: number;
  enable_registration: boolean;
  enable_captcha: boolean;
}

/**
 * 系统配置服务
 */
export class SystemConfigService {
  /**
   * 获取系统配置
   */
  static async getConfig(): Promise<SystemConfig> {
    console.log('获取系统配置');
    try {
      const response = await apiClient.get<ApiResponse<SystemConfig>>('/system/config');
      console.log('获取系统配置成功:', response.data);
      return response.data.data;
    } catch (error) {
      console.error('获取系统配置失败:', error);
      throw error;
    }
  }

  /**
   * 更新系统配置
   */
  static async updateConfig(config: Partial<SystemConfig>): Promise<SystemConfig> {
    console.log('更新系统配置:', config);
    try {
      const response = await apiClient.put<ApiResponse<SystemConfig>>('/system/config', config);
      console.log('更新系统配置成功:', response.data);
      return response.data.data;
    } catch (error) {
      console.error('更新系统配置失败:', error);
      throw error;
    }
  }
} 