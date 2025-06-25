'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Input,
  Select,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Checkbox,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useToast,
  Text,
  Badge,
  useColorModeValue,
} from '@chakra-ui/react';
import { FiMoreVertical, FiDownload, FiTrash2, FiSearch, FiLink } from 'react-icons/fi';

interface File {
  id: string;
  name: string;
  size: number;
  mimeType: string;
  storageType: string;
  status: 'uploading' | 'completed' | 'failed' | 'deleted';
  uploadTime: string;
  tags: string[];
  bucket?: string;
}

interface QueryParams {
  keyword: string;
  status: string;
  storageType: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

export default function FileListPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [queryParams, setQueryParams] = useState<QueryParams>({
    keyword: '',
    status: '',
    storageType: '',
    sortBy: 'uploadTime',
    sortOrder: 'desc',
  });
  const toast = useToast();

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  useEffect(() => {
    fetchFiles();
  }, [queryParams]);

  const fetchFiles = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/files?${new URLSearchParams(queryParams as any)}`);
      if (!response.ok) {
        throw new Error('获取文件列表失败');
      }
      const data = await response.json();
      setFiles(data);
    } catch (error) {
      toast({
        title: '获取文件列表失败',
        description: error instanceof Error ? error.message : '未知错误',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQueryParams((prev) => ({ ...prev, keyword: e.target.value }));
  };

  const handleSort = (field: string) => {
    setQueryParams((prev) => ({
      ...prev,
      sortBy: field,
      sortOrder: prev.sortBy === field && prev.sortOrder === 'asc' ? 'desc' : 'asc',
    }));
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedFiles(files.map((file) => file.id));
    } else {
      setSelectedFiles([]);
    }
  };

  const handleSelectFile = (fileId: string) => {
    setSelectedFiles((prev) =>
      prev.includes(fileId)
        ? prev.filter((id) => id !== fileId)
        : [...prev, fileId]
    );
  };

  const handleDownload = async (file: File) => {
    try {
      debugger
      const response = await fetch(`/api/files/${file.id}/download`);
      if (!response.ok) {
        throw new Error('下载失败');
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      toast({
        title: '下载失败',
        description: error instanceof Error ? error.message : '未知错误',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleDelete = async (fileId: string) => {
    try {
      const response = await fetch(`/api/files/${fileId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('删除失败');
      }
      setFiles((prev) => prev.filter((file) => file.id !== fileId));
      toast({
        title: '删除成功',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: '删除失败',
        description: error instanceof Error ? error.message : '未知错误',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleCopyLink = async (file: File) => {
    try {
      // 生成文件访问链接
      const fileUrl = `${window.location.origin}/api/files/${file.id}/view`;
      
      // 复制到剪贴板
      await navigator.clipboard.writeText(fileUrl);
      
      toast({
        title: '链接已复制',
        description: '文件访问链接已复制到剪贴板',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: '复制失败',
        description: error instanceof Error ? error.message : '复制链接失败',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleBatchDelete = async () => {
    if (!selectedFiles.length) {
      toast({
        title: '请选择要删除的文件',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      const response = await fetch('/api/files/batch', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fileIds: selectedFiles }),
      });

      if (!response.ok) {
        throw new Error('批量删除失败');
      }

      setFiles((prev) =>
        prev.filter((file) => !selectedFiles.includes(file.id))
      );
      setSelectedFiles([]);
      toast({
        title: '批量删除成功',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: '批量删除失败',
        description: error instanceof Error ? error.message : '未知错误',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const getStatusColor = (status: File['status']) => {
    switch (status) {
      case 'uploading':
        return 'blue';
      case 'completed':
        return 'green';
      case 'failed':
        return 'red';
      case 'deleted':
        return 'gray';
      default:
        return 'gray';
    }
  };

  return (
    <Box p={6}>
      <VStack spacing={6} align="stretch">
        <HStack spacing={4}>
          <Input
            placeholder="搜索文件名"
            value={queryParams.keyword}
            onChange={handleSearch}
            maxW="300px"
          />
          <Select
            placeholder="文件状态"
            value={queryParams.status}
            onChange={(e) =>
              setQueryParams((prev) => ({ ...prev, status: e.target.value }))
            }
            maxW="200px"
          >
            <option value="uploading">上传中</option>
            <option value="completed">已完成</option>
            <option value="failed">失败</option>
            <option value="deleted">已删除</option>
          </Select>
          <Select
            placeholder="存储类型"
            value={queryParams.storageType}
            onChange={(e) =>
              setQueryParams((prev) => ({ ...prev, storageType: e.target.value }))
            }
            maxW="200px"
          >
            <option value="local">本地存储</option>
            <option value="oss">阿里云OSS</option>
            <option value="cos">腾讯云COS</option>
            <option value="s3">AWS S3</option>
          </Select>
          <Button
            colorScheme="red"
            onClick={handleBatchDelete}
            isDisabled={!selectedFiles.length}
          >
            批量删除
          </Button>
        </HStack>

        <Box overflowX="auto">
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>
                  <Checkbox
                    isChecked={selectedFiles.length === files.length}
                    onChange={handleSelectAll}
                  />
                </Th>
                <Th
                  cursor="pointer"
                  onClick={() => handleSort('name')}
                >
                  文件名
                </Th>
                <Th
                  cursor="pointer"
                  onClick={() => handleSort('size')}
                >
                  大小
                </Th>
                <Th
                  cursor="pointer"
                  onClick={() => handleSort('storageType')}
                >
                  存储类型
                </Th>
                <Th>Bucket</Th>
                <Th
                  cursor="pointer"
                  onClick={() => handleSort('status')}
                >
                  状态
                </Th>
                <Th
                  cursor="pointer"
                  onClick={() => handleSort('uploadTime')}
                >
                  上传时间
                </Th>
                <Th>操作</Th>
              </Tr>
            </Thead>
            <Tbody>
              {files.map((file) => (
                <Tr key={file.id}>
                  <Td>
                    <Checkbox
                      isChecked={selectedFiles.includes(file.id)}
                      onChange={() => handleSelectFile(file.id)}
                    />
                  </Td>
                  <Td>
                    <Text noOfLines={1} maxW="200px">
                      {file.name}
                    </Text>
                  </Td>
                  <Td>{(file.size / 1024 / 1024).toFixed(2)} MB</Td>
                  <Td>{file.storageType}</Td>
                  <Td>{file.bucket || '-'}</Td>
                  <Td>
                    <Badge colorScheme={getStatusColor(file.status)}>
                      {file.status}
                    </Badge>
                  </Td>
                  <Td>{new Date(file.uploadTime).toLocaleString()}</Td>
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
                          icon={<FiDownload />}
                          onClick={() => handleDownload(file)}
                          isDisabled={file.status !== 'completed'}
                        >
                          下载
                        </MenuItem>
                        <MenuItem
                          icon={<FiLink />}
                          onClick={() => handleCopyLink(file)}
                          isDisabled={file.status !== 'completed'}
                        >
                          复制链接
                        </MenuItem>
                        <MenuItem
                          icon={<FiTrash2 />}
                          onClick={() => handleDelete(file.id)}
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
    </Box>
  );
} 