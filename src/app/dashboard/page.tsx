'use client';

import { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  SimpleGrid,
  Card,
  CardBody,
} from '@chakra-ui/react';

interface DashboardStats {
  todayUploads: number;
  todayDownloads: number;
  totalFiles: number;
  totalUsers: number;
  storageUsage: {
    used: number;
    total: number;
  };
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    todayUploads: 0,
    todayDownloads: 0,
    totalFiles: 0,
    totalUsers: 0,
    storageUsage: {
      used: 0,
      total: 100
    }
  });
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 模拟从API获取数据
    setTimeout(() => {
      setStats({
        todayUploads: 25,
        todayDownloads: 42,
        totalFiles: 156,
        totalUsers: 12,
        storageUsage: {
          used: 35,
          total: 100
        }
      });
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return (
      <Container maxW="container.xl" py={10}>
        <Text>加载中...</Text>
      </Container>
    );
  }

  return (
    <Container maxW="container.xl" py={10}>
      <Box mb={10}>
        <Heading size="lg" mb={6}>系统概览</Heading>
        
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
          <Card>
            <CardBody>
              <Heading size="md" mb={2}>今日上传</Heading>
              <Text fontSize="2xl">{stats.todayUploads}</Text>
            </CardBody>
          </Card>
          
          <Card>
            <CardBody>
              <Heading size="md" mb={2}>今日下载</Heading>
              <Text fontSize="2xl">{stats.todayDownloads}</Text>
            </CardBody>
          </Card>
          
          <Card>
            <CardBody>
              <Heading size="md" mb={2}>文件总数</Heading>
              <Text fontSize="2xl">{stats.totalFiles}</Text>
            </CardBody>
          </Card>
          
          <Card>
            <CardBody>
              <Heading size="md" mb={2}>用户总数</Heading>
              <Text fontSize="2xl">{stats.totalUsers}</Text>
            </CardBody>
          </Card>
        </SimpleGrid>
      </Box>
      
      <Box>
        <Heading size="lg" mb={6}>存储使用情况</Heading>
        <Card>
          <CardBody>
            <Text mb={2}>使用率: {stats.storageUsage.used}%</Text>
            <Box bg="gray.100" h="8px" borderRadius="full" overflow="hidden">
              <Box 
                bg="blue.500" 
                h="100%" 
                w={`${stats.storageUsage.used}%`} 
                borderRadius="full"
              />
            </Box>
          </CardBody>
        </Card>
      </Box>
    </Container>
  );
} 