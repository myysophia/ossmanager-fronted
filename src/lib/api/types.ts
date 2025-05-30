// 通用的响应结构
export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
}

// 分页响应结构
export interface PageResponse<T> {
  total: number;
  page: number;
  page_size: number;
  items: T[];
}

// 用户相关类型
export interface User {
  id: number;
  username: string;
  email: string;
  real_name?: string;
  status: boolean;
  created_at: string;
  updated_at: string;
  roles?: Role[];
}

// 登录请求参数
export interface LoginParams {
  username: string;
  password: string;
}

// 登录响应
export interface LoginResponse {
  token: string;
  user: User;
}

// 注册请求参数
export interface RegisterParams {
  username: string;
  password: string;
  email: string;
  real_name: string;
}

// 角色相关类型
export interface Role {
  id: number;
  name: string;
  description?: string;
  permissions?: Permission[];
  created_at: string;
  updated_at: string;
}

// 权限相关类型
export interface Permission {
  id: number;
  name: string;
  description?: string;
  resource: string;
  action: string;
  created_at: string;
  updated_at: string;
}

export interface PermissionListResponse {
  items: Permission[];
  total: number;
}

export interface CreatePermissionRequest {
  name: string;
  description?: string;
  resource: string;
  action: string;
}

export interface UpdatePermissionRequest {
  name: string;
  description?: string;
  resource: string;
  action: string;
}

// OSS文件相关类型
export interface OSSFile {
  id: number;
  file_name: string;
  file_size: number;
  file_type: string;
  storage_type: 'ALIYUN_OSS' | 'AWS_S3' | 'CLOUDFLARE_R2';
  object_key: string;
  config_id: number;
  config_name: string;
  md5: string;
  md5_status?: 'pending' | 'processing' | 'completed' | 'failed' | string;
  download_url?: string;
  created_at: string;
  updated_at: string;
  original_filename: string;
}

// 文件查询参数
export interface FileQueryParams {
  page?: number;
  page_size?: number;
  keyword?: string;
  storage_type?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

// 存储配置相关类型
export interface StorageConfig {
  id: string;
  name: string;
  storage_type: 'ALIYUN_OSS' | 'AWS_S3' | 'CLOUDFLARE_R2';
  endpoint: string;
  access_key: string;
  secret_key: string;
  bucket: string;
  region: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

// 存储配置输入
export interface StorageConfigInput {
  name: string;
  storage_type: 'ALIYUN_OSS' | 'AWS_S3' | 'CLOUDFLARE_R2';
  access_key: string;
  secret_key: string;
  region?: string;
  bucket: string;
  endpoint?: string;
  root_path?: string;
  description?: string;
}

// 配置查询参数
export interface ConfigQueryParams {
  page?: number;
  page_size?: number;
  name?: string;
  storage_type?: string;
}

// 系统配置相关类型
export interface SystemConfig {
  site_name: string;
  description: string;
  max_file_size: number;
  allowed_file_types: string[];
  max_upload_concurrency: number;
  enable_registration: boolean;
  enable_captcha: boolean;
  enable_public_access: boolean;
  retention_days: number;
  created_at: string;
  updated_at: string;
}

// 审计日志类型
export interface AuditLog {
  id: number;
  user_id: number;
  username: string;
  action: 'LOGIN' | 'LOGOUT' | 'UPLOAD' | 'DOWNLOAD' | 'DELETE' | 'CREATE' | 'UPDATE';
  resource_type: 'FILE' | 'USER' | 'ROLE' | 'CONFIG';
  resource_id: string;
  details: Record<string, any>;
  ip_address: string;
  user_agent: string;
  status: 'SUCCESS' | 'FAILED';
  created_at: string;
  updated_at: string;
}

// 审计日志查询参数
export interface AuditLogQueryParams {
  page?: number;
  page_size?: number;
  start_time?: string;
  end_time?: string;
  user_id?: number;
  username?: string;
  action?: string;
  resource_type?: string;
  status?: string;
}

// 分片上传初始化响应
export interface MultipartInitResponse {
  upload_id: string;
  urls: string[];
}

// 分片上传完成请求参数
export interface MultipartCompleteParams {
  upload_id: string;
  filename: string;
  parts: Array<{
    PartNumber: number;
    ETag: string;
  }>;
}

// 文件下载响应
export interface FileDownloadResponse {
  download_url: string;
  expires_in: number;
}

export interface FileUploadResponse {
  id: string;
  name: string;
  size: number;
  mime_type: string;
  url: string;
  created_at: string;
}

export interface FileUploadRequest {
  file: File | FormData;
  storage_type?: string;
  tags?: string[];
}

export interface CreateUserRequest {
  username: string;
  password: string;
  email: string;
  real_name?: string;
  role_ids?: number[];
}

export interface UpdateUserRequest {
  email?: string;
  real_name?: string;
  status?: boolean;
  role_ids?: number[];
}

export interface RoleListResponse {
  roles: Role[];
  total: number;
}

export interface CreateRoleRequest {
  name: string;
  description?: string;
  permission_ids: number[];
}

export interface UpdateRoleRequest {
  name: string;
  description?: string;
  permission_ids: number[];
}

export interface RegionBucketMapping {
  id: number;
  region_code: string;
  bucket_name: string;
  created_at: string;
  updated_at: string;
}

export interface RegionBucketMappingListResponse {
  mappings: RegionBucketMapping[];
  total: number;
}

export interface RoleRegionBucketAccessResponse {
  mapping_ids: number[];
}

export interface UpdateRoleRegionBucketAccessRequest {
  mapping_ids: number[];
} 