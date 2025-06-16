import apiClient from '../api/axios';

export interface BucketAccess {
  id: number;
  created_at: string;
  updated_at: string;
  region_code: string;
  bucket_name: string;
}

export class BucketService {
  /**
   * 获取当前用户有权限访问的 bucket 列表
   */
  static async getUserBucketAccess(): Promise<BucketAccess[]> {
    try {
      // 首先获取当前用户信息
      const userResponse = await apiClient.get<{
        code: number;
        message: string;
        data: {
          id: number;
          [key: string]: any;
        };
      }>('/user/current');
      if (!userResponse.data?.id) {
        throw new Error('获取当前用户信息失败');
      }
    
      const userId = userResponse.data.id;
      // 使用用户 ID 获取 bucket 访问权限
      const response = await apiClient.get<{
        code: number;
        message: string;
        data: BucketAccess[];
      }>(`/users/${userId}/bucket-access`);
      if (response.code === 200) {
        return response.data;
      }
      throw new Error(response.data.message || '获取 bucket 访问权限失败');
    } catch (error) {
      console.error('获取 bucket 访问权限失败:', error);
      throw error;
    }
  }
} 