/**
 * 统计数据相关类型定义
 */

import { StorageType } from './file';

/**
 * 仪表盘统计数据接口
 */
export interface DashboardStats {
  todayUploads: number;      // 今日上传文件数
  yesterdayUploads: number;  // 昨日上传文件数
  weekUploads: number;       // 本周上传文件数
  monthUploads: number;      // 本月上传文件数
  
  todayDownloads: number;    // 今日下载次数
  yesterdayDownloads: number; // 昨日下载次数
  weekDownloads: number;     // 本周下载次数
  monthDownloads: number;    // 本月下载次数
  
  totalFiles: number;        // 总文件数
  totalUsers: number;        // 总用户数
  totalStorageConfigs: number; // 总存储配置数
  
  storageUsed: {             // 存储空间使用情况（字节）
    total: number;
    byStorageType: Record<StorageType, number>;
  };
  
  uploadTrend: Array<{       // 上传趋势
    date: string;            // 日期
    count: number;           // 数量
    size: number;            // 大小（字节）
  }>;
  
  downloadTrend: Array<{     // 下载趋势
    date: string;            // 日期
    count: number;           // 数量
  }>;
  
  topFileTypes: Array<{      // 文件类型排行
    mimeType: string;        // MIME类型
    count: number;           // 数量
    size: number;            // 大小（字节）
  }>;
  
  topUploaders: Array<{      // 上传者排行
    userId: string;          // 用户ID
    username: string;        // 用户名
    count: number;           // 上传数量
    size: number;            // 总大小（字节）
  }>;
  
  storageDistribution: Array<{ // 存储分布
    storageType: StorageType;  // 存储类型
    count: number;             // 文件数量
    size: number;              // 总大小（字节）
    percentage: number;        // 百分比
  }>;
}

/**
 * 存储统计接口
 */
export interface StorageStats {
  storageType: StorageType;   // 存储类型
  usedSpace: number;          // 已用空间（字节）
  totalSpace?: number;        // 总空间（字节）
  fileCount: number;          // 文件数量
  bucketStats: Array<{        // 存储桶统计
    bucket: string;           // 存储桶
    usedSpace: number;        // 已用空间（字节）
    fileCount: number;        // 文件数量
  }>;
}

/**
 * 用户活动统计接口
 */
export interface UserActivityStats {
  activeUsers: {              // 活跃用户数
    today: number;            // 今日
    yesterday: number;        // 昨日
    week: number;             // 本周
    month: number;            // 本月
  };
  
  newUsers: {                 // 新增用户数
    today: number;            // 今日
    yesterday: number;        // 昨日
    week: number;             // 本周
    month: number;            // 本月
  };
  
  loginStats: {               // 登录统计
    today: number;            // 今日登录次数
    yesterday: number;        // 昨日登录次数
    week: number;             // 本周登录次数
    month: number;            // 本月登录次数
  };
  
  userTrend: Array<{          // 用户趋势
    date: string;             // 日期
    activeCount: number;      // 活跃用户数
    newCount: number;         // 新增用户数
    loginCount: number;       // 登录次数
  }>;
}

/**
 * 文件活动统计接口
 */
export interface FileActivityStats {
  period: 'day' | 'week' | 'month' | 'year'; // 统计周期
  data: Array<{              // 统计数据
    timestamp: string;       // 时间戳
    uploads: number;         // 上传数
    downloads: number;       // 下载数
    deletions: number;       // 删除数
    size: number;            // 大小变化（字节）
  }>;
} 