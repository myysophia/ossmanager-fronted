import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 需要管理员权限的路径
const ADMIN_PATHS = [
  '/main/admin',
  '/main/admin/users',
  '/main/admin/roles',
  '/main/admin/permissions',
  '/main/admin/audit',
  '/main/admin/settings',
  '/main/admin/storage-configs'
];

// 需要登录的路径
const PROTECTED_PATHS = [
  '/main',
  ...ADMIN_PATHS
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // 检查是否是需要保护的路径
  const isProtectedPath = PROTECTED_PATHS.some(path => 
    pathname.startsWith(path)
  );
  
  if (!isProtectedPath) {
    return NextResponse.next();
  }

  // 获取用户信息 (从cookie或localStorage，这里简化处理)
  const token = request.cookies.get('token')?.value;
  
  if (!token) {
    // 未登录，重定向到登录页
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  // 检查是否需要管理员权限
  const needsAdminAccess = ADMIN_PATHS.some(path => 
    pathname.startsWith(path)
  );

  if (needsAdminAccess) {
    // 这里可以进一步验证用户权限，但由于需要解析JWT或查询API
    // 建议在组件层面进行详细的权限验证
    // 中间件主要用于基础的路由保护
  }

  return NextResponse.next();
}

export const config = {
  // 匹配需要中间件处理的路径
  matcher: [
    '/main/:path*',
    '/admin/:path*'
  ]
}; 