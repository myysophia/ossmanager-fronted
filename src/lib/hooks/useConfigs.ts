import { useState, useCallback } from 'react';
import { ConfigAPI, StorageConfig, StorageConfigInput, ConfigQueryParams } from '../api';
import { createStandaloneToast } from '@chakra-ui/react';

const { toast } = createStandaloneToast();

/**
 * 存储配置相关的自定义Hook
 * @returns 存储配置相关状态和方法
 */
export const useConfigs = () => {
  const [configs, setConfigs] = useState<StorageConfig[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  /**
   * 获取存储配置列表
   * @param params 查询参数
   */
  const fetchConfigs = useCallback(async (params?: ConfigQueryParams) => {
    try {
      setLoading(true);
      const query = {
        page: currentPage,
        page_size: pageSize,
        ...params,
      };
      
      const response = await ConfigAPI.getConfigs(query);
      
      setConfigs(response.items);
      setTotal(response.total);
      
      // 更新分页状态
      if (params?.page) {
        setCurrentPage(params.page);
      }
      
      if (params?.page_size) {
        setPageSize(params.page_size);
      }
      
      return response;
    } catch (error) {
      console.error('获取存储配置列表失败', error);
      toast({
        title: '获取存储配置列表失败',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      
      return null;
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize]);

  /**
   * 获取单个存储配置
   * @param id 配置ID
   */
  const fetchConfigById = useCallback(async (id: number) => {
    try {
      setLoading(true);
      const config = await ConfigAPI.getConfigById(id);
      
      return config;
    } catch (error) {
      console.error('获取存储配置失败', error);
      toast({
        title: '获取存储配置失败',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * 创建存储配置
   * @param config 存储配置信息
   */
  const createConfig = useCallback(async (config: StorageConfigInput) => {
    try {
      setLoading(true);
      const newConfig = await ConfigAPI.createConfig(config);
      
      toast({
        title: '创建成功',
        description: `已创建存储配置：${config.name}`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      // 刷新配置列表
      fetchConfigs();
      
      return newConfig;
    } catch (error) {
      console.error('创建存储配置失败', error);
      toast({
        title: '创建失败',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      
      return null;
    } finally {
      setLoading(false);
    }
  }, [fetchConfigs]);

  /**
   * 更新存储配置
   * @param id 配置ID
   * @param config 存储配置信息
   */
  const updateConfig = useCallback(async (id: number, config: StorageConfigInput) => {
    try {
      setLoading(true);
      const updatedConfig = await ConfigAPI.updateConfig(id, config);
      
      toast({
        title: '更新成功',
        description: `已更新存储配置：${config.name}`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      // 更新本地配置列表
      setConfigs(prevConfigs => 
        prevConfigs.map(item => item.id === id ? updatedConfig : item)
      );
      
      return updatedConfig;
    } catch (error) {
      console.error('更新存储配置失败', error);
      toast({
        title: '更新失败',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * 删除存储配置
   * @param id 配置ID
   */
  const deleteConfig = useCallback(async (id: number) => {
    try {
      setLoading(true);
      await ConfigAPI.deleteConfig(id);
      
      toast({
        title: '删除成功',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      // 更新本地配置列表
      setConfigs(prevConfigs => prevConfigs.filter(config => config.id !== id));
      
      return true;
    } catch (error) {
      console.error('删除存储配置失败', error);
      toast({
        title: '删除失败',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * 设置默认配置
   * @param id 配置ID
   */
  const setDefaultConfig = useCallback(async (id: number) => {
    try {
      setLoading(true);
      await ConfigAPI.setDefaultConfig(id);
      
      toast({
        title: '设置成功',
        description: '已成功设置默认存储配置',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      // 更新本地配置列表
      setConfigs(prevConfigs => 
        prevConfigs.map(config => ({
          ...config,
          is_default: config.id === id,
        }))
      );
      
      return true;
    } catch (error) {
      console.error('设置默认配置失败', error);
      toast({
        title: '设置失败',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * 测试存储配置连接
   * @param id 配置ID
   */
  const testConnection = useCallback(async (id: number) => {
    try {
      setLoading(true);
      const result = await ConfigAPI.testConnection(id);
      
      if (result) {
        toast({
          title: '连接测试成功',
          description: '存储服务可正常连接',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        toast({
          title: '连接测试失败',
          description: '无法连接到存储服务，请检查配置',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
      
      return result;
    } catch (error) {
      console.error('测试连接失败', error);
      toast({
        title: '测试连接失败',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    configs,
    total,
    loading,
    currentPage,
    pageSize,
    fetchConfigs,
    fetchConfigById,
    createConfig,
    updateConfig,
    deleteConfig,
    setDefaultConfig,
    testConnection,
  };
}; 