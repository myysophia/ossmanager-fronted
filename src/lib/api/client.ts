import apiClient from './axios';
import {
  User,
  CreateUserRequest,
  UpdateUserRequest,
  Role,
  RoleListResponse,
  CreateRoleRequest,
  UpdateRoleRequest,
  Permission,
  PermissionListResponse,
  CreatePermissionRequest,
  UpdatePermissionRequest,
  PageResponse,
  ApiResponse,
} from './types';

// 用户管理相关 API
export const UserAPI = {
  // 获取用户列表
  getUsers: async (params: { page: number; limit: number; search?: string }): Promise<PageResponse<User>> => {
    console.log('UserAPI.getUsers called with params:', params); // 添加日志
    const response = await apiClient.get<PageResponse<User>>('/users', { params });
    console.log('UserAPI.getUsers raw response:', response); // 添加日志
    return response.data;
  },

  // 获取单个用户
  getUser: async (id: number) => {
    const response = await apiClient.get<User>(`/users/${id}`);
    return response.data;
  },

  // 创建用户
  createUser: async (data: CreateUserRequest) => {
    const response = await apiClient.post<User>('/users', data);
    return response.data;
  },

  // 更新用户
  updateUser: async (id: number, data: UpdateUserRequest) => {
    const response = await apiClient.put<User>(`/users/${id}`, data);
    return response.data;
  },

  // 删除用户
  deleteUser: async (id: number) => {
    await apiClient.delete(`/users/${id}`);
  },
};

export const RoleAPI = {
  getRoles: async (params: { page: number; limit: number; search?: string }) => {
    const response = await apiClient.get<RoleListResponse>('/roles', { params });
    return response.data;
  },

  getRole: async (id: number) => {
    const response = await apiClient.get<Role>(`/roles/${id}`);
    return response.data;
  },

  createRole: async (data: CreateRoleRequest) => {
    const response = await apiClient.post<Role>('/roles', data);
    return response.data;
  },

  updateRole: async (id: number, data: UpdateRoleRequest) => {
    const response = await apiClient.put<Role>(`/roles/${id}`, data);
    return response.data;
  },

  deleteRole: async (id: number) => {
    await apiClient.delete(`/roles/${id}`);
  },
};

export const PermissionAPI = {
  getPermissions: async (params: { page: number; limit: number; search?: string }) => {
    const response = await apiClient.get<PermissionListResponse>('/permissions', { params });
    return response.data;
  },

  getPermission: async (id: number) => {
    const response = await apiClient.get<Permission>(`/permissions/${id}`);
    return response.data;
  },

  createPermission: async (data: CreatePermissionRequest) => {
    const response = await apiClient.post<Permission>('/permissions', data);
    return response.data;
  },

  updatePermission: async (id: number, data: UpdatePermissionRequest) => {
    const response = await apiClient.put<Permission>(`/permissions/${id}`, data);
    return response.data;
  },

  deletePermission: async (id: number) => {
    await apiClient.delete(`/permissions/${id}`);
  },
}; 