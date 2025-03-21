'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  Box,
  Flex,
  HStack,
  IconButton,
  Button,
  Menu,
  Avatar,
  Text,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  VStack,
  Divider,
  useDisclosure,
  useColorModeValue,
  MenuButton,
  MenuList,
  MenuItem,
} from '@chakra-ui/react';
import { 
  FiMenu, 
  FiHome, 
  FiUpload, 
  FiSearch, 
  FiSettings, 
  FiList,
  FiUser,
  FiLogOut,
  FiChevronRight
} from 'react-icons/fi';

interface MainLayoutProps {
  children: React.ReactNode;
}

interface MenuItem {
  label: string;
  path: string;
  icon: React.ReactElement;
  permissions?: string[]; // 权限控制，根据用户角色显示菜单
}

export default function MainLayout({ children }: MainLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [user, setUser] = useState<any>(null);

  // 菜单项配置
  const menuItems: MenuItem[] = [
    { 
      label: '首页', 
      path: '/main/dashboard', 
      icon: <FiHome size={20} /> 
    },
    { 
      label: '文件上传', 
      path: '/main/files/upload', 
      icon: <FiUpload size={20} /> 
    },
    { 
      label: '文件查询', 
      path: '/main/files', 
      icon: <FiSearch size={20} /> 
    },
    { 
      label: '后台管理', 
      path: '/main/admin', 
      icon: <FiSettings size={20} />,
      permissions: ['admin'] // 仅管理员可见
    },
    { 
      label: '审计日志', 
      path: '/main/admin/audit', 
      icon: <FiList size={20} />,
      permissions: ['admin'] // 仅管理员可见
    },
    { 
      label: '系统设置', 
      path: '/main/admin/settings', 
      icon: <FiSettings size={20} />,
      permissions: ['admin'] // 仅管理员可见
    },
  ];

  // 检查当前路径是否匹配菜单项路径
  const isActiveRoute = (menuPath: string) => {
    return pathname === menuPath || pathname?.startsWith(menuPath + '/');
  };

  useEffect(() => {
    // 从 localStorage 获取用户信息
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const userData = JSON.parse(userStr);
        setUser(userData);
      } catch (error) {
        console.error('解析用户数据失败:', error);
      }
    } else {
      // 如果未登录且不在登录页，则跳转到登录页
      if (pathname !== '/auth/login' && pathname !== '/auth/register') {
        router.push('/auth/login');
      }
    }
  }, [pathname, router]);

  const handleLogout = () => {
    // 清除本地存储的用户信息和 token
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    // 跳转到登录页
    router.push('/auth/login');
  };

  // 过滤菜单项，根据用户权限显示
  const filteredMenuItems = menuItems.filter(item => {
    // 临时注释掉权限检查，使所有菜单项都可见
    // if (!item.permissions) return true;
    // return user?.role && item.permissions.includes(user.role);
    return true; // 临时允许所有菜单项都可见
  });

  // 登录页或注册页不显示布局
  if (pathname === '/auth/login' || pathname === '/auth/register') {
    return <>{children}</>;
  }

  return (
    <Box minH="100vh">
      {/* 顶部导航栏 */}
      <Flex
        as="header"
        position="fixed"
        w="full"
        h="60px"
        px={4}
        bg={useColorModeValue('white', 'gray.800')}
        boxShadow="sm"
        zIndex={10}
        alignItems="center"
        justifyContent="space-between"
      >
        <HStack spacing={4}>
          <IconButton
            aria-label="打开菜单"
            icon={<FiMenu />}
            display={{ base: 'flex', md: 'none' }}
            onClick={onOpen}
            variant="ghost"
          />
          <Text fontSize="xl" fontWeight="bold">OSS 文件管理系统</Text>
        </HStack>

        {/* 用户菜单 */}
        {user && (
          <Menu>
            <MenuButton
              as={Button}
              variant="ghost"
              rounded="full"
              cursor="pointer"
              minW={0}
            >
              <HStack>
                <Avatar size="sm" name={user.name || user.username} src={user.avatar} />
                <Text display={{ base: 'none', md: 'block' }}>{user.name || user.username}</Text>
              </HStack>
            </MenuButton>
            <MenuList>
              <MenuItem icon={<FiUser />}>个人资料</MenuItem>
              <MenuItem icon={<FiSettings />}>设置</MenuItem>
              <Divider />
              <MenuItem icon={<FiLogOut />} onClick={handleLogout}>退出登录</MenuItem>
            </MenuList>
          </Menu>
        )}
      </Flex>

      {/* 移动端侧边菜单抽屉 */}
      <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>菜单</DrawerHeader>
          <DrawerBody>
            <VStack spacing={2} align="stretch">
              {filteredMenuItems.map((item, index) => (
                <Button
                  key={index}
                  leftIcon={item.icon}
                  variant={isActiveRoute(item.path) ? 'solid' : 'ghost'}
                  colorScheme={isActiveRoute(item.path) ? 'blue' : 'gray'}
                  justifyContent="flex-start"
                  onClick={() => {
                    router.push(item.path);
                    onClose();
                  }}
                >
                  {item.label}
                </Button>
              ))}
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      {/* 桌面端侧边菜单 */}
      <Box
        position="fixed"
        h="calc(100vh - 60px)"
        w="240px"
        mt="60px"
        bg={useColorModeValue('white', 'gray.800')}
        boxShadow="sm"
        display={{ base: 'none', md: 'block' }}
      >
        <VStack spacing={2} align="stretch" p={4}>
          {filteredMenuItems.map((item, index) => (
            <Button
              key={index}
              leftIcon={item.icon}
              rightIcon={isActiveRoute(item.path) ? <FiChevronRight /> : undefined}
              variant={isActiveRoute(item.path) ? 'solid' : 'ghost'}
              colorScheme={isActiveRoute(item.path) ? 'blue' : 'gray'}
              justifyContent="flex-start"
              onClick={() => router.push(item.path)}
            >
              {item.label}
            </Button>
          ))}
        </VStack>
      </Box>

      {/* 主要内容区域 */}
      <Box ml={{ base: 0, md: '240px' }} pt="60px" minH="calc(100vh - 60px)">
        <Box p={4}>{children}</Box>
      </Box>
    </Box>
  );
} 