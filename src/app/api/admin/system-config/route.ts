import { NextRequest, NextResponse } from 'next/server';
import { SystemConfigService } from '@/lib/data/storage';

// 获取系统配置
export async function GET(request: NextRequest) {
  try {
    // 权限验证
    // 在实际应用中，应该检查用户是否有权限访问系统配置
    
    // 返回系统配置
    const config = SystemConfigService.getConfig();
    return NextResponse.json(config, { status: 200 });
  } catch (error) {
    console.error('获取系统配置失败:', error);
    return NextResponse.json(
      { message: '获取系统配置失败', error: (error as Error).message },
      { status: 500 }
    );
  }
}

// 更新系统配置
export async function PUT(request: NextRequest) {
  try {
    // 权限验证
    // 在实际应用中，应该检查用户是否有权限更新系统配置
    
    // 解析请求体
    const body = await request.json();
    
    // 基本验证
    if (body.maxFileSize !== undefined && (isNaN(body.maxFileSize) || body.maxFileSize <= 0)) {
      return NextResponse.json(
        { message: '最大文件大小必须是正数' },
        { status: 400 }
      );
    }
    
    if (body.maxUploadConcurrency !== undefined && (isNaN(body.maxUploadConcurrency) || body.maxUploadConcurrency <= 0)) {
      return NextResponse.json(
        { message: '最大上传并发数必须是正数' },
        { status: 400 }
      );
    }
    
    if (body.retentionDays !== undefined && (isNaN(body.retentionDays) || body.retentionDays < 0)) {
      return NextResponse.json(
        { message: '文件保留天数必须是非负数' },
        { status: 400 }
      );
    }
    
    // 更新配置
    const updatedConfig = SystemConfigService.updateConfig({
      maxFileSize: body.maxFileSize !== undefined ? body.maxFileSize : undefined,
      allowedFileTypes: body.allowedFileTypes || undefined,
      maxUploadConcurrency: body.maxUploadConcurrency !== undefined ? body.maxUploadConcurrency : undefined,
      enablePublicAccess: body.enablePublicAccess !== undefined ? body.enablePublicAccess : undefined,
      retentionDays: body.retentionDays !== undefined ? body.retentionDays : undefined,
    });
    
    // 记录审计日志
    // 在实际应用中，应该在这里记录谁更新了系统配置
    
    return NextResponse.json(updatedConfig, { status: 200 });
  } catch (error) {
    console.error('更新系统配置失败:', error);
    return NextResponse.json(
      { message: '更新系统配置失败', error: (error as Error).message },
      { status: 500 }
    );
  }
} 