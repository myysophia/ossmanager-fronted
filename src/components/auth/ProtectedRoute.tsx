'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Box, Spinner, Text, VStack, Alert, AlertIcon } from '@chakra-ui/react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermission?: {
    resource: string;
    action?: string;
  };
  requireManager?: boolean;
  fallbackPath?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredPermission,
  requireManager = false,
  fallbackPath = '/main/dashboard'
}) => {
  const { user, loading, hasPermission, hasManagerPermission } = useAuth();
  const router = useRouter();

  // 加载中状态 - 简化显示，避免闪烁
  if (loading) {
    return (
      <Box 
        minH="100vh" 
        display="flex" 
        alignItems="center" 
        justifyContent="center"
      >
        <Spinner size="lg" color="blue.500" />
      </Box>
    );
  }

  // 未登录
  if (!user) {
    router.push('/auth/login');
    return null;
  }

  // 检查管理员权限
  if (requireManager && !hasManagerPermission()) {
    return (
      <Box p={8}>
        <Alert status="error">
          <AlertIcon />
          <VStack align="start" spacing={2}>
            <Text fontWeight="bold">访问被拒绝</Text>
            <Text>您没有访问此页面的权限。需要管理员权限。</Text>
          </VStack>
        </Alert>
      </Box>
    );
  }

  // 检查特定权限
  if (requiredPermission) {
    const hasRequiredPermission = hasPermission(
      requiredPermission.resource,
      requiredPermission.action
    );

    if (!hasRequiredPermission) {
      return (
        <Box p={8}>
          <Alert status="error">
            <AlertIcon />
            <VStack align="start" spacing={2}>
              <Text fontWeight="bold">访问被拒绝</Text>
              <Text>
                您没有访问此页面的权限。需要权限: {requiredPermission.resource}
                {requiredPermission.action && ` - ${requiredPermission.action}`}
              </Text>
            </VStack>
          </Alert>
        </Box>
      );
    }
  }

  return <>{children}</>;
}; 