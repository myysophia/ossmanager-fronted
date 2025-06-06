import apiClient from './axios';
import { ApiResponse, LoginParams, LoginResponse, RegisterParams, User } from './types';

/**
 * 认证相关API服务
 */
export const AuthAPI = {
  /**
   * 用户登录
   * @param params 登录参数
   * @returns 登录响应包含token和用户信息
   */
  login: async (params: LoginParams): Promise<LoginResponse> => {
    try {
      const response = await apiClient.post<ApiResponse<LoginResponse>>('/auth/login', params);
      
      // console.log('登录响应数据:', response);
      
      // 验证响应数据
      if (!response.data || typeof response.data !== 'object') {
        console.error('响应数据格式错误:', response);
        throw new Error('响应数据格式错误');
      }

      const responseData = response.data;
      
      // 验证 token 和 user 数据
      // 检查 token 和 user 是否在顶层或者在 data 字段中
      const loginData = responseData.data || responseData;
      
      if (!loginData.token || !loginData.user) {
        console.error('缺少token或user数据:', responseData);
        throw new Error('认证响应缺少必要数据');
      }
      
      const { token, user } = loginData;
      
      // 存储认证信息
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      return loginData;
    } catch (error: any) {
      console.error('登录失败:', error);
      
      // 如果是我们自定义的错误，直接抛出
      if (error.message) {
        throw error;
      }
      
      // 其他错误统一处理
      throw new Error('登录失败，请检查用户名和密码');
    }
  },

  /**
   * 注册新用户
   * @param params 注册参数
   * @returns 成功响应
   */
  register: async (params: RegisterParams): Promise<void> => {
    await apiClient.post<ApiResponse>('/auth/register', params);
  },

  /**
   * 获取当前用户信息
   * @returns 用户信息
   */
  getCurrentUser: async (): Promise<User> => {
    const response = await apiClient.get<ApiResponse<User>>('/user/current');
    return response.data.data as User;
  },

  /**
   * 退出登录
   * @returns 成功响应
   */
  logout: async (): Promise<void> => {
    await apiClient.post<ApiResponse>('/auth/logout');
    // 清除本地存储的token和用户信息
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  /**
   * 检查是否已登录
   * @returns 是否已登录
   */
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('token');
  },

  /**
   * 获取本地存储的用户信息
   * @returns 用户信息或null
   */
  getStoredUser: (): User | null => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (e) {
        console.error('解析用户信息失败', e);
        return null;
      }
    }
    return null;
  },
}; 