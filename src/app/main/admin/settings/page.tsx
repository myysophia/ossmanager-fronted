'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useToast,
  Text,
  Badge,
  useColorModeValue,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  FormControl,
  FormLabel,
  Input,
  Select,
  Switch,
  useDisclosure,
  Spinner,
} from '@chakra-ui/react';
import { FiMoreVertical, FiEdit2, FiTrash2, FiPlus } from 'react-icons/fi';
import { StorageConfigService } from '@/lib/data/storage';
import { StorageConfig, StorageConfigInput } from '@/lib/api/types';
import { SystemConfigService, SystemConfig } from '@/lib/data/system';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

function SettingsPageContent() {
  const [storageConfigs, setStorageConfigs] = useState<StorageConfig[]>([]);
  const [systemConfig, setSystemConfig] = useState<SystemConfig>({
    site_name: '',
    description: '',
    logo_url: '',
    max_file_size: 5120,
    allowed_file_types: [],
    default_storage_config_id: 0,
    enable_registration: false,
    enable_captcha: false,
  });
  const [loading, setLoading] = useState(false);
  const [systemLoading, setSystemLoading] = useState(false);
  const [selectedConfig, setSelectedConfig] = useState<StorageConfig | null>(null);
  const [formData, setFormData] = useState<StorageConfigInput>({
    name: '',
    storage_type: 'ALIYUN_OSS',
    endpoint: '',
    access_key: '',
    secret_key: '',
    bucket: '',
    region: '',
    root_path: '',
    description: ''
  });
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  useEffect(() => {
    console.log('组件加载，开始获取配置');
    fetchStorageConfigs();
    fetchSystemConfig();
  }, []);

  const fetchStorageConfigs = async () => {
    console.log('开始获取存储配置列表');
    setLoading(true);
    try {
      const configs = await StorageConfigService.getAllStorageConfigs();
      console.log('获取到存储配置:', configs);
      setStorageConfigs(configs);
    } catch (error) {
      console.error('获取存储配置失败:', error);
      toast({
        title: '获取存储配置失败',
        description: error instanceof Error ? error.message : '未知错误',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchSystemConfig = async () => {
    console.log('开始获取系统配置');
    setSystemLoading(true);
    try {
      const config = await SystemConfigService.getConfig();
      console.log('获取到系统配置:', config);
      setSystemConfig(config);
    } catch (error) {
      console.error('获取系统配置失败:', error);
      toast({
        title: '获取系统配置失败',
        description: error instanceof Error ? error.message : '未知错误',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setSystemLoading(false);
    }
  };

  const handleCreateConfig = async () => {
    try {
      const response = await fetch('/api/admin/storage-configs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('创建存储配置失败');
      }

      fetchStorageConfigs();
      onClose();
      setFormData({
        name: '',
        storage_type: 'ALIYUN_OSS',
        endpoint: '',
        access_key: '',
        secret_key: '',
        bucket: '',
        region: '',
        root_path: '',
        description: ''
      });
      toast({
        title: '创建存储配置成功',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: '创建存储配置失败',
        description: error instanceof Error ? error.message : '未知错误',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleUpdateConfig = async () => {
    if (!selectedConfig) return;

    try {
      const response = await fetch(`/api/admin/storage-configs/${selectedConfig.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('更新存储配置失败');
      }

      fetchStorageConfigs();
      onClose();
      setSelectedConfig(null);
      setFormData({
        name: '',
        storage_type: 'ALIYUN_OSS',
        endpoint: '',
        access_key: '',
        secret_key: '',
        bucket: '',
        region: '',
        root_path: '',
        description: ''
      });
      toast({
        title: '更新存储配置成功',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: '更新存储配置失败',
        description: error instanceof Error ? error.message : '未知错误',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleDeleteConfig = async (id: string) => {
    try {
      await StorageConfigService.deleteStorageConfig(Number(id));
      toast({
        title: '删除存储配置成功',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      fetchStorageConfigs();
    } catch (error) {
      console.error('删除配置失败:', error);
      toast({
        title: '删除存储配置失败',
        description: error instanceof Error ? error.message : '未知错误',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleUpdateSystemConfig = async () => {
    try {
      console.log('开始更新系统配置');
      const updatedConfig = await SystemConfigService.updateConfig(systemConfig);
      console.log('系统配置更新成功:', updatedConfig);
      setSystemConfig(updatedConfig);
      toast({
        title: '更新系统配置成功',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('更新系统配置失败:', error);
      toast({
        title: '更新系统配置失败',
        description: error instanceof Error ? error.message : '未知错误',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleEditConfig = (config: StorageConfig) => {
    setSelectedConfig(config);
    setFormData({
      name: config.name,
      storage_type: config.storage_type,
      endpoint: config.endpoint || '',
      access_key: config.access_key,
      secret_key: config.secret_key,
      bucket: config.bucket,
      region: config.region || '',
      root_path: '',
      description: ''
    });
    onOpen();
  };

  return (
    <Box p={6}>
      <Tabs>
        <TabList>
          <Tab>存储配置</Tab>
          <Tab>系统设置</Tab>
        </TabList>

        <TabPanels>
          {/* 存储配置面板 */}
          <TabPanel>
            <VStack spacing={6} align="stretch">
              <HStack justify="space-between">
                <Text fontSize="2xl" fontWeight="bold">
                  存储配置
                </Text>
                <Button leftIcon={<FiPlus />} colorScheme="blue" onClick={onOpen}>
                  添加配置
                </Button>
              </HStack>

              {loading ? (
                <Box textAlign="center" py={4}>
                  <Spinner />
                  <Text mt={2}>加载中...</Text>
                </Box>
              ) : storageConfigs.length === 0 ? (
                <Box textAlign="center" py={4}>
                  <Text>暂无存储配置</Text>
                </Box>
              ) : (
                <Box overflowX="auto">
                  <Table variant="simple" bg={bgColor} borderWidth="1px" borderColor={borderColor}>
                    <Thead>
                      <Tr>
                        <Th>名称</Th>
                        <Th>类型</Th>
                        <Th>状态</Th>
                        <Th>描述</Th>
                        <Th>操作</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {storageConfigs.map((config) => (
                        <Tr key={config.id}>
                          <Td>{config.name}</Td>
                          <Td>{config.storage_type}</Td>
                          <Td>
                            <Badge colorScheme={config.is_default ? 'green' : 'gray'}>
                              {config.is_default ? '默认' : '正常'}
                            </Badge>
                          </Td>
                          <Td>-</Td>
                          <Td>
                            <Menu>
                              <MenuButton
                                as={IconButton}
                                icon={<FiMoreVertical />}
                                variant="ghost"
                                size="sm"
                              />
                              <MenuList>
                                <MenuItem
                                  icon={<FiEdit2 />}
                                  onClick={() => handleEditConfig(config)}
                                >
                                  编辑
                                </MenuItem>
                                <MenuItem
                                  icon={<FiTrash2 />}
                                  onClick={() => handleDeleteConfig(config.id)}
                                  color="red.500"
                                >
                                  删除
                                </MenuItem>
                              </MenuList>
                            </Menu>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </Box>
              )}
            </VStack>
          </TabPanel>

          {/* 系统设置面板 */}
          <TabPanel>
            <VStack spacing={6} align="stretch">
              <Text fontSize="2xl" fontWeight="bold">
                系统设置
              </Text>

              {systemLoading ? (
                <Box textAlign="center" py={4}>
                  <Spinner />
                  <Text mt={2}>加载中...</Text>
                </Box>
              ) : (
                <VStack spacing={4} align="stretch">
                  <FormControl>
                    <FormLabel>站点名称</FormLabel>
                    <Input
                      value={systemConfig.site_name}
                      onChange={(e) =>
                        setSystemConfig((prev) => ({
                          ...prev,
                          site_name: e.target.value,
                        }))
                      }
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>站点描述</FormLabel>
                    <Input
                      value={systemConfig.description}
                      onChange={(e) =>
                        setSystemConfig((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Logo URL</FormLabel>
                    <Input
                      value={systemConfig.logo_url}
                      onChange={(e) =>
                        setSystemConfig((prev) => ({
                          ...prev,
                          logo_url: e.target.value,
                        }))
                      }
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>最大文件大小 (MB)</FormLabel>
                    <Input
                      type="number"
                      value={systemConfig.max_file_size}
                      onChange={(e) =>
                        setSystemConfig((prev) => ({
                          ...prev,
                          max_file_size: Number(e.target.value),
                        }))
                      }
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>允许的文件类型</FormLabel>
                    <Input
                      value={systemConfig.allowed_file_types.join(', ')}
                      onChange={(e) =>
                        setSystemConfig((prev) => ({
                          ...prev,
                          allowed_file_types: e.target.value.split(',').map((t) => t.trim()),
                        }))
                      }
                      placeholder="用逗号分隔，例如：jpg, png, pdf"
                    />
                  </FormControl>

                  <FormControl display="flex" alignItems="center">
                    <FormLabel mb="0">启用注册</FormLabel>
                    <Switch
                      isChecked={systemConfig.enable_registration}
                      onChange={(e) =>
                        setSystemConfig((prev) => ({
                          ...prev,
                          enable_registration: e.target.checked,
                        }))
                      }
                    />
                  </FormControl>

                  <FormControl display="flex" alignItems="center">
                    <FormLabel mb="0">启用验证码</FormLabel>
                    <Switch
                      isChecked={systemConfig.enable_captcha}
                      onChange={(e) =>
                        setSystemConfig((prev) => ({
                          ...prev,
                          enable_captcha: e.target.checked,
                        }))
                      }
                    />
                  </FormControl>

                  <Button colorScheme="blue" onClick={handleUpdateSystemConfig}>
                    保存设置
                  </Button>
                </VStack>
              )}
            </VStack>
          </TabPanel>
        </TabPanels>
      </Tabs>

      {/* 存储配置表单弹窗 */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {selectedConfig ? '编辑存储配置' : '添加存储配置'}
          </ModalHeader>
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>名称</FormLabel>
                <Input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>存储类型</FormLabel>
                <Select
                  value={formData.storage_type}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      storage_type: e.target.value as 'ALIYUN_OSS' | 'AWS_S3' | 'CLOUDFLARE_R2',
                    }))
                  }
                >
                  <option value="ALIYUN_OSS">阿里云 OSS</option>
                  <option value="AWS_S3">AWS S3</option>
                  <option value="CLOUDFLARE_R2">Cloudflare R2</option>
                </Select>
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Endpoint</FormLabel>
                <Input
                  value={formData.endpoint}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, endpoint: e.target.value }))
                  }
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Access Key</FormLabel>
                <Input
                  value={formData.access_key}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, access_key: e.target.value }))
                  }
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Secret Key</FormLabel>
                <Input
                  type="password"
                  value={formData.secret_key}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, secret_key: e.target.value }))
                  }
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Bucket</FormLabel>
                <Input
                  value={formData.bucket}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, bucket: e.target.value }))
                  }
                />
              </FormControl>

              <FormControl>
                <FormLabel>Region</FormLabel>
                <Input
                  value={formData.region || ''}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, region: e.target.value }))
                  }
                />
              </FormControl>

              <FormControl>
                <FormLabel>根路径</FormLabel>
                <Input
                  value={formData.root_path || ''}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, root_path: e.target.value }))
                  }
                />
              </FormControl>

              <FormControl>
                <FormLabel>描述</FormLabel>
                <Input
                  value={formData.description || ''}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, description: e.target.value }))
                  }
                />
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              取消
            </Button>
            <Button
              colorScheme="blue"
              onClick={selectedConfig ? handleUpdateConfig : handleCreateConfig}
            >
              {selectedConfig ? '更新' : '创建'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}

export default function SettingsPage() {
  return (
    <ProtectedRoute requireManager>
      <SettingsPageContent />
    </ProtectedRoute>
  );
} 