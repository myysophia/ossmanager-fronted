'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
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
  MenuItem as ChakraMenuItem
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
  FiChevronRight,
  FiChevronLeft,
  FiDatabase,
  FiMoon,
  FiSun
} from 'react-icons/fi';
import { ColorModeToggle } from '../common/ColorModeToggle';
import apiClient from '@/lib/api/axios';
import { handleTokenExpired } from '@/lib/utils/auth';
import { debug, log } from 'console';

interface MainLayoutProps {
  children: React.ReactNode;
}

interface MenuItemType {
  label: string;
  path: string;
  icon: React.ReactElement;
  permissions?: string[];
}

// 菜单项定义 - 静态常量，避免重新创建
const MENU_ITEMS: MenuItemType[] = [
  { 
    label: '首页', 
    path: '/main/dashboard', 
    icon: <FiHome size={18} /> 
  },
  { 
    label: '文件上传', 
    path: '/main/files/upload', 
    icon: <FiUpload size={18} /> 
  },
  { 
    label: '文件查询', 
    path: '/main/files', 
    icon: <FiSearch size={18} /> 
  },
  { 
    label: '后台管理', 
    path: '/main/admin', 
    icon: <FiSettings size={18} />,
    permissions: ['admin']
  },
  { 
    label: '审计日志', 
    path: '/main/admin/audit', 
    icon: <FiList size={18} />,
    permissions: ['admin']
  }
];

// 拆分顶部导航为独立组件
const TopNav = React.memo(({ 
  onMobileMenuOpen, 
  user, 
  onNavigate, 
  onLogout 
}: { 
  onMobileMenuOpen: () => void;
  user: any; 
  onNavigate: (path: string) => void;
  onLogout: () => void;
}) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  
  return (
    <Flex
      as="header"
      position="fixed"
      w="full"
      h="60px"
      px={4}
      bg={bgColor}
      boxShadow="sm"
      zIndex={10}
      alignItems="center"
      justifyContent="space-between"
    >
      <HStack spacing={4}>
        <IconButton
          aria-label="菜单"
          icon={<FiMenu />}
          display={{ base: 'flex', md: 'none' }}
          onClick={onMobileMenuOpen}
          variant="ghost"
        />
        <HStack 
          spacing={2} 
          cursor="pointer"
          onClick={() => onNavigate('/main/dashboard')}
        >
          <Box 
            bg="primary.500" 
            p={1.5} 
            borderRadius="md" 
            color="white"
          >
            <FiDatabase size={16} />
          </Box>
          <Text 
            fontSize="lg" 
            fontWeight="bold"
          >
            OSS 文件管理系统
          </Text>
        </HStack>
      </HStack>

      {user && (
        <HStack spacing={2}>
          <ColorModeToggle size="sm" />
          <Menu>
            <MenuButton
              as={Button}
              variant="ghost"
              rounded="full"
            >
              <HStack>
                <Avatar 
                  size="sm" 
                  name={user.name || user.username} 
                  bg="primary.500"
                />
                <Text display={{ base: 'none', md: 'block' }}>
                  {user.name || user.username}
                </Text>
              </HStack>
            </MenuButton>
            <MenuList>
              {/* <ChakraMenuItem icon={<FiUser />}>个人资料</ChakraMenuItem>
              <ChakraMenuItem icon={<FiSettings />}>设置</ChakraMenuItem> */}
              <Divider />
              <ChakraMenuItem 
                icon={<FiLogOut />} 
                onClick={onLogout}
                color="red.500"
              >
                退出登录
              </ChakraMenuItem>
            </MenuList>
          </Menu>
        </HStack>
      )}
    </Flex>
  );
});

TopNav.displayName = 'TopNav';

