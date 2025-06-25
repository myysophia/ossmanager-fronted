'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  VStack,
  Text,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  SimpleGrid,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Heading,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  HStack,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  FormControl,
  FormLabel,
  Input,
  Select,
  Switch,
  useToast,
  Divider,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Tag,
  TagLabel,
  TagCloseButton,
  Flex,
  Spacer,
  useColorModeValue,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
} from '@chakra-ui/react';
import { FiMoreVertical, FiEdit2, FiTrash2, FiPlus } from 'react-icons/fi';
import { AdminAPI } from '@/lib/api';

// 本地存储配置类型，用于表单和UI展示
interface LocalStorageConfig {
  id: string;
  name: string;
  type: string;
  endpoint: string;
  accessKey: string;
  secretKey: string;
  bucket: string;
  region: string;
  isDefault: boolean;
}

// 本地系统配置类型，用于表单和UI展示
interface LocalSystemConfig {
  siteName: string;
  description: string;
  maxFileSize: number;
  allowedFileTypes: string[];
  maxUploadConcurrency: number;
  enableRegistration: boolean;
  enableCaptcha: boolean;
  enablePublicAccess: boolean;
  retentionDays: number;
}

export default function SettingsPage() {
  const [storageConfigs, setStorageConfigs] = useState<LocalStorageConfig[]>([]);
  const [systemConfig, setSystemConfig] = useState<LocalSystemConfig>({
    siteName: '',
    description: '',
    maxFileSize: 5120,
    allowedFileTypes: [],
    maxUploadConcurrency: 5,
    enableRegistration: false,
    enableCaptcha: false,
    enablePublicAccess: false,
    retentionDays: 30,
  });
  const [loading, setLoading] = useState(false);
  const [selectedConfig, setSelectedConfig] = useState<LocalStorageConfig | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    endpoint: '',
    accessKey: '',
    secretKey: '',
    bucket: '',
    region: '',
    isDefault: false,
  });
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  useEffect(() => {
    fetchStorageConfigs();
    fetchSystemConfig();
  }, []);

  const fetchStorageConfigs = async () => {
    setLoading(true);
    try {
      const data = await AdminAPI.getStorageConfigs();
      const localConfigs: LocalStorageConfig[] = data.map(config => ({
        id: config.id,
        name: config.name,
        type: config.storage_type,
        endpoint: config.endpoint,
        accessKey: config.access_key,
        secretKey: config.secret_key,
        bucket: config.bucket,
        region: config.region,
        isDefault: config.is_default,
      }));
      setStorageConfigs(localConfigs);
    } catch (error) {
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
    try {
      const data = await AdminAPI.getSystemConfig();
      const localConfig: LocalSystemConfig = {
        siteName: data.site_name,
        description: data.description,
        maxFileSize: data.max_file_size,
        allowedFileTypes: data.allowed_file_types,
        maxUploadConcurrency: data.max_upload_concurrency,
        enableRegistration: data.enable_registration,
        enableCaptcha: data.enable_captcha,
        enablePublicAccess: data.enable_public_access,
        retentionDays: data.retention_days,
      };
      setSystemConfig(localConfig);
    } catch (error) {
      toast({
        title: '获取系统配置失败',
        description: error instanceof Error ? error.message : '未知错误',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleCreateConfig = async () => {
    try {
      await AdminAPI.createStorageConfig({
        name: formData.name,
        storage_type: formData.type as 'ALIYUN_OSS' | 'AWS_S3' | 'CLOUDFLARE_R2',
        access_key: formData.accessKey,
        secret_key: formData.secretKey,
        bucket: formData.bucket,
        region: formData.region,
        endpoint: formData.endpoint,
        is_default: formData.isDefault,
      });

      fetchStorageConfigs();
      onClose();
      setFormData({
        name: '',
        type: '',
        endpoint: '',
        accessKey: '',
        secretKey: '',
        bucket: '',
        region: '',
        isDefault: false,
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
      await AdminAPI.updateStorageConfig(selectedConfig.id, {
        name: formData.name,
        storage_type: formData.type as 'ALIYUN_OSS' | 'AWS_S3' | 'CLOUDFLARE_R2',
        access_key: formData.accessKey,
        secret_key: formData.secretKey,
        bucket: formData.bucket,
        region: formData.region,
        endpoint: formData.endpoint,
        is_default: formData.isDefault,
      });

      fetchStorageConfigs();
      onClose();
      setSelectedConfig(null);
      setFormData({
        name: '',
        type: '',
        endpoint: '',
        accessKey: '',
        secretKey: '',
        bucket: '',
        region: '',
        isDefault: false,
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

  const handleDeleteConfig = async (configId: string) => {
    try {
      await AdminAPI.deleteStorageConfig(configId);
      
      fetchStorageConfigs();
      toast({
        title: '删除存储配置成功',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
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
      await AdminAPI.updateSystemConfig({
        site_name: systemConfig.siteName,
        description: systemConfig.description,
        max_file_size: systemConfig.maxFileSize,
        allowed_file_types: systemConfig.allowedFileTypes,
        enable_registration: systemConfig.enableRegistration,
        enable_captcha: systemConfig.enableCaptcha,
      });
      
      toast({
        title: '更新系统配置成功',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: '更新系统配置失败',
        description: error instanceof Error ? error.message : '未知错误',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleEditConfig = (config: LocalStorageConfig) => {
    setSelectedConfig(config);
    setFormData({
      name: config.name,
      type: config.type,
      endpoint: config.endpoint,
      accessKey: config.accessKey,
      secretKey: config.secretKey,
      bucket: config.bucket,
      region: config.region,
      isDefault: config.isDefault,
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
          {/* 存储配置 */}
          <TabPanel>
            <VStack spacing={6} align="stretch">
              <HStack justify="space-between">
                <Text fontSize="2xl" fontWeight="bold">
                  存储配置列表
                </Text>
                <Button
                  leftIcon={<FiPlus />}
                  onClick={() => {
                    setSelectedConfig(null);
                    setFormData({
                      name: '',
                      type: '',
                      endpoint: '',
                      accessKey: '',
                      secretKey: '',
                      bucket: '',
                      region: '',
                      isDefault: false,
                    });
                    onOpen();
                  }}
                >
                  新建配置
                </Button>
              </HStack>

              <Box overflowX="auto">
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th>名称</Th>
                      <Th>类型</Th>
                      <Th>端点</Th>
                      <Th>存储桶</Th>
                      <Th>区域</Th>
                      <Th>默认</Th>
                      <Th>操作</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {storageConfigs.map((config) => (
                      <Tr key={config.id}>
                        <Td>{config.name}</Td>
                        <Td>{config.type}</Td>
                        <Td>{config.endpoint}</Td>
                        <Td>{config.bucket}</Td>
                        <Td>{config.region}</Td>
                        <Td>
                          <Badge
                            colorScheme={config.isDefault ? 'green' : 'gray'}
                          >
                            {config.isDefault ? '是' : '否'}
                          </Badge>
                        </Td>
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
            </VStack>
          </TabPanel>

          {/* 系统设置 */}
          <TabPanel>
            <VStack spacing={6} align="stretch">
              <Text fontSize="2xl" fontWeight="bold">
                系统设置
              </Text>

              <VStack spacing={4} align="stretch">
                <FormControl>
                  <FormLabel>最大文件大小 (MB)</FormLabel>
                  <Input
                    type="number"
                    value={systemConfig.maxFileSize}
                    onChange={(e) =>
                      setSystemConfig((prev) => ({
                        ...prev,
                        maxFileSize: Number(e.target.value),
                      }))
                    }
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>允许的文件类型</FormLabel>
                  <Input
                    value={systemConfig.allowedFileTypes.join(', ')}
                    onChange={(e) =>
                      setSystemConfig((prev) => ({
                        ...prev,
                        allowedFileTypes: e.target.value.split(',').map((t) => t.trim()),
                      }))
                    }
                    placeholder="用逗号分隔，例如：jpg, png, pdf"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>最大上传并发数</FormLabel>
                  <Input
                    type="number"
                    value={systemConfig.maxUploadConcurrency}
                    onChange={(e) =>
                      setSystemConfig((prev) => ({
                        ...prev,
                        maxUploadConcurrency: Number(e.target.value),
                      }))
                    }
                  />
                </FormControl>

                <FormControl display="flex" alignItems="center">
                  <FormLabel mb="0">启用公开访问</FormLabel>
                  <Switch
                    isChecked={systemConfig.enablePublicAccess}
                    onChange={(e) =>
                      setSystemConfig((prev) => ({
                        ...prev,
                        enablePublicAccess: e.target.checked,
                      }))
                    }
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>文件保留天数</FormLabel>
                  <Input
                    type="number"
                    value={systemConfig.retentionDays}
                    onChange={(e) =>
                      setSystemConfig((prev) => ({
                        ...prev,
                        retentionDays: Number(e.target.value),
                      }))
                    }
                  />
                </FormControl>

                <Button colorScheme="blue" onClick={handleUpdateSystemConfig}>
                  保存设置
                </Button>
              </VStack>
            </VStack>
          </TabPanel>
        </TabPanels>
      </Tabs>

      {/* 存储配置表单弹窗 */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {selectedConfig ? '编辑存储配置' : '新建存储配置'}
          </ModalHeader>
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>配置名称</FormLabel>
                <Input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="请输入配置名称"
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>存储类型</FormLabel>
                <Select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, type: e.target.value }))
                  }
                >
                  <option value="local">本地存储</option>
                  <option value="oss">阿里云OSS</option>
                  <option value="cos">腾讯云COS</option>
                  <option value="s3">AWS S3</option>
                </Select>
              </FormControl>
              <FormControl isRequired>
                <FormLabel>端点</FormLabel>
                <Input
                  value={formData.endpoint}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, endpoint: e.target.value }))
                  }
                  placeholder="请输入端点地址"
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Access Key</FormLabel>
                <Input
                  value={formData.accessKey}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, accessKey: e.target.value }))
                  }
                  placeholder="请输入Access Key"
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Secret Key</FormLabel>
                <Input
                  type="password"
                  value={formData.secretKey}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, secretKey: e.target.value }))
                  }
                  placeholder="请输入Secret Key"
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>存储桶</FormLabel>
                <Input
                  value={formData.bucket}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, bucket: e.target.value }))
                  }
                  placeholder="请输入存储桶名称"
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>区域</FormLabel>
                <Input
                  value={formData.region}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, region: e.target.value }))
                  }
                  placeholder="请输入区域"
                />
              </FormControl>
              <FormControl display="flex" alignItems="center">
                <FormLabel mb="0">设为默认</FormLabel>
                <Switch
                  isChecked={formData.isDefault}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, isDefault: e.target.checked }))
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