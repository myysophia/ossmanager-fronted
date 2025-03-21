/**
 * 文件相关类型定义
 */

/**
 * 存储类型枚举
 */
export enum StorageType {
  ALIYUN_OSS = 'ALIYUN_OSS',
  TENCENT_COS = 'TENCENT_COS',
  QINIU = 'QINIU',
  MINIO = 'MINIO',
  LOCAL = 'LOCAL',
  S3 = 'S3',
}

/**
 * 文件状态枚举
 */
export enum FileStatus {
  UPLOADING = 'UPLOADING',   // 上传中
  COMPLETE = 'COMPLETE',     // 上传完成
  FAILED = 'FAILED',         // 上传失败
  DELETED = 'DELETED',       // 已删除
}

/**
 * OSS文件接口
 */
export interface OSSFile {
  id: string;
  filename: string;          // 显示的文件名
  originalFilename: string;  // 原始文件名
  fileSize: number;          // 文件大小（字节）
  mimeType: string;          // 文件MIME类型
  md5: string;               // 文件MD5哈希值
  storageType: StorageType;  // 存储类型
  bucket: string;            // 存储桶
  objectKey: string;         // 对象存储键
  path?: string;             // 对象存储路径
  downloadUrl?: string;      // 下载URL
  thumbnailUrl?: string;     // 缩略图URL（如果有）
  status: FileStatus;        // 文件状态
  tags?: string[];           // 文件标签
  uploaderId: string;        // 上传者ID
  uploaderName?: string;     // 上传者名称
  createdAt: string;         // 创建时间
  updatedAt: string;         // 更新时间
  expiresAt?: string;        // 过期时间（如果有）
  isPublic: boolean;         // 是否公开访问
  metadata?: Record<string, any>; // 元数据
}

/**
 * 上传请求接口
 */
export interface UploadRequest {
  filename: string;          // 文件名
  fileSize: number;          // 文件大小
  mimeType: string;          // 文件类型
  md5?: string;              // 文件MD5哈希值
  storageConfigId?: string;  // 存储配置ID（可选，使用默认配置）
  path?: string;             // 存储路径（可选）
  isPublic?: boolean;        // 是否公开访问
  tags?: string[];           // 文件标签
  expiresIn?: number;        // 过期时间（秒）
  metadata?: Record<string, any>; // 元数据
}

/**
 * 上传响应接口
 */
export interface UploadResponse {
  fileId: string;            // 文件ID
  uploadUrl: string;         // 上传URL
  headers?: Record<string, string>; // 上传需要的请求头
  downloadUrl?: string;      // 下载URL（如果是公开文件）
  formData?: Record<string, string>; // 表单数据（针对某些OSS需要）
}

/**
 * 分片上传初始化请求
 */
export interface MultipartUploadInitRequest extends UploadRequest {
  partCount: number;         // 分片数量
}

/**
 * 分片上传初始化响应
 */
export interface MultipartUploadInit {
  fileId: string;            // 文件ID
  uploadId: string;          // 上传ID
  partUrls: {                // 分片上传URLs
    partNumber: number;      // 分片序号
    uploadUrl: string;       // 分片上传URL
    headers?: Record<string, string>; // 上传需要的请求头
  }[];
  objectKey: string;         // 对象存储键
  bucket: string;            // 存储桶
}

/**
 * 分片上传完成请求
 */
export interface MultipartUploadCompleteRequest {
  fileId: string;            // 文件ID
  uploadId: string;          // 上传ID
  parts: {                   // 已上传分片信息
    partNumber: number;      // 分片序号
    eTag: string;            // 分片ETag
  }[];
}

/**
 * 文件查询参数
 */
export interface FileQueryParams {
  keyword?: string;          // 关键词
  startDate?: string;        // 开始日期
  endDate?: string;          // 结束日期
  status?: FileStatus;       // 文件状态
  storageType?: StorageType; // 存储类型
  uploaderId?: string;       // 上传者ID
  tags?: string[];           // 文件标签
  mimeType?: string;         // MIME类型
  page?: number;             // 页码
  pageSize?: number;         // 每页大小
  sortBy?: string;           // 排序字段
  sortOrder?: 'asc' | 'desc'; // 排序顺序
} 