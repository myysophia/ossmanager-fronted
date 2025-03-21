'use client';

import { useState } from 'react';
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
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('登录失败');
      }

      const data = await response.json();
      
      // 存储token和用户信息
      localStorage.setItem('token', data.token);
      localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('user', JSON.stringify(data.user));

      toast({
        title: '登录成功',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      router.push('/dashboard');
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