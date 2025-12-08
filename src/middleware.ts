// /**
//  * Next.js 中间件 - 安全加固
//  * 
//  * 功能：
//  * 1. API 请求速率限制
//  * 2. 请求日志记录
//  * 3. 安全头部设置
//  * 4. 可疑请求检测
//  */

// import { NextResponse } from 'next/server';
// import type { NextRequest } from 'next/server';

// // 简单的内存速率限制器（生产环境建议使用 Redis）
// const rateLimit = new Map<string, number[]>();

// // 速率限制配置
// const RATE_LIMIT_CONFIG = {
//   windowMs: 60 * 1000, // 1分钟
//   maxRequests: 100,     // 最大请求数
// };

// // 清理过期的速率限制记录
// function cleanupRateLimit() {
//   const now = Date.now();
//   for (const [key, requests] of rateLimit.entries()) {
//     const validRequests = requests.filter(
//       time => now - time < RATE_LIMIT_CONFIG.windowMs
//     );
//     if (validRequests.length === 0) {
//       rateLimit.delete(key);
//     } else {
//       rateLimit.set(key, validRequests);
//     }
//   }
// }

// // 定期清理（每分钟）
// setInterval(cleanupRateLimit, 60000);

// /**
//  * 检查速率限制
//  */
// function checkRateLimit(request: NextRequest): boolean {
//   const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
//   const now = Date.now();
  
//   const requests = rateLimit.get(ip) || [];
//   const recentRequests = requests.filter(
//     time => now - time < RATE_LIMIT_CONFIG.windowMs
//   );
  
//   if (recentRequests.length >= RATE_LIMIT_CONFIG.maxRequests) {
//     return false;
//   }
  
//   recentRequests.push(now);
//   rateLimit.set(ip, recentRequests);
  
//   return true;
// }

// /**
//  * 检测可疑请求
//  */
// function detectSuspiciousRequest(request: NextRequest): string | null {
//   const url = request.nextUrl.pathname;
//   const userAgent = request.headers.get('user-agent') || '';
  
//   // 检测常见的攻击模式
//   const suspiciousPatterns = [
//     /\.\.\//, // 路径遍历
//     /<script/i, // XSS 尝试
//     /union.*select/i, // SQL 注入
//     /exec\(/i, // 代码执行尝试
//     /__proto__/, // 原型污染
//     /constructor/i, // 构造函数注入
//   ];
  
//   for (const pattern of suspiciousPatterns) {
//     if (pattern.test(url)) {
//       return `可疑URL模式: ${pattern}`;
//     }
//   }
  
//   // 检测缺少 User-Agent
//   if (!userAgent) {
//     return '缺少 User-Agent';
//   }
  
//   return null;
// }

// /**
//  * 记录可疑请求
//  */
// function logSuspiciousRequest(
//   request: NextRequest,
//   reason: string
// ): void {
//   const logEntry = {
//     timestamp: new Date().toISOString(),
//     ip: request.ip || request.headers.get('x-forwarded-for'),
//     url: request.url,
//     method: request.method,
//     reason,
//     userAgent: request.headers.get('user-agent'),
//   };
  
//   console.warn('🚨 可疑请求:', JSON.stringify(logEntry, null, 2));
// }

// /**
//  * 添加安全响应头
//  */
// function addSecurityHeaders(response: NextResponse): NextResponse {
//   // 防止点击劫持
//   response.headers.set('X-Frame-Options', 'DENY');
  
//   // 防止 MIME 类型嗅探
//   response.headers.set('X-Content-Type-Options', 'nosniff');
  
//   // XSS 保护
//   response.headers.set('X-XSS-Protection', '1; mode=block');
  
//   // 引用策略
//   response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
//   // 内容安全策略（根据需要调整）
//   response.headers.set(
//     'Content-Security-Policy',
//     "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';"
//   );
  
//   return response;
// }

// /**
//  * 中间件主函数
//  */
// export function middleware(request: NextRequest) {
//   // 只对 API 路由进行处理
//   if (!request.nextUrl.pathname.startsWith('/api')) {
//     return NextResponse.next();
//   }
  
//   // 1. 速率限制检查
//   if (!checkRateLimit(request)) {
//     console.warn(`🚨 速率限制触发: ${request.ip || 'unknown IP'}`);
//     return NextResponse.json(
//       { 
//         error: 'Too Many Requests',
//         message: '请求过于频繁，请稍后再试',
//       },
//       { 
//         status: 429,
//         headers: {
//           'Retry-After': '60',
//         },
//       }
//     );
//   }
  
//   // 2. 可疑请求检测
//   const suspiciousReason = detectSuspiciousRequest(request);
//   if (suspiciousReason) {
//     logSuspiciousRequest(request, suspiciousReason);
    
//     // 根据严重程度决定是否阻止请求
//     // 当前仅记录，不阻止（可根据需要调整）
//     // return NextResponse.json(
//     //   { error: 'Forbidden' },
//     //   { status: 403 }
//     // );
//   }
  
//   // 3. 继续请求并添加安全头
//   const response = NextResponse.next();
//   return addSecurityHeaders(response);
// }

// /**
//  * 配置中间件匹配路径
//  */
// export const config = {
//   matcher: [
//     '/api/:path*',
//     // 如需要，可以添加其他路径
//   ],
// };

