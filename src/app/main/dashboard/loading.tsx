'use client';

import { Container, Spinner } from '@chakra-ui/react';

export default function DashboardLoading() {
  return (
    <Container centerContent>
      <Spinner size="xl" />
    </Container>
  );
} 