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
  Input,
  Textarea,
  useToast,
  VStack,
  Checkbox,
  Box,
  Text,
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { RoleAPI, PermissionAPI } from '@/lib/api/client';
import { Role, Permission } from '@/lib/api/types';

interface RoleFormProps {
  isOpen: boolean;
  onClose: () => void;
  role: Role | null;
  onSuccess: () => void;
}

export default function RoleForm({
  isOpen,
  onClose,
  role,
  onSuccess,
}: RoleFormProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [selectedPermissions, setSelectedPermissions] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (role) {
      setName(role.name);
      setDescription(role.description || '');
      setSelectedPermissions(role.permissions?.map((p) => p.id) || []);
    } else {
      setName('');
      setDescription('');
      setSelectedPermissions([]);
    }
  }, [role]);

  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        const response = await PermissionAPI.getPermissions({
          page: 1,
          limit: 100,
        });
        setPermissions(response.permissions);
      } catch (error) {
        toast({
          title: '获取权限列表失败',
          description: error instanceof Error ? error.message : '未知错误',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    };

    if (isOpen) {
      fetchPermissions();
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    if (!name) {
      toast({
        title: '请填写角色名称',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      setLoading(true);
      if (role) {
        await RoleAPI.updateRole(role.id, {
          name,
          description,
          permission_ids: selectedPermissions,
        });
        toast({
          title: '更新成功',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        await RoleAPI.createRole({
          name,
          description,
          permission_ids: selectedPermissions,
        });
        toast({
          title: '创建成功',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }
      onSuccess();
      onClose();
    } catch (error) {
      toast({
        title: role ? '更新失败' : '创建失败',
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

  const groupedPermissions = (permissions ?? []).reduce((acc, permission) => {
    const resource = permission.resource;
    if (!acc[resource]) {
      acc[resource] = [];
    }
    acc[resource].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{role ? '编辑角色' : '新建角色'}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4}>
            <FormControl isRequired>
              <FormLabel>角色名称</FormLabel>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="请输入角色名称"
              />
            </FormControl>
            <FormControl>
              <FormLabel>描述</FormLabel>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="请输入角色描述"
              />
            </FormControl>
            <FormControl>
              <FormLabel>权限</FormLabel>
              <Box maxH="300px" overflowY="auto" borderWidth={1} borderRadius="md" p={4}>
                {Object.entries(groupedPermissions).map(([resource, perms]) => (
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
                          {permission.name}
                        </Checkbox>
                      ))}
                    </VStack>
                  </Box>
                ))}
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
            {role ? '更新' : '创建'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
} 