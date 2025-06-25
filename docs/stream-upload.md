前端上传进度与速度显示实现文档
📋 概述
本文档详细说明了前端如何实现文件上传的实时进度显示和速度计算功能，该方案基于流式上传和Server-Sent Events (SSE)技术。
🏗️ 整体架构
用户选择文件
初始化上传任务
获取Task ID
建立SSE连接
开始流式上传
后端实时推送进度
前端计算速度
更新UI显示
上传完成
🔄 核心实现流程
1. 初始化阶段
Apply to page.tsx
graph TD
    A[用户选择文件] --> B[初始化上传任务]
    B --> C[获取Task ID]
    C --> D[建立SSE连接]
    D --> E[开始流式上传]
    E --> F[后端实时推送进度]
    F --> G[前端计算速度]
    G --> H[更新UI显示]
    H --> I[上传完成]
2. SSE连接建立
Apply to page.tsx
// 1. 初始化上传任务，获取task_id
const taskId = await initUploadTask(file.file.size);

// 2. 创建SSE连接监听进度
eventSource = createProgressListener(taskId, file.id, file.file.size);

// 3. 等待SSE连接建立
await waitForSSEConnection(eventSource);
3. 流式文件上传
Apply to page.tsx
const createProgressListener = (taskId, fileId, fileSize) => {
  const baseApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';
  const sseUrl = `${baseApiUrl}/uploads/${taskId}/stream`;
  
  const eventSource = new EventSource(sseUrl);
  
  // 监听进度事件
  eventSource.addEventListener('progress', handleProgressEvent);
  
  return eventSource;
};
📊 进度与速度计算算法
核心数据结构
Apply to page.tsx
// 使用新的API规范进行流式上传
xhr.setRequestHeader('Content-Type', 'application/octet-stream');
xhr.setRequestHeader('Content-Length', file.file.size.toString());
xhr.setRequestHeader('X-File-Name', file.file.name);
xhr.setRequestHeader('Upload-Task-ID', taskId);

// 直接发送文件二进制数据
xhr.send(file.file);
进度计算逻辑
Apply to page.tsx
let lastUpdateTime = Date.now();
let lastUploadedBytes = 0;
let speedSamples = []; // 速度样本数组
🎯 关键技术要点
1. 速度平滑算法
采样频率: 每0.5秒计算一次瞬时速度
样本缓存: 保留最近5个速度样本
平均计算: 使用滑动窗口平均值减少速度波动
Apply to page.tsx
eventSource.addEventListener('progress', (event) => {
  const data = JSON.parse(event.data);
  const { total, uploaded } = data;
  
  // 1. 计算进度百分比
  const progress = total > 0 ? (uploaded / total) * 100 : 0;
  
  // 2. 计算时间和字节差值
  const now = Date.now();
  const timeDiff = (now - lastUpdateTime) / 1000; // 秒
  const bytesDiff = uploaded - lastUploadedBytes;
  
  // 3. 计算瞬时速度
  let currentSpeed = 0;
  if (timeDiff >= 0.5 && bytesDiff > 0) {
    currentSpeed = bytesDiff / timeDiff; // 字节/秒
    
    // 4. 速度平滑处理
    speedSamples.push(currentSpeed);
    if (speedSamples.length > 5) {
      speedSamples.shift(); // 保留最近5个样本
    }
    
    lastUpdateTime = now;
    lastUploadedBytes = uploaded;
  }
  
  // 5. 计算平均速度
  const avgSpeed = speedSamples.length > 0 
    ? speedSamples.reduce((sum, speed) => sum + speed, 0) / speedSamples.length 
    : 0;
  
  // 6. 估算剩余时间
  const remainingBytes = total - uploaded;
  const estimatedTime = avgSpeed > 0 && remainingBytes > 0 
    ? remainingBytes / avgSpeed 
    : 0;
});
2. 进度更新策略
实时更新: SSE事件驱动的实时进度更新
进度限制: 上传过程中最大显示99%，避免误导用户
状态同步: 文件状态与进度同步更新
Apply to page.tsx
// 速度平滑处理
if (timeDiff >= 0.5 && bytesDiff > 0) {
  currentSpeed = bytesDiff / timeDiff;
  speedSamples.push(currentSpeed);
  if (speedSamples.length > 5) {
    speedSamples.shift();
  }
}
3. 时间估算算法
Apply to page.tsx
setFiles(prev => prev.map(f => f.id === fileId ? {
  ...f,
  progress: Math.min(progress, 99), // 限制在99%
  uploadedBytes: uploaded,
  uploadSpeed: avgSpeed,
  estimatedTimeRemaining: estimatedTime
} : f));
🎨 UI显示格式化
文件大小格式化
Apply to page.tsx
const remainingBytes = total - uploaded;
const estimatedTime = avgSpeed > 0 && remainingBytes > 0 
  ? remainingBytes / avgSpeed 
  : 0;
上传速度格式化
Apply to page.tsx
function formatFileSize(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
剩余时间格式化
Apply to page.tsx
function formatUploadSpeed(bytesPerSecond) {
  if (bytesPerSecond === 0) return '0 B/s';
  const k = 1024;
  const sizes = ['B/s', 'KB/s', 'MB/s', 'GB/s'];
  const i = Math.floor(Math.log(bytesPerSecond) / Math.log(k));
  return parseFloat((bytesPerSecond / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
🛠️ 技术栈
上传方式: XMLHttpRequest + 流式传输
进度监听: Server-Sent Events (SSE)
状态管理: React useState
UI组件: Chakra UI Progress组件
数据格式化: 自定义格式化函数
📈 性能优化
1. 连接管理
连接复用: 每个文件使用独立的SSE连接
连接超时: 10秒连接建立超时保护
自动清理: 上传完成后自动关闭SSE连接
2. 计算优化
采样控制: 限制速度计算频率（0.5秒间隔）
内存控制: 限制速度样本数量（最多5个）
状态批量更新: 使用React批量状态更新
3. 错误处理
Apply to page.tsx
function formatTimeRemaining(seconds) {
  if (seconds === 0 || !isFinite(seconds)) return '--';
  if (seconds < 60) return `${Math.ceil(seconds)}秒`;
  if (seconds < 3600) return `${Math.ceil(seconds / 60)}分钟`;
  return `${Math.ceil(seconds / 3600)}小时`;
}
🎯 实际效果
显示信息
实时进度条: 0-100%的可视化进度
传输量显示: "已上传/总大小" (如: 256 MB / 512 MB)
上传速度: 实时网速 (如: 15.2 MB/s)
剩余时间: 估算完成时间 (如: 2分钟)
用户体验
✅ 实时响应的进度更新
✅ 平滑的速度显示（无抖动）
✅ 准确的时间估算
✅ 直观的可视化界面
🔧 调试支持
代码中包含详细的控制台日志，便于开发调试：
Apply to page.tsx
eventSource.onerror = (error) => {
  console.error('SSE连接错误:', error);
  if (eventSource.readyState === EventSource.CLOSED) {
    console.log('SSE连接已关闭');
  } else if (eventSource.readyState === EventSource.CONNECTING) {
    console.log('SSE正在重连...');
  }
};
总结: 该实现方案通过SSE实时监听后端推送的上传进度，结合滑动窗口平均算法计算上传速度，为用户提供了准确、流畅的上传进度体验。核心在于流式上传 + 实时进度监听 + 智能速度计算的组合。