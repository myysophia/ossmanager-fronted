'use client'; // Next.js 13+ 的客户端组件标记

import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton,
  Flex, Box, Heading, HStack, VStack, Button, Input, Table, Thead, Tbody, Tr, Th, Td,
  Checkbox, TableContainer, Spinner, Text, useToast,
} from '@chakra-ui/react';
import { ChevronRightIcon, ChevronLeftIcon, ArrowBackIcon, ArrowForwardIcon } from '@chakra-ui/icons';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { debounce } from 'lodash'; // 添加 lodash 的 debounce

// 假设你的 RoleAPI 客户端定义在此路径
// 你需要确保这个文件存在，并且 RoleAPI 包含了正确的方法和请求逻辑
// 例如：
// import { axiosInstance } from './axiosInstance'; // 假设你有一个封装好的axios实例
// export const RoleAPI = {
//   getRegionBucketMappings: async (params: { page: number; limit: number; filter: string }) => {
//     const res = await axiosInstance.get('/api/v1/region-bucket-mappings', { params });
//     return res.data; // 根据你的API返回，这里可能是 res.data.data 或 res.data
//   },
//   getRoleRegionBucketAccess: async (roleId: number | string) => {
//     const res = await axiosInstance.get(`/api/v1/roles/${roleId}/bucket-access`);
//     return res.data; // 根据你的API返回，这里可能是 res.data.data 或 res.data
//   },
//   updateRoleRegionBucketAccess: async (roleId: number | string, data: { region_bucket_mapping_ids: number[] }) => {
//     const res = await axiosInstance.post(`/api/v1/roles/${roleId}/bucket-access`, data);
//     return res.data;
//   },
// };
import { RoleAPI } from '@/lib/api/client';


// 定义一个映射项的类型，便于类型提示
interface RegionBucketMapping {
  id: number;
  region_code: string;
  bucket_name: string;
  // created_at?: string; // 可选，如果API返回
  // updated_at?: string; // 可选，如果API返回
}

// 组件Props接口
interface RegionBucketAccessFormProps {
  isOpen: boolean;
  onClose: () => void;
  roleId: number | string | null | undefined; // roleId 可以是数字或字符串，也可能为 null/undefined
  roleName: string;
  onSuccess: () => void;
}

