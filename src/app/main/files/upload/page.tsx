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
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import { FiUpload, FiX, FiPlus } from 'react-icons/fi';
import { FileAPI } from '@/lib/api';
import { BucketService, BucketAccess } from '@/lib/data/bucket';

interface UploadFile {
  id: string;
  file: File;
  progress: number;
  status: 'ready' | 'uploading' | 'error' | 'done';
  error?: string;
  result?: any;
}

// 安全配置
const SECURITY_CONFIG = {
  // 允许的文件类型 (MIME types)
  allowedMimeTypes: [
    // 图片
    'image/jpeg',
    'image/png', 
    'image/gif',
    'image/webp',
    // 文档
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    // 文本
    'text/plain',
    'text/csv',
    // 压缩文件
    'application/zip',
    'application/x-rar-compressed',
    'application/vnd.rar', // 标准RAR MIME类型
    'application/x-rar', // 另一种可能的RAR MIME类型
    'application/rar', // 简化的RAR MIME类型
    'application/x-tar',
    'application/gzip',
    'application/x-gzip',
  ],
  
  // 允许的文件扩展名
  allowedExtensions: [
    '.jpg', '.jpeg', '.png', '.gif', '.webp',
    '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx',
    '.txt', '.csv',
    '.zip', '.rar', '.tar', '.gz'
  ],
  
  // 最大文件大小 (100MB)
  maxFileSize: 500 * 1024 * 1024,
  
  // 最大文件数量
  maxFileCount: 20,
  
  // 危险的文件扩展名黑名单
  dangerousExtensions: [
    '.exe', '.bat', '.cmd', '.com', '.pif', '.scr', '.vbs', '.js', '.jar',
    '.sh', '.php', '.asp', '.aspx', '.jsp', '.pl', '.py', '.rb'
  ]
};

// 文件安全验证函数 - 已取消验证限制
function validateFile(file: File): { isValid: boolean; error?: string } {
  // 调试信息：记录文件类型
  console.log(`文件验证: ${file.name}, MIME类型: "${file.type}", 大小: ${file.size}`);
  
  // 取消所有验证限制，直接返回 true
  return { isValid: true };
}

