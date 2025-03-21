/**
 * 配置相关类型定义
 */

import { StorageType } from './file';

/**
 * OSS配置接口
 */
export interface OSSConfig {
  id: string;
  name: string;              // 配置名称
  description?: string;      // 配置描述
  storageType: StorageType;  // 存储类型 (ALIYUN_OSS, TENCENT_COS, QINIU, S3, MINIO, LOCAL)
  endpoint: string;          // 服务端点URL
  bucket: string;            // 存储桶名称
  region?: string;           // 区域/地区
  accessKey?: string;        // 访问密钥ID
  secretKey?: string;        // 访问密钥Secret（后端通常不会返回该字段，仅用于创建时）
  isSecure: boolean;         // 是否使用HTTPS
  isDefault: boolean;        // 是否为默认配置
  maxFileSize?: number;      // 最大允许的文件大小（字节）
  allowedFileTypes?: string[]; // 允许的文件类型
  publicBaseUrl?: string;    // 公共访问的基础URL
  customDomain?: string;     // 自定义域名
  createdAt: string;         // 创建时间
  updatedAt: string;         // 更新时间
  status: 'ACTIVE' | 'INACTIVE'; // 配置状态
  pathStyle?: boolean;       // 是否使用路径样式访问（对S3和MinIO等有效）
  extraParams?: Record<string, any>; // 其他参数
}

/**
 * 创建OSS配置请求
 */
export interface CreateOSSConfigRequest {
  name: string;              // 配置名称
  description?: string;      // 配置描述
  storageType: StorageType;  // 存储类型
  endpoint: string;          // 服务端点URL
  bucket: string;            // 存储桶名称
  region?: string;           // 区域/地区
  accessKey: string;         // 访问密钥ID
  secretKey: string;         // 访问密钥Secret
  isSecure: boolean;         // 是否使用HTTPS
  isDefault?: boolean;       // 是否为默认配置
  maxFileSize?: number;      // 最大允许的文件大小（字节）
  allowedFileTypes?: string[]; // 允许的文件类型
  publicBaseUrl?: string;    // 公共访问的基础URL
  customDomain?: string;     // 自定义域名
  pathStyle?: boolean;       // 是否使用路径样式访问
  extraParams?: Record<string, any>; // 其他参数
}

/**
 * 更新OSS配置请求
 */
export interface UpdateOSSConfigRequest {
  id: string;                // 配置ID
  name?: string;             // 配置名称
  description?: string;      // 配置描述
  endpoint?: string;         // 服务端点URL
  bucket?: string;           // 存储桶名称
  region?: string;           // 区域/地区
  accessKey?: string;        // 访问密钥ID
  secretKey?: string;        // 访问密钥Secret
  isSecure?: boolean;        // 是否使用HTTPS
  isDefault?: boolean;       // 是否为默认配置
  maxFileSize?: number;      // 最大允许的文件大小（字节）
  allowedFileTypes?: string[]; // 允许的文件类型
  publicBaseUrl?: string;    // 公共访问的基础URL
  customDomain?: string;     // 自定义域名
  status?: 'ACTIVE' | 'INACTIVE'; // 配置状态
  pathStyle?: boolean;       // 是否使用路径样式访问
  extraParams?: Record<string, any>; // 其他参数
}

/**
 * 测试OSS配置请求
 */
export interface TestOSSConfigRequest {
  storageType: StorageType;  // 存储类型
  endpoint: string;          // 服务端点URL
  bucket: string;            // 存储桶名称
  region?: string;           // 区域/地区
  accessKey: string;         // 访问密钥ID
  secretKey: string;         // 访问密钥Secret
  isSecure: boolean;         // 是否使用HTTPS
  pathStyle?: boolean;       // 是否使用路径样式访问
  extraParams?: Record<string, any>; // 其他参数
}

/**
 * 配置查询参数
 */
export interface ConfigQueryParams {
  keyword?: string;           // 关键词查询
  storageType?: StorageType;  // 存储类型过滤
  status?: 'ACTIVE' | 'INACTIVE'; // 状态过滤
  page?: number;              // 页码
  pageSize?: number;          // 每页大小
} 