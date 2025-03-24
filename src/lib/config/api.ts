/**
 * API配置
 * 
 * 支持通过环境变量定制配置:
 * - NEXT_PUBLIC_API_URL: API基础地址
 * - NEXT_PUBLIC_API_TIMEOUT: API请求超时时间（毫秒）
 */

// 环境配置
// Next.js 中使用 process.env.NODE_ENV 获取当前环境
const env = (typeof process !== 'undefined' && process.env && process.env.NODE_ENV) || 'development';

// 从环境变量获取配置值
const getEnvValue = (key: string, defaultValue: string) => {
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key] || defaultValue;
  }
  return defaultValue;
};

// API基础地址配置
const API_CONFIG = {
  development: {
    // 使用相对路径，让请求通过Next.js代理
    baseURL: '/api/v1',
    timeout: parseInt(getEnvValue('NEXT_PUBLIC_API_TIMEOUT', '15000'), 10),
  },
  test: {
    baseURL: getEnvValue('NEXT_PUBLIC_API_URL', 'http://test-api.example.com/api/v1'),
    timeout: parseInt(getEnvValue('NEXT_PUBLIC_API_TIMEOUT', '15000'), 10),
  },
  production: {
    baseURL: '/api/v1',
    timeout: parseInt(getEnvValue('NEXT_PUBLIC_API_TIMEOUT', '15000'), 10),
  },
};

/**
 * 获取当前环境的API配置
 */
export const getApiConfig = () => {
  return API_CONFIG[env as keyof typeof API_CONFIG] || API_CONFIG.development;
};

export default getApiConfig; 