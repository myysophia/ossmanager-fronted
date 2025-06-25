# HTTP/2 SSE 连接问题解决方案

## 问题描述

在文件上传进度监控中，SSE (Server-Sent Events) 连接偶尔会出现 `ERR_HTTP2_PROTOCOL_ERROR` 错误。

## 问题原因

1. **HTTP/2 协议限制**
   - 某些浏览器或服务器的HTTP/2实现对长连接支持不完善
   - SSE连接在HTTP/2环境下可能出现协议层面的兼容性问题

2. **网络环境因素**
   - 代理服务器或CDN可能对HTTP/2连接有特殊处理
   - 防火墙或网络策略可能干扰HTTP/2流

3. **服务端配置**
   - 后端服务器的HTTP/2配置可能不适合长连接场景
   - 连接池或超时设置可能导致连接意外关闭

## 解决方案

### 1. 前端优化 ✅

已在代码中实现以下优化：

```javascript
// 增强错误处理和调试信息
eventSource.onerror = (error) => {
  console.error('SSE连接错误:', error);
  console.error('SSE readyState:', eventSource.readyState);
  console.error('SSE URL:', sseUrl);
  
  if (eventSource.readyState === EventSource.CLOSED) {
    // 如果是HTTP2协议错误，提供诊断建议
    console.warn('如果遇到ERR_HTTP2_PROTOCOL_ERROR，建议：');
    console.warn('1. 检查后端是否支持HTTP/1.1');
    console.warn('2. 尝试在后端配置中禁用HTTP/2');
    console.warn('3. 使用nginx等反向代理降级到HTTP/1.1');
  }
  
  // 更新UI显示错误状态
  setFiles(prev => prev.map(f => f.id === fileId ? {
    ...f,
    status: 'error' as const,
    error: 'SSE连接失败，可能是HTTP/2协议问题'
  } : f));
};
```

### 2. 后端配置建议

#### Go Gin 服务器配置

```go
// 方案1: 强制使用HTTP/1.1
server := &http.Server{
    Addr:    ":8080",
    Handler: router,
    // 禁用HTTP/2
    TLSNextProto: make(map[string]func(*http.Server, *tls.Conn, http.Handler)),
}
```

#### Nginx 反向代理配置

```nginx
server {
    listen 80;
    listen 443 ssl;
    
    # 强制使用HTTP/1.1与后端通信
    location /api/v1/uploads/ {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Connection "";
        
        # SSE 特殊配置
        proxy_buffering off;
        proxy_cache off;
        proxy_set_header X-Accel-Buffering no;
        
        # 保持连接
        proxy_read_timeout 3600;
        proxy_connect_timeout 60;
        proxy_send_timeout 60;
    }
}
```

### 3. 环境变量配置

#### 开发环境
```env
# 使用HTTP而非HTTPS避免HTTP/2
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
```

#### 生产环境
```env
# 如果必须使用HTTPS，确保后端支持HTTP/1.1降级
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api/v1
```

### 4. 重试机制（可选实现）

```javascript
// 可以添加的重试逻辑
const createProgressListenerWithRetry = (taskId, fileId, fileSize, maxRetries = 3) => {
  let retryCount = 0;
  
  const connect = () => {
    const eventSource = new EventSource(sseUrl);
    
    eventSource.onerror = (error) => {
      if (retryCount < maxRetries) {
        retryCount++;
        console.log(`SSE连接失败，尝试重连 (${retryCount}/${maxRetries})`);
        setTimeout(() => {
          eventSource.close();
          connect();
        }, 1000 * retryCount); // 递增延迟
      } else {
        console.error('SSE连接多次失败，停止重试');
        // 更新UI显示最终错误
      }
    };
    
    return eventSource;
  };
  
  return connect();
};
```

## 诊断步骤

### 1. 确认错误类型

在浏览器控制台查看错误信息：

```
net::ERR_HTTP2_PROTOCOL_ERROR
```

### 2. 检查网络协议

在浏览器开发者工具的 Network 选项卡中查看：
- Protocol 列显示是否为 `h2` (HTTP/2)
- 如果是，考虑降级到 `http/1.1`

### 3. 验证后端支持

```bash
# 测试后端是否支持HTTP/1.1
curl -v --http1.1 http://localhost:8080/api/v1/uploads/test-id/stream
```

### 4. 检查连接稳定性

```javascript
// 在浏览器控制台运行
const testSSE = () => {
  const es = new EventSource('http://localhost:8080/api/v1/uploads/test/stream');
  es.onopen = () => console.log('SSE连接建立');
  es.onerror = (e) => console.error('SSE错误:', e);
  setTimeout(() => es.close(), 10000); // 10秒后关闭
};
testSSE();
```

## 预防措施

1. **监控连接状态**
   - 添加连接健康检查
   - 记录错误发生频率和模式

2. **优雅降级**
   - 如果SSE失败，可以回退到轮询方式
   - 提供用户友好的错误提示

3. **服务端优化**
   - 定期发送心跳包保持连接活跃
   - 合理设置连接超时时间

## 参考资料

- [HTTP/2 RFC 7540](https://tools.ietf.org/html/rfc7540)
- [Server-Sent Events W3C Spec](https://www.w3.org/TR/eventsource/)
- [Nginx HTTP/2 Module](http://nginx.org/en/docs/http/ngx_http_v2_module.html)