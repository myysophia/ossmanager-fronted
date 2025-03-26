import { NextRequest, NextResponse } from 'next/server';
import { StorageConfigAPI } from '@/lib/api/admin';

// 获取单个存储配置
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const config = await StorageConfigAPI.getConfig(params.id);
    return NextResponse.json(config);
  } catch (error) {
    const message = error instanceof Error ? error.message : '获取存储配置失败';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// 更新存储配置
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const config = await StorageConfigAPI.updateConfig(params.id, body);
    return NextResponse.json(config);
  } catch (error) {
    const message = error instanceof Error ? error.message : '更新存储配置失败';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// 删除存储配置
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await StorageConfigAPI.deleteConfig(params.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : '删除存储配置失败';
    return NextResponse.json({ error: message }, { status: 500 });
  }
} 