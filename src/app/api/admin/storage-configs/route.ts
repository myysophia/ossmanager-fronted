import { NextRequest, NextResponse } from 'next/server';
import { StorageConfigService } from '@/lib/data/storage';

// 获取所有存储配置
export async function GET(request: NextRequest) {
  try {
    // 权限验证
    // 在实际应用中，应该检查用户是否有权限访问这些配置
    
    // 返回存储配置列表
    const configs = StorageConfigService.getAllConfigs();
    return NextResponse.json(configs, { status: 200 });
  } catch (error) {
    console.error('获取存储配置失败:', error);
    return NextResponse.json(
      { message: '获取存储配置失败', error: (error as Error).message },
      { status: 500 }
    );
  }
}

// 创建新的存储配置
export async function POST(request: NextRequest) {
  try {
    // 权限验证
    // 在实际应用中，应该检查用户是否有权限创建配置
    
    // 解析请求体
    const body = await request.json();
    
    // 基本验证
    if (!body.name || !body.type || !body.bucket) {
      return NextResponse.json(
        { message: '必填字段缺失' },
        { status: 400 }
      );
    }
    
    // 创建新的存储配置
    const newConfig = StorageConfigService.createConfig({
      name: body.name,
      type: body.type,
      endpoint: body.endpoint || '',
      accessKey: body.accessKey || '',
      secretKey: body.secretKey || '',
      bucket: body.bucket,
      region: body.region || '',
      isDefault: body.isDefault || false,
    });
    
    // 记录审计日志
    // 在实际应用中，应该在这里记录谁创建了这个配置
    
    return NextResponse.json(newConfig, { status: 201 });
  } catch (error) {
    console.error('创建存储配置失败:', error);
    return NextResponse.json(
      { message: '创建存储配置失败', error: (error as Error).message },
      { status: 500 }
    );
  }
} 