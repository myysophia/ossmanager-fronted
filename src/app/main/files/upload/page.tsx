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

interface UploadFile {
  id: string;
  file: File;
  progress: number;
  status: 'ready' | 'uploading' | 'error' | 'done';
  error?: string;
}

interface StorageConfig {
  id: string;
  name: string;
  type: string;
}

export default function UploadPage() {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [tag, setTag] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [isPublic, setIsPublic] = useState(false);
  const [storageConfigs, setStorageConfigs] = useState<StorageConfig[]>([]);
  const [selectedStorage, setSelectedStorage] = useState<string>('');
  const toast = useToast();

  useEffect(() => {
    // 模拟获取存储配置
    const fetchStorageConfigs = async () => {
      // 在实际应用中，这里应该是获取存储配置的API调用
      setTimeout(() => {
        const mockConfigs = [
          { id: '1', name: '默认存储', type: 'local' },
          { id: '2', name: '阿里云OSS', type: 'oss' },
        ];
        setStorageConfigs(mockConfigs);
        // 默认选择第一个
        setSelectedStorage(mockConfigs[0].id);
      }, 500);
    };
    
    fetchStorageConfigs();
  }, []);

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
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'text/plain': ['.txt'],
    },
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
        title: '请选择存储配置',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    setUploading(true);
    
    // 模拟文件上传进度
    const uploadPromises = files.map(async (file) => {
      // 只上传状态为ready的文件
      if (file.status !== 'ready') return;
      
      const formData = new FormData();
      formData.append('file', file.file);
      formData.append('storageId', selectedStorage);
      formData.append('isPublic', isPublic.toString());
      formData.append('tags', JSON.stringify(tags));
      
      try {
        // 模拟上传进度
        const totalSteps = 10;
        
        for (let i = 1; i <= totalSteps; i++) {
          await new Promise(resolve => setTimeout(resolve, 300));
          const progress = Math.floor((i / totalSteps) * 100);
          
          setFiles(prev => 
            prev.map(f => 
              f.id === file.id 
                ? { ...f, progress, status: 'uploading' } 
                : f
            )
          );
        }
        
        // 模拟上传完成
        setFiles(prev => 
          prev.map(f => 
            f.id === file.id 
              ? { ...f, progress: 100, status: 'done' } 
              : f
          )
        );
      } catch (error) {
        setFiles(prev => 
          prev.map(f => 
            f.id === file.id 
              ? { 
                  ...f, 
                  progress: 0, 
                  status: 'error', 
                  error: '上传失败' 
                } 
              : f
          )
        );
      }
    });
    
    await Promise.all(uploadPromises);
    
    setUploading(false);
    
    toast({
      title: '上传完成',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
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
                支持的文件类型: 图片, PDF, Word, Excel, 文本文件
              </Text>
            </VStack>
          )}
        </Box>

        <FormControl>
          <FormLabel>存储配置</FormLabel>
          <Select
            value={selectedStorage}
            onChange={(e) => setSelectedStorage(e.target.value)}
            placeholder="选择存储配置"
          >
            {storageConfigs.map((config) => (
              <option key={config.id} value={config.id}>
                {config.name} ({config.type})
              </option>
            ))}
          </Select>
        </FormControl>

        <FormControl display="flex" alignItems="center">
          <FormLabel mb="0">公开访问</FormLabel>
          <Switch
            isChecked={isPublic}
            onChange={(e) => setIsPublic(e.target.checked)}
          />
        </FormControl>

        <FormControl>
          <FormLabel>标签</FormLabel>
          <HStack>
            <Input
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              placeholder="输入标签"
              onKeyPress={(e) => e.key === 'Enter' && addTag()}
            />
            <IconButton
              aria-label="添加标签"
              icon={<FiPlus />}
              onClick={addTag}
            />
          </HStack>
          <Flex mt={2} flexWrap="wrap" gap={2}>
            {tags.map((tag) => (
              <Tag key={tag} size="md" colorScheme="blue">
                <TagLabel>{tag}</TagLabel>
                <TagCloseButton onClick={() => removeTag(tag)} />
              </Tag>
            ))}
          </Flex>
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