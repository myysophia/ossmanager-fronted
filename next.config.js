/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://1.94.50.42:8080/api/v1';
    return [
      {
        source: '/api/:path*',
        destination: `${apiUrl}/:path*`,
      },
    ];
  },
  // 允许跨域请求
  async headers() {
    return [
      {
        // 匹配所有API路由
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
    ];
  },
  // 添加webpack配置以处理大文件
  webpack: (config) => {
    config.performance = {
      ...config.performance,
      maxAssetSize: 1024 * 1024, // 1MB
      maxEntrypointSize: 1024 * 1024, // 1MB
    };
    return config;
  },
  output: 'standalone',
  eslint: {
    // 在生产构建时忽略 ESLint 错误
    ignoreDuringBuilds: true,
  },
  typescript: {
    // 在生产构建时忽略类型检查错误
    ignoreBuildErrors: true,
  },
  // 添加主机名配置
  hostname: '0.0.0.0',
  port: 3000,
};

module.exports = nextConfig; 