import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 安全配置
const SECURITY_CONFIG = {
  // 需要管理员权限的路径
  adminPaths: [
    '/main/admin',
    '/main/admin/users',
    '/main/admin/roles', 
    '/main/admin/permissions',
    '/main/admin/audit',
    '/main/admin/settings',
    '/main/admin/storage-configs'
  ],

  // 需要登录的路径
  protectedPaths: [
    '/main',
    '/api/admin',
    '/api/user'
  ],

  // 公开路径 (无需认证)
  publicPaths: [
    '/auth',
    '/api/auth',
    '/',
    '/about',
    '/contact'
  ],

  // 恶意请求模式检测
  suspiciousPatterns: [
    // SQL注入尝试
    /(\s|^)(union|select|insert|update|delete|drop|create|alter|exec|execute)(\s|$)/i,
    // XSS尝试
    /<script|javascript:|on\w+\s*=/i,
    // 路径遍历
    /\.\.[\/\\]/,
    // 命令注入
    /[;&|`$()]/
  ],

  // 限制请求频率 (简单实现)
  rateLimiting: {
    windowMs: 15 * 60 * 1000, // 15分钟
    maxRequests: 100, // 每个IP最多100次请求
  }
};

// 合并所有保护路径
const ALL_PROTECTED_PATHS = [
  ...SECURITY_CONFIG.protectedPaths,
  ...SECURITY_CONFIG.adminPaths
];

// 简单的内存存储来跟踪请求频率 (生产环境应使用Redis)
const requestCounts = new Map<string, { count: number; resetTime: number }>();

// 检查可疑请求
function detectSuspiciousActivity(request: NextRequest): boolean {
  const url = request.url;
  const userAgent = request.headers.get('user-agent') || '';
  
  // 检查URL中的可疑模式
  for (const pattern of SECURITY_CONFIG.suspiciousPatterns) {
    if (pattern.test(url)) {
      return true;
    }
  }
  
  // 检查User-Agent
  const suspiciousUserAgents = [
    'sqlmap',
    'nikto', 
    'nmap',
    'masscan',
    'nessus',
    'burp',
    'dirbuster'
  ];
  
  if (suspiciousUserAgents.some(agent => userAgent.toLowerCase().includes(agent))) {
    return true;
  }
  
  return false;
}

// 简单的速率限制
function checkRateLimit(request: NextRequest): boolean {
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
  const now = Date.now();
  const windowStart = now - SECURITY_CONFIG.rateLimiting.windowMs;
  
  const record = requestCounts.get(ip);
  
  if (!record || record.resetTime < windowStart) {
    // 新的时间窗口
    requestCounts.set(ip, { count: 1, resetTime: now });
    return true;
  }
  
  if (record.count >= SECURITY_CONFIG.rateLimiting.maxRequests) {
    return false; // 超过限制
  }
  
  record.count++;
  return true;
}

// 添加安全头部
function addSecurityHeaders(response: NextResponse): NextResponse {
  // 防止XSS攻击
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // 内容安全策略
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:; frame-ancestors 'none';"
  );
  
  // 强制HTTPS (生产环境)
  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  
  // 防止缓存敏感页面
  if (response.url?.includes('/admin') || response.url?.includes('/api')) {
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
  }
  
  return response;
}

// 验证管理员权限 (简化版本，实际应该解析JWT)
function hasAdminPermission(request: NextRequest): boolean {
  // 从cookie获取用户权限信息
  const userPermissions = request.cookies.get('user_permissions')?.value;
  const userRole = request.cookies.get('user_role')?.value;
  
  if (!userPermissions && !userRole) {
    return false;
  }
  
  // 检查权限
  if (userPermissions && userPermissions.includes('MANAGER')) {
    return true;
  }
  
  if (userRole && (userRole === 'admin' || userRole === 'manager')) {
    return true;
  }
  
  return false;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // 获取客户端IP地址
  const clientIP = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
  
  // 速率限制检查
  if (!checkRateLimit(request)) {
    console.warn(`🚨 Rate limit exceeded for IP: ${clientIP}`);
    return NextResponse.json({ error: 'Too Many Requests' }, { status: 429 });
  }
  
  // 检查可疑活动
  if (detectSuspiciousActivity(request)) {
    console.warn(`🚨 Suspicious activity detected: ${request.url} from ${clientIP}`);
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  
  // 检查是否是公开路径
  const isPublicPath = SECURITY_CONFIG.publicPaths.some(path => 
    pathname.startsWith(path)
  );
  
  if (isPublicPath) {
    const response = NextResponse.next();
    return addSecurityHeaders(response);
  }
  
  // 检查是否是需要保护的路径
  const isProtectedPath = ALL_PROTECTED_PATHS.some(path => 
    pathname.startsWith(path)
  );
  
  if (!isProtectedPath) {
    const response = NextResponse.next();
    return addSecurityHeaders(response);
  }

  // 获取认证令牌
  const token = request.cookies.get('token')?.value || 
                request.headers.get('authorization')?.replace('Bearer ', '');
  
  if (!token) {
    if (pathname.startsWith('/api')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  // 检查是否需要管理员权限
  const needsAdminPermission = SECURITY_CONFIG.adminPaths.some(path => 
    pathname.startsWith(path)
  );
  
  if (needsAdminPermission && !hasAdminPermission(request)) {
    if (pathname.startsWith('/api')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }
    // 记录未授权访问尝试
    console.warn(`🚨 Unauthorized admin access attempt: ${pathname} from ${clientIP}`);
    return NextResponse.redirect(new URL('/main/dashboard', request.url));
  }

  // 通过所有检查，允许访问
  const response = NextResponse.next();
  return addSecurityHeaders(response);
}

export const config = {
  // 匹配需要中间件处理的路径 - 包含API路径
  matcher: [
    '/main/:path*',
    '/admin/:path*',
    '/api/:path*'
  ]
}; 