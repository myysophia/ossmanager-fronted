'use client';

import { useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Box,
  Button,
  VStack,
  Text,
  useToast,
  Progress,
  HStack,
  IconButton,
  useColorModeValue,
  Select,
  FormControl,
  FormLabel,
  Checkbox,
  Input,
  Tag,
  TagLabel,
  TagCloseButton,
} from '@chakra-ui/react';
import { FiUpload, FiX, FiCheck, FiAlertCircle } from 'react-icons/fi';

interface UploadFile {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
}

interface StorageConfig {
  id: string;
  name: string;
  type: string;
  endpoint: string;
  accessKey: string;
  secretKey: string;
  bucket: string;
  region: string;
}

export default function UploadPage() {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [storageConfigs, setStorageConfigs] = useState<StorageConfig[]>([]);
  const [selectedConfig, setSelectedConfig] = useState<string>('');
  const [isPublic, setIsPublic] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const toast = useToast();

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  useEffect(() => {
    // 获取存储配置列表
    fetch('/api/configs')
      .then((res) => res.json())
      .then((data) => {
        setStorageConfigs(data);
        if (data.length > 0) {
          setSelectedConfig(data[0].id);
        }
      })
      .catch((error) => {
        toast({
          title: '获取存储配置失败',
          description: error.message,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      });
  }, [toast]);

  const onDrop = (acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map((file) => ({
      file,
      progress: 0,
      status: 'pending' as const,
    }));
    setFiles((prev) => [...prev, ...newFiles]);
  };

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

  const handleUpload = async (file: UploadFile) => {
    const formData = new FormData();
    formData.append('file', file.file);
    formData.append('storageConfigId', selectedConfig);
    formData.append('isPublic', String(isPublic));
    formData.append('tags', JSON.stringify(tags));

    setFiles((prev) =>
      prev.map((f) =>
        f.file === file.file ? { ...f, status: 'uploading' as const } : f
      )
    );

    try {
      const response = await fetch('/api/files/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('上传失败');
      }

      setFiles((prev) =>
        prev.map((f) =>
          f.file === file.file ? { ...f, status: 'success' as const } : f
        )
      );

      toast({
        title: '上传成功',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      setFiles((prev) =>
        prev.map((f) =>
          f.file === file.file
            ? { ...f, status: 'error' as const, error: error.message }
            : f
        )
      );

      toast({
        title: '上传失败',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleRemoveFile = (file: UploadFile) => {
    setFiles((prev) => prev.filter((f) => f.file !== file.file));
  };

  const handleAddTag = () => {
    if (newTag && !tags.includes(newTag)) {
      setTags((prev) => [...prev, newTag]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags((prev) => prev.filter((t) => t !== tag));
  };

  return (
    <Box p={6}>
      <VStack spacing={6} align="stretch">
        <Box
          {...getRootProps()}
          p={8}
          border="2px dashed"
          borderColor={isDragActive ? 'blue.500' : borderColor}
          borderRadius="md"
          bg={bgColor}
          cursor="pointer"
          transition="all 0.2s"
          _hover={{ borderColor: 'blue.500' }}
        >
          <input {...getInputProps()} />
          <VStack spacing={4}>
            <FiUpload size={48} />
            <Text fontSize="lg">
              {isDragActive
                ? '将文件拖放到这里'
                : '拖放文件到这里，或点击选择文件'}
            </Text>
            <Text fontSize="sm" color="gray.500">
              支持图片、PDF、Office文档等格式
            </Text>
          </VStack>
        </Box>

        <FormControl>
          <FormLabel>存储配置</FormLabel>
          <Select
            value={selectedConfig}
            onChange={(e) => setSelectedConfig(e.target.value)}
          >
            {storageConfigs.map((config) => (
              <option key={config.id} value={config.id}>
                {config.name}
              </option>
            ))}
          </Select>
        </FormControl>

        <FormControl>
          <FormLabel>公开访问</FormLabel>
          <Checkbox isChecked={isPublic} onChange={(e) => setIsPublic(e.target.checked)}>
            允许公开访问
          </Checkbox>
        </FormControl>

        <FormControl>
          <FormLabel>标签</FormLabel>
          <HStack>
            <Input
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="输入标签"
            />
            <Button onClick={handleAddTag}>添加</Button>
          </HStack>
          <HStack mt={2} flexWrap="wrap" spacing={2}>
            {tags.map((tag) => (
              <Tag key={tag} size="md" borderRadius="full">
                <TagLabel>{tag}</TagLabel>
                <TagCloseButton onClick={() => handleRemoveTag(tag)} />
              </Tag>
            ))}
          </HStack>
        </FormControl>

        <VStack spacing={4} align="stretch">
          {files.map((file) => (
            <Box
              key={file.file.name}
              p={4}
              borderWidth="1px"
              borderRadius="md"
              bg={bgColor}
            >
              <HStack justify="space-between">
                <Text noOfLines={1} flex={1}>
                  {file.file.name}
                </Text>
                <IconButton
                  aria-label="删除文件"
                  icon={<FiX />}
                  size="sm"
                  onClick={() => handleRemoveFile(file)}
                  isDisabled={file.status === 'uploading'}
                />
              </HStack>

              <Text fontSize="sm" color="gray.500" mt={1}>
                {(file.file.size / 1024 / 1024).toFixed(2)} MB
              </Text>

              {file.status === 'uploading' && (
                <Progress value={file.progress} size="sm" mt={2} />
              )}

              {file.status === 'success' && (
                <HStack mt={2} color="green.500">
                  <FiCheck />
                  <Text>上传成功</Text>
                </HStack>
              )}

              {file.status === 'error' && (
                <HStack mt={2} color="red.500">
                  <FiAlertCircle />
                  <Text>{file.error}</Text>
                </HStack>
              )}

              {file.status === 'pending' && (
                <Button
                  size="sm"
                  mt={2}
                  onClick={() => handleUpload(file)}
                  isLoading={file.status === 'uploading'}
                >
                  开始上传
                </Button>
              )}
            </Box>
          ))}
        </VStack>
      </VStack>
    </Box>
  );
} 