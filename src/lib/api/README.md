# API 服务层

本目录包含与后端API交互的服务层代码，按照Swagger文档定义实现了前端API调用。

## 目录结构

- `axios.ts` - Axios实例配置，包含请求/响应拦截器
- `types.ts` - API相关类型定义
- `auth.ts` - 认证相关API
- `files.ts` - 文件管理相关API
- `configs.ts` - 存储配置相关API
- `audit.ts` - 审计日志相关API
- `index.ts` - 统一导出

## 使用方法

### 导入API服务

```typescript
import { AuthAPI, FileAPI, ConfigAPI, AuditAPI } from '@/lib/api';
```

### 认证相关

```typescript
// 登录
const loginResponse = await AuthAPI.login({ username: 'admin', password: 'password' });

// 注册
await AuthAPI.register({
  username: 'newuser',
  password: 'password',
  email: 'user@example.com',
  real_name: '新用户'
});

// 获取当前用户信息
const user = await AuthAPI.getCurrentUser();

// 登出
await AuthAPI.logout();
```

### 文件相关

```typescript
// 获取文件列表
const files = await FileAPI.getFiles({ page: 1, page_size: 10 });

// 上传文件
const file = new File(['file content'], 'filename.txt', { type: 'text/plain' });
const uploadedFile = await FileAPI.uploadFile(file);

// 获取下载链接
const downloadUrl = await FileAPI.getFileDownloadURL(1);

// 删除文件
await FileAPI.deleteFile(1);
```

### 存储配置相关

```typescript
// 获取配置列表
const configs = await ConfigAPI.getConfigs();

// 创建配置
const newConfig = await ConfigAPI.createConfig({
  name: '阿里云OSS',
  storage_type: 'ALIYUN_OSS',
  access_key: 'access_key',
  secret_key: 'secret_key',
  region: 'cn-beijing',
  bucket: 'my-bucket',
});

// 更新配置
await ConfigAPI.updateConfig(1, {
  name: '阿里云OSS更新',
  access_key: 'new_access_key',
  secret_key: 'new_secret_key',
  region: 'cn-beijing',
  bucket: 'my-bucket',
  storage_type: 'ALIYUN_OSS',
});

// 删除配置
await ConfigAPI.deleteConfig(1);

// 设置默认配置
await ConfigAPI.setDefaultConfig(1);

// 测试连接
const isConnected = await ConfigAPI.testConnection(1);
```

### 审计日志相关

```typescript
// 获取审计日志列表
const logs = await AuditAPI.getLogs({
  start_time: '2023-01-01T00:00:00Z',
  end_time: '2023-12-31T23:59:59Z',
});

// 导出审计日志
await AuditAPI.exportLogs();
```

## 错误处理

所有API调用都会自动处理错误，并通过Chakra UI的toast组件显示错误信息。对于需要自定义错误处理的情况，可以使用try/catch：

```typescript
try {
  await FileAPI.uploadFile(file);
} catch (error) {
  // 自定义错误处理
  console.error('上传失败:', error);
}
``` 