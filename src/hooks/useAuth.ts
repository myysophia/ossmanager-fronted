import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api/axios';

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