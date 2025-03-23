# 自定义Hooks

本目录包含与后端API交互的自定义React Hooks，封装了API调用的状态管理和错误处理。

## 目录结构

- `useAuth.ts` - 认证相关Hook
- `useFiles.ts` - 文件管理相关Hook
- `useConfigs.ts` - 存储配置相关Hook
- `useAudit.ts` - 审计日志相关Hook
- `index.ts` - 统一导出

## 使用方法

### 导入Hooks

```typescript
import { useAuth, useFiles, useConfigs, useAudit } from '@/lib/hooks';
```

### 认证相关Hook

```typescript
const { 
  user,              // 当前用户
  loading,           // 加载状态
  isAuthenticated,   // 是否已认证
  login,             // 登录方法
  register,          // 注册方法
  logout,            // 登出方法
  initialize         // 初始化方法
} = useAuth();

// 登录示例
const handleLogin = async () => {
  const success = await login({ username: 'admin', password: 'password' });
  if (success) {
    // 登录成功处理
  }
};

// 注册示例
const handleRegister = async () => {
  const success = await register({
    username: 'newuser',
    password: 'password',
    email: 'user@example.com',
    real_name: '新用户'
  });
  if (success) {
    // 注册成功处理
  }
};

// 登出示例
const handleLogout = () => {
  logout();
};
```

### 文件管理Hook

```typescript
const {
  files,            // 文件列表
  total,            // 总数
  loading,          // 加载状态
  currentPage,      // 当前页码
  pageSize,         // 每页大小
  fetchFiles,       // 获取文件列表
  uploadFile,       // 上传文件
  deleteFile,       // 删除文件
  getDownloadUrl,   // 获取下载链接
  calculateMD5,     // 触发MD5计算
  getFileMD5        // 获取文件MD5
} = useFiles();

// 获取文件列表
useEffect(() => {
  fetchFiles({ page: 1, page_size: 10 });
}, [fetchFiles]);

// 上传文件
const handleUpload = async (file: File) => {
  const result = await uploadFile(file);
  if (result) {
    // 上传成功处理
  }
};

// 删除文件
const handleDelete = async (id: number) => {
  const success = await deleteFile(id);
  if (success) {
    // 删除成功处理
  }
};

// 下载文件
const handleDownload = async (id: number) => {
  const url = await getDownloadUrl(id);
  if (url) {
    window.open(url, '_blank');
  }
};
```

### 存储配置Hook

```typescript
const {
  configs,           // 配置列表
  total,             // 总数
  loading,           // 加载状态
  currentPage,       // 当前页码
  pageSize,          // 每页大小
  fetchConfigs,      // 获取配置列表
  fetchConfigById,   // 获取单个配置
  createConfig,      // 创建配置
  updateConfig,      // 更新配置
  deleteConfig,      // 删除配置
  setDefaultConfig,  // 设置默认配置
  testConnection     // 测试连接
} = useConfigs();

// 获取配置列表
useEffect(() => {
  fetchConfigs();
}, [fetchConfigs]);

// 创建配置
const handleCreate = async (config: StorageConfigInput) => {
  const result = await createConfig(config);
  if (result) {
    // 创建成功处理
  }
};

// 更新配置
const handleUpdate = async (id: number, config: StorageConfigInput) => {
  const result = await updateConfig(id, config);
  if (result) {
    // 更新成功处理
  }
};

// 测试连接
const handleTest = async (id: number) => {
  const success = await testConnection(id);
  if (success) {
    // 连接成功处理
  }
};
```

### 审计日志Hook

```typescript
const {
  logs,             // 日志列表
  total,            // 总数
  loading,          // 加载状态
  currentPage,      // 当前页码
  pageSize,         // 每页大小
  fetchLogs,        // 获取日志列表
  exportLogs        // 导出日志
} = useAudit();

// 获取日志列表
useEffect(() => {
  fetchLogs({ 
    start_time: '2023-01-01T00:00:00Z',
    end_time: '2023-12-31T23:59:59Z',
  });
}, [fetchLogs]);

// 导出日志
const handleExport = async () => {
  await exportLogs();
};
```

## 组件中使用示例

```tsx
import React, { useEffect } from 'react';
import { useFiles } from '@/lib/hooks';

const FilesPage: React.FC = () => {
  const { files, loading, fetchFiles } = useFiles();

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  return (
    <div>
      {loading ? (
        <p>加载中...</p>
      ) : (
        <ul>
          {files.map(file => (
            <li key={file.id}>{file.file_name}</li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default FilesPage;
``` 