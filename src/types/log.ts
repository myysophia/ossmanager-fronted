/**
 * 日志相关类型定义
 */

/**
 * 审计操作类型枚举
 */
export enum AuditAction {
  CREATE = 'CREATE',         // 创建
  READ = 'READ',             // 读取
  UPDATE = 'UPDATE',         // 更新
  DELETE = 'DELETE',         // 删除
  UPLOAD = 'UPLOAD',         // 上传
  DOWNLOAD = 'DOWNLOAD',     // 下载
  LOGIN = 'LOGIN',           // 登录
  LOGOUT = 'LOGOUT',         // 登出
  ACCESS = 'ACCESS',         // 访问
  EXPORT = 'EXPORT',         // 导出
  IMPORT = 'IMPORT',         // 导入
  SHARE = 'SHARE',           // 分享
  CONFIG = 'CONFIG',         // 配置
  ADMIN = 'ADMIN',           // 管理员操作
}

/**
 * 审计日志状态枚举
 */
export enum AuditStatus {
  SUCCESS = 'SUCCESS',       // 成功
  FAILURE = 'FAILURE',       // 失败
  WARNING = 'WARNING',       // 警告
}

/**
 * 资源类型枚举
 */
export enum ResourceType {
  FILE = 'FILE',             // 文件
  USER = 'USER',             // 用户
  ROLE = 'ROLE',             // 角色
  PERMISSION = 'PERMISSION', // 权限
  CONFIG = 'CONFIG',         // 配置
  SYSTEM = 'SYSTEM',         // 系统
}

/**
 * 审计日志接口
 */
export interface AuditLog {
  id: string;                // 日志ID
  userId: string;            // 用户ID
  username: string;          // 用户名
  action: AuditAction;       // 操作类型
  resourceType: ResourceType; // 资源类型
  resourceId?: string;       // 资源ID
  resourceName?: string;     // 资源名称
  details: string | Record<string, any>; // 详细信息
  status: AuditStatus;       // 状态
  ip: string;                // IP地址
  userAgent?: string;        // 用户代理
  errorMessage?: string;     // 错误信息（如果失败）
  createdAt: string;         // 创建时间
  duration?: number;         // 操作耗时（毫秒）
}

/**
 * 审计日志查询参数
 */
export interface LogQueryParams {
  keyword?: string;          // 关键词
  startDate?: string;        // 开始日期
  endDate?: string;          // 结束日期
  userId?: string;           // 用户ID
  action?: AuditAction;      // 操作类型
  resourceType?: ResourceType; // 资源类型
  resourceId?: string;       // 资源ID
  status?: AuditStatus;      // 状态
  ip?: string;               // IP地址
  page?: number;             // 页码
  pageSize?: number;         // 每页大小
  sortBy?: string;           // 排序字段
  sortOrder?: 'asc' | 'desc'; // 排序顺序
}

/**
 * 系统日志级别枚举
 */
export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
  FATAL = 'FATAL',
}

/**
 * 系统日志接口
 */
export interface SystemLog {
  id: string;                // 日志ID
  level: LogLevel;           // 日志级别
  message: string;           // 日志消息
  source: string;            // 日志来源
  timestamp: string;         // 时间戳
  metadata?: Record<string, any>; // 元数据
  stackTrace?: string;       // 堆栈跟踪（如果是错误日志）
}

/**
 * 系统日志查询参数
 */
export interface SystemLogQueryParams {
  keyword?: string;          // 关键词
  startDate?: string;        // 开始日期
  endDate?: string;          // 结束日期
  level?: LogLevel;          // 日志级别
  source?: string;           // 日志来源
  page?: number;             // 页码
  pageSize?: number;         // 每页大小
  sortBy?: string;           // 排序字段
  sortOrder?: 'asc' | 'desc'; // 排序顺序
} 