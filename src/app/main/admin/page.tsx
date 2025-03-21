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
import { FiSettings, FiList, FiUser, FiDatabase } from 'react-icons/fi';

interface AdminCard {
  title: string;
  description: string;
  icon: React.ReactElement;
  path: string;
}

export default function AdminPage() {
  const router = useRouter();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const adminCards: AdminCard[] = [
    {
      title: '系统设置',
      description: '管理系统配置、存储设置和权限控制',
      icon: <Icon as={FiSettings} boxSize={10} color="blue.500" />,
      path: '/main/admin/settings',
    },
    {
      title: '审计日志',
      description: '查看系统操作记录和用户行为日志',
      icon: <Icon as={FiList} boxSize={10} color="green.500" />,
      path: '/main/admin/audit',
    },
    {
      title: '用户管理',
      description: '管理系统用户、角色和权限分配',
      icon: <Icon as={FiUser} boxSize={10} color="purple.500" />,
      path: '/main/admin/users',
    },
    {
      title: '存储监控',
      description: '监控存储使用情况和性能指标',
      icon: <Icon as={FiDatabase} boxSize={10} color="orange.500" />,
      path: '/main/admin/monitor',
    },
  ];

  return (
    <Container maxW="container.xl" py={10}>
      <Box mb={8}>
        <Heading size="lg" mb={2}>后台管理</Heading>
        <Text color="gray.500">管理系统配置和监控系统运行状态</Text>
      </Box>

      <SimpleGrid columns={{ base: 1, md: 2, lg: 2 }} spacing={6}>
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