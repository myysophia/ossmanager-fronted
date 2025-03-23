'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Input,
  Stack,
  Heading,
  Text,
  useToast,
  Checkbox,
  Link,
} from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import { LoginRequest } from '@/types/auth';
import { AuthAPI } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<LoginRequest>({
    username: '',
    password: '',
    rememberMe: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // 使用AuthAPI服务发送请求到后端8080端口
      const response = await AuthAPI.login({
        username: formData.username,
        password: formData.password,
      });

      // 确认我们收到了token和用户数据
      if (response && response.token) {
        toast({
          title: '登录成功',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });

        // 短暂延迟，让toast显示完成
        setTimeout(() => {
          router.push('/main/dashboard');
        }, 300);
      } else {
        throw new Error('登录响应缺少必要数据');
      }
    } catch (error) {
      toast({
        title: '登录失败',
        description: error instanceof Error ? error.message : '请检查用户名和密码',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  return (
    <Container maxW="container.sm" py={10}>
      <Box
        p={8}
        borderWidth={1}
        borderRadius="lg"
        boxShadow="lg"
      >
        <Stack spacing={6} as="form" onSubmit={handleSubmit}>
          <Heading size="lg">登录</Heading>
          
          <FormControl isRequired>
            <FormLabel>用户名</FormLabel>
            <Input
              name="username"
              type="text"
              value={formData.username}
              onChange={handleChange}
              placeholder="请输入用户名"
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>密码</FormLabel>
            <Input
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="请输入密码"
            />
          </FormControl>

          <FormControl>
            <Checkbox
              name="rememberMe"
              isChecked={formData.rememberMe}
              onChange={handleChange}
            >
              记住我
            </Checkbox>
          </FormControl>

          <Button
            type="submit"
            colorScheme="blue"
            width="full"
            loadingText="登录中..."
            isLoading={isLoading}
          >
            登录
          </Button>

          <Text>
            还没有账号？{' '}
            <Link href="/auth/register" color="blue.500">
              立即注册
            </Link>
          </Text>
        </Stack>
      </Box>
    </Container>
  );
} 