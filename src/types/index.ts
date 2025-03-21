/**
 * 类型定义入口文件
 */

// 用户相关类型
export * from './user';

// 文件相关类型
export * from './file';

// 配置相关类型
export * from './config';

// 日志相关类型
export * from './log';

// 统计数据相关类型
export * from './stats';

// 认证相关类型
export * from './auth';

/**
 * API响应通用结构
 */
export interface ApiResponse<T> {
  code: number;             // 状态码
  message: string;          // 响应消息
  data?: T;                 // 响应数据
  timestamp: string;        // 时间戳
  path?: string;            // 请求路径
  traceId?: string;         // 跟踪ID
}

/**
 * 分页请求参数
 */
export interface PaginationParams {
  page: number;             // 页码（从1开始）
  pageSize: number;         // 每页大小
  sortBy?: string;          // 排序字段
  sortOrder?: 'asc' | 'desc'; // 排序顺序
}

/**
 * 分页响应结构
 */
export interface PaginatedResponse<T> {
  content: T[];             // 数据内容
  page: number;             // 当前页码
  pageSize: number;         // 每页大小
  totalElements: number;    // 总元素数
  totalPages: number;       // 总页数
  first: boolean;           // 是否为第一页
  last: boolean;            // 是否为最后一页
  empty: boolean;           // 是否为空
}

/**
 * 通用搜索请求参数
 */
export interface SearchParams {
  keyword?: string;          // 关键词
  startDate?: string;        // 开始日期
  endDate?: string;          // 结束日期
  status?: string;           // 状态
  page?: number;             // 页码
  pageSize?: number;         // 每页大小
  sortBy?: string;           // 排序字段
  sortOrder?: 'asc' | 'desc'; // 排序顺序
}

/**
 * 导出请求参数
 */
export interface ExportParams extends SearchParams {
  exportType: 'csv' | 'excel' | 'pdf'; // 导出类型
  columns?: string[];                  // 导出列
} 