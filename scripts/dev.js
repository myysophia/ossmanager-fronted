#!/usr/bin/env node

/**
 * 优化的Next.js开发脚本
 * 处理内存使用并自动在内存溢出时重启服务器
 */

const { spawn } = require('child_process');
const os = require('os');

// 配置选项
const config = {
  // 默认内存限制 (MB)
  memoryLimit: 8192,
  // 检查间隔 (ms)
  checkInterval: 30000,
  // 内存使用警告阈值 (%)
  warningThreshold: 80,
  // 是否使用Turbopack
  useTurbopack: process.argv.includes('--turbo'),
  // 低内存模式
  lowMemoryMode: process.argv.includes('--low-memory'),
};

// 如果是低内存模式，降低内存限制
if (config.lowMemoryMode) {
  config.memoryLimit = 4096;
  console.log('🧠 运行在低内存模式 (4GB)');
}

// 构建启动命令
const getStartCommand = () => {
  const memoryOption = `--max-old-space-size=${config.memoryLimit}`;
  const turboOption = config.useTurbopack ? '--turbopack' : '';
  
  return {
    cmd: 'next',
    args: ['dev', turboOption].filter(Boolean),
    env: {
      ...process.env,
      NODE_OPTIONS: `${process.env.NODE_OPTIONS || ''} ${memoryOption}`.trim(),
      NEXT_DISABLE_SOURCEMAPS: '1', // 减少内存使用
      NEXT_WEBPACK_MEMORY_CACHE: 'true',
    }
  };
};

// 启动Next.js开发服务器
const startDevServer = () => {
  const { cmd, args, env } = getStartCommand();
  
  console.log(`🚀 启动开发服务器 (内存限制: ${config.memoryLimit}MB)`);
  if (config.useTurbopack) {
    console.log('⚡ 启用Turbopack (实验性)');
  }
  
  const nextProcess = spawn(cmd, args, {
    env,
    stdio: 'inherit',
    shell: true
  });

  // 监听进程退出
  nextProcess.on('exit', (code) => {
    if (code !== 0) {
      console.error(`❌ 开发服务器意外退出，代码: ${code}`);
      
      if (code === 137) {
        console.error('⚠️ 服务器可能因内存不足而被终止');
        console.log('🔄 5秒后尝试重启...');
        setTimeout(startDevServer, 5000);
      }
    }
  });

  // 定期监控内存使用
  const memoryMonitor = setInterval(() => {
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedPercent = Math.round(((totalMem - freeMem) / totalMem) * 100);
    
    // 如果内存使用超过警告阈值，输出警告
    if (usedPercent > config.warningThreshold) {
      console.warn(`⚠️ 系统内存使用率高: ${usedPercent}%`);
      console.warn('💡 提示: 考虑关闭一些应用以释放内存');
    }
  }, config.checkInterval);

  // 清理
  process.on('SIGINT', () => {
    clearInterval(memoryMonitor);
    process.exit(0);
  });
};

// 启动服务器
startDevServer(); 