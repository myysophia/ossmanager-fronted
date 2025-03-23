import { useState, useCallback } from 'react';
import { FileAPI, OSSFile, FileQueryParams, PageResponse } from '../api';
import { createStandaloneToast } from '@chakra-ui/react';

const { toast } = createStandaloneToast();

/**
 * 文件操作相关的自定义Hook
 * @returns 文件操作相关状态和方法
 */
export const useFiles = () => {
  const [files, setFiles] = useState<OSSFile[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  /**
   * 获取文件列表
   * @param params 查询参数
   */
  const fetchFiles = useCallback(async (params?: FileQueryParams) => {
    try {
      setLoading(true);
      const query = {
        page: currentPage,
        page_size: pageSize,
        ...params,
      };
      
      const response = await FileAPI.getFiles(query);
      
      setFiles(response.items);
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
      console.error('获取文件列表失败', error);
      toast({
        title: '获取文件列表失败',
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
   * 上传文件
   * @param file 文件对象
   * @param storageType 存储类型
   */
  const uploadFile = useCallback(async (file: File, storageType?: string) => {
    try {
      setLoading(true);
      const uploadedFile = await FileAPI.uploadFile(file, storageType);
      
      toast({
        title: '上传成功',
        description: `文件 ${file.name} 上传成功`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      // 刷新文件列表
      fetchFiles();
      
      return uploadedFile;
    } catch (error) {
      console.error('上传文件失败', error);
      toast({
        title: '上传失败',
        description: `文件 ${file.name} 上传失败`,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      
      return null;
    } finally {
      setLoading(false);
    }
  }, [fetchFiles]);

  /**
   * 删除文件
   * @param id 文件ID
   */
  const deleteFile = useCallback(async (id: number) => {
    try {
      setLoading(true);
      await FileAPI.deleteFile(id);
      
      toast({
        title: '删除成功',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      // 更新本地文件列表
      setFiles(prevFiles => prevFiles.filter(file => file.id !== id));
      
      return true;
    } catch (error) {
      console.error('删除文件失败', error);
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
   * 获取文件下载链接
   * @param id 文件ID
   */
  const getDownloadUrl = useCallback(async (id: number) => {
    try {
      setLoading(true);
      const response = await FileAPI.getFileDownloadURL(id);
      
      return response.download_url;
    } catch (error) {
      console.error('获取下载链接失败', error);
      toast({
        title: '获取下载链接失败',
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
   * 触发MD5计算
   * @param id 文件ID
   */
  const calculateMD5 = useCallback(async (id: number) => {
    try {
      setLoading(true);
      await FileAPI.triggerMD5Calculation(id);
      
      toast({
        title: 'MD5计算已触发',
        description: '请稍后刷新查看结果',
        status: 'info',
        duration: 3000,
        isClosable: true,
      });
      
      return true;
    } catch (error) {
      console.error('触发MD5计算失败', error);
      toast({
        title: '触发MD5计算失败',
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
   * 获取文件MD5值
   * @param id 文件ID
   */
  const getFileMD5 = useCallback(async (id: number) => {
    try {
      setLoading(true);
      const response = await FileAPI.getFileMD5(id);
      
      return response;
    } catch (error) {
      console.error('获取MD5值失败', error);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    files,
    total,
    loading,
    currentPage,
    pageSize,
    fetchFiles,
    uploadFile,
    deleteFile,
    getDownloadUrl,
    calculateMD5,
    getFileMD5,
  };
}; 