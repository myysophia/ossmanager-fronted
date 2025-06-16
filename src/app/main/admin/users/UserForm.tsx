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
  Checkbox,
  Box,
  Text,
} from '@chakra-ui/react';
import { UserAPI, RoleAPI } from '@/lib/api/client';
import { User, CreateUserRequest, UpdateUserRequest, Role } from '@/lib/api/types';

interface UserFormProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onSuccess: () => void;
}

export default function UserForm({ isOpen, onClose, user, onSuccess }: UserFormProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [realName, setRealName] = useState('');
  const [status, setStatus] = useState(true);
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const toast = useToast();

  useEffect(() => {
    if (user) {
      setUsername(user.username);
      setEmail(user.email);
      setRealName(user.real_name || '');
      setStatus(user.status);
      setSelectedRoles(Array.isArray(user.roles) ? user.roles.map((r) => r.id) : []);
    } else {
      setUsername('');
      setPassword('');
      setEmail('');
      setRealName('');
      setStatus(true);
      setSelectedRoles([]);
    }
  }, [user]);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await RoleAPI.getRoles({
          page: 1,
          limit: 100,
        });
        setRoles(response.roles || []);
      } catch (error) {
        toast({
          title: '获取角色列表失败',
          description: error instanceof Error ? error.message : '未知错误',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    };

    if (isOpen) {
      fetchRoles();
    }
  }, [isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!user && !username) {
      newErrors.username = '用户名不能为空';
    }

    if (!user && !password) {
      newErrors.password = '密码不能为空';
    }

    if (!email) {
      newErrors.email = '邮箱不能为空';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
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
          email,
          real_name: realName,
          status,
          role_ids: selectedRoles,
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
          username,
          password,
          email,
          real_name: realName,
          role_ids: selectedRoles,
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

  const handleRoleChange = (roleId: number, checked: boolean) => {
    if (checked) {
      setSelectedRoles([...selectedRoles, roleId]);
    } else {
      setSelectedRoles(selectedRoles.filter((id) => id !== roleId));
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{user ? '编辑用户' : '新建用户'}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4}>
            <FormControl isRequired isInvalid={!!errors.username}>
              <FormLabel>用户名</FormLabel>
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="请输入用户名"
                isDisabled={!!user}
              />
              {errors.username && <FormErrorMessage>{errors.username}</FormErrorMessage>}
            </FormControl>
            {!user && (
              <FormControl isRequired isInvalid={!!errors.password}>
                <FormLabel>密码</FormLabel>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="请输入密码"
                />
                {errors.password && <FormErrorMessage>{errors.password}</FormErrorMessage>}
              </FormControl>
            )}
            <FormControl isRequired isInvalid={!!errors.email}>
              <FormLabel>邮箱</FormLabel>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="请输入邮箱"
              />
              {errors.email && <FormErrorMessage>{errors.email}</FormErrorMessage>}
            </FormControl>
            <FormControl>
              <FormLabel>真实姓名</FormLabel>
              <Input
                value={realName}
                onChange={(e) => setRealName(e.target.value)}
                placeholder="请输入真实姓名"
              />
            </FormControl>
            <FormControl>
              <FormLabel>状态</FormLabel>
              <Switch
                isChecked={status}
                onChange={(e) => setStatus(e.target.checked)}
                colorScheme="green"
              />
              <FormHelperText>
                {status ? '启用' : '禁用'}
              </FormHelperText>
            </FormControl>
            <FormControl>
              <FormLabel>角色</FormLabel>
              <Box maxH="200px" overflowY="auto" borderWidth={1} borderRadius="md" p={4}>
                <VStack align="start" spacing={2}>
                  {roles.map((role) => (
                    <Checkbox
                      key={role.id}
                      isChecked={selectedRoles.includes(role.id)}
                      onChange={(e) => handleRoleChange(role.id, e.target.checked)}
                    >
                      {role.name}
                    </Checkbox>
                  ))}
                </VStack>
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