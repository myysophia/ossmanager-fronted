import { useRouter } from 'next/navigation';
import { useState, useCallback, useEffect } from 'react';
import { AuthAPI, User, LoginParams, RegisterParams } from '../api';
import { createStandaloneToast } from '@chakra-ui/react';
import { handleTokenExpired, isAuthError } from '../utils/auth';

const { toast } = createStandaloneToast();

/**
 * 认证相关的自定义Hook
 * @returns 认证相关状态和方法
 */
export const useAuth = () => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  /**
   * 初始化用户状态
   */
  const initialize = useCallback(async () => {
    try {
      setLoading(true);
      // 检查本地存储中是否有用户信息
      const storedUser = AuthAPI.getStoredUser();
      
      if (storedUser) {
        // 如果有用户信息，尝试从服务器获取最新信息
        try {
          const currentUser = await AuthAPI.getCurrentUser();
          setUser(currentUser);
          // 更新本地存储
          localStorage.setItem('user', JSON.stringify(currentUser));
        } catch (error) {
          // 如果是认证错误，清除本地存储并重定向
          if (isAuthError(error)) {
            setUser(null);
            handleTokenExpired();
            return;
          }
          // 其他错误，使用缓存的用户信息
          setUser(storedUser);
        }
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('初始化用户状态失败', error);
      setUser(null);
    } finally {
      setLoading(false);
      setInitialized(true);
    }
  }, []);

  /**
   * 登录方法
   * @param params 登录参数
   */
  const login = useCallback(async (params: LoginParams) => {
    try {
      setLoading(true);
      const response = await AuthAPI.login(params);
      setUser(response.user);
      
      toast({
        title: '登录成功',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      router.push('/main/dashboard');
      return true;
    } catch (error) {
      console.error('登录失败', error);
      return false;
    } finally {
      setLoading(false);
    }
  }, [router]);

  /**
   * 注册方法
   * @param params 注册参数
   */
  const register = useCallback(async (params: RegisterParams) => {
    try {
      setLoading(true);
      await AuthAPI.register(params);
      
      toast({
        title: '注册成功',
        description: '请登录您的账号',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      router.push('/auth/login');
      return true;
    } catch (error) {
      console.error('注册失败', error);
      return false;
    } finally {
      setLoading(false);
    }
  }, [router]);

  /**
   * 登出方法
   */
  const logout = useCallback(async () => {
    try {
      setLoading(true);
      await AuthAPI.logout();
      setUser(null);
      
      toast({
        title: '已登出',
        status: 'info',
        duration: 3000,
        isClosable: true,
      });
      
      router.push('/auth/login');
    } catch (error) {
      console.error('登出失败', error);
    } finally {
      setLoading(false);
    }
  }, [router]);

  // 组件挂载时初始化
  useEffect(() => {
    if (!initialized) {
      initialize();
    }
  }, [initialize, initialized]);

  return {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    initialize,
  };
}; 