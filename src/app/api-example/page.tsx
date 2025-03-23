'use client';

import { useState, useEffect } from 'react';
import { 
  Box, 
  Heading, 
  Text, 
  Button, 
  VStack, 
  HStack, 
  useToast, 
  Divider,
  Container
} from '@chakra-ui/react';
import { AuthAPI, AdminAPI, FileAPI, ConfigAPI } from '@/lib/api';

export default function ApiExamplePage() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const toast = useToast();

  // 演示如何使用AuthAPI
  const handleTestAuth = async () => {
    setLoading(true);
    try {
      // 检查是否已认证
      const isAuth = AuthAPI.isAuthenticated();
      addResult('认证状态', isAuth ? '已登录' : '未登录');
      
      // 如果已认证，获取当前用户
      if (isAuth) {
        const user = AuthAPI.getStoredUser();
        addResult('当前用户', user);
      }
    } catch (error) {
      handleError('认证API测试失败', error);
    } finally {
      setLoading(false);
    }
  };

  // 演示如何使用FileAPI
  const handleTestFiles = async () => {
    setLoading(true);
    try {
      // 获取文件列表 - 发送到8080端口的后端
      const files = await FileAPI.getFiles({ page: 1, page_size: 10 });
      addResult('文件列表', files);
    } catch (error) {
      handleError('文件API测试失败', error);
    } finally {
      setLoading(false);
    }
  };

  // 演示如何使用ConfigAPI
  const handleTestConfigs = async () => {
    setLoading(true);
    try {
      // 获取存储配置列表 - 发送到8080端口的后端
      const configs = await ConfigAPI.getConfigs();
      addResult('存储配置列表', configs);
    } catch (error) {
      handleError('配置API测试失败', error);
    } finally {
      setLoading(false);
    }
  };

  // 演示如何使用AdminAPI
  const handleTestAdmin = async () => {
    setLoading(true);
    try {
      // 获取用户列表 - 发送到8080端口的后端
      const users = await AdminAPI.getUsers();
      addResult('用户列表', users);
    } catch (error) {
      handleError('管理API测试失败', error);
    } finally {
      setLoading(false);
    }
  };
  
  // 添加结果到显示列表
  const addResult = (title: string, data: any) => {
    setResults(prev => [...prev, { title, data, time: new Date().toLocaleTimeString() }]);
  };

  // 处理错误
  const handleError = (title: string, error: any) => {
    const message = error instanceof Error ? error.message : '未知错误';
    toast({
      title,
      description: message,
      status: 'error',
      duration: 5000,
      isClosable: true,
    });
    addResult(title, { error: message });
  };

  // 清除结果
  const handleClear = () => {
    setResults([]);
  };

  return (
    <Container maxW="container.lg" py={10}>
      <VStack spacing={8} align="stretch">
        <Box>
          <Heading as="h1" size="xl" mb={4}>
            API服务示例
          </Heading>
          <Text fontSize="lg" color="gray.600">
            这个页面演示如何使用API服务来与后端(8080端口)进行通信，而不是使用前端的API路由(3000端口)。
          </Text>
        </Box>

        <Divider />

        <HStack spacing={4}>
          <Button 
            colorScheme="blue" 
            onClick={handleTestAuth} 
            isLoading={loading}
          >
            测试认证API
          </Button>
          <Button 
            colorScheme="green" 
            onClick={handleTestFiles} 
            isLoading={loading}
          >
            测试文件API
          </Button>
          <Button 
            colorScheme="purple" 
            onClick={handleTestConfigs} 
            isLoading={loading}
          >
            测试配置API
          </Button>
          <Button 
            colorScheme="red" 
            onClick={handleTestAdmin} 
            isLoading={loading}
          >
            测试管理API
          </Button>
          <Button 
            colorScheme="gray" 
            onClick={handleClear} 
            variant="outline"
          >
            清除结果
          </Button>
        </HStack>

        <Divider />

        <Box>
          <Heading as="h2" size="lg" mb={4}>
            API调用结果
          </Heading>
          <VStack spacing={4} align="stretch">
            {results.length === 0 ? (
              <Text>还没有执行任何API调用。点击上方按钮开始测试。</Text>
            ) : (
              results.map((result, index) => (
                <Box 
                  key={index} 
                  p={4} 
                  borderWidth={1} 
                  borderRadius="md"
                  boxShadow="sm"
                >
                  <HStack mb={2} justifyContent="space-between">
                    <Heading as="h3" size="md">
                      {result.title}
                    </Heading>
                    <Text fontSize="sm" color="gray.500">
                      {result.time}
                    </Text>
                  </HStack>
                  <Box 
                    bg="gray.50" 
                    p={3} 
                    borderRadius="md"
                    overflow="auto"
                    maxH="200px"
                  >
                    <pre>{JSON.stringify(result.data, null, 2)}</pre>
                  </Box>
                </Box>
              ))
            )}
          </VStack>
        </Box>
      </VStack>
    </Container>
  );
} 