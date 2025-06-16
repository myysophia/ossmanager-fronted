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
} from '@chakra-ui/react';
import { SearchIcon, AddIcon, EditIcon, DeleteIcon } from '@chakra-ui/icons';
import { PermissionAPI } from '@/lib/api/client';
import { Permission } from '@/lib/api/types';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import PermissionForm from './PermissionForm';

function PermissionsPageContent() {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedPermission, setSelectedPermission] = useState<Permission | null>(null);

  const fetchPermissions = async () => {
    try {
      setLoading(true);
      const response = await PermissionAPI.getPermissions({
        page,
        limit,
        search: search || undefined,
      });
      setPermissions(response.permissions);
      setTotal(response.total);
    } catch (error) {
      toast({
        title: '获取权限列表失败',
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
    fetchPermissions();
  }, [page, limit, search]);

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleCreatePermission = () => {
    setSelectedPermission(null);
    onOpen();
  };

  const handleEditPermission = (permission: Permission) => {
    setSelectedPermission(permission);
    onOpen();
  };

  const handleDeletePermission = async (id: number) => {
    if (!confirm('确定要删除该权限吗？')) return;

    try {
      await PermissionAPI.deletePermission(id);
      toast({
        title: '删除成功',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      fetchPermissions();
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
            placeholder="搜索权限..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </InputGroup>
        <Button leftIcon={<AddIcon />} colorScheme="blue" onClick={handleCreatePermission}>
          新建权限
        </Button>
      </HStack>

      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>权限名称</Th>
            <Th>描述</Th>
            <Th>资源</Th>
            <Th>操作</Th>
            <Th>创建时间</Th>
            <Th>操作</Th>
          </Tr>
        </Thead>
        <Tbody>
          {permissions.map((permission) => (
            <Tr key={permission.id}>
              <Td>{permission.name}</Td>
              <Td>{permission.description || '-'}</Td>
              <Td>
                <Badge colorScheme="blue">{permission.resource}</Badge>
              </Td>
              <Td>
                <Badge colorScheme="green">{permission.action}</Badge>
              </Td>
              <Td>{new Date(permission.created_at).toLocaleString()}</Td>
              <Td>
                <HStack spacing={2}>
                  <IconButton
                    aria-label="编辑权限"
                    icon={<EditIcon />}
                    size="sm"
                    onClick={() => handleEditPermission(permission)}
                  />
                  <IconButton
                    aria-label="删除权限"
                    icon={<DeleteIcon />}
                    size="sm"
                    colorScheme="red"
                    onClick={() => handleDeletePermission(permission.id)}
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

      <PermissionForm
        isOpen={isOpen}
        onClose={onClose}
        permission={selectedPermission}
        onSuccess={fetchPermissions}
      />
    </Box>
  );
}

export default function PermissionsPage() {
  return (
    <ProtectedRoute requireManager>
      <PermissionsPageContent />
    </ProtectedRoute>
  );
} 