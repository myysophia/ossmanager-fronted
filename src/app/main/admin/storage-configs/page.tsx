'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Container,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
  useToast,
  Badge,
  HStack,
  Text,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Select,
  Textarea,
  VStack,
  Switch,
} from '@chakra-ui/react';
import { FiEdit2, FiTrash2, FiPlus, FiCheck, FiStar } from 'react-icons/fi';
import { ConfigAPI } from '@/lib/api';
import { StorageConfig, StorageConfigInput } from '@/lib/api/types';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

type StorageType = 'ALIYUN_OSS' | 'AWS_S3' | 'CLOUDFLARE_R2';

function StorageConfigsPageContent() {
  const [configs, setConfigs] = useState<StorageConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedConfig, setSelectedConfig] = useState<StorageConfig | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  // 获取存储配置列表
  const fetchConfigs = async () => {
    try {
      const response = await ConfigAPI.getConfigs();
      setConfigs(response.items || []);
    } catch (error) {
      console.error('获取存储配置失败:', error);
      toast({
        title: '获取存储配置失败',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfigs();
  }, []);

  // 处理删除配置
  const handleDelete = async (id: number) => {
    if (!window.confirm('确定要删除此配置吗？')) return;

    try {
      await ConfigAPI.deleteConfig(id);
      toast({
        title: '删除成功',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      fetchConfigs(); // 重新加载列表
    } catch (error) {
      console.error('删除配置失败:', error);
      toast({
        title: '删除配置失败',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // 处理设置默认配置
  const handleSetDefault = async (id: number) => {
    try {
      await ConfigAPI.setDefaultConfig(id);
      toast({
        title: '设置默认配置成功',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      fetchConfigs(); // 重新加载列表
    } catch (error) {
      console.error('设置默认配置失败:', error);
      toast({
        title: '设置默认配置失败',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // 处理测试连接
  const handleTestConnection = async (id: number) => {
    try {
      const success = await ConfigAPI.testConnection(id);
      toast({
        title: success ? '连接测试成功' : '连接测试失败',
        status: success ? 'success' : 'error',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('测试连接失败:', error);
      toast({
        title: '测试连接失败',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Container maxW="container.xl" py={8}>
      <Box mb={6}>
        <HStack justify="space-between">
          <Heading size="lg">存储配置管理</Heading>
          <Button
            leftIcon={<FiPlus />}
            colorScheme="blue"
            onClick={() => {
              setSelectedConfig(null); // 清空选中的配置
              onOpen(); // 打开模态框
            }}
          >
            添加配置
          </Button>
        </HStack>
      </Box>

      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>名称</Th>
            <Th>存储类型</Th>
            <Th>Bucket</Th>
            <Th>Region</Th>
            <Th>状态</Th>
            <Th>操作</Th>
          </Tr>
        </Thead>
        <Tbody>
          {configs.map((config) => (
            <Tr key={config.id}>
              <Td>
                <HStack>
                  <Text>{config.name}</Text>
                  {config.is_default && (
                    <Badge colorScheme="green">默认</Badge>
                  )}
                </HStack>
              </Td>
              <Td>{config.storage_type}</Td>
              <Td>{config.bucket}</Td>
              <Td>{config.region}</Td>
              <Td>
                <Badge colorScheme="blue">
                  {config.is_default ? '默认' : '正常'}
                </Badge>
              </Td>
              <Td>
                <HStack spacing={2}>
                  <IconButton
                    aria-label="编辑"
                    icon={<FiEdit2 />}
                    size="sm"
                    onClick={() => {
                      setSelectedConfig(config);
                      onOpen();
                    }}
                  />
                  <IconButton
                    aria-label="删除"
                    icon={<FiTrash2 />}
                    size="sm"
                    colorScheme="red"
                    onClick={() => handleDelete(config.id)}
                  />
                  <IconButton
                    aria-label="设为默认"
                    icon={<FiStar />}
                    size="sm"
                    colorScheme={config.is_default ? 'yellow' : 'gray'}
                    onClick={() => handleSetDefault(config.id)}
                  />
                  <Button
                    size="sm"
                    onClick={() => handleTestConnection(config.id)}
                  >
                    测试连接
                  </Button>
                </HStack>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>

      {/* 编辑/创建配置的模态框 */}
      <ConfigFormModal
        isOpen={isOpen}
        onClose={onClose}
        config={selectedConfig}
        onSuccess={() => {
          onClose();
          fetchConfigs();
        }}
      />
    </Container>
  );
}

// 配置表单模态框组件
function ConfigFormModal({
  isOpen,
  onClose,
  config,
  onSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  config: StorageConfig | null;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState<StorageConfigInput>({
    name: '',
    storage_type: 'AWS_S3' as StorageType,
    access_key: '',
    secret_key: '',
    region: '',
    bucket: '',
    endpoint: '',
    root_path: '',
    description: '',
  });
  const toast = useToast();

  useEffect(() => {
    if (config) {
      setFormData({
        name: config.name,
        storage_type: config.storage_type,
        access_key: config.access_key,
        secret_key: '', // 出于安全考虑，不回显密钥
        region: config.region,
        bucket: config.bucket,
        endpoint: config.endpoint,
        root_path: config.root_path || '',
        description: config.description || '',
      });
    } else {
      setFormData({
        name: '',
        storage_type: 'AWS_S3' as StorageType,
        access_key: '',
        secret_key: '',
        region: '',
        bucket: '',
        endpoint: '',
        root_path: '',
        description: '',
      });
    }
  }, [config]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (config) {
        await ConfigAPI.updateConfig(config.id, formData);
        toast({
          title: '更新配置成功',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        await ConfigAPI.createConfig(formData);
        toast({
          title: '创建配置成功',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }
      onSuccess();
    } catch (error) {
      console.error('保存配置失败:', error);
      toast({
        title: '保存配置失败',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          {config ? '编辑存储配置' : '创建存储配置'}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <form onSubmit={handleSubmit}>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>配置名称</FormLabel>
                <Input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="请输入配置名称"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>存储类型</FormLabel>
                <Select
                  value={formData.storage_type}
                  onChange={(e) =>
                    setFormData({ ...formData, storage_type: e.target.value as StorageType })
                  }
                >
                  <option value="ALIYUN_OSS">阿里云OSS</option>
                  <option value="AWS_S3">AWS S3</option>
                  <option value="CLOUDFLARE_R2">Cloudflare R2</option>
                </Select>
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Access Key</FormLabel>
                <Input
                  value={formData.access_key}
                  onChange={(e) =>
                    setFormData({ ...formData, access_key: e.target.value })
                  }
                  placeholder="请输入Access Key"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Secret Key</FormLabel>
                <Input
                  type="password"
                  value={formData.secret_key}
                  onChange={(e) =>
                    setFormData({ ...formData, secret_key: e.target.value })
                  }
                  placeholder={config ? '不修改请留空' : '请输入Secret Key'}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Region</FormLabel>
                <Input
                  value={formData.region}
                  onChange={(e) =>
                    setFormData({ ...formData, region: e.target.value })
                  }
                  placeholder="请输入Region"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Bucket</FormLabel>
                <Input
                  value={formData.bucket}
                  onChange={(e) =>
                    setFormData({ ...formData, bucket: e.target.value })
                  }
                  placeholder="请输入Bucket名称"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Endpoint</FormLabel>
                <Input
                  value={formData.endpoint}
                  onChange={(e) =>
                    setFormData({ ...formData, endpoint: e.target.value })
                  }
                  placeholder="请输入Endpoint地址"
                />
              </FormControl>

              <FormControl>
                <FormLabel>根路径</FormLabel>
                <Input
                  value={formData.root_path}
                  onChange={(e) =>
                    setFormData({ ...formData, root_path: e.target.value })
                  }
                  placeholder="请输入根路径（可选）"
                />
              </FormControl>

              <FormControl>
                <FormLabel>描述</FormLabel>
                <Textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="请输入配置描述（可选）"
                />
              </FormControl>

              <Button type="submit" colorScheme="blue" width="full">
                {config ? '更新' : '创建'}
              </Button>
            </VStack>
          </form>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}

export default function StorageConfigsPage() {
  return (
    <ProtectedRoute requireManager>
      <StorageConfigsPageContent />
    </ProtectedRoute>
  );
} 