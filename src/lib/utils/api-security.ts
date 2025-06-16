import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

// JWT密钥 (应该从环境变量获取)
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key-change-this-in-production');

// 权限接口定义
interface Permission {
  id: number;
  resource: string;
  action: string;
}

interface UserPayload {
  id: number;
  username: string;
  email?: string;
  role: string;
  permissions: Permission[];
}

// 验证JWT令牌
export async function verifyToken(token: string): Promise<{ isValid: boolean; payload?: UserPayload }> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return { isValid: true, payload: payload as UserPayload };
  } catch (error) {
    return { isValid: false };
  }
}

// 从请求中提取令牌
export function extractToken(request: NextRequest): string | null {
  // 从Authorization头部获取
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  // 从Cookie获取
  const token = request.cookies.get('token')?.value;
  if (token) {
    return token;
  }
  
  return null;
}

// 检查用户是否具有特定权限
export function hasPermission(user: UserPayload, resource: string, action?: string): boolean {
  if (!user || !user.permissions) return false;
  
  return user.permissions.some(permission => {
    if (permission.resource !== resource) return false;
    if (action && permission.action !== action && permission.action !== 'ALL') return false;
    return true;
  });
}

// 检查是否为管理员
export function isAdmin(user: UserPayload): boolean {
  if (!user) return false;
  
  // 检查角色
  if (user.role === 'admin' || user.role === 'manager') return true;
  
  // 检查权限
  return hasPermission(user, 'MANAGER') || hasPermission(user, 'ADMIN');
}

// API权限装饰器
export function withAuth(handler: (request: NextRequest, user: UserPayload) => Promise<NextResponse>) {
  return async (request: NextRequest): Promise<NextResponse> => {
    try {
      const token = extractToken(request);
      
      if (!token) {
        return NextResponse.json({ error: 'Unauthorized: No token provided' }, { status: 401 });
      }
      
      const { isValid, payload } = await verifyToken(token);
      
      if (!isValid || !payload) {
        return NextResponse.json({ error: 'Unauthorized: Invalid token' }, { status: 401 });
      }
      
      return await handler(request, payload);
    } catch (error) {
      console.error('Auth middleware error:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  };
}

// 管理员权限装饰器
export function withAdminAuth(handler: (request: NextRequest, user: UserPayload) => Promise<NextResponse>) {
  return withAuth(async (request: NextRequest, user: UserPayload) => {
    if (!isAdmin(user)) {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }
    
    return await handler(request, user);
  });
}

// 特定权限装饰器
export function withPermission(resource: string, action?: string) {
  return function(handler: (request: NextRequest, user: UserPayload) => Promise<NextResponse>) {
    return withAuth(async (request: NextRequest, user: UserPayload) => {
      if (!hasPermission(user, resource, action)) {
        return NextResponse.json({ 
          error: `Forbidden: ${resource} ${action || 'access'} permission required` 
        }, { status: 403 });
      }
      
      return await handler(request, user);
    });
  };
}

// 资源所有者验证装饰器
export function withOwnershipCheck(resourceExtractor: (request: NextRequest, user: UserPayload) => Promise<boolean>) {
  return function(handler: (request: NextRequest, user: UserPayload) => Promise<NextResponse>) {
    return withAuth(async (request: NextRequest, user: UserPayload) => {
      // 管理员可以访问所有资源
      if (isAdmin(user)) {
        return await handler(request, user);
      }
      
      // 检查资源所有权
      const isOwner = await resourceExtractor(request, user);
      
      if (!isOwner) {
        return NextResponse.json({ error: 'Forbidden: Resource access denied' }, { status: 403 });
      }
      
      return await handler(request, user);
    });
  };
}

// API端点安全响应包装器
export function secureResponse(data: any, options?: {
  removeFields?: string[];
  maxAge?: number;
}): NextResponse {
  let responseData = data;
  
  // 移除敏感字段
  if (options?.removeFields && Array.isArray(data)) {
    responseData = data.map(item => {
      const cleanItem = { ...item };
      options.removeFields?.forEach(field => {
        delete cleanItem[field];
      });
      return cleanItem;
    });
  } else if (options?.removeFields && typeof data === 'object') {
    responseData = { ...data };
    options.removeFields.forEach(field => {
      delete responseData[field];
    });
  }
  
  const response = NextResponse.json(responseData);
  
  // 设置安全头部
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  
  // 设置缓存控制
  if (options?.maxAge) {
    response.headers.set('Cache-Control', `max-age=${options.maxAge}, must-revalidate`);
  } else {
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
  }
  
  return response;
}

// 错误响应包装器
export function errorResponse(message: string, status: number = 400, details?: any): NextResponse {
  const response = NextResponse.json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && details ? { details } : {})
  }, { status });
  
  // 设置安全头部
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  
  return response;
}

// 速率限制 (简单实现)
const requestCounts = new Map<string, { count: number; resetTime: number }>();

export function withRateLimit(maxRequests: number = 100, windowMs: number = 15 * 60 * 1000) {
  return function(handler: (request: NextRequest) => Promise<NextResponse>) {
    return async (request: NextRequest): Promise<NextResponse> => {
      const ip = request.headers.get('x-forwarded-for') || 
                request.headers.get('x-real-ip') || 'unknown';
      
      const now = Date.now();
      const windowStart = now - windowMs;
      
      const record = requestCounts.get(ip);
      
      if (!record || record.resetTime < windowStart) {
        requestCounts.set(ip, { count: 1, resetTime: now });
        return await handler(request);
      }
      
      if (record.count >= maxRequests) {
        return errorResponse('Too Many Requests', 429);
      }
      
      record.count++;
      return await handler(request);
    };
  };
}

// 输入验证装饰器
export function withValidation(validator: (request: NextRequest) => Promise<{ isValid: boolean; errors?: any }>) {
  return function(handler: (request: NextRequest) => Promise<NextResponse>) {
    return async (request: NextRequest): Promise<NextResponse> => {
      const validation = await validator(request);
      
      if (!validation.isValid) {
        return errorResponse('Validation failed', 400, validation.errors);
      }
      
      return await handler(request);
    };
  };
} 