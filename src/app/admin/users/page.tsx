'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  useToast,
  Input,
  InputGroup,
  InputLeftElement,
  HStack,
  IconButton,
  useDisclosure,
  Badge,
  Switch,
} from '@chakra-ui/react';
import { SearchIcon, AddIcon, EditIcon, DeleteIcon } from '@chakra-ui/icons';
import { UserAPI } from '@/lib/api/client';
import { User } from '@/lib/api/types';
import UserForm from './UserForm';

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await UserAPI.getUsers({
        page,
        limit,
        search: search || undefined,
      });
      setUsers(response.users);
      setTotal(response.total);
    } catch (error) {
      toast({
        title: '获取用户列表失败',
        description: error instanceof Error ? error.message : '未知错误',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, limit, search]);

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleCreateUser = () => {
    setSelectedUser(null);
    onOpen();
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    onOpen();
  };

  const handleDeleteUser = async (id: number) => {
    if (!confirm('确定要删除该用户吗？')) return;

    try {
      await UserAPI.deleteUser(id);
      toast({
        title: '删除成功',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      fetchUsers();
    } catch (error) {
      toast({
        title: '删除失败',
        description: error instanceof Error ? error.message : '未知错误',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleStatusChange = async (id: number, status: boolean) => {
    try {
      await UserAPI.updateUserStatus(id, status);
      toast({
        title: '更新状态成功',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      fetchUsers();
    } catch (error) {
      toast({
        title: '更新状态失败',
        description: error instanceof Error ? error.message : '未知错误',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Box p={4}>
      <HStack mb={4} justify="space-between">
        <InputGroup maxW="300px">
          <InputLeftElement pointerEvents="none">
            <SearchIcon color="gray.300" />
          </InputLeftElement>
          <Input
            placeholder="搜索用户..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </InputGroup>
        <Button leftIcon={<AddIcon />} colorScheme="blue" onClick={handleCreateUser}>
          新建用户
        </Button>
      </HStack>

      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>用户名</Th>
            <Th>邮箱</Th>
            <Th>真实姓名</Th>
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
              <Td>{user.real_name || '-'}</Td>
              <Td>
                {user.roles?.map((role) => (
                  <Badge key={role.id} mr={1}>
                    {role.name}
                  </Badge>
                ))}
              </Td>
              <Td>
                <Switch
                  isChecked={user.status}
                  onChange={(e) => handleStatusChange(user.id, e.target.checked)}
                />
              </Td>
              <Td>{new Date(user.created_at).toLocaleString()}</Td>
              <Td>
                <HStack spacing={2}>
                  <IconButton
                    aria-label="编辑用户"
                    icon={<EditIcon />}
                    size="sm"
                    onClick={() => handleEditUser(user)}
                  />
                  <IconButton
                    aria-label="删除用户"
                    icon={<DeleteIcon />}
                    size="sm"
                    colorScheme="red"
                    onClick={() => handleDeleteUser(user.id)}
                  />
                </HStack>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>

      <UserForm
        isOpen={isOpen}
        onClose={onClose}
        user={selectedUser}
        onSuccess={fetchUsers}
      />
    </Box>
  );
} 