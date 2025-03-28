'use client';

import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Box,
  Container,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  Input,
  FormControl,
  FormLabel,
  Switch,
  Select,
  Tag,
  TagLabel,
  TagCloseButton,
  Progress,
  useToast,
  Flex,
  List,
  ListItem,
  IconButton,
} from '@chakra-ui/react';
import { FiUpload, FiX, FiPlus } from 'react-icons/fi';
import { FileAPI } from '@/lib/api';
import { StorageConfig } from '@/lib/api/types';
import { StorageConfigService } from '@/lib/data/storage';

interface UploadFile {
  id: string;
  file: File;
  progress: number;
  status: 'ready' | 'uploading' | 'error' | 'done';
  error?: string;
  result?: any;
}

export default function UploadPage() {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [tag, setTag] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [storageConfigs, setStorageConfigs] = useState<StorageConfig[]>([]);
  const [selectedStorage, setSelectedStorage] = useState<string | null>(null);
  const toast = useToast();

  useEffect(() => {
    // 获取存储配置列表
    const fetchStorageConfigs = async () => {
      try {
        console.log('开始获取存储配置列表...');
        const configs = await StorageConfigService.getAllStorageConfigs();
        console.log('获取到的存储配置列表:', configs);
        
        setStorageConfigs(configs);
        
        // 如果有默认配置，则选中它
        const defaultConfig = configs.find(config => config.is_default);
        if (defaultConfig) {
          console.log('选择默认存储配置:', defaultConfig);
          setSelectedStorage(defaultConfig.id);
        } else if (configs.length > 0) {
          // 如果没有默认配置但有配置项，选择第一个
          console.log('没有默认配置，选择第一个配置:', configs[0]);
          setSelectedStorage(configs[0].id);
        }
      } catch (error) {
        console.error('获取存储配置失败:', error);
        toast({
          title: '获取存储配置失败',
          description: error instanceof Error ? error.message : '未知错误',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    };

    fetchStorageConfigs();
  }, [toast]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map(file => ({
      id: Math.random().toString(36).substring(2, 9),
      file,
      progress: 0,
      status: 'ready' as const,
    }));
    
    setFiles(prev => [...prev, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
  });

  const addTag = () => {
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
      setTag('');
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  const removeFile = (id: string) => {
    setFiles(files.filter(file => file.id !== id));
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      toast({
        title: '请先选择文件',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (!selectedStorage) {
      toast({
        title: '请选择存储位置',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    setUploading(true);
    
    // 实际上传文件到后端
    const uploadPromises = files.map(async (file) => {
      // 只上传状态为ready的文件
      if (file.status !== 'ready') return;
      
      try {
        // 更新状态为正在上传
        setFiles(prev => 
          prev.map(f => 
            f.id === file.id 
              ? { ...f, progress: 10, status: 'uploading' } 
              : f
          )
        );
        
        // 创建包含文件和额外字段的表单数据
        const formData = new FormData();
        // 按照后端 API 格式设置文件
        formData.append('file', file.file);
        
        // 打印上传信息
        console.log('准备上传文件:', {
          fileName: file.file.name,
          fileSize: file.file.size,
          fileType: file.file.type
        });
        
        // 调用后端API上传文件
        const result = await FileAPI.uploadFile(file.file);
        console.log(`文件 ${file.file.name} 上传成功:`, result);
        
        // 更新文件状态为上传完成
        setFiles(prev => 
          prev.map(f => 
            f.id === file.id 
              ? { ...f, progress: 100, status: 'done', result } 
              : f
          )
        );
      } catch (error) {
        console.error(`文件 ${file.file.name} 上传失败:`, error);
        setFiles(prev => 
          prev.map(f => 
            f.id === file.id 
              ? { 
                  ...f, 
                  progress: 0, 
                  status: 'error', 
                  error: error instanceof Error ? error.message : '上传失败' 
                } 
              : f
          )
        );
      }
    });
    
    await Promise.all(uploadPromises);
    
    setUploading(false);
    
    // 检查是否有上传失败的文件
    const failedFiles = files.filter(f => f.status === 'error').length;
    const successFiles = files.filter(f => f.status === 'done').length;
    
    if (failedFiles === 0 && successFiles > 0) {
      toast({
        title: '上传完成',
        description: `成功上传 ${successFiles} 个文件`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } else if (failedFiles > 0 && successFiles > 0) {
      toast({
        title: '上传部分完成',
        description: `成功上传 ${successFiles} 个文件，${failedFiles} 个文件失败`,
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
    } else if (failedFiles > 0 && successFiles === 0) {
      toast({
        title: '上传失败',
        description: `所有 ${failedFiles} 个文件上传失败`,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Container maxW="container.xl" py={10}>
      <VStack spacing={8} align="stretch">
        <Heading size="lg">文件上传</Heading>

        <Box
          {...getRootProps()}
          borderWidth={2}
          borderStyle="dashed"
          borderRadius="lg"
          borderColor={isDragActive ? 'blue.500' : 'gray.300'}
          p={10}
          bg={isDragActive ? 'blue.50' : 'gray.50'}
          textAlign="center"
          cursor="pointer"
          transition="all 0.2s"
          _hover={{ borderColor: 'blue.400', bg: 'blue.50' }}
        >
          <input {...getInputProps()} />
          {isDragActive ? (
            <Text fontSize="lg" color="blue.500">释放文件以上传...</Text>
          ) : (
            <VStack spacing={2}>
              <FiUpload size={40} color="gray" />
              <Text fontSize="lg">拖放文件到此处，或点击选择文件</Text>
              <Text color="gray.500" fontSize="sm">
                支持的文件类型: 图片, PDF, Word, Excel, 文本文件, ZIP, RAR, TAR.GZ, calib, auth
              </Text>
            </VStack>
          )}
        </Box>

        {storageConfigs.length > 0 && (
          <FormControl isRequired>
            <FormLabel>存储位置</FormLabel>
            <Select
              value={selectedStorage || ''}
              onChange={(e) => setSelectedStorage(e.target.value || null)}
              placeholder="选择存储位置"
            >
              {storageConfigs.map((config) => (
                <option key={config.id} value={config.id}>
                  {config.name} ({config.storage_type})
                  {config.is_default ? ' (默认)' : ''}
                </option>
              ))}
            </Select>
          </FormControl>
        )}

        <FormControl>
          <FormLabel>标签</FormLabel>
          <HStack>
            <Input
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              placeholder="添加标签"
              onKeyPress={(e) => e.key === 'Enter' && addTag()}
            />
            <IconButton
              aria-label="添加标签"
              icon={<FiPlus />}
              onClick={addTag}
            />
          </HStack>

          <Box mt={2}>
            {tags.map((tag, index) => (
              <Tag
                key={index}
                borderRadius="full"
                variant="solid"
                colorScheme="blue"
                m={1}
              >
                <TagLabel>{tag}</TagLabel>
                <TagCloseButton onClick={() => removeTag(tag)} />
              </Tag>
            ))}
          </Box>
        </FormControl>

        {files.length > 0 && (
          <Box>
            <Heading size="md" mb={4}>
              已选择的文件 ({files.length})
            </Heading>
            <List spacing={3}>
              {files.map((file) => (
                <ListItem
                  key={file.id}
                  p={3}
                  borderWidth={1}
                  borderRadius="md"
                  bg={
                    file.status === 'done'
                      ? 'green.50'
                      : file.status === 'error'
                      ? 'red.50'
                      : 'white'
                  }
                >
                  <HStack justify="space-between">
                    <VStack align="start" flex={1}>
                      <HStack>
                        <Text fontWeight="medium" noOfLines={1}>
                          {file.file.name}
                        </Text>
                        <Text color="gray.500" fontSize="sm">
                          ({(file.file.size / 1024 / 1024).toFixed(2)} MB)
                        </Text>
                      </HStack>
                      {file.status === 'uploading' && (
                        <Progress
                          value={file.progress}
                          size="sm"
                          width="100%"
                          colorScheme="blue"
                        />
                      )}
                      {file.status === 'error' && (
                        <Text color="red.500" fontSize="sm">
                          {file.error || '上传失败'}
                        </Text>
                      )}
                      {file.status === 'done' && file.result && (
                        <Text color="green.500" fontSize="sm">
                          文件ID: {file.result.id}
                        </Text>
                      )}
                    </VStack>
                    <IconButton
                      aria-label="Remove file"
                      icon={<FiX />}
                      size="sm"
                      variant="ghost"
                      isDisabled={uploading && file.status === 'uploading'}
                      onClick={() => removeFile(file.id)}
                    />
                  </HStack>
                </ListItem>
              ))}
            </List>
          </Box>
        )}

        <Button
          leftIcon={<FiUpload />}
          colorScheme="blue"
          size="lg"
          onClick={handleUpload}
          isLoading={uploading}
          loadingText="上传中..."
          isDisabled={files.length === 0 || uploading}
        >
          开始上传
        </Button>
      </VStack>
    </Container>
  );
} 