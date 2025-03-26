import apiClient from './axios';
import { ApiResponse, User, Role, Permission, StorageConfig, SystemConfig } from './types';
import { request } from './request';

/**
 * 管理员相关API服务
 */
export const AdminAPI = {
  /**
   * 获取用户列表
   * @returns 用户列表
   */
  getUsers: async (): Promise<User[]> => {
    const response = await apiClient.get<ApiResponse<User[]>>('/admin/users');
    return response.data as unknown as User[];
  },

  /**
   * 创建用户
   * @param user 用户信息
   * @returns 创建的用户
   */
  createUser: async (user: Partial<User>): Promise<User> => {
    const response = await apiClient.post<ApiResponse<User>>('/admin/users', user);
    return response.data as unknown as User;
  },

  /**
   * 更新用户
   * @param id 用户ID
   * @param user 用户信息
   * @returns 更新后的用户
   */
  updateUser: async (id: string, user: Partial<User>): Promise<User> => {
    const response = await apiClient.put<ApiResponse<User>>(`/admin/users/${id}`, user);
    return response.data as unknown as User;
  },

  /**
   * 删除用户
   * @param id 用户ID
   */
  deleteUser: async (id: string): Promise<void> => {
    await apiClient.delete<ApiResponse>(`/admin/users/${id}`);
  },

  /**
   * 获取角色列表
   * @returns 角色列表
   */
  getRoles: async (): Promise<Role[]> => {
    const response = await apiClient.get<ApiResponse<Role[]>>('/admin/roles');
    return response.data as unknown as Role[];
  },

  /**
   * 创建角色
   * @param role 角色信息
   * @returns 创建的角色
   */
  createRole: async (role: Partial<Role>): Promise<Role> => {
    const response = await apiClient.post<ApiResponse<Role>>('/admin/roles', role);
    return response.data as unknown as Role;
  },

  /**
   * 更新角色
   * @param id 角色ID
   * @param role 角色信息
   * @returns 更新后的角色
   */
  updateRole: async (id: string, role: Partial<Role>): Promise<Role> => {
    const response = await apiClient.put<ApiResponse<Role>>(`/admin/roles/${id}`, role);
    return response.data as unknown as Role;
  },

  /**
   * 删除角色
   * @param id 角色ID
   */
  deleteRole: async (id: string): Promise<void> => {
    await apiClient.delete<ApiResponse>(`/admin/roles/${id}`);
  },

  /**
   * 获取权限列表
   * @returns 权限列表
   */
  getPermissions: async (): Promise<Permission[]> => {
    const response = await apiClient.get<ApiResponse<Permission[]>>('/admin/permissions');
    return response.data as unknown as Permission[];
  },

  /**
   * 获取存储配置列表
   * @returns 存储配置列表
   */
  getStorageConfigs: async (): Promise<StorageConfig[]> => {
    const response = await apiClient.get<ApiResponse<StorageConfig[]>>('/admin/storage-configs');
    return response.data as unknown as StorageConfig[];
  },

  /**
   * 创建存储配置
   * @param config 存储配置信息
   * @returns 创建的存储配置
   */
  createStorageConfig: async (config: Partial<StorageConfig>): Promise<StorageConfig> => {
    const response = await apiClient.post<ApiResponse<StorageConfig>>('/admin/storage-configs', config);
    return response.data as unknown as StorageConfig;
  },

  /**
   * 更新存储配置
   * @param id 存储配置ID
   * @param config 存储配置信息
   * @returns 更新后的存储配置
   */
  updateStorageConfig: async (id: string, config: Partial<StorageConfig>): Promise<StorageConfig> => {
    const response = await apiClient.put<ApiResponse<StorageConfig>>(`/admin/storage-configs/${id}`, config);
    return response.data as unknown as StorageConfig;
  },

  /**
   * 删除存储配置
   * @param id 存储配置ID
   */
  deleteStorageConfig: async (id: string): Promise<void> => {
    await apiClient.delete<ApiResponse>(`/admin/storage-configs/${id}`);
  },

  /**
   * 获取系统配置
   * @returns 系统配置
   */
  getSystemConfig: async (): Promise<SystemConfig> => {
    const response = await apiClient.get<ApiResponse<SystemConfig>>('/admin/system-config');
    return response.data as unknown as SystemConfig;
  },

  /**
   * 更新系统配置
   * @param config 系统配置信息
   * @returns 更新后的系统配置
   */
  updateSystemConfig: async (config: Partial<SystemConfig>): Promise<SystemConfig> => {
    const response = await apiClient.put<ApiResponse<SystemConfig>>('/admin/system-config', config);
    return response.data as unknown as SystemConfig;
  },

  /**
   * 获取审计日志列表
   * @param params 查询参数
   * @returns 审计日志列表
   */
  getAuditLogs: async (params: any): Promise<any> => {
    const queryParams = new URLSearchParams(params);
    const response = await apiClient.get<ApiResponse<any>>(`/admin/audit-logs?${queryParams}`);
    return response.data as unknown as any;
  },
};

export const StorageConfigAPI = {
  getConfig: async (id: string) => {
    return request.get(`/api/admin/storage-configs/${id}`);
  },
  
  updateConfig: async (id: string, data: any) => {
    return request.put(`/api/admin/storage-configs/${id}`, data);
  },
  
  deleteConfig: async (id: string) => {
    return request.delete(`/api/admin/storage-configs/${id}`);
  },
  
  listConfigs: async () => {
    return request.get('/api/admin/storage-configs');
  },
  
  createConfig: async (data: any) => {
    return request.post('/api/admin/storage-configs', data);
  },
}; 