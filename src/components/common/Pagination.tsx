import { Button, ButtonGroup, Flex, Text } from '@chakra-ui/react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  return (
    <Flex justify="center" align="center" mt={4} gap={4}>
      <ButtonGroup size="sm" variant="outline">
        <Button
          onClick={() => onPageChange(currentPage - 1)}
          isDisabled={currentPage === 1}
        >
          上一页
        </Button>
        <Button isDisabled>
          {currentPage} / {totalPages}
        </Button>
        <Button
          onClick={() => onPageChange(currentPage + 1)}
          isDisabled={currentPage === totalPages}
        >
          下一页
        </Button>
      </ButtonGroup>
    </Flex>
  );
} 