'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useToast,
  Text,
  Badge,
  useColorModeValue,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  FormControl,
  FormLabel,
  Input,
  Select,
  Checkbox,
  useDisclosure,
} from '@chakra-ui/react';
import { FiMoreVertical, FiEdit2, FiTrash2, FiPlus } from 'react-icons/fi';

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
}

interface Permission {
  id: string;
  name: string;
  description: string;
  module: string;
}

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: '',
    status: 'active',
  });
  const [roleFormData, setRoleFormData] = useState({
    name: '',
    description: '',
    permissions: [] as string[],
  });
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isRoleOpen,
    onOpen: onRoleOpen,
    onClose: onRoleClose,
  } = useDisclosure();

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  useEffect(() => {
    fetchUsers();
    fetchRoles();
    fetchPermissions();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/users');
      if (!response.ok) {
        throw new Error('获取用户列表失败');
      }
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      toast({
        title: '获取用户列表失败',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await fetch('/api/admin/roles');
      if (!response.ok) {
        throw new Error('获取角色列表失败');
      }
      const data = await response.json();
      setRoles(data);
    } catch (error) {
      toast({
        title: '获取角色列表失败',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const fetchPermissions = async () => {
    try {
      const response = await fetch('/api/admin/permissions');
      if (!response.ok) {
        throw new Error('获取权限列表失败');
      }
      const data = await response.json();
      setPermissions(data);
    } catch (error) {
      toast({
        title: '获取权限列表失败',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleCreateUser = async () => {
    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('创建用户失败');
      }

      fetchUsers();
      onClose();
      setFormData({
        username: '',
        email: '',
        password: '',
        role: '',
        status: 'active',
      });
      toast({
        title: '创建用户成功',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: '创建用户失败',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;

    try {
      const response = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('更新用户失败');
      }

      fetchUsers();
      onClose();
      setSelectedUser(null);
      setFormData({
        username: '',
        email: '',
        password: '',
        role: '',
        status: 'active',
      });
      toast({
        title: '更新用户成功',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: '更新用户失败',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('删除用户失败');
      }

      fetchUsers();
      toast({
        title: '删除用户成功',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: '删除用户失败',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleCreateRole = async () => {
    try {
      const response = await fetch('/api/admin/roles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(roleFormData),
      });

      if (!response.ok) {
        throw new Error('创建角色失败');
      }

      fetchRoles();
      onRoleClose();
      setRoleFormData({
        name: '',
        description: '',
        permissions: [],
      });
      toast({
        title: '创建角色成功',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: '创建角色失败',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleUpdateRole = async () => {
    if (!selectedRole) return;

    try {
      const response = await fetch(`/api/admin/roles/${selectedRole.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(roleFormData),
      });

      if (!response.ok) {
        throw new Error('更新角色失败');
      }

      fetchRoles();
      onRoleClose();
      setSelectedRole(null);
      setRoleFormData({
        name: '',
        description: '',
        permissions: [],
      });
      toast({
        title: '更新角色成功',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: '更新角色失败',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleDeleteRole = async (roleId: string) => {
    try {
      const response = await fetch(`/api/admin/roles/${roleId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('删除角色失败');
      }

      fetchRoles();
      toast({
        title: '删除角色成功',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: '删除角色失败',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setFormData({
      username: user.username,
      email: user.email,
      password: '',
      role: user.role,
      status: user.status,
    });
    onOpen();
  };

  const handleEditRole = (role: Role) => {
    setSelectedRole(role);
    setRoleFormData({
      name: role.name,
      description: role.description,
      permissions: role.permissions,
    });
    onRoleOpen();
  };

  return (
    <Box p={6}>
      <Tabs>
        <TabList>
          <Tab>用户管理</Tab>
          <Tab>角色管理</Tab>
          <Tab>权限管理</Tab>
        </TabList>

        <TabPanels>
          {/* 用户管理 */}
          <TabPanel>
            <VStack spacing={6} align="stretch">
              <HStack justify="space-between">
                <Text fontSize="2xl" fontWeight="bold">
                  用户列表
                </Text>
                <Button
                  leftIcon={<FiPlus />}
                  onClick={() => {
                    setSelectedUser(null);
                    setFormData({
                      username: '',
                      email: '',
                      password: '',
                      role: '',
                      status: 'active',
                    });
                    onOpen();
                  }}
                >
                  新建用户
                </Button>
              </HStack>

              <Box overflowX="auto">
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th>用户名</Th>
                      <Th>邮箱</Th>
                      <Th>角色</Th>
                      <Th>状态</Th>
                      <Th>创建时间</Th>
                      <Th>操作</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {users.map((user) => (
                      <Tr key={user.id}>
                        <Td>{user.username}</Td>
                        <Td>{user.email}</Td>
                        <Td>{user.role}</Td>
                        <Td>
                          <Badge
                            colorScheme={user.status === 'active' ? 'green' : 'red'}
                          >
                            {user.status === 'active' ? '启用' : '禁用'}
                          </Badge>
                        </Td>
                        <Td>{new Date(user.createdAt).toLocaleString()}</Td>
                        <Td>
                          <Menu>
                            <MenuButton
                              as={IconButton}
                              icon={<FiMoreVertical />}
                              variant="ghost"
                              size="sm"
                            />
                            <MenuList>
                              <MenuItem
                                icon={<FiEdit2 />}
                                onClick={() => handleEditUser(user)}
                              >
                                编辑
                              </MenuItem>
                              <MenuItem
                                icon={<FiTrash2 />}
                                onClick={() => handleDeleteUser(user.id)}
                                color="red.500"
                              >
                                删除
                              </MenuItem>
                            </MenuList>
                          </Menu>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
            </VStack>
          </TabPanel>

          {/* 角色管理 */}
          <TabPanel>
            <VStack spacing={6} align="stretch">
              <HStack justify="space-between">
                <Text fontSize="2xl" fontWeight="bold">
                  角色列表
                </Text>
                <Button
                  leftIcon={<FiPlus />}
                  onClick={() => {
                    setSelectedRole(null);
                    setRoleFormData({
                      name: '',
                      description: '',
                      permissions: [],
                    });
                    onRoleOpen();
                  }}
                >
                  新建角色
                </Button>
              </HStack>

              <Box overflowX="auto">
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th>角色名称</Th>
                      <Th>描述</Th>
                      <Th>权限数量</Th>
                      <Th>操作</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {roles.map((role) => (
                      <Tr key={role.id}>
                        <Td>{role.name}</Td>
                        <Td>{role.description}</Td>
                        <Td>{role.permissions.length}</Td>
                        <Td>
                          <Menu>
                            <MenuButton
                              as={IconButton}
                              icon={<FiMoreVertical />}
                              variant="ghost"
                              size="sm"
                            />
                            <MenuList>
                              <MenuItem
                                icon={<FiEdit2 />}
                                onClick={() => handleEditRole(role)}
                              >
                                编辑
                              </MenuItem>
                              <MenuItem
                                icon={<FiTrash2 />}
                                onClick={() => handleDeleteRole(role.id)}
                                color="red.500"
                              >
                                删除
                              </MenuItem>
                            </MenuList>
                          </Menu>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
            </VStack>
          </TabPanel>

          {/* 权限管理 */}
          <TabPanel>
            <VStack spacing={6} align="stretch">
              <Text fontSize="2xl" fontWeight="bold">
                权限列表
              </Text>

              <Box overflowX="auto">
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th>权限名称</Th>
                      <Th>描述</Th>
                      <Th>模块</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {permissions.map((permission) => (
                      <Tr key={permission.id}>
                        <Td>{permission.name}</Td>
                        <Td>{permission.description}</Td>
                        <Td>{permission.module}</Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
            </VStack>
          </TabPanel>
        </TabPanels>
      </Tabs>

      {/* 用户表单弹窗 */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {selectedUser ? '编辑用户' : '新建用户'}
          </ModalHeader>
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>用户名</FormLabel>
                <Input
                  value={formData.username}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, username: e.target.value }))
                  }
                  placeholder="请输入用户名"
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>邮箱</FormLabel>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, email: e.target.value }))
                  }
                  placeholder="请输入邮箱"
                />
              </FormControl>
              {!selectedUser && (
                <FormControl isRequired>
                  <FormLabel>密码</FormLabel>
                  <Input
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, password: e.target.value }))
                    }
                    placeholder="请输入密码"
                  />
                </FormControl>
              )}
              <FormControl isRequired>
                <FormLabel>角色</FormLabel>
                <Select
                  value={formData.role}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, role: e.target.value }))
                  }
                >
                  {roles.map((role) => (
                    <option key={role.id} value={role.name}>
                      {role.name}
                    </option>
                  ))}
                </Select>
              </FormControl>
              <FormControl isRequired>
                <FormLabel>状态</FormLabel>
                <Select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, status: e.target.value }))
                  }
                >
                  <option value="active">启用</option>
                  <option value="inactive">禁用</option>
                </Select>
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              取消
            </Button>
            <Button
              colorScheme="blue"
              onClick={selectedUser ? handleUpdateUser : handleCreateUser}
            >
              {selectedUser ? '更新' : '创建'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* 角色表单弹窗 */}
      <Modal isOpen={isRoleOpen} onClose={onRoleClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {selectedRole ? '编辑角色' : '新建角色'}
          </ModalHeader>
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>角色名称</FormLabel>
                <Input
                  value={roleFormData.name}
                  onChange={(e) =>
                    setRoleFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="请输入角色名称"
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>描述</FormLabel>
                <Input
                  value={roleFormData.description}
                  onChange={(e) =>
                    setRoleFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="请输入角色描述"
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>权限</FormLabel>
                <VStack align="start" spacing={2}>
                  {permissions.map((permission) => (
                    <Checkbox
                      key={permission.id}
                      isChecked={roleFormData.permissions.includes(permission.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setRoleFormData((prev) => ({
                            ...prev,
                            permissions: [...prev.permissions, permission.id],
                          }));
                        } else {
                          setRoleFormData((prev) => ({
                            ...prev,
                            permissions: prev.permissions.filter(
                              (id) => id !== permission.id
                            ),
                          }));
                        }
                      }}
                    >
                      {permission.name}
                    </Checkbox>
                  ))}
                </VStack>
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onRoleClose}>
              取消
            </Button>
            <Button
              colorScheme="blue"
              onClick={selectedRole ? handleUpdateRole : handleCreateRole}
            >
              {selectedRole ? '更新' : '创建'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
} 