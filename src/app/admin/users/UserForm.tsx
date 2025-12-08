'use client';

import { useState, useEffect } from 'react';
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
  FormErrorMessage,
  VStack,
  useToast,
  Switch,
  FormHelperText,
  Select,
} from '@chakra-ui/react';
import { UserAPI } from '@/lib/api/client';
import { User, CreateUserRequest, UpdateUserRequest } from '@/lib/api/types';

interface UserFormProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onSuccess: () => void;
}

type FormData = {
  username?: string;
  password?: string;
  email: string;
  real_name?: string;
  status?: boolean;
  role_ids: number[];
};

export default function UserForm({ isOpen, onClose, user, onSuccess }: UserFormProps) {
  const [formData, setFormData] = useState<FormData>({
    username: '',
    password: '',
    email: '',
    real_name: '',
    role_ids: [],
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const toast = useToast();

  useEffect(() => {
    if (user) {
      setFormData({
        email: user.email,
        real_name: user.real_name || '',
        status: user.status,
        role_ids: user.roles?.map((role) => Number(role.id)) || [],
      });
    } else {
      setFormData({
        username: '',
        password: '',
        email: '',
        real_name: '',
        role_ids: [],
      });
    }
  }, [user]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!user && !formData.username) {
      newErrors.username = '用户名不能为空';
    }

    if (!user && !formData.password) {
      newErrors.password = '密码不能为空';
    }

    if (!formData.email) {
      newErrors.email = '邮箱不能为空';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = '邮箱格式不正确';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      if (user) {
        const updateData: UpdateUserRequest = {
          email: formData.email,
          real_name: formData.real_name,
          status: formData.status,
          role_ids: formData.role_ids,
        };
        await UserAPI.updateUser(user.id, updateData);
        toast({
          title: '更新成功',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        const createData: CreateUserRequest = {
          username: formData.username!,
          password: formData.password!,
          email: formData.email,
          real_name: formData.real_name,
          role_ids: formData.role_ids,
        };
        await UserAPI.createUser(createData);
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
        title: user ? '更新失败' : '创建失败',
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
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{user ? '编辑用户' : '新建用户'}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4}>
            {!user && (
              <>
                <FormControl isInvalid={!!errors.username}>
                  <FormLabel>用户名</FormLabel>
                  <Input
                    value={formData.username}
                    onChange={(e) =>
                      setFormData({ ...formData, username: e.target.value })
                    }
                  />
                  <FormErrorMessage>{errors.username}</FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={!!errors.password}>
                  <FormLabel>密码</FormLabel>
                  <Input
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                  />
                  <FormErrorMessage>{errors.password}</FormErrorMessage>
                </FormControl>
              </>
            )}

            <FormControl isInvalid={!!errors.email}>
              <FormLabel>邮箱</FormLabel>
              <Input
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
              <FormErrorMessage>{errors.email}</FormErrorMessage>
            </FormControl>

            <FormControl>
              <FormLabel>真实姓名</FormLabel>
              <Input
                value={formData.real_name}
                onChange={(e) => setFormData({ ...formData, real_name: e.target.value })}
              />
            </FormControl>

            {user && (
              <FormControl>
                <FormLabel>状态</FormLabel>
                <Switch
                  isChecked={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.checked })
                  }
                />
                <FormHelperText>启用或禁用用户账号</FormHelperText>
              </FormControl>
            )}
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
            {user ? '保存' : '创建'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
} 