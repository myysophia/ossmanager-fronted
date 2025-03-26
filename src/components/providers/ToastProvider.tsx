'use client';

import { ChakraProvider, createStandaloneToast } from '@chakra-ui/react';
import { theme } from '@/lib/theme';

const { ToastContainer } = createStandaloneToast();

export function ToastProvider() {
  return (
    <ChakraProvider theme={theme}>
      <ToastContainer />
    </ChakraProvider>
  );
} 