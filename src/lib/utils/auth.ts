/**
 * 认证相关工具函数
 */

/**
 * 统一处理认证令牌过期
 * 清除所有本地存储和cookie，并重定向到登录页
 */
export const handleTokenExpired = () => {
  if (typeof window === 'undefined') return;
  
  console.log('🔐 认证令牌过期，清除认证信息并重定向到登录页...');
  
  // 清除所有本地存储
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('refreshToken');
  
  // 清除cookie
  document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  
  // 避免重复重定向
  if (!window.location.pathname.includes('/auth/login')) {
    window.location.href = '/auth/login';
  }
};

/**
 * 检查是否是认证错误（401）
 */
export const isAuthError = (error: any): boolean => {
  return error && 
         typeof error === 'object' && 
         ('response' in error && error.response?.status === 401);
};

/**
 * 获取存储的令牌
 */
export const getStoredToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
};

/**
 * 检查用户是否已登录
 */
export const isAuthenticated = (): boolean => {
  return !!getStoredToken();
}; 