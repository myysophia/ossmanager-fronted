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
  Card,
  CardBody,
  useToken,
  useColorMode,
  Stack,
} from '@chakra-ui/react';
import { motion, type AnimationProps } from 'framer-motion';
import { FiCloud, FiDatabase, FiLayers, FiShield, FiUpload, FiZap } from 'react-icons/fi';

const MotionFlex = motion(Flex);
const MotionBox = motion(Box);

// 动画配置
const fadeInUp: AnimationProps = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

const cardAnimation = (index: number): AnimationProps => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay: index * 0.1 },
});

const features = [
  {
    title: '多云存储支持',
    description: '支持阿里云OSS、AWS S3、Cloudflare R2等多种云存储服务',
    icon: FiCloud,
    color: 'primary.500',
    darkColor: 'primary.300',
  },
  {
    title: '高性能文件处理',
    description: '采用流式处理和并发上传，提供极致的文件传输体验',
    icon: FiZap,
    color: 'accent.500',
    darkColor: 'accent.300',
  },
  {
    title: '文件管理',
    description: '强大的文件管理功能，支持批量操作、文件预览和版本控制',
    icon: FiDatabase,
    color: 'secondary.500',
    darkColor: 'secondary.300',
  },
  {
    title: '安全可靠',
    description: '完善的权限控制和审计日志，确保文件访问安全',
    icon: FiShield,
    color: 'primary.600',
    darkColor: 'primary.400',
  },
  {
    title: '便捷上传',
    description: '支持拖拽上传、大文件断点续传、文件秒传等功能',
    icon: FiUpload,
    color: 'accent.600',
    darkColor: 'accent.400',
  },
  {
    title: '系统集成',
    description: '提供完整的API接口，便于与其他系统集成',
    icon: FiLayers,
    color: 'secondary.600',
    darkColor: 'secondary.400',
  },
];

export default function DashboardContent() {
  const { colorMode } = useColorMode();
  const isDark = colorMode === 'dark';

  // 使用语义化的颜色令牌
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const containerBg = useColorModeValue('white', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const headingColor = useColorModeValue('gray.900', 'white');
  
  // 获取渐变色的token值
  const [primary300, primary400, primary500, primary600] = useToken(
    'colors',
    ['primary.300', 'primary.400', 'primary.500', 'primary.600']
  );
  
  const gradientColors = isDark 
    ? `${primary300}, ${primary400}`
    : `${primary500}, ${primary600}`;
  
  return (
    <Box 
      bg={bgColor} 
      minH="100vh" 
      py={{ base: 4, sm: 6, md: 8, lg: 10 }}
      px={{ base: 2, sm: 4, md: 6 }}
    >
      <Container 
        maxW="container.xl" 
        bg={containerBg}
        borderRadius={{ base: "lg", md: "xl" }}
        p={{ base: 4, sm: 6, md: 8, lg: 10 }}
        boxShadow={isDark ? 'dark-lg' : 'xl'}
        mx="auto"
        w="full"
      >
        <Stack
          spacing={{ base: 8, md: 12, lg: 16 }}
          align="center"
          direction="column"
        >
          {/* Hero Section */}
          <Box textAlign="center" w="full">
            <MotionBox {...fadeInUp}>
              <Heading
                as="h1"
                fontSize={{ base: "2xl", sm: "3xl", md: "4xl", lg: "5xl" }}
                mb={{ base: 3, md: 4, lg: 6 }}
                bgGradient={`linear(to-r, ${gradientColors})`}
                bgClip="text"
                letterSpacing="tight"
                lineHeight="shorter"
              >
                Nova oss云存储文件管理系统
              </Heading>
              <Text 
                fontSize={{ base: "md", sm: "lg", md: "xl" }} 
                color={textColor}
                maxW="container.md"
                mx="auto"
                px={{ base: 4, md: 0 }}
                lineHeight="tall"
              >
                一个高性能、易扩展的云存储文件管理解决方案，支持多种云存储服务，提供统一的文件管理体验。
              </Text>
            </MotionBox>
          </Box>

          {/* Features Grid */}
          <SimpleGrid 
            columns={{ base: 1, md: 2, lg: 3 }} 
            spacing={{ base: 4, sm: 6, md: 8 }}
            w="full"
          >
            {features.map((feature, index) => {
              const motionProps: AnimationProps = cardAnimation(index);
              
              return (
                <Card
                  key={index}
                  as={MotionFlex}
                  direction="column"
                  initial={motionProps.initial}
                  animate={motionProps.animate}
                  transition={motionProps.transition as any}
                  bg={cardBg}
                  borderWidth="1px"
                  borderColor={borderColor}
                  borderRadius={{ base: "md", md: "lg" }}
                  boxShadow={isDark ? 'dark-lg' : 'md'}
                  h="full"
                  _hover={{
                    transform: 'translateY(-4px)',
                    boxShadow: isDark ? '2xl' : 'xl',
                    borderColor: isDark ? feature.darkColor : feature.color,
                    transition: 'all 0.2s ease-in-out',
                  }}
                >
                  <CardBody
                    display="flex"
                    flexDirection="column"
                    gap={{ base: 3, md: 4 }}
                    p={{ base: 4, sm: 5, md: 6 }}
                  >
                    <Flex
                      w={{ base: 10, md: 12 }}
                      h={{ base: 10, md: 12 }}
                      align="center"
                      justify="center"
                      borderRadius="full"
                      bg={useColorModeValue(feature.color, feature.darkColor)}
                      color="white"
                      boxShadow={isDark ? 'dark-lg' : 'md'}
                    >
                      <Icon as={feature.icon} boxSize={{ base: 5, md: 6 }} />
                    </Flex>
                    <Heading 
                      size={{ base: "sm", md: "md" }}
                      color={headingColor}
                      lineHeight="shorter"
                    >
                      {feature.title}
                    </Heading>
                    <Text 
                      color={textColor}
                      fontSize={{ base: "sm", md: "md" }}
                      lineHeight="tall"
                    >
                      {feature.description}
                    </Text>
                  </CardBody>
                </Card>
              );
            })}
          </SimpleGrid>
        </Stack>
      </Container>
    </Box>
  );
}