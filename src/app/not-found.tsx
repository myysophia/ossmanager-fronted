'use client';

import { 
  Box, 
  Container, 
  Heading, 
  Text, 
  Button, 
  VStack, 
  useColorModeValue 
} from '@chakra-ui/react';
import { useRouter } from 'next/navigation';

export default function NotFoundPage() {
  const router = useRouter();
  const bgColor = useColorModeValue('gray.50', 'gray.900');

  return (
    <Box bg={bgColor} minH="100vh" py={10}>
      <Container 
        maxW="xl" 
        centerContent
        py={10}
        px={6}
      >
        <VStack spacing={6} textAlign="center">
          <Heading as="h1" size="4xl" color="blue.500">
            404
          </Heading>
          
          <Heading as="h2" size="xl">
            页面未找到
          </Heading>
          
          <Text fontSize="lg" color="gray.600">
            抱歉，您访问的页面不存在或已被移除。
          </Text>
          
          <Box pt={6} w="full">
            <Button 
              colorScheme="blue" 
              size="lg" 
              onClick={() => router.push('/main/dashboard')}
              w="full"
            >
              返回首页
            </Button>
            
            <Button 
              variant="ghost" 
              size="lg" 
              onClick={() => router.back()}
              mt={4}
              w="full"
            >
              返回上一页
            </Button>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
} 