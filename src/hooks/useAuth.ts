import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api/axios';
import { handleTokenExpired, isAuthError } from '@/lib/utils/auth';

interface User {
  id: number;
  username: string;
  email?: string;
  permissions: Permission[];
}

interface Permission {
  id: number;
  resource: string;
  action: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // 首先尝试从localStorage快速获取用户信息，减少闪烁
    const userStr = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    // 如果有token但没有cookie，设置cookie
    if (token && !document.cookie.includes('token=')) {
      const isProduction = process.env.NODE_ENV === 'production';
      document.cookie = `token=${token}; path=/; ${isProduction ? 'secure;' : ''} samesite=strict; max-age=86400`;
    }
    
    if (userStr) {
      try {
        const cachedUser = JSON.parse(userStr);
        if (cachedUser && cachedUser.permissions) {
          setUser(cachedUser);
          setLoading(false); // 立即设置为false，避免闪烁
        }
      } catch (error) {
        console.error('解析本地用户数据失败:', error);
      }
    }
    
    // 然后异步验证用户信息
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await apiClient.get('/user/current');
      const userData = res.data;
      
      if (userData && userData.permissions) {
        const processedUserData = {
          ...userData,
          permissions: Array.isArray(userData.permissions) ? userData.permissions : []
        };
        setUser(processedUserData);
        localStorage.setItem('user', JSON.stringify(processedUserData));
      } else {
        // 回退到本地存储
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const cachedUser = JSON.parse(userStr);
          setUser(cachedUser);
        } else {
          router.push('/auth/login');
        }
      }
    } catch (error) {
      console.error('认证检查失败:', error);
      // 如果是401认证错误，使用统一的处理函数
      if (isAuthError(error)) {
        setUser(null);
        handleTokenExpired();
        return;
      }
      
      // 其他错误，尝试使用缓存的用户信息
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const cachedUser = JSON.parse(userStr);
        setUser(cachedUser);
      } else {
        router.push('/auth/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const hasPermission = (resource: string, action?: string): boolean => {
    if (!user || !user.permissions) return false;
    
    return user.permissions.some((permission) => {
      if (action) {
        return permission.resource === resource && permission.action === action;
      }
      return permission.resource === resource;
    });
  };

  const hasManagerPermission = (): boolean => {
    return hasPermission('MANAGER');
  };

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    // 清除cookie
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    setUser(null);
    router.push('/auth/login');
  };

  return {
    user,
    loading,
    hasPermission,
    hasManagerPermission,
    logout,
    checkAuth
  };
}; 