'use client';

import {
  Box,
  Container,
  Heading,
  Text,
  SimpleGrid,
  Icon,
  Flex,
  VStack,
  useColorModeValue,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { FiCloud, FiDatabase, FiLayers, FiShield, FiUpload, FiZap } from 'react-icons/fi';

const MotionFlex = motion(Flex);

const features = [
  {
    title: '多云存储支持',
    description: '支持阿里云OSS、AWS S3、Cloudflare R2等多种云存储服务',
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

export default function DashboardContent() {
  const cardBg = useColorModeValue('white', 'gray.800');
  
  return (
    <Container maxW="container.xl" py={10}>
      <Box>
        <VStack spacing={12}>
          <Box textAlign="center" maxW="container.md" mx="auto">
            <Heading
              as="h1"
              size="2xl"
              mb={6}
              bgGradient="linear(to-r, blue.400, blue.600)"
              bgClip="text"
            >
              开源的云存储文件管理系统
            </Heading>
            <Text fontSize="xl" color="gray.500" mb={8}>
              一个高性能、易扩展的云存储文件管理解决方案，支持多种云存储服务，提供统一的文件管理体验。
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
      </Box>
    </Container>
  );
}