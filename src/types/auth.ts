/**
 * 认证相关类型定义
 */

import { User } from './user';

/**
 * 登录请求接口
 */
export interface LoginRequest {
  username: string;          // 用户名
  password: string;          // 密码
  rememberMe?: boolean;      // 记住我
  captchaId?: string;        // 验证码ID（如果启用验证码）
  captchaValue?: string;     // 验证码值（如果启用验证码）
}

/**
 * 登录响应接口
 */
export interface LoginResponse {
  token: string;             // JWT令牌
  refreshToken: string;      // 刷新令牌
  tokenType: string;         // 令牌类型（通常为"Bearer"）
  expiresIn: number;         // 过期时间（秒）
  user: User;                // 用户信息
}

/**
 * JWT荷载接口
 */
export interface JWTPayload {
  sub: string;               // 主题（通常是用户ID）
  username: string;          // 用户名
  email?: string;            // 邮箱
  roles: string[];           // 角色列表
  permissions?: string[];    // 权限列表
  iat: number;               // 签发时间
  exp: number;               // 过期时间
  iss?: string;              // 签发者
}

/**
 * 令牌刷新请求
 */
export interface RefreshTokenRequest {
  refreshToken: string;      // 刷新令牌
}

/**
 * 令牌刷新响应
 */
export interface RefreshTokenResponse {
  token: string;             // 新的JWT令牌
  refreshToken: string;      // 新的刷新令牌
  tokenType: string;         // 令牌类型
  expiresIn: number;         // 过期时间（秒）
}

/**
 * 注册请求接口
 */
export interface RegisterRequest {
  username: string;          // 用户名
  email: string;             // 邮箱
  password: string;          // 密码
  confirmPassword: string;   // 确认密码
  realName?: string;         // 真实姓名
  captchaId?: string;        // 验证码ID
  captchaValue?: string;     // 验证码值
}

/**
 * 重置密码请求
 */
export interface ResetPasswordRequest {
  email: string;             // 邮箱
  token: string;             // 重置令牌
  newPassword: string;       // 新密码
  confirmPassword: string;   // 确认密码
}

/**
 * 密码重置请求（获取重置链接）
 */
export interface ForgotPasswordRequest {
  email: string;             // 邮箱
  captchaId?: string;        // 验证码ID
  captchaValue?: string;     // 验证码值
}

/**
 * 验证码请求响应
 */
export interface CaptchaResponse {
  captchaId: string;         // 验证码ID
  captchaImage: string;      // 验证码图片（Base64编码）
}

/**
 * 认证状态
 */
export interface AuthState {
  isAuthenticated: boolean;  // 是否已认证
  token?: string;            // JWT令牌
  refreshToken?: string;     // 刷新令牌
  user?: User;               // 用户信息
  loading: boolean;          // 加载状态
  error?: string;            // 错误信息
}

/**
 * 社交登录提供商
 */
export enum SocialProvider {
  GOOGLE = 'GOOGLE',
  GITHUB = 'GITHUB',
  MICROSOFT = 'MICROSOFT',
  WECHAT = 'WECHAT',
  DINGTALK = 'DINGTALK',
}

/**
 * 社交登录请求
 */
export interface SocialLoginRequest {
  provider: SocialProvider;  // 提供商
  code: string;              // 授权码
  state?: string;            // 状态码（防CSRF）
  redirectUri?: string;      // 重定向URI
} 