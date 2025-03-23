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
  Link,
  FormErrorMessage,
} from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import { AuthAPI } from '@/lib/api';

export default function RegisterPage() {
  const router = useRouter();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    real_name: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.username.trim()) {
      newErrors.username = '用户名不能为空';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = '邮箱不能为空';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = '请输入有效的邮箱地址';
    }
    
    if (!formData.password) {
      newErrors.password = '密码不能为空';
    } else if (formData.password.length < 6) {
      newErrors.password = '密码至少需要6个字符';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = '两次输入的密码不一致';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);

    try {
      // 使用API服务进行注册，发送请求到后端8080端口
      await AuthAPI.register({
        username: formData.username,
        password: formData.password,
        email: formData.email,
        real_name: formData.real_name,
      });

      toast({
        title: '注册成功',
        description: '请使用您的账号登录',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      router.push('/auth/login');
    } catch (error) {
      toast({
        title: '注册失败',
        description: error instanceof Error ? error.message : '注册处理失败，请稍后再试',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    
    // 清除字段的错误信息（当用户开始修改时）
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
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
          <Heading size="lg">注册</Heading>
          
          <FormControl isRequired isInvalid={!!errors.username}>
            <FormLabel>用户名</FormLabel>
            <Input
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="请输入用户名"
            />
            <FormErrorMessage>{errors.username}</FormErrorMessage>
          </FormControl>

          <FormControl isRequired isInvalid={!!errors.email}>
            <FormLabel>邮箱</FormLabel>
            <Input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="请输入邮箱"
            />
            <FormErrorMessage>{errors.email}</FormErrorMessage>
          </FormControl>

          <FormControl>
            <FormLabel>真实姓名</FormLabel>
            <Input
              name="real_name"
              value={formData.real_name}
              onChange={handleChange}
              placeholder="请输入真实姓名（可选）"
            />
          </FormControl>

          <FormControl isRequired isInvalid={!!errors.password}>
            <FormLabel>密码</FormLabel>
            <Input
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="请输入密码"
            />
            <FormErrorMessage>{errors.password}</FormErrorMessage>
          </FormControl>

          <FormControl isRequired isInvalid={!!errors.confirmPassword}>
            <FormLabel>确认密码</FormLabel>
            <Input
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="请再次输入密码"
            />
            <FormErrorMessage>{errors.confirmPassword}</FormErrorMessage>
          </FormControl>

          <Button
            type="submit"
            colorScheme="blue"
            width="full"
            loadingText="注册中..."
            isLoading={isLoading}
          >
            注册
          </Button>

          <Text>
            已有账号？{' '}
            <Link href="/auth/login" color="blue.500">
              立即登录
            </Link>
          </Text>
        </Stack>
      </Box>
    </Container>
  );
} 