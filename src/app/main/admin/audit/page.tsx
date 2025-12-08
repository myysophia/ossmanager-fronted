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
import apiClient from '@/lib/api/axios';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { debug } from 'console';

interface AuditLog {
  id: number;
  created_at: string;
  user_id: number;
  username: string;
  action: string;
  resource_type: string;
  resource_id: string;
  details: string;
  ip_address: string;
  user_agent: string;
  status: string;
}

// RFC3339 格式化函数
function toRFC3339(local: string): string | undefined {
  if (!local) return undefined;
  const date = new Date(local);
  const pad = (n: number) => n.toString().padStart(2, '0');
  const yyyy = date.getFullYear();
  const MM = pad(date.getMonth() + 1);
  const dd = pad(date.getDate());
  const hh = pad(date.getHours());
  const mm = pad(date.getMinutes());
  const ss = pad(date.getSeconds());
  const offset = -date.getTimezoneOffset();
  const sign = offset >= 0 ? '+' : '-';
  const absOffset = Math.abs(offset);
  const offsetHH = pad(Math.floor(absOffset / 60));
  const offsetMM = pad(absOffset % 60);
  return `${yyyy}-${MM}-${dd}T${hh}:${mm}:${ss}${sign}${offsetHH}:${offsetMM}`;
}

function AuditLogPageContent() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    from: '',
    to: '',
  });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const toast = useToast();

  // 获取审计日志
  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params: any = {
        page,
        page_size: pageSize,
      };
      if (dateRange.from) params.start_time = toRFC3339(dateRange.from);
      if (dateRange.to) params.end_time = toRFC3339(dateRange.to);
      const res = await apiClient.get('/audit/logs', { params });
      const data = res.data;
      if (data && data.items) {
        setLogs(data.items);
        setTotal(data.total || 0);
      } else {
        setLogs([]);
        setTotal(0);
        toast({ title: '获取日志失败', status: 'error', duration: 2000, isClosable: true });
      }
    } catch (e) {
      setLogs([]);
      setTotal(0);
      toast({ title: '获取日志失败', status: 'error', duration: 2000, isClosable: true });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    // eslint-disable-next-line
  }, [page, pageSize, dateRange.from, dateRange.to]);

  const handleSearch = () => {
    setPage(1);
    fetchLogs();
    toast({
      title: '搜索完成',
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  };

  const getStatusBadge = (status: string) => {
    const isSuccess = status === '200' || status === 'success';
    return (
      <Badge
        colorScheme={isSuccess ? 'green' : 'red'}
        px={2}
        py={1}
        borderRadius="full"
      >
        {isSuccess ? '成功' : '失败'}
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
        <Flex direction={{ base: 'column', md: 'row' }} gap={4} mb={6}>
          <HStack flex={1}>
            <Text minW="80px">时间范围:</Text>
            <Input
              type="datetime-local"
              placeholder="开始时间"
              value={dateRange.from}
              onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
            />
            <Text>至</Text>
            <Input
              type="datetime-local"
              placeholder="结束时间"
              value={dateRange.to}
              onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
            />
            <Button leftIcon={<FiCalendar />} onClick={handleSearch}>
              搜索
            </Button>
          </HStack>
        </Flex>
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
                  <Th>资源类型</Th>
                  <Th>资源ID</Th>
                  <Th>IP地址</Th>
                  <Th>状态</Th>
                  <Th>详情</Th>
                </Tr>
              </Thead>
              <Tbody>
                {logs.map((log) => (
                  <Tr key={log.id}>
                    <Td>{log.created_at}</Td>
                    <Td>{log.username}</Td>
                    <Td>{log.action}</Td>
                    <Td>{log.resource_type}</Td>
                    <Td>{log.resource_id}</Td>
                    <Td>{log.ip_address}</Td>
                    <Td>{getStatusBadge(log.status)}</Td>
                    <Td>
                      <Text maxW="300px" whiteSpace="pre-wrap" wordBreak="break-all">
                        {log.details}
                      </Text>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
            {/* 分页控件 */}
            <Flex justify="space-between" align="center" mt={4}>
              <Button
                onClick={() => setPage(page - 1)}
                isDisabled={page === 1}
              >
                上一页
              </Button>
              <Text>
                第 {page} 页 / 共 {Math.ceil(total / pageSize) || 1} 页（共 {total} 条）
              </Text>
              <Button
                onClick={() => setPage(page + 1)}
                isDisabled={page * pageSize >= total}
              >
                下一页
              </Button>
              <Select
                value={pageSize}
                onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }}
                width="100px"
                ml={4}
              >
                <option value={10}>10条/页</option>
                <option value={20}>20条/页</option>
                <option value={50}>50条/页</option>
                <option value={100}>100条/页</option>
              </Select>
            </Flex>
          </Box>
        )}
      </Box>
    </Container>
  );
}

export default function AuditLogPage() {
  return (
    <ProtectedRoute requireManager>
      <AuditLogPageContent />
    </ProtectedRoute>
  );
} 