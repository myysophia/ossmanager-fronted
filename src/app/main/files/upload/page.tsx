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
import apiClient from '@/lib/api/axios';

interface UploadFile {
  id: string;
  file: File;
  progress: number;
  status: 'ready' | 'initializing' | 'uploading' | 'error' | 'done';
  error?: string;
  result?: any;
  uploadedBytes?: number;
  uploadSpeed?: number;
  startTime?: number;
  estimatedTimeRemaining?: number;
  taskId?: string;
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
  
  // 最大文件大小 (5GB)
  maxFileSize: 5 * 1024 * 1024 * 1024,
  
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

// 格式化文件大小
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 格式化上传速度
function formatUploadSpeed(bytesPerSecond: number): string {
  if (bytesPerSecond === 0) return '0 B/s';
  const k = 1024;
  const sizes = ['B/s', 'KB/s', 'MB/s', 'GB/s'];
  const i = Math.floor(Math.log(bytesPerSecond) / Math.log(k));
  return parseFloat((bytesPerSecond / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 格式化剩余时间
function formatTimeRemaining(seconds: number): string {
  if (seconds === 0 || !isFinite(seconds)) return '--';
  if (seconds < 60) return `${Math.ceil(seconds)}秒`;
  if (seconds < 3600) return `${Math.ceil(seconds / 60)}分钟`;
  return `${Math.ceil(seconds / 3600)}小时`;
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

  // 初始化上传任务，获取task_id
  const initUploadTask = async (fileSize: number): Promise<string> => {
    console.log('开始初始化上传任务，文件大小:', fileSize);

    try {
      const response = await apiClient.post('/uploads/init', {
        total: fileSize
      });

      console.log('初始化上传任务响应:', response.data);
      
      const apiResponse = response.data;
      
      // 检查响应格式
      if (!apiResponse || typeof apiResponse !== 'object') {
        console.error('响应格式错误:', apiResponse);
        throw new Error('服务器返回数据格式错误');
      }
      
      // 检查API响应状态
      if (response.code !== 200) {
        throw new Error(`初始化上传任务失败: ${apiResponse.message || '未知错误'}`);
      }

      // 检查是否有data和task_id
      if (!response.data || !response.data.id) {
        console.error('响应中缺少task_id:', apiResponse);
        throw new Error('服务器返回的数据中缺少task_id');
      }

      console.log('获取到task_id:', response.data.id);
      return response.data.id;
    } catch (error: any) {
      console.error('初始化上传任务失败，完整错误对象:', error);
      console.error('错误类型:', typeof error);
      console.error('错误名称:', error.name);
      console.error('错误消息:', error.message);
      console.error('错误栈:', error.stack);
      
      // 如果是axios错误
      if (error.response) {
        console.error('这是axios响应错误');
        console.error('错误响应状态:', error.response.status);
        console.error('错误响应数据:', error.response.data);
        console.error('错误响应头:', error.response.headers);
        const errorMessage = error.response.data?.message || error.response.statusText || '网络请求失败';
        throw new Error(`初始化上传任务失败: ${error.response.status} - ${errorMessage}`);
      }
      // 如果是网络错误
      if (error.request) {
        console.error('这是网络错误');
        console.error('错误请求:', error.request);
        throw new Error('网络连接失败，请检查网络');
      }
      
      // 其他错误
      console.error('这是其他类型错误');
      const errorMessage = error.message || String(error) || '完全未知错误';
      throw new Error(`初始化上传任务失败: ${errorMessage}`);
    }
  };

  // 创建SSE连接监听上传进度
  const createProgressListener = (taskId: string, fileId: string, fileSize: number) => {
    const token = localStorage.getItem('token');
    
    // EventSource不支持自定义headers，需要通过cookie认证
    // 直接连接到后端，因为SSE不会经过Next.js代理
    const baseApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';
    const sseUrl = `${baseApiUrl}/uploads/${taskId}/stream`;
    console.log('创建SSE连接:', sseUrl);
    console.log('直连后端，依赖cookie认证');
    
    const eventSource = new EventSource(sseUrl);

    let lastUpdateTime = Date.now();
    let lastUploadedBytes = 0;
    let speedSamples: number[] = [];

    eventSource.addEventListener('progress', (event) => {
      try {
        const data = JSON.parse(event.data);
        const { total, uploaded } = data;

        const now = Date.now();
        const timeDiff = (now - lastUpdateTime) / 1000; // 秒
        const bytesDiff = uploaded - lastUploadedBytes;

        // 计算上传速度
        let currentSpeed = 0;
        if (timeDiff >= 2 && bytesDiff > 0) { // 每0.5秒更新一次速度
          currentSpeed = bytesDiff / timeDiff;
          
          // 保留最近5个速度样本以平滑计算
          speedSamples.push(currentSpeed);
          if (speedSamples.length > 5) {
            speedSamples.shift();
          }
          
          lastUpdateTime = now;
          lastUploadedBytes = uploaded;
        }

        // 计算平均速度
        const avgSpeed = speedSamples.length > 0 
          ? speedSamples.reduce((sum, speed) => sum + speed, 0) / speedSamples.length 
          : 0;

        // 计算进度百分比
        const progress = total > 0 ? (uploaded / total) * 100 : 0;

        // 计算剩余时间
        const remainingBytes = total - uploaded;
        const estimatedTime = avgSpeed > 0 && remainingBytes > 0 ? remainingBytes / avgSpeed : 0;

        console.log('进度更新:', { progress: progress.toFixed(1), uploaded, total, avgSpeed });

        // 更新文件状态
        setFiles(prev => prev.map(f => f.id === fileId ? {
          ...f,
          progress: Math.min(progress, 99), // 限制在99%，等待上传完成确认
          uploadedBytes: uploaded,
          uploadSpeed: avgSpeed,
          estimatedTimeRemaining: estimatedTime
        } : f));

      } catch (error) {
        console.error('解析进度数据失败:', error);
      }
    });

    // 监听所有消息事件（包括无类型的默认消息）
    eventSource.onmessage = (event) => {
      // console.log('收到SSE默认消息事件:', event.data);
      try {
        const data = JSON.parse(event.data);
        console.log('解析默认消息数据:', data);
      } catch (e) {
        console.log('默认消息不是JSON格式:', event.data);
      }
    };

    eventSource.addEventListener('open', () => {
      console.log('SSE连接已建立');
    });

    eventSource.onerror = (error) => {
      console.error('SSE连接错误:', error);
      console.error('SSE readyState:', eventSource.readyState);
      if (eventSource.readyState === EventSource.CLOSED) {
        console.log('SSE连接已关闭');
      } else if (eventSource.readyState === EventSource.CONNECTING) {
        console.log('SSE正在重连...');
      }
    };

    return eventSource;
  };

  // 通过 ReadableStream 以 chunk 方式上传文件
  const streamUploadFile = async (
    file: File,
    url: string,
    headers: Record<string, string>,
    onChunk: (uploaded: number, total: number, speed: number) => void
  ) => {
    const reader = file.stream().getReader();
    let uploaded = 0;
    let lastTime = Date.now();
    const speedSamples: number[] = [];

    const stream = new ReadableStream({
      async pull(controller) {
        const { done, value } = await reader.read();
        if (done) {
          controller.close();
          return;
        }
        controller.enqueue(value);
        uploaded += value.length;
        const now = Date.now();
        const diff = (now - lastTime) / 1000;
        if (diff > 0) {
          const sample = value.length / diff;
          speedSamples.push(sample);
          if (speedSamples.length > 5) speedSamples.shift();
        }
        lastTime = now;
        const avgSpeed =
          speedSamples.reduce((s, v) => s + v, 0) / speedSamples.length;
        onChunk(uploaded, file.size, avgSpeed);
      },
    });

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: stream,
      duplex: 'half'      // Required by the Fetch spec when using a ReadableStream as the body
    });

    if (!response.ok) {
      throw new Error(`上传失败: ${response.status}`);
    }

    return response.json();
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
      
      let eventSource: EventSource | null = null;
      
      try {
        const startTime = Date.now();
        
        // 1. 设置初始化状态
        setFiles(prev => prev.map(f => f.id === file.id ? { 
          ...f, 
          progress: 0, 
          status: 'initializing' as const,
          startTime,
          uploadedBytes: 0,
          uploadSpeed: 0,
          estimatedTimeRemaining: 0
        } : f));

        // 2. 初始化上传任务，获取task_id
        const taskId = await initUploadTask(file.file.size);
        
        // 3. 更新为上传状态并记录taskId
        setFiles(prev => prev.map(f => f.id === file.id ? { 
          ...f, 
          status: 'uploading' as const,
          taskId
        } : f));

        // 4. 创建SSE连接监听进度
        eventSource = createProgressListener(taskId, file.id, file.file.size);

        // 5. 等待SSE连接建立后再开始上传（最多等待10秒）
        await new Promise((resolve, reject) => {
          const startTime = Date.now();
          const timeout = 5000; // 10秒超时
          
          if (eventSource?.readyState === EventSource.OPEN) {
            console.log('SSE连接已经是打开状态');
            resolve(void 0);
            return;
          }
          
          const checkConnection = () => {
            console.log('检查SSE连接状态:', eventSource?.readyState);
            
            if (eventSource?.readyState === EventSource.OPEN) {
              console.log('SSE连接已建立');
              resolve(void 0);
            } else if (Date.now() - startTime > timeout) {
              console.error('SSE连接超时');
              reject(new Error('SSE连接超时'));
            } else {
              setTimeout(checkConnection, 100);
            }
          };
          
          checkConnection();
        });

        console.log('SSE连接已就绪，开始文件上传');

        // 6. 执行流式文件上传（新的API规范）
        const baseApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';
        const uploadUrl = `${baseApiUrl}/oss/files`;
        console.log('流式上传URL:', uploadUrl);

        const token = localStorage.getItem('token');
        const encodedFileName = encodeURIComponent(file.file.name);

        const headers: Record<string, string> = {
          'Content-Type': 'application/octet-stream',
          'X-File-Name': encodedFileName,
          region_code: selectedBucket.region_code,
          bucket_name: selectedBucket.bucket_name,
        };
        if (token) headers['Authorization'] = `Bearer ${token}`;
        if (taskId) headers['Upload-Task-ID'] = taskId;

        const result = await streamUploadFile(
          file.file,
          uploadUrl,
          headers,
          (uploaded, total, speed) => {
            const progress = total > 0 ? (uploaded / total) * 100 : 0;
            const remaining = total - uploaded;
            const eta = speed > 0 && remaining > 0 ? remaining / speed : 0;
            setFiles(prev =>
              prev.map(f =>
                f.id === file.id
                  ? {
                      ...f,
                      progress: Math.min(progress, 99),
                      uploadedBytes: uploaded,
                      uploadSpeed: speed,
                      estimatedTimeRemaining: eta,
                    }
                  : f
              )
            );
          }
        );

        // 8. 关闭SSE连接
        if (eventSource) {
          eventSource.close();
        }
        
        // 9. 更新为完成状态
        setFiles(prev => prev.map(f => f.id === file.id ? { 
          ...f, 
          progress: 100, 
          status: 'done', 
          result,
          uploadedBytes: file.file.size,
          uploadSpeed: 0,
          estimatedTimeRemaining: 0
        } : f));
        
      } catch (error) {
        // 确保关闭SSE连接
        if (eventSource) {
          eventSource.close();
        }
        
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
                支持的文件类型: 图片, PDF, Word, Excel, 文本文件, ZIP, RAR, TAR.GZ,Nova 文件格式后缀(如.calib)
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
                          ({formatFileSize(file.file.size)})
                        </Text>
                      </HStack>
                      {file.status === 'initializing' && (
                        <VStack spacing={2} width="100%">
                          <Progress
                            isIndeterminate
                            size="sm"
                            width="100%"
                            colorScheme="orange"
                          />
                          <Text fontSize="xs" color="orange.600">
                            正在初始化上传任务...
                          </Text>
                        </VStack>
                      )}
                      {file.status === 'uploading' && (
                        <VStack spacing={2} width="100%">
                          <Progress
                            value={file.progress}
                            size="sm"
                            width="100%"
                            colorScheme="blue"
                          />
                          <HStack justify="space-between" width="100%" fontSize="xs" color="gray.600">
                            <Text>
                              {file.uploadedBytes ? formatFileSize(file.uploadedBytes) : '0 B'} / {formatFileSize(file.file.size)}
                            </Text>
                            <Text>
                              {file.progress.toFixed(1)}%
                            </Text>
                          </HStack>
                          <HStack justify="space-between" width="100%" fontSize="xs" color="gray.600">
                            <Text>
                              速度: {file.uploadSpeed ? formatUploadSpeed(file.uploadSpeed) : '计算中...'}
                            </Text>
                            <Text>
                              剩余: {file.estimatedTimeRemaining ? formatTimeRemaining(file.estimatedTimeRemaining) : '--'}
                            </Text>
                          </HStack>
                        </VStack>
                      )}
                      {file.status === 'error' && (
                        <Text color="red.500" fontSize="sm">
                          {file.error || '上传失败'}
                        </Text>
                      )}
                      {/* {file.status === 'done' && file.result && (
                        <Text color="green.500" fontSize="sm">
                          文件ID: {file.result.id}
                        </Text>
                      )} */}
                    </VStack>
                    <IconButton
                      aria-label="Remove file"
                      icon={<FiX />}
                      size="sm"
                      variant="ghost"
                      isDisabled={uploading && (file.status === 'initializing' || file.status === 'uploading')}
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
