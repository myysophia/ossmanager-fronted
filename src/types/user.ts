/**
 * 用户相关类型定义
 */

/**
 * 用户状态枚举
 */
export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  LOCKED = 'LOCKED',
}

/**
 * 权限接口
 */
export interface Permission {
  id: string;
  name: string;
  resource: string; // 资源类型，例如: "FILE", "USER", "CONFIG" 等
  action: string;   // 操作类型，例如: "READ", "WRITE", "DELETE" 等
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * 角色接口
 */
export interface Role {
  id: string;
  name: string;
  description?: string;
  permissions: Permission[];
  createdAt?: string;
  updatedAt?: string;
}

/**
 * 用户接口
 */
export interface User {
  id: string;
  username: string;
  email: string;
  realName?: string;
  avatar?: string;
  status: UserStatus;
  roles: Role[];
  lastLoginAt?: string;
  createdAt?: string;
  updatedAt?: string;
  department?: string; 
  position?: string;
  phoneNumber?: string;
}

/**
 * 用户创建请求
 */
export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
  realName?: string;
  roleIds: string[];
  department?: string;
  position?: string;
  phoneNumber?: string;
}

/**
 * 用户更新请求
 */
export interface UpdateUserRequest {
  id: string;
  email?: string;
  realName?: string;
  status?: UserStatus;
  roleIds?: string[];
  department?: string;
  position?: string;
  phoneNumber?: string;
}

/**
 * 用户密码修改请求
 */
export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
} 