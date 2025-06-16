'use client';

import { useState, useEffect, useCallback } from 'react';
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
  Progress,
  InputGroup,
  InputRightElement,
  Icon,
  Tooltip,
} from '@chakra-ui/react';
import { CheckIcon, WarningIcon } from '@chakra-ui/icons';
import { UserAPI, RoleAPI } from '@/lib/api/client';
import { User, CreateUserRequest, UpdateUserRequest, Role } from '@/lib/api/types';

interface UserFormProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onSuccess: () => void;
}

interface ValidationError {
  message: string;
  type: 'error' | 'warning';
}

interface PasswordStrength {
  score: number;
  level: 'weak' | 'medium' | 'strong' | 'very-strong';
  feedback: string[];
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
  const [errors, setErrors] = useState<Record<string, ValidationError>>({});
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({
    score: 0,
    level: 'weak',
    feedback: []
  });
  const [isValidating, setIsValidating] = useState(false);
  const toast = useToast();

  // Debounced validation for real-time feedback
  const [validationTimeouts, setValidationTimeouts] = useState<Record<string, NodeJS.Timeout>>({});

  const debounceValidation = useCallback((field: string, value: string, validator: () => void) => {
    if (validationTimeouts[field]) {
      clearTimeout(validationTimeouts[field]);
    }
    
    const timeout = setTimeout(() => {
      validator();
    }, 300);
    
    setValidationTimeouts(prev => ({ ...prev, [field]: timeout }));
  }, [validationTimeouts]);

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
    // Clear validation errors when switching users
    setErrors({});
    setPasswordStrength({ score: 0, level: 'weak', feedback: [] });
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
  }, [isOpen, toast]);

  // Clean up timeouts on unmount
  useEffect(() => {
    return () => {
      Object.values(validationTimeouts).forEach(timeout => clearTimeout(timeout));
    };
  }, [validationTimeouts]);

  const calculatePasswordStrength = (password: string): PasswordStrength => {
    if (!password) {
      return { score: 0, level: 'weak', feedback: ['请输入密码'] };
    }

    let score = 0;
    const feedback: string[] = [];
    
    // Length check
    if (password.length >= 8) score += 1;
    else if (password.length >= 6) score += 0.5;
    else feedback.push('密码长度至少需要6个字符');
    
    // Character types (required)
    if (/[a-z]/.test(password)) score += 1;
    else feedback.push('必须包含小写字母');
    
    if (/[A-Z]/.test(password)) score += 1;
    else feedback.push('必须包含大写字母');
    
    if (/[0-9]/.test(password)) score += 1;
    else feedback.push('必须包含数字');
    
    if (/[^a-zA-Z0-9]/.test(password)) score += 1;
    else feedback.push('必须包含特殊字符');
    
    // Common password patterns
    if (/(.)\1{2,}/.test(password)) {
      score -= 0.5;
      feedback.push('避免重复字符');
    }
    
    if (/123|abc|qwe|password|admin/i.test(password)) {
      score -= 1;
      feedback.push('避免常见密码模式');
    }

    let level: PasswordStrength['level'] = 'weak';
    if (score >= 4.5) level = 'very-strong';
    else if (score >= 3.5) level = 'strong';
    else if (score >= 2.5) level = 'medium';

    return { score: Math.max(0, Math.min(5, score)), level, feedback };
  };

  const validateUsername = useCallback((value: string): ValidationError | null => {
    if (!value && !user) {
      return { message: '用户名不能为空', type: 'error' };
    }
    
    if (value.length < 3) {
      return { message: '用户名至少需要3个字符', type: 'error' };
    }
    
    if (value.length > 32) {
      return { message: '用户名不能超过32个字符', type: 'error' };
    }
    
    if (!/^[a-zA-Z0-9_-]+$/.test(value)) {
      return { message: '用户名只能包含字母、数字、下划线和连字符', type: 'error' };
    }
    
    // Check for reserved usernames
    const reserved = ['admin', 'root', 'administrator', 'system', 'guest', 'user', 'test', 'demo'];
    if (reserved.includes(value.toLowerCase())) {
      return { message: '此用户名为系统保留用户名', type: 'warning' };
    }
    
    return null;
  }, [user]);

  const validateEmail = useCallback((value: string): ValidationError | null => {
    if (!value) {
      return { message: '邮箱不能为空', type: 'error' };
    }
    
    // Enhanced email regex
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    if (!emailRegex.test(value)) {
      return { message: '邮箱格式不正确', type: 'error' };
    }
    
    // Check for common typos
    const commonDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', '163.com', 'qq.com'];
    const domain = value.split('@')[1]?.toLowerCase();
    if (domain && !commonDomains.includes(domain) && domain.includes('.co')) {
      return { message: '请检查邮箱域名是否正确', type: 'warning' };
    }
    
    return null;
  }, []);

  const validateRealName = useCallback((value: string): ValidationError | null => {
    if (value && value.length > 50) {
      return { message: '真实姓名不能超过50个字符', type: 'error' };
    }
    
    // Check for potential security issues
    if (value && /<[^>]*>/.test(value)) {
      return { message: '姓名不能包含HTML标签', type: 'error' };
    }
    
    return null;
  }, []);

  const validateForm = (): boolean => {
    const newErrors: Record<string, ValidationError> = {};

    // Validate username
    if (!user) {
      const usernameError = validateUsername(username);
      if (usernameError) newErrors.username = usernameError;
    }

    // Validate password
    if (!user) {
      if (!password) {
        newErrors.password = { message: '密码不能为空', type: 'error' };
      } else if (password.length < 6) {
        newErrors.password = { message: '密码至少需要6个字符', type: 'error' };
      } else if (password.length > 32) {
        newErrors.password = { message: '密码不能超过32个字符', type: 'error' };
      } else {
        // 强制密码包含大小写字母、数字和特殊字符
        const hasLower = /[a-z]/.test(password);
        const hasUpper = /[A-Z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        const hasSpecial = /[^a-zA-Z0-9]/.test(password);
        
        if (!hasLower) {
          newErrors.password = { message: '密码必须包含小写字母', type: 'error' };
        } else if (!hasUpper) {
          newErrors.password = { message: '密码必须包含大写字母', type: 'error' };
        } else if (!hasNumber) {
          newErrors.password = { message: '密码必须包含数字', type: 'error' };
        } else if (!hasSpecial) {
          newErrors.password = { message: '密码必须包含特殊字符', type: 'error' };
        } 
        
      }
    }

    // Validate email
    const emailError = validateEmail(email);
    if (emailError) newErrors.email = emailError;

    // Validate real name
    const realNameError = validateRealName(realName);
    if (realNameError) newErrors.realName = realNameError;

    // Validate role selection
    if (selectedRoles.length === 0) {
      newErrors.roles = { message: '请至少选择一个角色', type: 'warning' };
    }

    setErrors(newErrors);
    
    // Only allow submission if there are no error-level validations
    const hasErrors = Object.values(newErrors).some(error => error.type === 'error');
    return !hasErrors;
  };

  // Real-time validation handlers
  const handleUsernameChange = (value: string) => {
    setUsername(value);
    if (!user) {
      debounceValidation('username', value, () => {
        const error = validateUsername(value);
        setErrors(prev => error ? { ...prev, username: error } : { ...prev, username: undefined } as any);
      });
    }
  };

     const handlePasswordChange = (value: string) => {
     setPassword(value);
     const strength = calculatePasswordStrength(value);
     setPasswordStrength(strength);
     
     debounceValidation('password', value, () => {
       let error: ValidationError | null = null;
       if (!value) {
         error = { message: '密码不能为空', type: 'error' };
       } else if (value.length < 6) {
         error = { message: '密码至少需要6个字符', type: 'error' };
       } else if (value.length > 32) {
         error = { message: '密码不能超过32个字符', type: 'error' };
       } else {
         // 强制密码包含大小写字母、数字和特殊字符
         const hasLower = /[a-z]/.test(value);
         const hasUpper = /[A-Z]/.test(value);
         const hasNumber = /[0-9]/.test(value);
         const hasSpecial = /[^a-zA-Z0-9]/.test(value);
         
         if (!hasLower) {
           error = { message: '密码必须包含小写字母', type: 'error' };
         } else if (!hasUpper) {
           error = { message: '密码必须包含大写字母', type: 'error' };
         } else if (!hasNumber) {
           error = { message: '密码必须包含数字', type: 'error' };
         } else if (!hasSpecial) {
           error = { message: '密码必须包含特殊字符', type: 'error' };
         } 
        //  else {
        //    // 检查常见密码模式
        //    if (/(.)\1{2,}/.test(value)) {
        //      error = { message: '密码不能包含连续重复字符', type: 'error' };
        //    } else if (/123|abc|qwe|password|admin/i.test(value)) {
        //      error = { message: '密码不能包含常见密码模式', type: 'error' };
        //    }
        //  }
       }
       
       setErrors(prev => error ? { ...prev, password: error } : { ...prev, password: undefined } as any);
     });
   };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    debounceValidation('email', value, () => {
      const error = validateEmail(value);
      setErrors(prev => error ? { ...prev, email: error } : { ...prev, email: undefined } as any);
    });
  };

  const handleRealNameChange = (value: string) => {
    setRealName(value);
    debounceValidation('realName', value, () => {
      const error = validateRealName(value);
      setErrors(prev => error ? { ...prev, realName: error } : { ...prev, realName: undefined } as any);
    });
  };

  const handleSubmit = async () => {
    setIsValidating(true);
    
    if (!validateForm()) {
      setIsValidating(false);
      return;
    }

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
      setIsValidating(false);
    }
  };

  const handleRoleChange = (roleId: number, checked: boolean) => {
    const newSelectedRoles = checked
      ? [...selectedRoles, roleId]
      : selectedRoles.filter((id) => id !== roleId);
    
    setSelectedRoles(newSelectedRoles);
    
    // Clear role validation error if roles are selected
    if (newSelectedRoles.length > 0 && errors.roles) {
      setErrors(prev => ({ ...prev, roles: undefined } as any));
    }
  };

  const getPasswordStrengthColor = () => {
    switch (passwordStrength.level) {
      case 'very-strong': return 'green';
      case 'strong': return 'blue';
      case 'medium': return 'yellow';
      case 'weak': return 'red';
      default: return 'gray';
    }
  };

  const getPasswordStrengthText = () => {
    switch (passwordStrength.level) {
      case 'very-strong': return '非常强';
      case 'strong': return '强';
      case 'medium': return '中等';
      case 'weak': return '弱';
      default: return '';
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
            {/* Username */}
            <FormControl isRequired={!user} isInvalid={!!errors.username && errors.username.type === 'error'}>
              <FormLabel>用户名</FormLabel>
              <InputGroup>
                <Input
                  value={username}
                  onChange={(e) => handleUsernameChange(e.target.value)}
                  placeholder="请输入用户名 (3-32个字符)"
                  isDisabled={!!user}
                />
                {!user && username && !errors.username && (
                  <InputRightElement>
                    <Icon as={CheckIcon} color="green.500" />
                  </InputRightElement>
                )}
              </InputGroup>
              {errors.username && (
                <FormErrorMessage color={errors.username.type === 'warning' ? 'orange.500' : 'red.500'}>
                  {errors.username.message}
                </FormErrorMessage>
              )}
              {!user && (
                <FormHelperText fontSize="sm" color="gray.500">
                  用户名只能包含字母、数字、下划线和连字符
                </FormHelperText>
              )}
            </FormControl>

            {/* Password */}
            {!user && (
              <FormControl isRequired isInvalid={!!errors.password && errors.password.type === 'error'}>
                <FormLabel>密码</FormLabel>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  placeholder="请输入密码 (6-32个字符)"
                />
                {password && (
                  <Box mt={2}>
                    <Text fontSize="sm" mb={1}>
                      密码强度: {getPasswordStrengthText()}
                    </Text>
                    <Progress
                      value={(passwordStrength.score / 5) * 100}
                      colorScheme={getPasswordStrengthColor()}
                      size="sm"
                      borderRadius="md"
                    />
                    {passwordStrength.feedback.length > 0 && (
                      <Box mt={1}>
                        {passwordStrength.feedback.map((feedback, index) => (
                          <Text key={index} fontSize="xs" color="gray.500">
                            • {feedback}
                          </Text>
                        ))}
                      </Box>
                    )}
                  </Box>
                )}
                {errors.password && (
                  <FormErrorMessage color={errors.password.type === 'warning' ? 'orange.500' : 'red.500'}>
                    {errors.password.message}
                  </FormErrorMessage>
                )}
              </FormControl>
            )}

            {/* Email */}
            <FormControl isRequired isInvalid={!!errors.email && errors.email.type === 'error'}>
              <FormLabel>邮箱</FormLabel>
              <InputGroup>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  placeholder="请输入邮箱地址"
                />
                {email && !errors.email && (
                  <InputRightElement>
                    <Icon as={CheckIcon} color="green.500" />
                  </InputRightElement>
                )}
              </InputGroup>
              {errors.email && (
                <FormErrorMessage color={errors.email.type === 'warning' ? 'orange.500' : 'red.500'}>
                  {errors.email.message}
                </FormErrorMessage>
              )}
            </FormControl>

            {/* Real Name */}
            <FormControl isInvalid={!!errors.realName}>
              <FormLabel>真实姓名</FormLabel>
              <Input
                value={realName}
                onChange={(e) => handleRealNameChange(e.target.value)}
                placeholder="请输入真实姓名 (可选)"
                maxLength={50}
              />
              {errors.realName && (
                <FormErrorMessage>{errors.realName.message}</FormErrorMessage>
              )}
              <FormHelperText fontSize="sm" color="gray.500">
                {realName.length}/50 字符
              </FormHelperText>
            </FormControl>

            {/* Status */}
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

            {/* Roles */}
            <FormControl isInvalid={!!errors.roles}>
              <FormLabel>角色</FormLabel>
              <Box maxH="200px" overflowY="auto" borderWidth={1} borderRadius="md" p={4}>
                <VStack align="start" spacing={2}>
                  {roles.map((role) => (
                    <Checkbox
                      key={role.id}
                      isChecked={selectedRoles.includes(role.id)}
                      onChange={(e) => handleRoleChange(role.id, e.target.checked)}
                    >
                      <Box>
                        <Text fontWeight="medium">{role.name}</Text>
                        {role.description && (
                          <Text fontSize="sm" color="gray.500">
                            {role.description}
                          </Text>
                        )}
                      </Box>
                    </Checkbox>
                  ))}
                </VStack>
              </Box>
              {errors.roles && (
                <FormErrorMessage color={errors.roles.type === 'warning' ? 'orange.500' : 'red.500'}>
                  {errors.roles.message}
                </FormErrorMessage>
              )}
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
            isLoading={loading || isValidating}
            loadingText={isValidating ? "验证中..." : "保存中..."}
          >
            保存
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
} 