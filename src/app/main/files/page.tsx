'use client';

import { useState, useEffect } from 'react';
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
} from '@chakra-ui/react';
import { FiDownload, FiTrash2, FiMoreVertical, FiSearch } from 'react-icons/fi';

interface File {
  id: string;
  name: string;
  size: string;
  type: string;
  uploadDate: string;
  uploadBy: string;
}

export default function FileListPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const toast = useToast();

  useEffect(() => {
    // 模拟从API获取数据
    setTimeout(() => {
      const mockFiles: File[] = [
        {
          id: '1',
          name: '项目计划.pdf',
          size: '2.5 MB',
          type: 'pdf',
          uploadDate: '2023-06-15',
          uploadBy: '张三',
        },
        {
          id: '2',
          name: '财务报表.xlsx',
          size: '1.8 MB',
          type: 'xlsx',
          uploadDate: '2023-06-14',
          uploadBy: '李四',
        },
        {
          id: '3',
          name: '会议记录.docx',
          size: '856 KB',
          type: 'docx',
          uploadDate: '2023-06-13',
          uploadBy: '王五',
        },
        {
          id: '4',
          name: '产品图片.jpg',
          size: '3.2 MB',
          type: 'jpg',
          uploadDate: '2023-06-12',
          uploadBy: '赵六',
        },
      ];
      setFiles(mockFiles);
      setLoading(false);
    }, 1000);
  }, []);

  const handleDownload = (fileId: string) => {
    toast({
      title: '文件下载中',
      description: '开始下载文件',
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
  };

  const handleDelete = (fileId: string) => {
    setFiles(files.filter(file => file.id !== fileId));
    toast({
      title: '文件已删除',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  const handleBatchDelete = () => {
    if (selectedFiles.length === 0) return;
    
    setFiles(files.filter(file => !selectedFiles.includes(file.id)));
    setSelectedFiles([]);
    toast({
      title: '批量删除成功',
      description: `已删除 ${selectedFiles.length} 个文件`,
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  const handleSearch = () => {
    setLoading(true);
    // 模拟搜索
    setTimeout(() => {
      if (searchTerm === '') {
        // 如果搜索词为空，恢复所有文件
        const mockFiles: File[] = [
          {
            id: '1',
            name: '项目计划.pdf',
            size: '2.5 MB',
            type: 'pdf',
            uploadDate: '2023-06-15',
            uploadBy: '张三',
          },
          // ... (其他文件)
        ];
        setFiles(mockFiles);
      } else {
        // 模拟搜索结果
        const filteredFiles = files.filter(file => 
          file.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFiles(filteredFiles);
      }
      setLoading(false);
    }, 500);
  };

  const toggleFileSelection = (fileId: string) => {
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

  return (
    <Container maxW="container.xl" py={10}>
      <Box mb={6}>
        <Heading size="lg" mb={4}>文件列表</Heading>
        
        <HStack spacing={4} mb={6}>
          <Input
            placeholder="搜索文件名"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            maxW="300px"
          />
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
          <Text>加载中...</Text>
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
                      <Th>文件名</Th>
                      <Th>大小</Th>
                      <Th>类型</Th>
                      <Th>上传日期</Th>
                      <Th>上传者</Th>
                      <Th>操作</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {files.map((file) => (
                      <Tr key={file.id}>
                        <Td px={2}>
                          <Checkbox
                            isChecked={selectedFiles.includes(file.id)}
                            onChange={() => toggleFileSelection(file.id)}
                          />
                        </Td>
                        <Td>{file.name}</Td>
                        <Td>{file.size}</Td>
                        <Td>{file.type}</Td>
                        <Td>{file.uploadDate}</Td>
                        <Td>{file.uploadBy}</Td>
                        <Td>
                          <HStack spacing={2}>
                            <IconButton
                              aria-label="下载文件"
                              icon={<FiDownload />}
                              size="sm"
                              onClick={() => handleDownload(file.id)}
                            />
                            <Menu>
                              <MenuButton
                                as={IconButton}
                                aria-label="更多操作"
                                icon={<FiMoreVertical />}
                                variant="ghost"
                                size="sm"
                              />
                              <MenuList>
                                <MenuItem 
                                  icon={<FiTrash2 />} 
                                  onClick={() => handleDelete(file.id)}
                                  color="red.500"
                                >
                                  删除
                                </MenuItem>
                              </MenuList>
                            </Menu>
                          </HStack>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
            )}
          </>
        )}
      </Box>
    </Container>
  );
} 