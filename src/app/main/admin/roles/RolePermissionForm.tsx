'use client';

import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  VStack,
  useToast,
  Checkbox,
  Box,
  Text,
  Divider,
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { RoleAPI, PermissionAPI } from '@/lib/api/client';
import { Role, Permission } from '@/lib/api/types';

interface RolePermissionFormProps {
  isOpen: boolean;
  onClose: () => void;
  role: Role;
  onSuccess: () => void;
}

export default function RolePermissionForm({
  isOpen,
  onClose,
  role,
  onSuccess,
}: RolePermissionFormProps) {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [selectedPermissions, setSelectedPermissions] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen, role]);

  const fetchData = async () => {
    try {
      setLoading(true);
      // 获取所有权限
      const permissionsResponse = await PermissionAPI.getPermissions({
        page: 1,
        limit: 100,
      });
      console.log('获取到的权限数据:', permissionsResponse);
      setPermissions(permissionsResponse.permissions);
      console.log('设置后的 permissions 状态:', permissionsResponse.permissions);

      // 获取角色已分配的权限
      const roleResponse = await RoleAPI.getRole(role.id);
      console.log('获取到的角色权限数据:', roleResponse);
      setSelectedPermissions(roleResponse.permissions?.map((p) => p.id) || []);
    } catch (error) {
      console.error('获取数据失败:', error);
      toast({
        title: '获取数据失败',
        description: error instanceof Error ? error.message : '未知错误',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePermissionChange = (permissionId: number, checked: boolean) => {
    if (checked) {
      setSelectedPermissions([...selectedPermissions, permissionId]);
    } else {
      setSelectedPermissions(selectedPermissions.filter((id) => id !== permissionId));
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      await RoleAPI.updateRole(role.id, {
        name: role.name,
        description: role.description,
        permission_ids: selectedPermissions,
      });
      toast({
        title: '更新成功',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onSuccess();
      onClose();
    } catch (error) {
      toast({
        title: '更新失败',
        description: error instanceof Error ? error.message : '未知错误',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  // 按资源类型分组权限
  const groupedPermissions = permissions.reduce((acc, permission) => {
    const resource = permission.resource;
    if (!acc[resource]) {
      acc[resource] = [];
    }
    acc[resource].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);

  console.log('计算后的 groupedPermissions:', groupedPermissions);
  console.log('当前 permissions 状态:', permissions);
  console.log('当前 selectedPermissions 状态:', selectedPermissions);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>角色权限管理 - {role.name}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4}>
            <FormControl>
              <FormLabel>权限列表</FormLabel>
              <Box maxH="400px" overflowY="auto" borderWidth={1} borderRadius="md" p={4}>
                {loading ? (
                  <Text>加载中...</Text>
                ) : Object.keys(groupedPermissions).length === 0 ? (
                  <Text>暂无权限数据</Text>
                ) : (
                  Object.entries(groupedPermissions).map(([resource, perms]) => (
                    <Box key={resource} mb={4}>
                      <Text fontWeight="bold" mb={2}>
                        {resource}
                      </Text>
                      <VStack align="start" spacing={2}>
                        {perms.map((permission) => (
                          <Checkbox
                            key={permission.id}
                            isChecked={selectedPermissions.includes(permission.id)}
                            onChange={(e) =>
                              handlePermissionChange(permission.id, e.target.checked)
                            }
                          >
                            <Box>
                              <Text fontWeight="medium">{permission.name}</Text>
                              {permission.description && (
                                <Text fontSize="sm" color="gray.500">
                                  {permission.description}
                                </Text>
                              )}
                            </Box>
                          </Checkbox>
                        ))}
                      </VStack>
                      <Divider my={2} />
                    </Box>
                  ))
                )}
              </Box>
            </FormControl>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            取消
          </Button>
          <Button
            colorScheme="blue"
            onClick={handleSubmit}
            isLoading={loading}
          >
            保存
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
} 