'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Container,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  Input,
  HStack,
  IconButton,
  Checkbox,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useToast,
  Select,
  VStack,
  Text,
  Spinner,
  Badge,
  Flex,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
} from '@chakra-ui/react';
import { FiDownload, FiTrash2, FiMoreVertical, FiSearch, FiRefreshCw } from 'react-icons/fi';
import { FileAPI } from '@/lib/api/files';
import { OSSFile, FileQueryParams } from '@/lib/api/types';

// 格式化文件大小的函数
const formatFileSize = (sizeInBytes: number): string => {
  if (sizeInBytes < 1024) {
    return `${sizeInBytes} B`;
  } else if (sizeInBytes < 1024 * 1024) {
    return `${(sizeInBytes / 1024).toFixed(2)} KB`;
  } else if (sizeInBytes < 1024 * 1024 * 1024) {
    return `${(sizeInBytes / (1024 * 1024)).toFixed(2)} MB`;
  } else {
    return `${(sizeInBytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  }
};

// 格式化日期的函数
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export default function FileListPage() {
  const [files, setFiles] = useState<OSSFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFiles, setSelectedFiles] = useState<number[]>([]);
  const [queryParams, setQueryParams] = useState<FileQueryParams>({
    page: 1,
    page_size: 10,
    keyword: '',
    storage_type: '',
  });
  // 前端排序状态
  const [sortConfig, setSortConfig] = useState<{
    key: keyof OSSFile | '',
    direction: 'asc' | 'desc'
  }>({
    key: 'created_at',
    direction: 'desc'
  });
  const [total, setTotal] = useState(0);
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [fileToDelete, setFileToDelete] = useState<number | null>(null);
  
  // 获取排序后的文件列表
  const sortedFiles = useMemo(() => {
    const filesArray = [...files];
    if (sortConfig.key === '') return filesArray;
    
    return filesArray.sort((a, b) => {
      if (a[sortConfig.key as keyof OSSFile] === undefined || b[sortConfig.key as keyof OSSFile] === undefined) {
        return 0;
      }
      
      const aValue = a[sortConfig.key as keyof OSSFile];
      const bValue = b[sortConfig.key as keyof OSSFile];
      
      // 处理不同类型的排序
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortConfig.direction === 'asc' 
          ? aValue.localeCompare(bValue) 
          : bValue.localeCompare(aValue);
      } else if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortConfig.direction === 'asc' 
          ? aValue - bValue 
          : bValue - aValue;
      }
      
      return 0;
    });
  }, [files, sortConfig]);

  useEffect(() => {
    fetchFiles();
  }, [queryParams]);

  const fetchFiles = async () => {
    try {
      setLoading(true);
      const response = await FileAPI.getFiles(queryParams);
      
      if (response) {
        setFiles(response.items || []);
        setTotal(response.total || 0);
      }
    } catch (error) {
      console.error('获取文件列表失败', error);
      toast({
        title: '获取文件列表失败',
        description: error instanceof Error ? error.message : '未知错误',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (fileId: number) => {
    try {
      const response = await FileAPI.getFileDownloadURL(fileId);
      if (response && response.download_url) {
        // 删除download_url中的Expires=1742885917&
        const downloadUrl = response.download_url.replace(/Expires=\d+&/, '');
        console.log('downloadUrl',downloadUrl)
        // 使用新窗口打开下载链接
        window.open(downloadUrl, '_blank');
        
        toast({
          title: '文件下载中',
          status: 'info',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('获取下载链接失败', error);
      toast({
        title: '获取下载链接失败',
        description: error instanceof Error ? error.message : '未知错误',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const confirmDelete = (fileId: number) => {
    setFileToDelete(fileId);
    onOpen();
  };

  const handleDelete = async () => {
    if (fileToDelete === null) return;
    
    try {
      await FileAPI.deleteFile(fileToDelete);
      toast({
        title: '文件已删除',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      // 重新获取文件列表
      fetchFiles();
    } catch (error) {
      console.error('删除文件失败', error);
      toast({
        title: '删除文件失败',
        description: error instanceof Error ? error.message : '未知错误',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setFileToDelete(null);
      onClose();
    }
  };

  const handleBatchDelete = () => {
    if (selectedFiles.length === 0) return;
    
    toast({
      title: '批量删除暂未实现',
      description: '请使用单个删除功能',
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
  };

  const handleSearch = () => {
    // 重置页码并执行搜索
    setQueryParams(prev => ({
      ...prev,
      page: 1
    }));
  };

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQueryParams(prev => ({
      ...prev,
      keyword: e.target.value
    }));
  };

  const handleStorageTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setQueryParams(prev => ({
      ...prev,
      storage_type: e.target.value
    }));
  };

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setQueryParams(prev => ({
      ...prev,
      page: 1, // 重置页码
      page_size: Number(e.target.value)
    }));
  };

  const handleSort = (field: keyof OSSFile) => {
    setSortConfig(prev => ({
      key: field,
      direction: prev.key === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const toggleFileSelection = (fileId: number) => {
    if (selectedFiles.includes(fileId)) {
      setSelectedFiles(selectedFiles.filter(id => id !== fileId));
    } else {
      setSelectedFiles([...selectedFiles, fileId]);
    }
  };

  const toggleSelectAll = () => {
    if (selectedFiles.length === files.length) {
      setSelectedFiles([]);
    } else {
      setSelectedFiles(files.map(file => file.id));
    }
  };

  const handleRefresh = () => {
    fetchFiles();
  };

  const handlePageChange = (page: number) => {
    setQueryParams(prev => ({
      ...prev,
      page
    }));
  };

  return (
    <Container maxW="container.xl" py={10}>
      <Box mb={6}>
        <Flex justify="space-between" align="center" mb={4}>
          <Heading size="lg">文件列表</Heading>
          <Button 
            leftIcon={<FiRefreshCw />} 
            onClick={handleRefresh}
            isLoading={loading}
          >
            刷新
          </Button>
        </Flex>
        
        <HStack spacing={4} mb={6}>
          <Input
            placeholder="搜索文件名"
            value={queryParams.keyword}
            onChange={handleSearchInputChange}
            maxW="300px"
          />
          {/* <Select
            placeholder="存储类型"
            value={queryParams.storage_type}
            onChange={handleStorageTypeChange}
            maxW="200px"
          >
            <option value="ALIYUN_OSS">阿里云OSS</option>
            <option value="AWS_S3">AWS S3</option>
            <option value="CLOUDFLARE_R2">Cloudflare R2</option>
          </Select> */}
          <Button leftIcon={<FiSearch />} onClick={handleSearch}>
            搜索
          </Button>
          
          {selectedFiles.length > 0 && (
            <Button 
              colorScheme="red" 
              leftIcon={<FiTrash2 />} 
              onClick={handleBatchDelete}
            >
              批量删除 ({selectedFiles.length})
            </Button>
          )}
        </HStack>
        
        {loading ? (
          <Flex justify="center" align="center" minH="200px">
            <Spinner size="xl" />
          </Flex>
        ) : (
          <>
            {files.length === 0 ? (
              <VStack py={10}>
                <Text color="gray.500">暂无文件</Text>
              </VStack>
            ) : (
              <Box overflowX="auto">
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th px={2}>
                        <Checkbox
                          isChecked={selectedFiles.length === files.length && files.length > 0}
                          onChange={toggleSelectAll}
                        />
                      </Th>
                      <Th cursor="pointer" onClick={() => handleSort('original_filename')}>
                        <Flex align="center">
                          文件名
                          {sortConfig.key === 'original_filename' && (
                            <Text ml={1} fontSize="xs">
                              {sortConfig.direction === 'asc' ? '↑' : '↓'}
                            </Text>
                          )}
                        </Flex>
                      </Th>
                      <Th cursor="pointer" onClick={() => handleSort('file_size')}>
                        <Flex align="center">
                          大小
                          {sortConfig.key === 'file_size' && (
                            <Text ml={1} fontSize="xs">
                              {sortConfig.direction === 'asc' ? '↑' : '↓'}
                            </Text>
                          )}
                        </Flex>
                      </Th>
                      <Th cursor="pointer" onClick={() => handleSort('md5')}>
                        <Flex align="center">
                          MD5值
                          {sortConfig.key === 'md5' && (
                            <Text ml={1} fontSize="xs">
                              {sortConfig.direction === 'asc' ? '↑' : '↓'}
                            </Text>
                          )}
                        </Flex>
                      </Th>
                      <Th cursor="pointer" onClick={() => handleSort('md5_status')}>
                        <Flex align="center">
                          MD5 状态
                          {sortConfig.key === 'md5_status' && (
                            <Text ml={1} fontSize="xs">
                              {sortConfig.direction === 'asc' ? '↑' : '↓'}
                            </Text>
                          )}
                        </Flex>
                      </Th>
                      <Th cursor="pointer" onClick={() => handleSort('storage_type')}>
                        <Flex align="center">
                          存储类型
                          {sortConfig.key === 'storage_type' && (
                            <Text ml={1} fontSize="xs">
                              {sortConfig.direction === 'asc' ? '↑' : '↓'}
                            </Text>
                          )}
                        </Flex>
                      </Th>
                      <Th cursor="pointer" onClick={() => handleSort('created_at')}>
                        <Flex align="center">
                          上传时间
                          {sortConfig.key === 'created_at' && (
                            <Text ml={1} fontSize="xs">
                              {sortConfig.direction === 'asc' ? '↑' : '↓'}
                            </Text>
                          )}
                        </Flex>
                      </Th>
                      <Th>操作</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {sortedFiles.map((file) => (
                      <Tr key={file.id}>
                        <Td px={2}>
                          <Checkbox
                            isChecked={selectedFiles.includes(file.id)}
                            onChange={() => toggleFileSelection(file.id)}
                          />
                        </Td>
                        <Td>{file.original_filename}</Td>
                        <Td>{formatFileSize(file.file_size)}</Td>
                        <Td>{file.md5}</Td>
                        <Td>
                          <Badge colorScheme={
                            file.md5_status === 'pending' ? 'gray' :
                            file.md5_status === 'processing' ? 'yellow' :
                            file.md5_status === 'completed' ? 'green' :
                            file.md5_status === 'failed' ? 'red' : 'gray'
                          }>
                            {file.md5_status === 'pending' ? '等待中' :
                             file.md5_status === 'processing' ? '处理中' :
                             file.md5_status === 'completed' ? '已完成' :
                             file.md5_status === 'failed' ? '失败' : 
                             file.md5_status || '未知'}
                          </Badge>
                        </Td>
                        <Td>
                          <Badge colorScheme={
                            file.storage_type === 'ALIYUN_OSS' ? 'orange' :
                            file.storage_type === 'AWS_S3' ? 'blue' :
                            file.storage_type === 'CLOUDFLARE_R2' ? 'purple' : 'gray'
                          }>
                            {file.storage_type}
                          </Badge>
                        </Td>
                        <Td>{formatDate(file.created_at)}</Td>
                        <Td>
                          <HStack spacing={2}>
                            <IconButton
                              aria-label="下载文件"
                              icon={<FiDownload />}
                              size="sm"
                              onClick={() => handleDownload(file.id)}
                            />
                            <IconButton
                              aria-label="删除文件"
                              icon={<FiTrash2 />}
                              size="sm"
                              colorScheme="red"
                              onClick={() => confirmDelete(file.id)}
                            />
                          </HStack>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
                
                <Flex justify="space-between" mt={4}>
                  <HStack>
                    <Text>共 {total} 条记录</Text>
                    <Select 
                      value={queryParams.page_size} 
                      onChange={handlePageSizeChange}
                      size="sm"
                      width="100px"
                      ml={4}
                    >
                      <option value={10}>10条/页</option>
                      <option value={20}>20条/页</option>
                      <option value={50}>50条/页</option>
                      <option value={100}>100条/页</option>
                    </Select>
                  </HStack>
                  <HStack>
                    <Button 
                      onClick={() => handlePageChange(queryParams.page! - 1)}
                      isDisabled={queryParams.page === 1 || loading}
                    >
                      上一页
                    </Button>
                    <Text>第 {queryParams.page} 页</Text>
                    <Button 
                      onClick={() => handlePageChange(queryParams.page! + 1)}
                      isDisabled={queryParams.page! * queryParams.page_size! >= total || loading}
                    >
                      下一页
                    </Button>
                  </HStack>
                </Flex>
              </Box>
            )}
          </>
        )}
      </Box>

      {/* 删除确认对话框 */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>确认删除</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            您确定要删除选中的文件吗？此操作无法撤销。
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              取消
            </Button>
            <Button colorScheme="red" onClick={handleDelete}>
              确认删除
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  );
} 