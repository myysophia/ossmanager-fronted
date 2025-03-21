'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Text,
  Badge,
  Input,
  HStack,
  Button,
  Select,
  Flex,
  useToast,
} from '@chakra-ui/react';
import { FiSearch, FiCalendar } from 'react-icons/fi';

interface AuditLog {
  id: string;
  action: string;
  module: string;
  userId: string;
  username: string;
  ip: string;
  timestamp: string;
  status: 'success' | 'failure';
  details: string;
}

export default function AuditLogPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [moduleFilter, setModuleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateRange, setDateRange] = useState({
    from: '',
    to: '',
  });
  const toast = useToast();

  useEffect(() => {
    // 模拟从API获取数据
    setTimeout(() => {
      const mockLogs: AuditLog[] = [
        {
          id: '1',
          action: '用户登录',
          module: '认证',
          userId: 'user001',
          username: 'admin',
          ip: '192.168.1.1',
          timestamp: '2023-06-15 10:35:22',
          status: 'success',
          details: '管理员登录成功',
        },
        {
          id: '2',
          action: '文件上传',
          module: '存储',
          userId: 'user001',
          username: 'admin',
          ip: '192.168.1.1',
          timestamp: '2023-06-15 10:40:15',
          status: 'success',
          details: '上传文件: 项目计划.pdf',
        },
        {
          id: '3',
          action: '文件下载',
          module: '存储',
          userId: 'user002',
          username: '张三',
          ip: '192.168.1.5',
          timestamp: '2023-06-15 11:20:45',
          status: 'success',
          details: '下载文件: 项目计划.pdf',
        },
        {
          id: '4',
          action: '修改配置',
          module: '设置',
          userId: 'user001',
          username: 'admin',
          ip: '192.168.1.1',
          timestamp: '2023-06-15 14:05:33',
          status: 'success',
          details: '修改存储配置',
        },
        {
          id: '5',
          action: '用户登录',
          module: '认证',
          userId: 'user003',
          username: '李四',
          ip: '192.168.1.10',
          timestamp: '2023-06-15 09:15:12',
          status: 'failure',
          details: '密码错误',
        },
      ];
      setLogs(mockLogs);
      setLoading(false);
    }, 1000);
  }, []);

  const handleSearch = () => {
    setLoading(true);
    // 模拟API搜索
    setTimeout(() => {
      // 这里应该是真实的API调用
      // 使用过滤条件进行搜索
      setLoading(false);
      toast({
        title: '搜索完成',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    }, 500);
  };

  const getStatusBadge = (status: 'success' | 'failure') => {
    return (
      <Badge
        colorScheme={status === 'success' ? 'green' : 'red'}
        px={2}
        py={1}
        borderRadius="full"
      >
        {status === 'success' ? '成功' : '失败'}
      </Badge>
    );
  };

  return (
    <Container maxW="container.xl" py={10}>
      <Box mb={6}>
        <Heading size="lg" mb={4}>审计日志</Heading>
        <Text color="gray.500" mb={6}>
          查看和搜索系统操作记录
        </Text>

        {/* 搜索和过滤区域 */}
        <Flex direction={{ base: 'column', md: 'row' }} gap={4} mb={6}>
          <HStack flex={1}>
            <Input
              placeholder="搜索用户、操作或详情"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Button leftIcon={<FiSearch />} onClick={handleSearch}>
              搜索
            </Button>
          </HStack>
          
          <HStack>
            <Select
              placeholder="模块"
              value={moduleFilter}
              onChange={(e) => setModuleFilter(e.target.value)}
              maxW="150px"
            >
              <option value="认证">认证</option>
              <option value="存储">存储</option>
              <option value="设置">设置</option>
            </Select>
            
            <Select
              placeholder="状态"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              maxW="150px"
            >
              <option value="success">成功</option>
              <option value="failure">失败</option>
            </Select>
          </HStack>
        </Flex>

        <Flex direction={{ base: 'column', md: 'row' }} gap={4} mb={6}>
          <HStack>
            <Text minW="80px">日期范围:</Text>
            <Input
              type="date"
              placeholder="开始日期"
              value={dateRange.from}
              onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
            />
            <Text>至</Text>
            <Input
              type="date"
              placeholder="结束日期"
              value={dateRange.to}
              onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
            />
          </HStack>
        </Flex>

        {/* 日志表格 */}
        {loading ? (
          <Text>加载中...</Text>
        ) : (
          <Box overflowX="auto">
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>时间</Th>
                  <Th>用户</Th>
                  <Th>操作</Th>
                  <Th>模块</Th>
                  <Th>IP地址</Th>
                  <Th>状态</Th>
                  <Th>详情</Th>
                </Tr>
              </Thead>
              <Tbody>
                {logs.map((log) => (
                  <Tr key={log.id}>
                    <Td>{log.timestamp}</Td>
                    <Td>{log.username}</Td>
                    <Td>{log.action}</Td>
                    <Td>{log.module}</Td>
                    <Td>{log.ip}</Td>
                    <Td>{getStatusBadge(log.status)}</Td>
                    <Td>{log.details}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        )}
      </Box>
    </Container>
  );
} 