import axios from 'axios';
import { createLogger } from '../logger';

const log = createLogger('axios');

// 创建axios实例
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://ossmanager-api.ampaura.tech/api/v1',
  timeout: 3600000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
apiClient.interceptors.request.use(
  (config) => {
    // 从 localStorage 获取 token
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    
    // 请求日志
    log('request', {
      url: config.url,
      method: config.method,
      baseURL: config.baseURL,
      headers: config.headers,
      fullPath: `${config.baseURL}${config.url}`
    });
    
    return config;
  },
  (error) => {
    console.error('请求拦截器错误:', error);
    return Promise.reject(error);
  }
);

// 响应拦截器
apiClient.interceptors.response.use(
  (response) => {
    // 响应日志
    log('response', {
      url: response.config.url,
      status: response.status,
      data: response.data
    });
    
    // 检查响应数据结构
    const responseData = response.data;
    
    // 检查是否是标准的API响应格式
    if (responseData && typeof responseData === 'object') {
      // 检查是否包含code字段
      if (responseData.code !== undefined) {
        // 如果code不为0或200，说明有错误
        if (responseData.code !== 0 && responseData.code !== 200) {
          console.error('API响应错误:', responseData);
          return Promise.reject(new Error(responseData.message || '请求失败'));
        }
        // 返回完整的响应数据
        return responseData;
      }
    }
    
    // 如果不是标准格式，返回原始响应
    return response;
  },
  (error) => {
    // 添加错误日志
    console.error('请求失败:', {
      url: error.config?.url,
      message: error.message,
      response: error.response?.data
    });
    
    // 处理错误响应
    if (error.response) {
      const status = error.response.status;
      
      if (status === 401 && typeof window !== 'undefined') {
        // token 过期或无效，清除本地存储并跳转到登录页
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      } else {
        // 记录错误信息
        const errorMessage = error.response.data?.message || '请求失败';
        console.error('API错误:', errorMessage);
      }
    } else if (error.request) {
      // 请求已发出但没有收到响应
      console.error('网络错误: 请检查网络连接');
    } else {
      // 请求设置时发生错误
      console.error('请求错误:', error.message || '发生未知错误');
    }
    
    return Promise.reject(error);
  }
);

export default apiClient; 