'use client';

import {
  Box,
  Container,
  Heading,
  Text,
  SimpleGrid,
  Card,
  CardBody,
} from '@chakra-ui/react';

export interface DashboardStats {
  todayUploads: number;
  todayDownloads: number;
  totalFiles: number;
  totalUsers: number;
  storageUsage: {
    used: number;
    total: number;
  };
}

export default function DashboardContent({ initialStats }: { initialStats: DashboardStats }) {
  return (
    <Container maxW="container.xl" py={10}>
      <Box mb={10}>
        <Heading size="lg" mb={6}>系统概览</Heading>
        
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
          <Card>
            <CardBody>
              <Heading size="md" mb={2}>今日上传</Heading>
              <Text fontSize="2xl">{initialStats.todayUploads}</Text>
            </CardBody>
          </Card>
          
          <Card>
            <CardBody>
              <Heading size="md" mb={2}>今日下载</Heading>
              <Text fontSize="2xl">{initialStats.todayDownloads}</Text>
            </CardBody>
          </Card>
          
          <Card>
            <CardBody>
              <Heading size="md" mb={2}>文件总数</Heading>
              <Text fontSize="2xl">{initialStats.totalFiles}</Text>
            </CardBody>
          </Card>
          
          <Card>
            <CardBody>
              <Heading size="md" mb={2}>用户总数</Heading>
              <Text fontSize="2xl">{initialStats.totalUsers}</Text>
            </CardBody>
          </Card>
        </SimpleGrid>
      </Box>
      
      <Box>
        <Heading size="lg" mb={6}>存储使用情况</Heading>
        <Card>
          <CardBody>
            <Text mb={2}>使用率: {initialStats.storageUsage.used}%</Text>
            <Box bg="gray.100" h="8px" borderRadius="full" overflow="hidden">
              <Box 
                bg="blue.500" 
                h="100%" 
                w={`${initialStats.storageUsage.used}%`} 
                borderRadius="full"
              />
            </Box>
          </CardBody>
        </Card>
      </Box>
    </Container>
  );
} 