'use client';

import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  VStack,
  HStack,
  Text,
  Radio,
  RadioGroup,
  Stack,
  Input,
  InputGroup,
  InputRightElement,
  IconButton,
  useClipboard,
  useToast,
  Spinner,
  Alert,
  AlertIcon,
  Box,
  Divider,
} from '@chakra-ui/react';
import { CopyIcon, CheckIcon } from '@chakra-ui/icons';
import { useState, useEffect } from 'react';
import { FileAPI } from '../lib/api';
import { OSSFile } from '../lib/api/types';

interface ShareLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  file: OSSFile | null;
}

const EXPIRE_OPTIONS = [
  { value: '1', label: '1小时' },
  { value: '2', label: '2小时' },
  { value: '3', label: '3小时' },
  { value: '6', label: '6小时' },
  { value: '12', label: '12小时' },
  { value: '24', label: '24小时' },
  { value: '48', label: '48小时' },
  { value: '0', label: '永不过期' },
];

export const ShareLinkModal: React.FC<ShareLinkModalProps> = ({
  isOpen,
  onClose,
  file,
}) => {
  const [selectedExpire, setSelectedExpire] = useState('24'); // 默认24小时
  const [shareUrl, setShareUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerated, setIsGenerated] = useState(false);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [neverExpires, setNeverExpires] = useState(false);
  
  const { hasCopied, onCopy } = useClipboard(shareUrl);
  const toast = useToast();

  // 重置状态
  const resetState = () => {
    setSelectedExpire('24');
    setShareUrl('');
    setIsGenerated(false);
    setExpiresAt(null);
    setNeverExpires(false);
  };

  // 当模态框关闭时重置状态
  useEffect(() => {
    if (!isOpen) {
      resetState();
    }
  }, [isOpen]);

  // 生成分享链接
  const generateShareLink = async () => {
    if (!file) return;

    setIsLoading(true);
    try {
      const expireHours = parseInt(selectedExpire);
      const response = await FileAPI.getFileDownloadURL(file.id, expireHours);
      
      if (response.download_url) {
        setShareUrl(response.download_url);
        setNeverExpires(response.never_expires || false);
        setExpiresAt(response.expires || null);
        setIsGenerated(true);
        
        toast({
          title: '分享链接生成成功',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('生成分享链接失败:', error);
      toast({
        title: '生成分享链接失败',
        description: error instanceof Error ? error.message : '请重试',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 复制链接
  const handleCopy = () => {
    onCopy();
    toast({
      title: '链接已复制',
      description: '分享链接已复制到剪贴板',
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  };

  // 格式化过期时间显示
  const formatExpiresAt = (expiresAt: string | null, neverExpires: boolean) => {
    if (neverExpires) {
      return '永不过期';
    }
    if (!expiresAt) {
      return '';
    }
    try {
      const date = new Date(expiresAt);
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    } catch {
      return expiresAt;
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>分享文件链接</ModalHeader>
        <ModalCloseButton />
        
        <ModalBody>
          <VStack spacing={4} align="stretch">
            {/* 文件信息 */}
            {file && (
              <Box p={4} bg="gray.50" borderRadius="md">
                <Text fontSize="sm" color="gray.600">分享文件</Text>
                <Text fontWeight="medium" isTruncated title={file.original_filename}>
                  {file.original_filename}
                </Text>
                <Text fontSize="sm" color="gray.500">
                  大小: {(file.file_size / 1024 / 1024).toFixed(2)} MB
                </Text>
              </Box>
            )}

            {!isGenerated ? (
              <>
                {/* 过期时间选择 */}
                <Box>
                  <Text mb={3} fontWeight="medium">选择链接过期时间</Text>
                  <RadioGroup value={selectedExpire} onChange={setSelectedExpire}>
                    <Stack spacing={3}>
                      {EXPIRE_OPTIONS.map((option) => (
                        <HStack key={option.value} spacing={3}>
                          <Radio value={option.value} colorScheme="blue">
                            <Text fontWeight="medium">{option.label}</Text>
                          </Radio>
                        </HStack>
                      ))}
                    </Stack>
                  </RadioGroup>
                </Box>

                {selectedExpire === '0' && (
                  <Alert status="warning" borderRadius="md">
                    <AlertIcon />
                    <Box>
                      <Text fontWeight="medium">注意</Text>
                      <Text fontSize="sm">
                        永不过期的链接将长期有效，请确保只与信任的人分享，避免数据泄露风险。
                      </Text>
                    </Box>
                  </Alert>
                )}
              </>
            ) : (
              <>
                {/* 生成的分享链接 */}
                <Box>
                  <Text mb={2} fontWeight="medium">分享链接</Text>
                  <InputGroup>
                    <Input
                      value={shareUrl}
                      isReadOnly
                      fontSize="sm"
                      bg="gray.50"
                      _focus={{ bg: 'gray.50' }}
                    />
                    <InputRightElement>
                      <IconButton
                        aria-label="复制链接"
                        icon={hasCopied ? <CheckIcon /> : <CopyIcon />}
                        size="sm"
                        colorScheme={hasCopied ? 'green' : 'blue'}
                        variant="ghost"
                        onClick={handleCopy}
                      />
                    </InputRightElement>
                  </InputGroup>
                </Box>

                {/* 过期时间信息 */}
                <Box p={3} bg="blue.50" borderRadius="md">
                  <HStack justify="space-between">
                    <Text fontSize="sm" color="blue.700">
                      过期时间:
                    </Text>
                    <Text fontSize="sm" fontWeight="medium" color={neverExpires ? 'green.600' : 'blue.700'}>
                      {formatExpiresAt(expiresAt, neverExpires)}
                    </Text>
                  </HStack>
                  {!neverExpires && expiresAt && (
                    <Text fontSize="xs" color="blue.600" mt={1}>
                      链接将在上述时间后失效，需要重新生成
                    </Text>
                  )}
                </Box>

                <Divider />

                {/* 重新生成选项 */}
                <Box>
                  <Text fontSize="sm" color="gray.600" mb={2}>
                    需要修改过期时间？
                  </Text>
                  <Button
                    size="sm"
                    variant="outline"
                    colorScheme="blue"
                    onClick={resetState}
                  >
                    重新设置过期时间
                  </Button>
                </Box>
              </>
            )}
          </VStack>
        </ModalBody>

        <ModalFooter>
          <HStack spacing={3}>
            <Button variant="ghost" onClick={onClose}>
              取消
            </Button>
            {!isGenerated ? (
              <Button
                colorScheme="blue"
                onClick={generateShareLink}
                isLoading={isLoading}
                loadingText="生成中..."
                disabled={!file}
              >
                生成分享链接
              </Button>
            ) : (
              <Button colorScheme="green" onClick={handleCopy}>
                {hasCopied ? '已复制' : '复制链接'}
              </Button>
            )}
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ShareLinkModal;