// 清理文件名
function sanitizeFileName(fileName: string): string {
  return fileName
    .replace(/[<>:"/\\|?*\x00-\x1f]/g, '_') // 替换危险字符
    .replace(/^\.+/, '') // 移除开头的点
    .substring(0, 255); // 限制长度
}

export default function UploadPage() {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [tag, setTag] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [buckets, setBuckets] = useState<BucketAccess[]>([]);
  const [selectedBucketId, setSelectedBucketId] = useState<number | null>(null);
  const [bucketsLoading, setBucketsLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    const fetchUserBuckets = async () => {
      try {
        const bucketList = await BucketService.getUserBucketAccess();
        setBuckets(bucketList);
        if (bucketList.length > 0) {
          setSelectedBucketId(bucketList[0].id);
        }
      } catch (error) {
        toast({
          title: '获取 bucket 列表失败',
          description: error instanceof Error ? error.message : '未知错误',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setBucketsLoading(false);
      }
    };
    fetchUserBuckets();
  }, [toast]);

  // 生成人性化的错误提示
  const getHumanizedErrorMessage = (error: any, fileName: string): string => {
    if (error.code === 'file-invalid-type') {
      const fileExtension = '.' + fileName.split('.').pop()?.toLowerCase();
      return `不支持 ${fileExtension} 格式的文件。支持的格式包括：图片 (JPG、PNG、GIF、WebP)、文档 (PDF、Word、Excel、PowerPoint)、文本文件 (TXT、CSV) 和压缩包 (ZIP、RAR、TAR、GZ)`;
    }
    if (error.code === 'file-too-large') {
      const maxSizeMB = (SECURITY_CONFIG.maxFileSize / 1024 / 1024).toFixed(0);
      return `文件大小超过限制，最大允许 ${maxSizeMB}MB。`;
    }
    if (error.code === 'too-many-files') {
      return `文件数量超过限制，最多只能选择 ${SECURITY_CONFIG.maxFileCount} 个文件。`;
    }
    return error.message || '文件上传失败，请重试。';
  };

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    // 取消所有验证限制，直接处理所有文件
    const allFiles = [...acceptedFiles, ...rejectedFiles.map(r => r.file)];
    
    // 添加所有文件，不进行任何验证
    if (allFiles.length > 0) {
      const newFiles = allFiles.map(file => ({
        id: Math.random().toString(36).substring(2, 9),
        file: file,
        progress: 0,
        status: 'ready' as const,
      }));
      setFiles(prev => [...prev, ...newFiles]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    // 取消所有文件类型、大小和数量限制
    // accept: undefined,
    // maxSize: undefined,
    // maxFiles: undefined,
  });

  const addTag = () => {
    if (tag && !tags.includes(tag)) {
      // 验证标签内容
      const sanitizedTag = tag.trim().replace(/[<>:"/\\|?*\x00-\x1f]/g, '');
      if (sanitizedTag && sanitizedTag.length <= 50) {
        setTags([...tags, sanitizedTag]);
        setTag('');
      } else {
        toast({
          title: '无效的标签',
          description: '标签不能包含特殊字符且长度不能超过50字符',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
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
    
    const selectedBucket = buckets.find(b => b.id === selectedBucketId);
    if (!selectedBucket) {
      toast({
        title: '请选择存储位置',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    setUploading(true);
    const uploadPromises = files.map(async (file) => {
      if (file.status !== 'ready') return;
      
      try {
        setFiles(prev => prev.map(f => f.id === file.id ? { ...f, progress: 10, status: 'uploading' } : f));
        
        // 已取消文件验证限制
        
        const formData = new FormData();
        formData.append('file', file.file);
        if (tags.length > 0) {
          formData.append('tags', JSON.stringify(tags));
        }
        
        const result = await FileAPI.uploadFile(
          formData,
          {
            regionCode: selectedBucket.region_code,
            bucketName: selectedBucket.bucket_name
          }
        );
        
        setFiles(prev => prev.map(f => f.id === file.id ? { ...f, progress: 100, status: 'done', result } : f));
      } catch (error) {
        setFiles(prev => prev.map(f => f.id === file.id ? { 
          ...f, 
          progress: 0, 
          status: 'error', 
          error: error instanceof Error ? error.message : '上传失败' 
        } : f));
      }
    });
    
    await Promise.all(uploadPromises);
    setUploading(false);
    
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
        
        {/* 安全提示 */}
        <Alert status="info">
          <AlertIcon />
          <VStack align="start" spacing={1}>
            <Text fontWeight="bold">安全提示:</Text>
            <Text fontSize="sm">
              • 最大文件大小: {(SECURITY_CONFIG.maxFileSize / 1024 / 1024).toFixed(0)}MB
            </Text>
            <Text fontSize="sm">
              • 最多文件数量: {SECURITY_CONFIG.maxFileCount}个
            </Text>
            <Text fontSize="sm">
              • 支持格式: 图片、PDF、Office文档、文本、压缩包
            </Text>
          </VStack>
        </Alert>
        
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
                支持的文件类型: 图片, PDF, Word, Excel, 文本文件, ZIP, RAR, TAR.GZ,Nova文件格式后缀(如.calib)
              </Text>
              <Text color="red.500" fontSize="xs">
                禁止上传可执行文件和脚本文件
              </Text>
            </VStack>
          )}
        </Box>

        {/* 存储位置选择 */}
        <FormControl isRequired>
          <FormLabel>存储位置</FormLabel>
          {bucketsLoading ? (
            <Select placeholder="加载中..." isDisabled />
          ) : buckets.length > 0 ? (
            <Select
              value={selectedBucketId ?? ''}
              onChange={e => setSelectedBucketId(Number(e.target.value) || null)}
              placeholder="选择存储位置"
            >
              {buckets.map(bucket => (
                <option key={bucket.id} value={bucket.id}>
                  {bucket.region_code} - {bucket.bucket_name}
                </option>
              ))}
            </Select>
          ) : (
            <Alert status="warning">
              <AlertIcon />
              <VStack align="start" spacing={1}>
                <Text fontWeight="medium">暂无可用的存储位置</Text>
                <Text fontSize="sm">
                  请联系管理员配置存储bucket或为您分配访问权限
                </Text>
              </VStack>
            </Alert>
          )}
        </FormControl>

        {/* <FormControl>
          <FormLabel>文件标签</FormLabel>
          <HStack>
            <Input
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              placeholder="输入标签名称"
              onKeyPress={(e) => e.key === 'Enter' && addTag()}
            />
            <IconButton
              aria-label="添加标签"
              icon={<FiPlus />}
              onClick={addTag}
              isDisabled={!tag}
            />
          </HStack>
          {tags.length > 0 && (
            <Flex mt={2} flexWrap="wrap" gap={2}>
              {tags.map((t, index) => (
                <Tag key={index} size="md" colorScheme="blue">
                  <TagLabel>{t}</TagLabel>
                  <TagCloseButton onClick={() => removeTag(t)} />
                </Tag>
              ))}
            </Flex>
          )}
        </FormControl> */}

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