export default function RegionBucketAccessForm({
  isOpen, onClose, roleId, roleName, onSuccess
}: RegionBucketAccessFormProps) {
  // === >>> 在这里添加这行日志 <<< ===
  console.log("RegionBucketAccessForm Props:", { isOpen, roleId, roleName }); 
  // ===================================

  const toast = useToast();

  // 左侧（所有可分配）列表状态
  const [allAvailableMappings, setAllAvailableMappings] = useState<RegionBucketMapping[]>([]); // 所有可用映射
  const [filteredMappings, setFilteredMappings] = useState<RegionBucketMapping[]>([]); // 过滤后的映射
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [filter, setFilter] = useState('');
  const [loadingLeft, setLoadingLeft] = useState(false);

  // 右侧（已分配）列表状态
  const [currentAssignedMappings, setCurrentAssignedMappings] = useState<RegionBucketMapping[]>([]);
  const [loadingRight, setLoadingRight] = useState(false);

  // 选中项状态
  const [selectedLeftIds, setSelectedLeftIds] = useState<number[]>([]);
  const [selectedRightIds, setSelectedRightIds] = useState<number[]>([]);

  const [saving, setSaving] = useState(false);

  // 获取所有可配置的地域-桶（左侧列表数据）
  const fetchAllMappings = useCallback(async () => {
    if (!roleId) {
      console.warn("roleId is undefined or null in fetchAllMappings, skipping.");
      return;
    }
    setLoadingLeft(true);
    try {
      const res = await RoleAPI.getRegionBucketMappings({ page: 1, limit: 1000 }); // 获取所有数据
      const items = res?.data?.items ?? [];
      setAllAvailableMappings(items);
      setFilteredMappings(items); // 初始时显示所有数据
      console.log('Initial data loaded:', items);
    } catch (error: any) {
      console.error("Failed to fetch all mappings:", error);
      toast({ title: '加载所有地域-桶失败', description: error.message || '请检查网络或后端服务。', status: 'error', duration: 3000 });
    } finally {
      setLoadingLeft(false);
    }
  }, [roleId, toast]);

  // 获取当前角色已分配的地域-桶（右侧列表数据）
  const fetchAssignedMappings = useCallback(async () => {
    console.log("Fetching assigned mappings for roleId:", roleId);
    if (!roleId) {
      console.warn("roleId is undefined or null in fetchAssignedMappings, skipping.");
      return;
    }
    setLoadingRight(true);
    try {
      const res = await RoleAPI.getRoleRegionBucketAccess(roleId);
      console.log("Raw API Response (Assigned Mappings):", res);

      // 修改数据处理逻辑
      let mappings: RegionBucketMapping[] = [];
      if (res) {
        // 如果返回的是单个对象，将其转换为数组
        if (res.id && res.region_code && res.bucket_name) {
          mappings = [res];
        }
        // 如果返回的是数组，直接使用
        else if (Array.isArray(res)) {
          mappings = res;
        }
      }
      
      console.log("Processed assigned mappings:", mappings);
      setCurrentAssignedMappings(mappings);

    } catch (error: any) {
      console.error("Failed to fetch assigned mappings:", error);
      toast({ title: '加载已分配地域-桶失败', description: error.message || '请检查网络或后端服务。', status: 'error', duration: 3000 });
    } finally {
      setLoadingRight(false);
    }
  }, [roleId, toast]);

  // --- useEffect 钩子管理数据加载和状态重置 ---
  // Modal打开时，进行初始数据加载和状态重置
  useEffect(() => {
    console.log("useEffect triggered. isOpen:", isOpen, "roleId:", roleId);
    if (!isOpen || !roleId) {
      console.log("Modal not open or roleId missing, returning early from useEffect.");
      // 模态框关闭时，重置所有状态，防止下次打开时保留旧数据
      setAllAvailableMappings([]);
      setCurrentPage(1);
      setFilteredMappings([]);
      setCurrentAssignedMappings([]);
      setSelectedLeftIds([]);
      setSelectedRightIds([]);
      setLoadingLeft(false);
      setLoadingRight(false);
      setSaving(false);
      return;
    }

    console.log("Modal opened and roleId is valid. Triggering initial data fetch.");
    // 第一次打开时，并行加载左右两侧数据
    fetchAllMappings();
    fetchAssignedMappings();

  }, [isOpen, roleId]); // 依赖isOpen和roleId，当它们变化时触发

  // 当 currentPage 或 filter 变化时，重新获取左侧列表数据
  useEffect(() => {
    if (isOpen && roleId) {
      fetchAllMappings();
    }
  }, [currentPage, filter, isOpen, roleId, fetchAllMappings]);


  // --- 列表过滤和派生状态 ---
  // 所有已分配的ID集合，用于高效过滤左侧列表
  const assignedIdsSet = useMemo(() => new Set(currentAssignedMappings.map(m => m.id)), [currentAssignedMappings]);

  // 处理搜索
  const handleSearch = useCallback((value: string) => {
    setFilter(value);
    setCurrentPage(1); // 重置到第一页
  }, []);

  // 监听 filter 变化
  useEffect(() => {
    if (filter) {
      const searchValue = filter.toLowerCase().trim();
      const filtered = allAvailableMappings.filter(mapping => 
        mapping.bucket_name.toLowerCase().includes(searchValue) ||
        mapping.region_code.toLowerCase().includes(searchValue)
      );
      console.log('Filter changed, new filtered results:', filtered);
      setFilteredMappings(filtered);
    } else {
      setFilteredMappings(allAvailableMappings);
    }
  }, [filter, allAvailableMappings]);

  // 左侧显示的可供选择的列表 (当前页 + 排除已分配的)
  const leftList = useMemo(
    () => {
      console.log('Computing leftList with filteredMappings:', filteredMappings);
      const filtered = filteredMappings.filter(m => !assignedIdsSet.has(m.id));
      console.log('Filtered leftList:', filtered);
      return filtered;
    },
    [filteredMappings, assignedIdsSet]
  );

  // 右侧显示已分配的列表 (直接使用 currentAssignedMappings)
  const rightList = currentAssignedMappings;

  // --- 穿梭操作 ---
  const addSelected = () => {
    const itemsToAdd = leftList.filter(m => selectedLeftIds.includes(m.id));
    setCurrentAssignedMappings(prev => {
      // 过滤掉已在右侧的，确保不重复添加
      const newItems = itemsToAdd.filter(item => !prev.some(p => p.id === item.id));
      return [...prev, ...newItems];
    });
    setSelectedLeftIds([]); // 清空左侧选中
  };

  const addAll = () => {
    const itemsToAdd = leftList; // leftList本身已排除已分配的
    setCurrentAssignedMappings(prev => {
      const newItems = itemsToAdd.filter(item => !prev.some(p => p.id === item.id));
      return [...prev, ...newItems];
    });
    setSelectedLeftIds([]); // 清空左侧选中
  };

  const removeSelected = () => {
    setCurrentAssignedMappings(prev => prev.filter(m => !selectedRightIds.includes(m.id)));
    setSelectedRightIds([]); // 清空右侧选中
  };

  const removeAll = () => {
    setCurrentAssignedMappings([]);
    setSelectedRightIds([]);
  };

  // --- 复选框控制 ---
  const handleLeftCheckboxChange = (id: number) => {
    setSelectedLeftIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleRightCheckboxChange = (id: number) => {
    setSelectedRightIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleLeftSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedLeftIds(leftList.map(m => m.id));
    } else {
      setSelectedLeftIds([]);
    }
  };

  const handleRightSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedRightIds(rightList.map(m => m.id));
    } else {
      setSelectedRightIds([]);
    }
  };

  // --- 分页控制 ---
  const totalPages = Math.ceil(leftList.length / itemsPerPage);

  // 计算当前页的数据
  const paginatedMappings = useMemo(() => {
    console.log('Computing paginatedMappings with leftList:', leftList);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginated = leftList.slice(startIndex, endIndex);
    console.log('Paginated results:', paginated);
    return paginated;
  }, [leftList, currentPage, itemsPerPage]);

  // --- 保存 ---
  const handleSave = async () => {
    setSaving(true);
    try {
      const idsToSave = currentAssignedMappings.map(m => m.id);
      await RoleAPI.updateRoleRegionBucketAccess(roleId!, { region_bucket_mapping_ids: idsToSave }); // roleId! 确保非空
      toast({ title: '保存成功', status: 'success', duration: 3000, isClosable: true });
      onSuccess && onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Failed to save mappings:", error);
      const errorMessage = error.response?.data?.message || '保存失败，请重试。';
      toast({ title: '保存失败', description: errorMessage, status: 'error', duration: 5000, isClosable: true });
    } finally {
      setSaving(false);
    }
  };

  // 只在模态框打开和 roleId 变化时获取数据
  useEffect(() => {
    let mounted = true;
    
    if (isOpen && roleId) {
      const loadData = async () => {
        if (!mounted) return;
        await fetchAllMappings();
      };
      loadData();
    }

    return () => {
      mounted = false;
    };
  }, [isOpen, roleId]); // 移除 fetchAllMappings 依赖

  // 重置状态
  useEffect(() => {
    if (!isOpen) {
      setAllAvailableMappings([]);
      setFilteredMappings([]);
      setCurrentPage(1);
      setFilter('');
      setCurrentAssignedMappings([]);
      setSelectedLeftIds([]);
      setSelectedRightIds([]);
      setLoadingLeft(false);
      setLoadingRight(false);
      setSaving(false);
    }
  }, [isOpen]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="6xl" closeOnOverlayClick={false}> {/* 增大Modal尺寸, 禁止点击遮罩层关闭 */}
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <Heading size="md">地域-桶访问权限分配 - {roleName}</Heading>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Flex direction={{ base: 'column', md: 'row' }} gap={6}> {/* 增加间距 */}
            {/* 左侧面板：所有可配置的地域-桶 */}
            <Box flex={1} borderWidth="1px" borderRadius="lg" p={4}>
              <HStack mb={4}>
                <Input
                  placeholder="按桶名称或地域筛选..."
                  value={filter}
                  onChange={e => handleSearch(e.target.value)}
                  size="md"
                />
                <Button size="md" onClick={addAll} isDisabled={leftList.length === 0 || loadingLeft}>全部添加</Button>
              </HStack>
              <TableContainer maxH="400px" overflowY="auto"> {/* 固定高度并允许滚动 */}
                <Table variant="simple" size="sm">
                  <Thead>
                    <Tr>
                      <Th w="50px">
                        <Checkbox
                          isChecked={selectedLeftIds.length > 0 && selectedLeftIds.length === paginatedMappings.length}
                          onChange={handleLeftSelectAll}
                        />
                      </Th>
                      <Th>地域</Th>
                      <Th>桶名称</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {loadingLeft ? (
                      <Tr><Td colSpan={3} textAlign="center"><Spinner size="sm" mt={4}/></Td></Tr>
                    ) : paginatedMappings.length === 0 ? (
                      <Tr><Td colSpan={3} textAlign="center"><Text py={4}>无可分配地域-桶</Text></Td></Tr>
                    ) : (
                      paginatedMappings.map(m => (
                        <Tr key={m.id}>
                          <Td>
                            <Checkbox
                              isChecked={selectedLeftIds.includes(m.id)}
                              onChange={() => handleLeftCheckboxChange(m.id)}
                            />
                          </Td>
                          <Td>{m.region_code}</Td>
                          <Td>{m.bucket_name}</Td>
                        </Tr>
                      ))
                    )}
                  </Tbody>
                </Table>
              </TableContainer>
              {/* 左侧分页控制 */}
              <Flex justifyContent="space-between" alignItems="center" mt={4}>
                <Text fontSize="sm">
                  共 {leftList.length} 条，第 {currentPage}/{totalPages} 页
                </Text>
                <HStack>
                  <Button
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    isDisabled={currentPage === 1 || loadingLeft}
                  >
                    上一页
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    isDisabled={currentPage === totalPages || loadingLeft}
                  >
                    下一页
                  </Button>
                </HStack>
              </Flex>
            </Box>

            {/* 中间按钮 */}
            <VStack justify="center" align="center" minW="120px" py={4} spacing={4}>
              <Button
                rightIcon={<ChevronRightIcon />}
                onClick={addSelected}
                isDisabled={selectedLeftIds.length === 0}
                size="md"
                colorScheme="blue"
              >添加</Button>
              <Button
                leftIcon={<ChevronLeftIcon />}
                onClick={removeSelected}
                isDisabled={selectedRightIds.length === 0}
                size="md"
                colorScheme="red"
              >移除</Button>
            </VStack>

            {/* 右侧面板：已分配的地域-桶 */}
            <Box flex={1} borderWidth="1px" borderRadius="lg" p={4}>
              <HStack mb={4} justifyContent="space-between">
                 <Heading size="md">已分配给 {roleName} 的地域-桶</Heading>
                 {/* "全部移除"按钮在右侧顶部 */}
                 <Button
                    size="md"
                    onClick={removeAll}
                    isDisabled={rightList.length === 0 || loadingRight}
                    colorScheme="red"
                 >全部移除</Button>
              </HStack>
              <TableContainer maxH="400px" overflowY="auto">
                <Table variant="simple" size="sm">
                  <Thead>
                    <Tr>
                      <Th w="50px">
                        <Checkbox
                          isChecked={selectedRightIds.length > 0 && selectedRightIds.length === rightList.length}
                          onChange={handleRightSelectAll}
                        />
                      </Th>
                      <Th>地域</Th>
                      <Th>桶名称</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {loadingRight ? (
                      <Tr><Td colSpan={3} textAlign="center"><Spinner size="sm" mt={4}/></Td></Tr>
                    ) : rightList.length === 0 ? (
                      <Tr><Td colSpan={3} textAlign="center"><Text py={4}>无已分配地域-桶</Text></Td></Tr>
                    ) : (
                      rightList.map(m => (
                        <Tr key={m.id}>
                          <Td>
                            <Checkbox
                              isChecked={selectedRightIds.includes(m.id)}
                              onChange={() => handleRightCheckboxChange(m.id)}
                            />
                          </Td>
                          <Td>{m.region_code}</Td>
                          <Td>{m.bucket_name}</Td>
                        </Tr>
                      ))
                    )}
                  </Tbody>
                </Table>
              </TableContainer>
            </Box>
          </Flex>
        </ModalBody>
        <ModalFooter>
          <HStack w="100%" justify="flex-end">
            <Button variant="outline" onClick={onClose} isDisabled={saving}>取消</Button>
            <Button colorScheme="blue" onClick={handleSave} isLoading={saving}>保存</Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}