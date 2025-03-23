import axios from 'axios';
import { createStandaloneToast } from '@chakra-ui/react';
import { getApiConfig } from '../config/api';

const { toast } = createStandaloneToast();
const apiConfig = getApiConfig();

// 创建axios实例
const apiClient = axios.create({
  baseURL: apiConfig.baseURL, // 从环境配置获取API基础地址
  timeout: apiConfig.timeout, // 从环境配置获取超时设置
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
apiClient.interceptors.request.use(
  (config) => {
    // 从本地存储获取token
    const token = localStorage.getItem('token');
    
    // 如果有token，添加到请求头
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
apiClient.interceptors.response.use(
  (response) => {
    // 如果后端返回的不是标准结构，可以在这里进行转换
    if (response.data) {
      // 检查业务层面的错误码
      if (response.data.code !== 0 && response.data.code !== 200) {
        // 避免显示成功消息的同时显示错误消息
        if (response.data.message !== '操作成功') {
          toast({
            title: '请求失败',
            description: response.data.message || '未知错误',
            status: 'error',
            duration: 3000,
            isClosable: true,
          });
        }
        // 如果这是一个认证相关的请求，我们暂时不拒绝，让调用者处理
        if (response.config.url && (
          response.config.url.includes('/auth/login') || 
          response.config.url.includes('/auth/register')
        )) {
          console.log('认证请求返回非零状态码:', response.data);
          return response;
        }
        return Promise.reject(new Error(response.data.message || '请求失败'));
      }
      
      // 避免显示太多成功提示
      if (
        response.config.method !== 'get' && 
        !response.config.url?.includes('/auth/login') && 
        !response.config.url?.includes('/user/current')
      ) {
        toast({
          title: '操作成功',
          status: 'success',
          duration: 2000,
          isClosable: true,
        });
      }
      
      return response;
    }
    return response;
  },
  (error) => {
    // 处理网络错误
    if (error.response) {
      // 服务器返回了错误状态码
      const status = error.response.status;
      
      if (status === 401) {
        // 未授权，清除本地token，跳转到登录页
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // 如果不是登录页面，再跳转
        if (!window.location.href.includes('/auth/login')) {
          window.location.href = '/auth/login';
          toast({
            title: '登录已过期',
            description: '请重新登录',
            status: 'error',
            duration: 3000,
            isClosable: true,
          });
        }
      } else if (status === 403) {
        toast({
          title: '访问被拒绝',
          description: '没有操作权限',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      } else if (status === 500) {
        toast({
          title: '服务器错误',
          description: '请稍后再试',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      } else {
        // 其他错误状态码
        const errorMessage = 
          error.response.data?.message || 
          '请求失败，请稍后再试';
        toast({
          title: '请求失败',
          description: errorMessage,
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    } else if (error.request) {
      // 请求发出但没有收到响应
      toast({
        title: '网络错误',
        description: '请检查网络连接',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } else {
      // 请求配置出错
      toast({
        title: '请求错误',
        description: '请求配置错误',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
    
    return Promise.reject(error);
  }
);

export default apiClient; 