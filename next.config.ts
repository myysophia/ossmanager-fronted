import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

const nextConfig: NextConfig = {
  /* 基本配置 */
  // 内存优化 - 在开发模式下禁用一些功能
  reactStrictMode: !isDev,
  productionBrowserSourceMaps: false,

  // 减少运行时代码
  poweredByHeader: false,
  
  // 自定义webpack配置
  webpack: (config, { dev, isServer }) => {
    // 在开发模式下优化内存使用
    if (dev) {
      // 降低块大小
      config.optimization.splitChunks = {
        chunks: 'all',
        maxSize: 200000,
      };

      // 禁用性能提示，减少日志和内存使用
      config.performance = {
        hints: false,
      };
    }

    return config;
  },
  
  experimental: {
    // 优化编译器选项
    optimizePackageImports: ['@chakra-ui/react', 'react-icons'],
    
    // 开发过程中关闭预渲染以减少内存使用
    typedRoutes: !isDev,
  },
};

export default nextConfig;
