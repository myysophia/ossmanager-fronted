'use client';

import { useState } from 'react';
import {
  Box,
  Button,
  Checkbox,
  Container,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Link,
  Stack,
  Text,
  useColorModeValue,
  useToast,
  Image,
} from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { AuthAPI } from '@/lib/api/auth';

const MotionBox = motion(Box);
const IllustrationWrapper = motion(Box);

function generateCaptcha() {
  // 生成4位数字验证码
  return Math.random().toString().slice(2, 6);
}

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [captcha, setCaptcha] = useState(generateCaptcha());
  const [captchaInput, setCaptchaInput] = useState('');
  const [captchaError, setCaptchaError] = useState('');
  const router = useRouter();
  const toast = useToast();

  const refreshCaptcha = () => {
    setCaptcha(generateCaptcha());
    setCaptchaInput('');
    setCaptchaError('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setCaptchaError('');
    if (captchaInput !== captcha) {
      setCaptchaError('验证码错误');
      refreshCaptcha();
      return;
    }
    setIsLoading(true);
    try {
      const response = await AuthAPI.login({
        username: email,
        password: password,
      });
      if (response) {
        toast({
          title: '登录成功',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        router.push('/main/dashboard');
      }
    } catch (error) {
      toast({
        title: '登录失败',
        description: error instanceof Error ? error.message : '未知错误',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Flex minH="100vh" direction={{ base: 'column', md: 'row' }}>
      {/* 左侧插图部分 */}
      <Box
        flex="1"
        bg={useColorModeValue('blue.700', 'blue.900')}
        color="white"
        position="relative"
        overflow="hidden"
      >
        {/* Logo */}
        <Box
          position="absolute"
          top="4"
          left="4"
          display="flex"
          alignItems="center"
          zIndex="1"
        >
          <Image
            src="/logo.svg"
            alt="OSS Management System"
            height="40px"
            mr={3}
          />
          <Text fontSize="xl" fontWeight="bold">
            OSS Manager
          </Text>
        </Box>
        
        {/* 背景装饰 */}
        <Box
          position="absolute"
          top="0"
          left="0"
          right="0"
          bottom="0"
          opacity="0.1"
          bgImage="url('/pattern.svg')"
          bgRepeat="repeat"
        />

        {/* 主要内容区域 */}
        <Flex
          height="100%"
          direction="column"
          alignItems="center"
          justifyContent="center"
          position="relative"
          p={8}
          textAlign="center"
        >
          {/* 标题和描述 */}
          <Box mb={8} maxW="480px">
            <Heading
              as="h1"
              size="2xl"
              mb={4}
              bgGradient="linear(to-r, white, blue.200)"
              bgClip="text"
            >
              OSS 文件管理系统
            </Heading>
            <Text
              fontSize="lg"
              color="blue.100"
              maxW="400px"
              mx="auto"
            >
              一个高效的oss文件管理的Web工具
            </Text>
          </Box>

          {/* 主要插图 */}
          <IllustrationWrapper
            position="relative"
            w="full"
            maxW="600px"
            initial={{ y: 0 }}
            animate={{
              y: [0, -10, 0],
              transition: {
                duration: 4,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut"
              }
            }}
            style={{
              perspective: "1000px",
              transformStyle: "preserve-3d"
            }}
          >
            <Box
              position="relative"
              transform="translateZ(0)"
              _before={{
                content: '""',
                position: "absolute",
                bottom: "-20px",
                left: "50%",
                transform: "translateX(-50%)",
                width: "70%",
                height: "20px",
                background: "rgba(0, 0, 0, 0.1)",
                filter: "blur(10px)",
                borderRadius: "50%",
                animation: "shadowPulse 4s ease-in-out infinite"
              }}
              sx={{
                "@keyframes shadowPulse": {
                  "0%, 100%": {
                    transform: "translateX(-50%) scale(1)",
                    opacity: 0.3
                  },
                  "50%": {
                    transform: "translateX(-50%) scale(0.9)",
                    opacity: 0.2
                  }
                }
              }}
            >
              <Image
                src="/login-illustration.svg"
                alt="System Illustration"
                w="full"
                h="auto"
                style={{
                  transform: "translateZ(20px)",
                  transformStyle: "preserve-3d"
                }}
              />
            </Box>
          </IllustrationWrapper>

          {/* 装饰元素 */}
          <Box
            position="absolute"
            top="20%"
            left="15%"
            as={motion.div}
            animate={{
              y: [0, -15, 0],
              transition: {
                duration: 3,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut",
                delay: 0.5
              }
            }}
          >
            <Box
              w="10px"
              h="10px"
              bg="blue.200"
              borderRadius="full"
              opacity={0.6}
            />
          </Box>

          <Box
            position="absolute"
            bottom="25%"
            right="15%"
            as={motion.div}
            animate={{
              y: [0, -20, 0],
              transition: {
                duration: 3.5,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut",
                delay: 1
              }
            }}
          >
            <Box
              w="8px"
              h="8px"
              bg="green.300"
              borderRadius="full"
              opacity={0.6}
            />
          </Box>
        </Flex>

        {/* 底部渐变 */}
        <Box
          position="absolute"
          bottom="0"
          left="0"
          right="0"
          height="200px"
          bgGradient="linear(to-t, blue.800, transparent)"
          pointerEvents="none"
        />
      </Box>

      {/* 右侧登录表单部分 */}
      <Flex
        flex="1"
        align="center"
        justify="center"
        bg={useColorModeValue('gray.50', 'gray.900')}
        p={8}
      >
        <MotionBox
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          w="full"
          maxW="md"
          p={8}
          borderRadius="xl"
          bg={useColorModeValue('white', 'gray.800')}
          boxShadow="xl"
        >
          <Stack spacing={6}>
            <Stack spacing={2}>
              <Heading size="lg">欢迎回来 👋🏻</Heading>
            </Stack>

            <form onSubmit={handleLogin}>
              <Stack spacing={5}>
                <FormControl isRequired>
                  <FormLabel>用户名</FormLabel>
                  <Input
                    type="text"
                    placeholder="请输入您的用户名"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    size="lg"
                    borderRadius="md"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>密码</FormLabel>
                  <Input
                    type="password"
                    placeholder="请输入您的密码"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    size="lg"
                    borderRadius="md"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>验证码</FormLabel>
                  <Flex align="center">
                    <Input
                      type="text"
                      placeholder="请输入验证码"
                      value={captchaInput}
                      onChange={(e) => setCaptchaInput(e.target.value)}
                      size="lg"
                      borderRadius="md"
                      maxLength={4}
                    />
                    <Box
                      ml={3}
                      px={3}
                      py={2}
                      bg={useColorModeValue('gray.200', 'gray.600')}
                      borderRadius="md"
                      fontWeight="bold"
                      fontSize="lg"
                      letterSpacing="4px"
                      cursor="pointer"
                      userSelect="none"
                      onClick={refreshCaptcha}
                      title="点击刷新验证码"
                    >
                      {captcha}
                    </Box>
                  </Flex>
                  {captchaError && (
                    <Text color="red.500" fontSize="sm" mt={1}>{captchaError}</Text>
                  )}
                </FormControl>

                <Stack spacing={5}>
                  <Flex justify="space-between" align="center">
                    <Checkbox
                      isChecked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      colorScheme="blue"
                    >
                      记住我
                    </Checkbox>
                    {/* <Link
                      color="blue.500"
                      href="/auth/forgot-password"
                      _hover={{ textDecoration: 'underline' }}
                    >
                      忘记密码？
                    </Link> */}
                  </Flex>

                  <Button
                    type="submit"
                    colorScheme="blue"
                    size="lg"
                    fontSize="md"
                    isLoading={isLoading}
                    _hover={{
                      transform: 'translateY(-2px)',
                      boxShadow: 'lg',
                    }}
                    _active={{
                      transform: 'translateY(0)',
                      boxShadow: 'md',
                    }}
                  >
                    登录
                  </Button>
                </Stack>
              </Stack>
            </form>

            {/* <Text align="center">
              还没有账号？{' '}
              <Link
                color="blue.500"
                href="/auth/register"
                _hover={{ textDecoration: 'underline' }}
              >
                立即注册
              </Link>
            </Text> */}
          </Stack>
        </MotionBox>
      </Flex>
    </Flex>
  );
}