import { useState, useCallback } from 'react';
import { AuditAPI, AuditLog, AuditLogQueryParams } from '../api';
import { createStandaloneToast } from '@chakra-ui/react';

const { toast } = createStandaloneToast();

/**
 * 审计日志相关的自定义Hook
 * @returns 审计日志相关状态和方法
 */
export const useAudit = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  /**
   * 获取审计日志列表
   * @param params 查询参数
   */
  const fetchLogs = useCallback(async (params?: AuditLogQueryParams) => {
    try {
      setLoading(true);
      const query = {
        page: currentPage,
        page_size: pageSize,
        ...params,
      };
      
      const response = await AuditAPI.getLogs(query);
      
      setLogs(response.items);
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
      console.error('获取审计日志失败', error);
      toast({
        title: '获取审计日志失败',
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
   * 导出审计日志
   * @param params 查询参数
   */
  const exportLogs = useCallback(async (params?: AuditLogQueryParams) => {
    try {
      setLoading(true);
      await AuditAPI.exportLogs(params);
      
      toast({
        title: '导出成功',
        description: '审计日志已开始下载',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      return true;
    } catch (error) {
      console.error('导出审计日志失败', error);
      toast({
        title: '导出失败',
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
    logs,
    total,
    loading,
    currentPage,
    pageSize,
    fetchLogs,
    exportLogs,
  };
}; 