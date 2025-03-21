import { NextRequest, NextResponse } from 'next/server';
import { StorageConfigService } from '@/lib/data/storage';

// 获取单个存储配置
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 权限验证
    // 在实际应用中，应该检查用户是否有权限访问这个配置
    
    const { id } = params;
    
    // 查找指定ID的配置
    const config = StorageConfigService.getConfigById(id);
    
    if (!config) {
      return NextResponse.json(
        { message: '存储配置不存在' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(config, { status: 200 });
  } catch (error) {
    console.error('获取存储配置失败:', error);
    return NextResponse.json(
      { message: '获取存储配置失败', error: (error as Error).message },
      { status: 500 }
    );
  }
}

// 更新存储配置
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 权限验证
    // 在实际应用中，应该检查用户是否有权限更新配置
    
    const { id } = params;
    const body = await request.json();
    
    // 基本验证
    if (!body.name || !body.type || !body.bucket) {
      return NextResponse.json(
        { message: '必填字段缺失' },
        { status: 400 }
      );
    }
    
    // 更新配置
    const updatedConfig = StorageConfigService.updateConfig(id, {
      name: body.name,
      type: body.type,
      endpoint: body.endpoint || '',
      accessKey: body.accessKey || '',
      secretKey: body.secretKey || '',
      bucket: body.bucket,
      region: body.region || '',
      isDefault: body.isDefault || false,
    });
    
    if (!updatedConfig) {
      return NextResponse.json(
        { message: '存储配置不存在' },
        { status: 404 }
      );
    }
    
    // 记录审计日志
    // 在实际应用中，应该在这里记录谁更新了这个配置
    
    return NextResponse.json(updatedConfig, { status: 200 });
  } catch (error) {
    console.error('更新存储配置失败:', error);
    return NextResponse.json(
      { message: '更新存储配置失败', error: (error as Error).message },
      { status: 500 }
    );
  }
}

// 删除存储配置
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 权限验证
    // 在实际应用中，应该检查用户是否有权限删除配置
    
    const { id } = params;
    
    // 尝试删除配置
    const result = StorageConfigService.deleteConfig(id);
    
    if (!result) {
      return NextResponse.json(
        { message: '存储配置不存在或无法删除默认配置' },
        { status: 400 }
      );
    }
    
    // 记录审计日志
    // 在实际应用中，应该在这里记录谁删除了这个配置
    
    return NextResponse.json({ message: '存储配置已删除' }, { status: 200 });
  } catch (error) {
    console.error('删除存储配置失败:', error);
    return NextResponse.json(
      { message: '删除存储配置失败', error: (error as Error).message },
      { status: 500 }
    );
  }
} 