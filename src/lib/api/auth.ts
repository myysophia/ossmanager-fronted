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
    const response = await apiClient.post<ApiResponse<LoginResponse>>('/auth/login', params);
    
    // 确保我们得到了有效的响应数据
    if (!response.data || !response.data.data) {
      throw new Error('服务器响应缺少数据');
    }
    
    const loginData = response.data.data;
    
    // 存储token和用户信息
    if (loginData.token && loginData.user) {
      localStorage.setItem('token', loginData.token);
      localStorage.setItem('user', JSON.stringify(loginData.user));
      console.log('认证成功，已存储token和用户信息');
      return loginData;
    } else {
      console.error('认证成功但缺少必要数据', loginData);
      throw new Error('认证响应缺少必要数据');
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