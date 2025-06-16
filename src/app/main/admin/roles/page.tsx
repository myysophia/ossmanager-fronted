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
import { SearchIcon, AddIcon, EditIcon, DeleteIcon, SettingsIcon, LockIcon } from '@chakra-ui/icons';
import { RoleAPI } from '@/lib/api/client';
import { Role } from '@/lib/api/types';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import RoleForm from './RoleForm';
import RegionBucketAccessForm from './RegionBucketAccessForm';
import RolePermissionForm from './RolePermissionForm';

function RolesPageContent() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  
  // 地域-桶访问权限分配模态框状态
  const {
    isOpen: isRegionBucketAccessOpen,
    onOpen: onRegionBucketAccessOpen,
    onClose: onRegionBucketAccessClose,
  } = useDisclosure();

  // 角色权限管理模态框状态
  const {
    isOpen: isPermissionFormOpen,
    onOpen: onPermissionFormOpen,
    onClose: onPermissionFormClose,
  } = useDisclosure();

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const response = await RoleAPI.getRoles({
        page,
        limit,
        search: search || undefined,
      });
      setRoles(response.roles);
      setTotal(response.total);
    } catch (error) {
      toast({
        title: '获取角色列表失败',
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
    fetchRoles();
  }, [page, limit, search]);

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleCreateRole = () => {
    setSelectedRole(null);
    onOpen();
  };

  const handleEditRole = (role: Role) => {
    setSelectedRole(role);
    onOpen();
  };

  const handleRegionBucketAccess = (role: Role) => {
    setSelectedRole(role);
    onRegionBucketAccessOpen();
  };

  const handlePermissionManage = (role: Role) => {
    setSelectedRole(role);
    onPermissionFormOpen();
  };

  const handleDeleteRole = async (id: number) => {
    if (!confirm('确定要删除该角色吗？')) return;

    try {
      await RoleAPI.deleteRole(id);
      toast({
        title: '删除成功',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      fetchRoles();
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
            placeholder="搜索角色..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </InputGroup>
        <Button leftIcon={<AddIcon />} colorScheme="blue" onClick={handleCreateRole}>
          新建角色
        </Button>
      </HStack>

      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>角色名称</Th>
            <Th>描述</Th>
            <Th>权限数量</Th>
            <Th>创建时间</Th>
            <Th>操作</Th>
          </Tr>
        </Thead>
        <Tbody>
          {roles.map((role) => (
            <Tr key={role.id}>
              <Td>{role.name}</Td>
              <Td>{role.description || '-'}</Td>
              <Td>
                <Badge colorScheme="blue">{role.permissions?.length || 0}</Badge>
              </Td>
              <Td>{new Date(role.created_at).toLocaleString()}</Td>
              <Td>
                <HStack spacing={2}>
                  <IconButton
                    aria-label="编辑角色"
                    icon={<EditIcon />}
                    size="sm"
                    onClick={() => handleEditRole(role)}
                  />
                  <IconButton
                    aria-label="权限管理"
                    icon={<LockIcon />}
                    size="sm"
                    colorScheme="teal"
                    onClick={() => handlePermissionManage(role)}
                  />
                  <IconButton
                    aria-label="地域-桶访问权限"
                    icon={<SettingsIcon />}
                    size="sm"
                    colorScheme="purple"
                    onClick={() => handleRegionBucketAccess(role)}
                  />
                  <IconButton
                    aria-label="删除角色"
                    icon={<DeleteIcon />}
                    size="sm"
                    colorScheme="red"
                    onClick={() => handleDeleteRole(role.id)}
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

      <RoleForm
        isOpen={isOpen}
        onClose={onClose}
        role={selectedRole}
        onSuccess={fetchRoles}
      />

      {selectedRole && (
        <>
          <RegionBucketAccessForm
            isOpen={isRegionBucketAccessOpen}
            onClose={onRegionBucketAccessClose}
            roleId={selectedRole.id}
            roleName={selectedRole.name}
            onSuccess={fetchRoles}
          />
          <RolePermissionForm
            isOpen={isPermissionFormOpen}
            onClose={onPermissionFormClose}
            role={selectedRole}
            onSuccess={fetchRoles}
          />
        </>
      )}
    </Box>
  );
}

export default function RolesPage() {
  return (
    <ProtectedRoute requireManager>
      <RolesPageContent />
    </ProtectedRoute>
  );
} 