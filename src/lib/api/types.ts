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
  real_name: string;
  role: 'admin' | 'user';
  created_at: string;
  updated_at: string;
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
  code: string;
  description: string;
  permissions: Permission[];
  created_at: string;
  updated_at: string;
}

// 权限相关类型
export interface Permission {
  id: number;
  name: string;
  code: string;
  description: string;
  created_at: string;
  updated_at: string;
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
  download_url: string;
  created_at: string;
  updated_at: string;
}

// 文件查询参数
export interface FileQueryParams {
  page?: number;
  page_size?: number;
  keyword?: string;
  storage_type?: string;
}

// 存储配置相关类型
export interface StorageConfig {
  id: number;
  name: string;
  storage_type: 'ALIYUN_OSS' | 'AWS_S3' | 'CLOUDFLARE_R2';
  access_key: string;
  secret_key: string;
  region: string;
  bucket: string;
  endpoint: string;
  root_path: string;
  is_default: boolean;
  description: string;
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
  site_description: string;
  logo_url: string;
  max_file_size: number;
  allowed_file_types: string[];
  default_storage_config_id: number;
  enable_registration: boolean;
  enable_captcha: boolean;
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