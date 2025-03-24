'use client';

import { useEffect } from 'react';
import { Container, Text, Button, VStack } from '@chakra-ui/react';

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Dashboard error:', error);
  }, [error]);

  return (
    <Container maxW="container.xl" py={10}>
      <VStack spacing={4}>
        <Text fontSize="xl" color="red.500">出错了！</Text>
        <Text>{error.message}</Text>
        <Button colorScheme="blue" onClick={reset}>
          重试
        </Button>
      </VStack>
    </Container>
  );
} 