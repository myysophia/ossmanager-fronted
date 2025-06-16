'use client';

import { useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  SimpleGrid,
  Card,
  CardBody,
  Text,
  Icon,
  HStack,
  VStack,
  useColorModeValue,
} from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import { FiList, FiUser, FiLock } from 'react-icons/fi';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

interface AdminCard {
  title: string;
  description: string;
  icon: React.ReactElement;
  path: string;
}

function AdminPageContent() {
  const router = useRouter();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const adminCards: AdminCard[] = [
    {
      title: '用户管理',
      description: '管理系统用户、角色和权限分配',
      icon: <Icon as={FiUser} boxSize={10} color="purple.500" />,
      path: '/main/admin/users',
    },
    {
      title: '角色管理',
      description: '管理系统角色和权限配置',
      icon: <Icon as={FiLock} boxSize={10} color="blue.500" />,
      path: '/main/admin/roles',
    },
    {
      title: '审计日志',
      description: '查看系统操作记录和用户行为日志',
      icon: <Icon as={FiList} boxSize={10} color="green.500" />,
      path: '/main/admin/audit',
    }
  ];

  return (
    <Container maxW="container.xl" py={10}>
      <Box mb={8}>
        <Heading size="lg" mb={2}>后台管理</Heading>
        <Text color="gray.500">管理系统用户和查看操作日志</Text>
      </Box>

      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
        {adminCards.map((card, index) => (
          <Card
            key={index}
            borderWidth="1px"
            borderColor={borderColor}
            borderRadius="lg"
            overflow="hidden"
            transition="all 0.3s"
            _hover={{
              transform: 'translateY(-5px)',
              boxShadow: 'lg',
              borderColor: 'blue.300',
            }}
            cursor="pointer"
            onClick={() => router.push(card.path)}
          >
            <CardBody>
              <HStack spacing={6} align="start">
                <Box p={2}>
                  {card.icon}
                </Box>
                <VStack align="start" spacing={1}>
                  <Heading size="md">{card.title}</Heading>
                  <Text color="gray.500">{card.description}</Text>
                </VStack>
              </HStack>
            </CardBody>
          </Card>
        ))}
      </SimpleGrid>
    </Container>
  );
}

export default function AdminPage() {
  return (
    <ProtectedRoute requireManager>
      <AdminPageContent />
    </ProtectedRoute>
  );
} 