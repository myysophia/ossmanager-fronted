import { NextRequest, NextResponse } from 'next/server';
import { StorageConfigAPI } from '@/lib/api/admin';
import { extractToken, verifyToken, isAdmin } from '@/lib/utils/api-security';
import { validateForm } from '@/lib/utils/validation';

interface UserPayload {
  id: number;
  username: string;
  email?: string;
  role: string;
  permissions: any[];
}

// 通用权限验证函数
async function checkAdminAuth(request: NextRequest): Promise<{ user?: UserPayload; error?: NextResponse }> {
  const token = extractToken(request);
  
  if (!token) {
    return { error: NextResponse.json({ error: 'Unauthorized: No token provided' }, { status: 401 }) };
  }
  
  const { isValid, payload } = await verifyToken(token);
  
  if (!isValid || !payload) {
    return { error: NextResponse.json({ error: 'Unauthorized: Invalid token' }, { status: 401 }) };
  }
  
  if (!isAdmin(payload)) {
    return { error: NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 }) };
  }
  
  return { user: payload };
}

// 验证存储配置数据
function validateStorageConfigData(data: any) {
  const rules = {
    name: { required: true, maxLength: 100, type: 'text' as const },
    type: { required: true, pattern: /^(ALIYUN_OSS|AWS_S3|CLOUDFLARE_R2)$/ },
    endpoint: { required: true, type: 'url' as const },
    accessKey: { required: true, maxLength: 200 },
    secretKey: { required: true, maxLength: 200 },
    bucket: { required: true, maxLength: 100, pattern: /^[a-z0-9][a-z0-9-]*[a-z0-9]$/ },
    region: { required: true, maxLength: 50 }
  };
  
  return validateForm(data, rules);
}

// 移除敏感字段
function sanitizeStorageConfig(config: any) {
  if (!config) return config;
  
  const { secretKey, accessKey, ...sanitized } = config;
  return sanitized;
}

// 添加安全头部
function addSecurityHeaders(response: NextResponse) {
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  response.headers.set('Pragma', 'no-cache');
  response.headers.set('Expires', '0');
  return response;
}

// 获取单个存储配置
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 权限验证
    const { user, error } = await checkAdminAuth(request);
    if (error) return error;

    // 验证ID格式
    if (!params.id || !/^\d+$/.test(params.id)) {
      const response = NextResponse.json({ error: 'Invalid storage config ID' }, { status: 400 });
      return addSecurityHeaders(response);
    }
    
    const config = await StorageConfigAPI.getConfig(params.id);
    
    if (!config) {
      const response = NextResponse.json({ error: 'Storage config not found' }, { status: 404 });
      return addSecurityHeaders(response);
    }
    
    // 移除敏感信息并返回
    const sanitized = sanitizeStorageConfig(config);
    const response = NextResponse.json(sanitized);
    return addSecurityHeaders(response);
  } catch (error) {
    console.error('Failed to get storage config:', error);
    const response = NextResponse.json({ error: '获取存储配置失败' }, { status: 500 });
    return addSecurityHeaders(response);
  }
}

// 更新存储配置
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 权限验证
    const { user, error } = await checkAdminAuth(request);
    if (error) return error;

    // 验证ID格式
    if (!params.id || !/^\d+$/.test(params.id)) {
      const response = NextResponse.json({ error: 'Invalid storage config ID' }, { status: 400 });
      return addSecurityHeaders(response);
    }
    
    // 解析和验证请求数据
    let body;
    try {
      body = await request.json();
    } catch {
      const response = NextResponse.json({ error: 'Invalid JSON data' }, { status: 400 });
      return addSecurityHeaders(response);
    }
    
    // 输入验证
    const validation = validateStorageConfigData(body);
    if (!validation.isValid) {
      const response = NextResponse.json({ 
        error: 'Validation failed', 
        details: validation.errors 
      }, { status: 400 });
      return addSecurityHeaders(response);
    }
    
    // 记录审计日志
    console.log(`User ${user!.username} (ID: ${user!.id}) is updating storage config ${params.id}`);
    
    const config = await StorageConfigAPI.updateConfig(params.id, validation.sanitizedData);
    
    // 返回时移除敏感信息
    const sanitized = sanitizeStorageConfig(config);
    const response = NextResponse.json(sanitized);
    return addSecurityHeaders(response);
  } catch (error) {
    console.error('Failed to update storage config:', error);
    const response = NextResponse.json({ error: '更新存储配置失败' }, { status: 500 });
    return addSecurityHeaders(response);
  }
}

// 删除存储配置
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 权限验证
    const { user, error } = await checkAdminAuth(request);
    if (error) return error;

    // 验证ID格式
    if (!params.id || !/^\d+$/.test(params.id)) {
      const response = NextResponse.json({ error: 'Invalid storage config ID' }, { status: 400 });
      return addSecurityHeaders(response);
    }
    
    // 记录审计日志
    console.log(`User ${user!.username} (ID: ${user!.id}) is deleting storage config ${params.id}`);
    
    await StorageConfigAPI.deleteConfig(params.id);
    
    const response = NextResponse.json({ success: true });
    return addSecurityHeaders(response);
  } catch (error) {
    console.error('Failed to delete storage config:', error);
    const response = NextResponse.json({ error: '删除存储配置失败' }, { status: 500 });
    return addSecurityHeaders(response);
  }
} 