// 拆分为菜单项组件
const MenuItemButton = React.memo(({ 
  item, 
  isActive, 
  isLoading, 
  isCollapsed, 
  onClick 
}: { 
  item: MenuItemType; 
  isActive: boolean; 
  isLoading: boolean;
  isCollapsed: boolean;
  onClick: () => void;
}) => {
  return (
    <Button
      leftIcon={item.icon}
      variant="ghost"
      justifyContent={isCollapsed ? "center" : "flex-start"}
      h="40px"
      p={isCollapsed ? 0 : 3}
      color={isActive ? "blue.500" : undefined}
      fontWeight={isActive ? "bold" : "normal"}
      isLoading={isLoading && isActive}
      onClick={onClick}
      title={isCollapsed ? item.label : undefined}
    >
      {!isCollapsed && item.label}
    </Button>
  );
});

MenuItemButton.displayName = 'MenuItemButton';

// 拆分为移动端抽屉菜单组件
const MobileDrawer = React.memo(({ 
  isOpen, 
  onClose, 
  items,
  isActiveRoute,
  isLoading,
  onNavigate 
}: { 
  isOpen: boolean; 
  onClose: () => void;
  items: MenuItemType[];
  isActiveRoute: (path: string) => boolean;
  isLoading: boolean;
  onNavigate: (path: string) => void;
}) => {
  return (
    <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerHeader borderBottomWidth="1px">菜单</DrawerHeader>
        <DrawerBody>
          <VStack spacing={2} align="stretch" pt={2}>
            {items.map((item, index) => (
              <Button
                key={index}
                leftIcon={item.icon}
                variant="ghost"
                justifyContent="flex-start"
                isLoading={isLoading && isActiveRoute(item.path)}
                color={isActiveRoute(item.path) ? "blue.500" : undefined}
                fontWeight={isActiveRoute(item.path) ? "bold" : "normal"}
                onClick={() => {
                  onNavigate(item.path);
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
  );
});

MobileDrawer.displayName = 'MobileDrawer';

// 拆分为桌面端侧边栏组件
const DesktopSidebar = React.memo(({ 
  isCollapsed, 
  onToggle,
  items,
  isActiveRoute,
  isLoading,
  onNavigate 
}: { 
  isCollapsed: boolean; 
  onToggle: () => void;
  items: MenuItemType[];
  isActiveRoute: (path: string) => boolean;
  isLoading: boolean;
  onNavigate: (path: string) => void;
}) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  return (
    <Box
      position="fixed"
      h="calc(100vh - 60px)"
      w={isCollapsed ? "60px" : "220px"}
      mt="60px"
      bg={bgColor}
      borderRightWidth="1px"
      borderColor={borderColor}
      display={{ base: 'none', md: 'block' }}
      transition="width 0.3s ease"
      zIndex={5}
    >
      <Flex direction="column" h="full">
        <IconButton
          aria-label={isCollapsed ? "展开菜单" : "收起菜单"}
          icon={isCollapsed ? <FiChevronRight /> : <FiChevronLeft />}
          size="sm"
          position="absolute"
          top="4"
          right="2"
          variant="ghost"
          onClick={onToggle}
        />

        <VStack spacing={1} align="stretch" p={3} pt={10}>
          {items.map((item, index) => (
            <Button
              key={index}
              leftIcon={item.icon}
              variant="ghost"
              w="100%"
              justifyContent={isCollapsed ? "center" : "flex-start"}
              h="40px"
              px={isCollapsed ? 2 : 4}
              borderRadius="md"
              color={isActiveRoute(item.path) ? "blue.500" : undefined}
              fontWeight={isActiveRoute(item.path) ? "bold" : "normal"}
              isActive={isActiveRoute(item.path)}
              onClick={() => onNavigate(item.path)}
              _hover={{ bg: "gray.100" }}
              _active={{ bg: "gray.200" }}
              style={{ zIndex: 1 }}
              title={isCollapsed ? item.label : undefined}
            >
              {!isCollapsed && item.label}
            </Button>
          ))}
        </VStack>
      </Flex>
    </Box>
  );
});

DesktopSidebar.displayName = 'DesktopSidebar';

// 主布局组件
const MainLayout = ({ children }: MainLayoutProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [user, setUser] = useState<any>(null);
  const [userLoading, setUserLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);

  // 检查当前路径是否匹配菜单项路径
  const isActiveRoute = useCallback((menuPath: string) => {
    // 精确匹配
    return pathname === menuPath;
  }, [pathname]);

  // 导航处理函数
  const navigateTo = useCallback((path: string) => {
    if (path === pathname) return; // 避免相同路径的重复导航
    setIsLoading(true);
    try {
      router.push(path);
    } catch (error) {
      console.error('[导航错误]:', error);
    } finally {
      setTimeout(() => setIsLoading(false), 200);
    }
  }, [router, pathname]);

  // 处理登出
  const handleLogout = useCallback(() => {
    handleTokenExpired();
  }, []);

  // 切换侧边栏状态
  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed(prev => !prev);
  }, []);

  // 只在组件挂载时获取用户信息（优先接口，兼容本地缓存）
  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await apiClient.get('/user/current');
        const userData = res.data;
        if (userData && userData.permissions) {
          const processedUserData = {
            ...userData,
            permissions: Array.isArray(userData.permissions) ? userData.permissions : []
          };
          setUser(processedUserData);
          localStorage.setItem('user', JSON.stringify(processedUserData));
        } else {
          const userStr = localStorage.getItem('user');
          if (userStr) {
            const cachedUser = JSON.parse(userStr);
            setUser(cachedUser);
          } else if (pathname !== '/auth/login' && pathname !== '/auth/register') {
            router.push('/auth/login');
          }
        }
      } catch (error) {
        console.error('获取用户信息失败:', error);
        // 检查是否是认证错误
        if (error && typeof error === 'object' && 'response' in error) {
          const httpError = error as any;
          if (httpError.response?.status === 401) {
            handleTokenExpired();
            return;
          }
        }
        
        // 其他错误，尝试使用缓存的用户信息
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const cachedUser = JSON.parse(userStr);
          setUser(cachedUser);
        } else {
          router.push('/auth/login');
        }
      } finally {
        setUserLoading(false);
      }
    }
    fetchUser();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 判断是否有 MANAGER 权限
  function hasManagerPermission(user: any): boolean {
    if (!user || !user.permissions) return false;
    return user.permissions.some((p: any) => p.resource === 'MANAGER');
  }

  // 动态过滤菜单项
  const filteredMenuItems = MENU_ITEMS.filter(item => {
    if (!item.permissions) return true;
    if (item.permissions.includes('admin')) {
      return hasManagerPermission(user);
    }
    return true;
  });

  // 登录页或注册页不显示布局
  if (pathname === '/auth/login' || pathname === '/auth/register') {
    return <>{children}</>;
  }

  // 修复左侧栏闪烁：用户权限未加载完成前渲染固定宽度占位
  if (userLoading) {
    return (
      <Box minH="100vh" display="flex">
        <Box
          w={{ base: 0, md: isSidebarCollapsed ? '60px' : '220px' }}
          bg="gray.800"
          minH="100vh"
          transition="width 0.3s ease"
        />
        <Box flex={1} bg="white">
          {/* 可选：顶部导航等 */}
        </Box>
      </Box>
    );
  }

  return (
    <Box minH="100vh">
      {/* 顶部导航 */}
      <TopNav 
        onMobileMenuOpen={onOpen} 
        user={user} 
        onNavigate={navigateTo}
        onLogout={handleLogout} 
      />

      {/* 移动端菜单 */}
      <MobileDrawer 
        isOpen={isOpen} 
        onClose={onClose}
        items={filteredMenuItems}
        isActiveRoute={isActiveRoute}
        isLoading={isLoading}
        onNavigate={navigateTo}
      />

      {/* 桌面侧边栏 */}
      <DesktopSidebar 
        isCollapsed={isSidebarCollapsed}
        onToggle={toggleSidebar}
        items={filteredMenuItems}
        isActiveRoute={isActiveRoute}
        isLoading={isLoading}
        onNavigate={navigateTo}
      />

      {/* 主内容区域 */}
      <Box 
        ml={{ base: 0, md: isSidebarCollapsed ? "60px" : "220px" }} 
        pt="60px" 
        transition="margin-left 0.3s ease"
      >
        <Box p={4}>
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default MainLayout; 