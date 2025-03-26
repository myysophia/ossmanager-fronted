'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Input,
  Select,
  Button,
  Text,
  Badge,
  useColorModeValue,
  Pagination,
  useToast,
} from '@chakra-ui/react';
import { FiSearch } from 'react-icons/fi';
import { Pagination as CustomPagination } from '@/components/common/Pagination';

interface AuditLog {
  id: string;
  userId: string;
  username: string;
  action: string;
  resource: string;
  resourceId: string;
  details: string;
  ip: string;
  userAgent: string;
  createdAt: string;
}

interface QueryParams {
  keyword: string;
  action: string;
  resource: string;
  startDate: string;
  endDate: string;
  page: number;
  pageSize: number;
}

export default function AuditLogPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [queryParams, setQueryParams] = useState<QueryParams>({
    keyword: '',
    action: '',
    resource: '',
    startDate: '',
    endDate: '',
    page: 1,
    pageSize: 10,
  });
  const toast = useToast();

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  useEffect(() => {
    fetchLogs();
  }, [queryParams]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/admin/audit-logs?${new URLSearchParams(queryParams as any)}`
      );
      if (!response.ok) {
        throw new Error('获取审计日志失败');
      }
      const data = await response.json();
      setLogs(data.content);
      setTotal(data.total);
    } catch (error) {
      toast({
        title: '获取审计日志失败',
        description: error instanceof Error ? error.message : '未知错误',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQueryParams((prev) => ({
      ...prev,
      keyword: e.target.value,
      page: 1,
    }));
  };

  const handleActionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setQueryParams((prev) => ({
      ...prev,
      action: e.target.value,
      page: 1,
    }));
  };

  const handleResourceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setQueryParams((prev) => ({
      ...prev,
      resource: e.target.value,
      page: 1,
    }));
  };

  const handleDateChange = (
    type: 'startDate' | 'endDate',
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setQueryParams((prev) => ({
      ...prev,
      [type]: e.target.value,
      page: 1,
    }));
  };

  const handlePageChange = (page: number) => {
    setQueryParams((prev) => ({
      ...prev,
      page,
    }));
  };

  const getActionColor = (action: string) => {
    switch (action.toLowerCase()) {
      case 'create':
        return 'green';
      case 'update':
        return 'blue';
      case 'delete':
        return 'red';
      case 'login':
        return 'purple';
      case 'logout':
        return 'orange';
      default:
        return 'gray';
    }
  };

  return (
    <Box p={6}>
      <VStack spacing={6} align="stretch">
        <Text fontSize="2xl" fontWeight="bold">
          审计日志
        </Text>

        <HStack spacing={4}>
          <Input
            placeholder="搜索关键词"
            value={queryParams.keyword}
            onChange={handleSearch}
            maxW="300px"
          />
          <Select
            placeholder="操作类型"
            value={queryParams.action}
            onChange={handleActionChange}
            maxW="200px"
          >
            <option value="create">创建</option>
            <option value="update">更新</option>
            <option value="delete">删除</option>
            <option value="login">登录</option>
            <option value="logout">登出</option>
          </Select>
          <Select
            placeholder="资源类型"
            value={queryParams.resource}
            onChange={handleResourceChange}
            maxW="200px"
          >
            <option value="user">用户</option>
            <option value="role">角色</option>
            <option value="permission">权限</option>
            <option value="file">文件</option>
            <option value="config">配置</option>
          </Select>
          <Input
            type="date"
            value={queryParams.startDate}
            onChange={(e) => handleDateChange('startDate', e)}
            maxW="200px"
          />
          <Input
            type="date"
            value={queryParams.endDate}
            onChange={(e) => handleDateChange('endDate', e)}
            maxW="200px"
          />
        </HStack>

        <Box overflowX="auto">
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>时间</Th>
                <Th>用户</Th>
                <Th>操作</Th>
                <Th>资源</Th>
                <Th>详情</Th>
                <Th>IP地址</Th>
              </Tr>
            </Thead>
            <Tbody>
              {logs.map((log) => (
                <Tr key={log.id}>
                  <Td>{new Date(log.createdAt).toLocaleString()}</Td>
                  <Td>{log.username}</Td>
                  <Td>
                    <Badge colorScheme={getActionColor(log.action)}>
                      {log.action}
                    </Badge>
                  </Td>
                  <Td>{log.resource}</Td>
                  <Td>{log.details}</Td>
                  <Td>{log.ip}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>

        <HStack justify="center">
          <CustomPagination
            currentPage={queryParams.page}
            totalPages={Math.ceil(total / queryParams.pageSize)}
            onPageChange={handlePageChange}
            showSizeChanger
            showQuickJumper
            showTotal={(total) => `共 ${total} 条`}
          />
        </HStack>
      </VStack>
    </Box>
  );
} 