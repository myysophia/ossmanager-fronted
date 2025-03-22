'use client';

import { useEffect } from 'react';
import { 
  Box, 
  Container, 
  Heading, 
  Text, 
  Button, 
  VStack, 
  useColorModeValue,
  useToast 
} from '@chakra-ui/react';
import { useRouter } from 'next/navigation';

export default function ErrorPage({ 
  error, 
  reset 
}: { 
  error: Error & { digest?: string }; 
  reset: () => void 
}) {
  const router = useRouter();
  const toast = useToast();
  const bgColor = useColorModeValue('gray.50', 'gray.900');

  useEffect(() => {
    // 记录错误到控制台
    console.error('页面发生错误:', error);

    // 显示错误提示
    toast({
      title: '发生错误',
      description: '页面加载过程中发生了错误，请尝试重新加载。',
      status: 'error',
      duration: 5000,
      isClosable: true,
    });
  }, [error, toast]);

  return (
    <Box bg={bgColor} minH="100vh" py={10}>
      <Container 
        maxW="xl" 
        centerContent
        py={10}
        px={6}
      >
        <VStack spacing={6} textAlign="center">
          <Heading as="h1" size="xl" color="red.500">
            出错了
          </Heading>
          
          <Text fontSize="lg" color="gray.600">
            抱歉，页面加载过程中发生了错误。
          </Text>
          
          <Box pt={6} w="full">
            <Button 
              colorScheme="blue" 
              size="lg" 
              onClick={() => reset()}
              w="full"
            >
              重试
            </Button>
            
            <Button 
              variant="ghost" 
              size="lg" 
              onClick={() => router.push('/main/dashboard')}
              mt={4}
              w="full"
            >
              返回首页
            </Button>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
} 