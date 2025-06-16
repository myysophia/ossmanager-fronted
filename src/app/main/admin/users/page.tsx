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
  Text,
  Switch,
} from '@chakra-ui/react';
import { SearchIcon, AddIcon, EditIcon, DeleteIcon } from '@chakra-ui/icons';
import { UserAPI } from '@/lib/api/client';
import { User } from '@/lib/api/types';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import UserForm from './UserForm';

function UsersPageContent() {
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      console.log('Fetching users with params:', { page, limit, search });
      
      const response = await UserAPI.getUsers({
        page,
        limit,
        search: search || undefined,
      });
      
      console.log('Raw API Response:', response);
      
      if (!response) {
        console.error('Response is null or undefined');
        throw new Error('Empty API response');
      }

      if (!response.items) {
        console.error('Response missing items array:', response);
        throw new Error('Invalid API response: missing items array');
      }

      if (!Array.isArray(response.items)) {
        console.error('Response items is not an array:', response.items);
        throw new Error('Invalid API response: items is not an array');
      }

      console.log('Response items:', response.items);
      console.log('Response total:', response.total);

      const usersWithRoles = response.items.map(user => {
        console.log('Processing user:', user);
        return {
          ...user,
          roles: Array.isArray(user.roles) ? user.roles : [],
          real_name: user.real_name || '',
          status: user.status ?? true,
          created_at: user.created_at || new Date().toISOString()
        };
      });

      console.log('Processed users:', usersWithRoles);
      
      setUsers(usersWithRoles);
      setTotal(response.total || usersWithRoles.length);
    } catch (error) {
      console.error('Error fetching users:', error);
      if (error instanceof Error) {
        console.error('Error details:', {
          message: error.message,
          stack: error.stack
        });
      }
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

  const handleStatusChange = async (user: User) => {
    try {
      await UserAPI.updateUser(user.id, {
        status: !user.status,
      });
      toast({
        title: '更新成功',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      fetchUsers();
    } catch (error) {
      toast({
        title: '更新失败',
        description: error instanceof Error ? error.message : '未知错误',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const totalPages = Math.ceil(total / limit);
  const canPreviousPage = page > 1;
  const canNextPage = page < totalPages;

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
                <HStack spacing={1}>
                  {user.roles && user.roles.length > 0 ? (
                    user.roles.map((role) => (
                      <Badge key={role.id} colorScheme="blue">
                        {role.name}
                      </Badge>
                    ))
                  ) : (
                    <Text color="gray.500">无角色</Text>
                  )}
                </HStack>
              </Td>
              <Td>
                <Switch
                  isChecked={user.status}
                  onChange={() => handleStatusChange(user)}
                  colorScheme="green"
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

      <HStack justify="space-between" mt={4}>
        <Text>
          第 {page} 页，共 {totalPages} 页
        </Text>
        <HStack>
          <Button
            size="sm"
            onClick={() => setPage(page - 1)}
            isDisabled={!canPreviousPage}
          >
            上一页
          </Button>
          <Button
            size="sm"
            onClick={() => setPage(page + 1)}
            isDisabled={!canNextPage}
          >
            下一页
          </Button>
        </HStack>
      </HStack>

      <UserForm
        isOpen={isOpen}
        onClose={onClose}
        user={selectedUser}
        onSuccess={fetchUsers}
      />
    </Box>
  );
}

export default function UsersPage() {
  return (
    <ProtectedRoute requireManager>
      <UsersPageContent />
    </ProtectedRoute>
  );
} 