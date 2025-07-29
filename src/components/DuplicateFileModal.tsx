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
  Box,
  Alert,
  AlertIcon,
  Badge,
  Divider,
  Icon,
} from '@chakra-ui/react';
import { FiFile, FiClock, FiHardDrive, FiAlertTriangle } from 'react-icons/fi';

interface DuplicateFileInfo {
  id: number;
  filename: string;
  original_filename: string;
  file_size: number;
  created_at: string;
  object_key: string;
}

interface DuplicateFileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  newFile?: File;
  existingFile?: DuplicateFileInfo;
}

// 格式化文件大小
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// 格式化日期
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const DuplicateFileModal: React.FC<DuplicateFileModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  newFile,
  existingFile,
}) => {
  const handleConfirm = () => {
    onConfirm();
    // onClose() 由 onConfirm 在上传页面中处理
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" isCentered>
      <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(4px)" />
      <ModalContent>
        <ModalHeader>
          <HStack spacing={3}>
            <Icon as={FiAlertTriangle} color="orange.500" boxSize={6} />
            <Text>文件已存在</Text>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />
        
        <ModalBody>
          <VStack spacing={4} align="stretch">
            {/* 警告信息 */}
            <Alert status="warning" borderRadius="md">
              <AlertIcon />
              <VStack align="start" spacing={1}>
                <Text fontWeight="medium">发现同名文件</Text>
                <Text fontSize="sm">
                  继续上传将覆盖原文件，此操作不可撤销。
                </Text>
              </VStack>
            </Alert>

            {/* 即将被覆盖的文件信息 */}
            {existingFile && (
              <Box>
                <Text fontSize="lg" fontWeight="bold" mb={4} color="gray.700">
                  即将被覆盖的文件
                </Text>
                
                <Box 
                  w="full" 
                  p={4} 
                  bg="red.50" 
                  borderRadius="md" 
                  borderLeft="4px solid"
                  borderLeftColor="red.400"
                >
                  <HStack justify="space-between" mb={2}>
                    <HStack>
                      <Icon as={FiFile} color="red.500" />
                      <Text fontWeight="semibold" color="red.700">
                        原文件（将被覆盖）
                      </Text>
                    </HStack>
                    <Badge colorScheme="red" variant="subtle">
                      已存在
                    </Badge>
                  </HStack>
                  
                  <VStack align="start" spacing={2} fontSize="sm">
                    <HStack>
                      <Icon as={FiFile} boxSize={4} color="gray.500" />
                      <Text color="gray.600">文件名：</Text>
                      <Text fontWeight="medium" wordBreak="break-all">
                        {existingFile.original_filename}
                      </Text>
                    </HStack>
                    
                    <HStack>
                      <Icon as={FiHardDrive} boxSize={4} color="gray.500" />
                      <Text color="gray.600">大小：</Text>
                      <Text fontWeight="medium">
                        {formatFileSize(existingFile.file_size)}
                      </Text>
                    </HStack>
                    
                    <HStack>
                      <Icon as={FiClock} boxSize={4} color="gray.500" />
                      <Text color="gray.600">上传时间：</Text>
                      <Text fontWeight="medium">
                        {formatDate(existingFile.created_at)}
                      </Text>
                    </HStack>
                  </VStack>
                </Box>
              </Box>
            )}

            <Divider />

            {/* 确认提示 */}
            <Box>
              <Text fontSize="md" fontWeight="medium" color="gray.700" mb={2}>
                是否继续上传并覆盖原文件？
              </Text>
              <Text fontSize="sm" color="gray.600">
                请仔细确认，覆盖操作无法撤销。如果您不确定，建议取消上传并重命名文件。
              </Text>
            </Box>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <HStack spacing={3}>
            <Button 
              variant="ghost" 
              onClick={handleCancel}
              size="lg"
            >
              取消上传
            </Button>
            <Button 
              colorScheme="red" 
              onClick={handleConfirm}
              size="lg"
              leftIcon={<FiAlertTriangle />}
            >
              确认覆盖
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default DuplicateFileModal;
