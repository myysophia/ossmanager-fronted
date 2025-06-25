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
import { FiDownload, FiTrash2, FiMoreVertical, FiSearch, FiRefreshCw, FiLink } from 'react-icons/fi';
import { FileAPI } from '@/lib/api/files';
import { OSSFile, FileQueryParams } from '@/lib/api/types';
import { css } from '@emotion/react';
import { debug } from 'console';
import apiClient from '@/lib/api/axios';

// 添加可调整列宽的样式
const resizableTableStyles = css`
  .resizable-table {
    table-layout: fixed;
    border-collapse: collapse;
    width: 100%;
  }

  .resizable-column {
    position: relative;
    background-clip: padding-box;
  }

  .resizable-column:after {
    content: '';
    position: absolute;
    right: 0;
    top: 0;
    bottom: 0;
    width: 5px;
    cursor: col-resize;
    background-color: transparent;
  }

  .resizable-column:hover:after {
    background-color: #ddd;
  }

  th.resizable-column {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  td {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
`;

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
  const [searchKeyword, setSearchKeyword] = useState('');
  const [queryParams, setQueryParams] = useState<FileQueryParams>({
    page: 1,
    page_size: 20,
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
  
  // 在 FileListPage 组件内添加
  const [columnWidths, setColumnWidths] = useState({
    checkbox: 50,
    filename: 200,
    size: 100,
    bucket: 160,
    storagePath: 200,
    storageType: 120,
    createdAt: 160,
    actions: 140,
  });

  const [userPermissions, setUserPermissions] = useState<any[]>([]);
  const [permissionsLoading, setPermissionsLoading] = useState(true);

  // 获取排序和搜索过滤后的文件列表
  const filteredAndSortedFiles = useMemo(() => {
    // 先进行搜索过滤
    let filteredFiles = searchKeyword
      ? files.filter(file => 
          file.original_filename.toLowerCase().includes(searchKeyword.toLowerCase())
        )
      : files;

    // 如果没有排序配置，直接返回过滤后的结果
    if (sortConfig.key === '') return filteredFiles;
    
    // 对过滤后的结果进行排序
    return [...filteredFiles].sort((a, b) => {
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
  }, [files, searchKeyword, sortConfig]);

  // 获取当前页的文件
  const currentPageFiles = useMemo(() => {
    const startIndex = (queryParams.page! - 1) * queryParams.page_size!;
    const endIndex = startIndex + queryParams.page_size!;
    return filteredAndSortedFiles.slice(startIndex, endIndex);
  }, [filteredAndSortedFiles, queryParams.page, queryParams.page_size]);

  useEffect(() => {
    fetchFiles();
    // 获取用户权限
    apiClient.get('/user/current')
      .then(res => {
        setUserPermissions(res.data.permissions || []);
      })
      .finally(() => setPermissionsLoading(false));
  }, []); // 只在组件挂载时获取一次数据

  const fetchFiles = async () => {
    try {
      setLoading(true);
      const response = await FileAPI.getFiles({
        page: 1,
        page_size: 1000 // 获取较大数量的数据，因为要在前端处理
      });
      
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
      debugger
      if (response && response.download_url) {
        // 确保使用 HTTPS 链接
        let secureUrl = response.download_url;
        if (secureUrl.startsWith('http://')) {
          secureUrl = secureUrl.replace('http://', 'https://');
        }

        // 创建一个隐藏的 a 标签来下载
        const link = document.createElement('a');
        link.href = secureUrl;
        // 从原始文件名中获取文件扩展名
        const file = files.find(f => f.id === fileId);
        if (file) {
          link.download = file.original_filename; // 设置下载文件名
        }
        link.rel = 'noopener noreferrer'; // 添加安全属性
        link.target = '_blank'; // 在新标签页中打开
        
        // 直接在新标签页中打开链接
        window.open(secureUrl, '_blank', 'noopener,noreferrer');
        
        toast({
          title: '文件下载中',
          description: '如果下载没有自动开始，请检查浏览器是否阻止了弹出窗口',
          status: 'info',
          duration: 5000,
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

  const handleCopyLink = async (file: OSSFile) => {
    try {
      // 获取OSS下载链接
      const response = await FileAPI.getFileDownloadURL(file.id);
      const downloadUrl = response.download_url;
      
      if (!downloadUrl) {
        throw new Error('无法获取下载链接');
      }
      
      // 复制到剪贴板
      await navigator.clipboard.writeText(downloadUrl);
      
      toast({
        title: '链接已复制',
        description: 'OSS下载链接已复制到剪贴板',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: '复制失败',
        description: error instanceof Error ? error.message : '复制链接失败，请重试',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchKeyword(e.target.value);
    // 重置到第一页
    setQueryParams(prev => ({
      ...prev,
      page: 1
    }));
  };

  const handleSearch = () => {
    // 搜索时重置到第一页
    setQueryParams(prev => ({
      ...prev,
      page: 1
    }));
  };

  const handleStorageTypeChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newParams = {
      ...queryParams,
      page: 1,
      storage_type: e.target.value
    };
    setQueryParams(newParams);
    await fetchFiles();
  };

  const handlePageSizeChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newParams = {
      ...queryParams,
      page: 1,
      page_size: Number(e.target.value)
    };
    setQueryParams(newParams);
    await fetchFiles();
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

  const handleRefresh = async () => {
    await fetchFiles();
  };

  const handlePageChange = (page: number) => {
    setQueryParams(prev => ({
      ...prev,
      page
    }));
  };

  const handleColumnResize = (column: string, event: MouseEvent) => {
    const startX = event.pageX;
    const startWidth = columnWidths[column as keyof typeof columnWidths];

    const handleMouseMove = (e: MouseEvent) => {
      const newWidth = Math.max(50, startWidth + (e.pageX - startX));
      setColumnWidths(prev => ({
        ...prev,
        [column]: newWidth,
      }));
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };
  // 判断是否有删除权限
  const canDeleteFile = useMemo(() =>
    userPermissions.some(
      (p: any) => p.resource === 'FILE' && p.action === 'DELETE'
    ),
    [userPermissions]
  );

  if (permissionsLoading) {
    return <div>加载中...</div>;
  }

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
            value={searchKeyword}
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
              <Box overflowX="auto" css={resizableTableStyles}>
                <Table variant="simple" className="resizable-table">
                  <Thead>
                    <Tr>
                      <Th px={2} className="resizable-column" width={`${columnWidths.checkbox}px`} onMouseDown={(e) => handleColumnResize('checkbox', e.nativeEvent)}>
                        <Checkbox
                          isChecked={selectedFiles.length === files.length && files.length > 0}
                          onChange={toggleSelectAll}
                        />
                      </Th>
                      <Th cursor="pointer" className="resizable-column" width={`${columnWidths.filename}px`} onMouseDown={(e) => handleColumnResize('filename', e.nativeEvent)} onClick={() => handleSort('original_filename')}>
                        <Flex align="center">
                          文件名
                          {sortConfig.key === 'original_filename' && (
                            <Text ml={1} fontSize="xs">{sortConfig.direction === 'asc' ? '↑' : '↓'}</Text>
                          )}
                        </Flex>
                      </Th>
                      <Th className="resizable-column" width={`${columnWidths.bucket}px`} onMouseDown={(e) => handleColumnResize('bucket', e.nativeEvent)}>
                        用户名称
                      </Th>
                      <Th className="resizable-column" width={`${columnWidths.storagePath}px`} onMouseDown={(e) => handleColumnResize('storagePath', e.nativeEvent)}>
                        存储路径
                      </Th>
                      <Th cursor="pointer" className="resizable-column" width={`${columnWidths.size}px`} onMouseDown={(e) => handleColumnResize('size', e.nativeEvent)} onClick={() => handleSort('file_size')}>
                        <Flex align="center">
                          大小
                          {sortConfig.key === 'file_size' && (
                            <Text ml={1} fontSize="xs">{sortConfig.direction === 'asc' ? '↑' : '↓'}</Text>
                          )}
                        </Flex>
                      </Th>
                      {/* <Th cursor="pointer" className="resizable-column" width={`${columnWidths.storageType}px`} onMouseDown={(e) => handleColumnResize('storageType', e.nativeEvent)} onClick={() => handleSort('storage_type')}>
                        <Flex align="center">
                          存储类型
                          {sortConfig.key === 'storage_type' && (
                            <Text ml={1} fontSize="xs">{sortConfig.direction === 'asc' ? '↑' : '↓'}</Text>
                          )}
                        </Flex>
                      </Th> */}
                      <Th cursor="pointer" className="resizable-column" width={`${columnWidths.createdAt}px`} onMouseDown={(e) => handleColumnResize('createdAt', e.nativeEvent)} onClick={() => handleSort('created_at')}>
                        <Flex align="center">
                          上传时间
                          {sortConfig.key === 'created_at' && (
                            <Text ml={1} fontSize="xs">{sortConfig.direction === 'asc' ? '↑' : '↓'}</Text>
                          )}
                        </Flex>
                      </Th>
                      <Th className="resizable-column" width={`${columnWidths.actions}px`} onMouseDown={(e) => handleColumnResize('actions', e.nativeEvent)}>
                        操作
                      </Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {currentPageFiles.map((file) => {
                      // 从 object_key 提取 bucket 和存储路径
                      const objectKeyParts = file.object_key ? file.object_key.split('/') : [];
                      const bucket = objectKeyParts.length > 0 ? objectKeyParts[0] : file.config_name || '-';
                      const storagePath = objectKeyParts.length > 1 ? objectKeyParts.slice(0, -1).join('/') : (file.object_key || '-');
                      
                      return (
                        <Tr key={file.id}>
                          <Td px={2} className="resizable-column" width={`${columnWidths.checkbox}px`}>
                            <Checkbox
                              isChecked={selectedFiles.includes(file.id)}
                              onChange={() => toggleFileSelection(file.id)}
                            />
                          </Td>
                          <Td className="resizable-column" width={`${columnWidths.filename}px`}>
                            {file.original_filename}
                          </Td>
                          <Td className="resizable-column" width={`${columnWidths.bucket}px`}>
                            {bucket}
                          </Td>
                          <Td className="resizable-column" width={`${columnWidths.storagePath}px`}>
                            {storagePath}
                          </Td>
                          <Td className="resizable-column" width={`${columnWidths.size}px`}>
                            {formatFileSize(file.file_size)}
                          </Td>
                          {/* <Td className="resizable-column" width={`${columnWidths.storageType}px`}>
                            <Badge colorScheme={
                              file.storage_type === 'ALIYUN_OSS' ? 'orange' :
                              file.storage_type === 'AWS_S3' ? 'blue' :
                              file.storage_type === 'CLOUDFLARE_R2' ? 'purple' : 'gray'
                            }>
                              {file.storage_type}
                            </Badge>
                          </Td> */}
                          <Td className="resizable-column" width={`${columnWidths.createdAt}px`}>
                            {formatDate(file.created_at)}
                          </Td>
                          <Td className="resizable-column" width={`${columnWidths.actions}px`}>
                            <HStack spacing={2} justify="flex-start" overflow="visible">
                              <IconButton
                                aria-label="下载文件"
                                icon={<FiDownload />}
                                size="sm"
                                onClick={() => handleDownload(file.id)}
                              />
                              <IconButton
                                aria-label="复制链接"
                                icon={<FiLink />}
                                size="sm"
                                colorScheme="blue"
                                onClick={() => handleCopyLink(file)}
                              />
                              {canDeleteFile && (
                                <IconButton
                                  aria-label="删除文件"
                                  icon={<FiTrash2 />}
                                  size="sm"
                                  colorScheme="red"
                                  onClick={() => confirmDelete(file.id)}
                                  zIndex={1}
                                />
                              )}
                            </HStack>
                          </Td>
                        </Tr>
                      );
                    })}
                  </Tbody>
                </Table>
                
                <Flex justify="space-between" mt={4}>
                  <HStack>
                    <Text>每页 {queryParams.page_size} 条</Text>
                    <Text mx={2}>|</Text>
                    <Text>第 {queryParams.page} 页</Text>
                    <Text mx={2}>|</Text>
                    <Text>共 {filteredAndSortedFiles.length} 条记录</Text>
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
                      isDisabled={queryParams.page! * queryParams.page_size! >= filteredAndSortedFiles.length || loading}
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