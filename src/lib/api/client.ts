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
  RegionBucketMappingListResponse,
  RoleRegionBucketAccessResponse,
  UpdateRoleRegionBucketAccessRequest,
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
    try {
      const response = await apiClient.get('/roles', { params });
      const data = response.data;
      // 1. 分页结构
      if (data && data.data && Array.isArray(data.data.items)) {
        const roles = data.data.items.map((r: any) => ({
          id: r.id,
          name: r.name ?? '',
          description: r.description ?? '',
          permissions: Array.isArray(r.permissions) ? r.permissions : [],
          created_at: r.created_at ?? '',
          ...r
        }));
        return { roles, total: roles.length };
      }
      // 2. 数组结构
      if (Array.isArray(data)) {
        const roles = data.map((r: any) => ({
          id: r.id,
          name: r.name ?? '',
          description: r.description ?? '',
          permissions: Array.isArray(r.permissions) ? r.permissions : [],
          created_at: r.created_at ?? '',
          ...r
        }));
        return { roles, total: roles.length };
      }
      // 3. 单对象结构
      if (data && typeof data === 'object' && data.id) {
        const role = {
          id: data.id,
          name: data.name ?? '',
          description: data.description ?? '',
          permissions: Array.isArray(data.permissions) ? data.permissions : [],
          created_at: data.created_at ?? '',
          ...data
        };
        return { roles: [role], total: 1 };
      }
      // 兜底
      return { roles: [], total: 0 };
    } catch (error) {
      return { roles: [], total: 0 };
    }
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

  // 获取所有 region-bucket 映射
  getRegionBucketMappings: async (params: { page: number; limit: number; filter?: string }) => {
    const response = await apiClient.get('/region-bucket-mappings', { params });
    return response.data;
  },

  // 获取某角色已分配 region-bucket
  getRoleRegionBucketAccess: async (roleId: string | number) => {
    const response = await apiClient.get(`/roles/${roleId}/bucket-access`);
    return response.data; // { mapping_ids: [...] }
  },

  // 更新某角色 region-bucket
  updateRoleRegionBucketAccess: async (roleId: string | number, data: { region_bucket_mapping_ids: number[] }) => {
    await apiClient.put(`/roles/${roleId}/bucket-access`, data);
  },

  // 取消某角色的某个 region-bucket
  deleteRoleRegionBucketAccess: async (roleId: number, mappingId: number) => {
    await apiClient.delete(`/roles/${roleId}/accessible-buckets/${mappingId}`);
  },
};

export const PermissionAPI = {
  getPermissions: async (params: { page: number; limit: number; search?: string }) => {
    try {
      const response = await apiClient.get<PermissionListResponse>('/permissions', { params });
      console.log('PermissionAPI.getPermissions response:', response);
      console.log('PermissionAPI.getPermissions response.data:', response.data);

      if (response.data && response.data.items) {
        console.log('PermissionAPI.getPermissions response.data.items:', response.data.items);
        return {
          permissions: response.data.items,
          total: response.data.total
        };
      }

      if (Array.isArray(response.data)) {
        return {
          permissions: response.data,
          total: response.data.length
        };
      }

      return {
        permissions: [],
        total: 0
      };
    } catch (error) {
      console.error('PermissionAPI.getPermissions error:', error);
      throw error;
    }
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