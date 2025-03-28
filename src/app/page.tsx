'use client';

import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  Icon,
  SimpleGrid,
  Stack,
  Text,
  useColorModeValue,
  VStack,
  Image,
} from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FiCloud, FiDatabase, FiLayers, FiShield, FiUpload, FiZap } from 'react-icons/fi';

const MotionBox = motion(Box);
const MotionFlex = motion(Flex);

const features = [
  {
    title: '多云存储支持',
    description: '支持阿里云OSS、AWS S3、Cloudflare R2等多种云存储服务(V2.0将支持更多云存储服务,当前版本只支持阿里云oss)',
    icon: FiCloud,
    color: 'blue.500',
  },
  {
    title: '高性能文件处理',
    description: '采用流式处理和并发上传，提供极致的文件传输体验',
    icon: FiZap,
    color: 'yellow.500',
  },
  {
    title: '文件管理',
    description: '强大的文件管理功能，支持批量操作、文件预览和版本控制',
    icon: FiDatabase,
    color: 'green.500',
  },
  {
    title: '安全可靠',
    description: '完善的权限控制和审计日志，确保文件访问安全',
    icon: FiShield,
    color: 'purple.500',
  },
  {
    title: '便捷上传',
    description: '支持拖拽上传、大文件断点续传、文件秒传等功能',
    icon: FiUpload,
    color: 'red.500',
  },
  {
    title: '系统集成',
    description: '提供完整的API接口，便于与其他系统集成',
    icon: FiLayers,
    color: 'orange.500',
  },
];

export default function HomePage() {
  const router = useRouter();
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');

  return (
    <Box bg={bgColor} minH="100vh">
      {/* Hero Section */}
      <Container maxW="container.xl" pt={{ base: 20, md: 32 }} pb={20}>
        <Stack direction={{ base: 'column', md: 'row' }} spacing={8} align="center">
          <MotionBox
            flex={1}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Heading
              as="h1"
              size="2xl"
              mb={6}
              bgGradient="linear(to-r, blue.400, blue.600)"
              bgClip="text"
            >
              Nova 云存储文件管理系统
            </Heading>
            <Text fontSize="xl" color="gray.500" mb={8}>
              一个高性能、易扩展的云存储文件管理解决方案，支持多种云存储服务，提供统一的文件管理体验。
            </Text>
            <Stack direction={{ base: 'column', sm: 'row' }} spacing={4}>
              <Button
                size="lg"
                colorScheme="blue"
                onClick={() => router.push('/auth/login')}
                _hover={{
                  transform: 'translateY(-2px)',
                  boxShadow: 'lg',
                }}
              >
                立即使用
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => router.push('https://baidu.com')}
              >
                查看文档
              </Button>
            </Stack>
          </MotionBox>

          <MotionBox
            flex={1}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Image
              src="/login-illustration.svg"
              alt="Hero Illustration"
              w="full"
              h="auto"
              maxW="600px"
            />
          </MotionBox>
        </Stack>
      </Container>

      {/* Features Section */}
      <Box bg={cardBg} py={20}>
        <Container maxW="container.xl">
          <VStack spacing={12}>
            <Box textAlign="center" maxW="container.md" mx="auto">
              <Heading mb={4}>核心功能</Heading>
              <Text fontSize="lg" color="gray.500">
                提供全面的文件管理解决方案，满足各种业务场景需求
              </Text>
            </Box>

            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8} w="full">
              {features.map((feature, index) => (
                <MotionFlex
                  key={index}
                  p={8}
                  bg={cardBg}
                  borderRadius="lg"
                  boxShadow="md"
                  direction="column"
                  align="start"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  _hover={{
                    transform: 'translateY(-4px)',
                    boxShadow: 'lg',
                    transition: 'all 0.3s ease',
                  }}
                >
                  <Flex
                    w={12}
                    h={12}
                    align="center"
                    justify="center"
                    borderRadius="full"
                    bg={feature.color}
                    color="white"
                    mb={4}
                  >
                    <Icon as={feature.icon} boxSize={6} />
                  </Flex>
                  <Heading size="md" mb={2}>
                    {feature.title}
                  </Heading>
                  <Text color="gray.500">{feature.description}</Text>
                </MotionFlex>
              ))}
            </SimpleGrid>
          </VStack>
        </Container>
      </Box>

      {/* Footer */}
      <Box py={8} textAlign="center" color="gray.500">
        <Text>© 2024 OSS Manager. All rights reserved.</Text>
      </Box>
    </Box>
  );
}
