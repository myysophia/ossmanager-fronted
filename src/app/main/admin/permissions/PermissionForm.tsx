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
  Select,
  useToast,
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { PermissionAPI } from '@/lib/api/client';
import { Permission } from '@/lib/api/types';

interface PermissionFormProps {
  isOpen: boolean;
  onClose: () => void;
  permission: Permission | null;
  onSuccess: () => void;
}

export default function PermissionForm({
  isOpen,
  onClose,
  permission,
  onSuccess,
}: PermissionFormProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [resource, setResource] = useState('');
  const [action, setAction] = useState('');
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (permission) {
      setName(permission.name);
      setDescription(permission.description || '');
      setResource(permission.resource);
      setAction(permission.action);
    } else {
      setName('');
      setDescription('');
      setResource('');
      setAction('');
    }
  }, [permission]);

  const handleSubmit = async () => {
    if (!name || !resource || !action) {
      toast({
        title: '请填写必填字段',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      setLoading(true);
      if (permission) {
        await PermissionAPI.updatePermission(permission.id, {
          name,
          description,
          resource,
          action,
        });
        toast({
          title: '更新成功',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        await PermissionAPI.createPermission({
          name,
          description,
          resource,
          action,
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
        title: permission ? '更新失败' : '创建失败',
        description: error instanceof Error ? error.message : '未知错误',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{permission ? '编辑权限' : '新建权限'}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <FormControl isRequired mb={4}>
            <FormLabel>权限名称</FormLabel>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="请输入权限名称"
            />
          </FormControl>
          <FormControl mb={4}>
            <FormLabel>描述</FormLabel>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="请输入权限描述"
            />
          </FormControl>
          <FormControl isRequired mb={4}>
            <FormLabel>资源</FormLabel>
            <Select value={resource} onChange={(e) => setResource(e.target.value)}>
              <option value="">请选择资源</option>
              <option value="user">用户</option>
              <option value="role">角色</option>
              <option value="permission">权限</option>
              <option value="file">文件</option>
              <option value="storage">存储</option>
            </Select>
          </FormControl>
          <FormControl isRequired>
            <FormLabel>操作</FormLabel>
            <Select value={action} onChange={(e) => setAction(e.target.value)}>
              <option value="">请选择操作</option>
              <option value="create">创建</option>
              <option value="read">读取</option>
              <option value="update">更新</option>
              <option value="delete">删除</option>
              <option value="list">列表</option>
            </Select>
          </FormControl>
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
            {permission ? '更新' : '创建'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
} 