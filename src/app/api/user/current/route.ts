import { NextRequest, NextResponse } from 'next/server';

// 简化的token解析（由于我们使用的是简单的Base64编码）
function parseToken(token: string): any {
  try {
    if (token.startsWith('Bearer_')) {
      const base64Payload = token.substring(7);
      const payload = JSON.parse(Buffer.from(base64Payload, 'base64').toString());
      
      // 检查token是否过期
      if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
        return null;
      }
      
      return payload;
    }
    return null;
  } catch (error) {
    return null;
  }
}

// 模拟用户数据（应与login route保持一致）
const users = [
  {
    id: '1',
    username: process.env.ADMIN_USERNAME || 'admin',
    name: '管理员',
    avatar: '',
    email: 'admin@example.com',
    role: 'admin',
    permissions: [{ id: 1, resource: 'MANAGER', action: 'ALL' }]
  },
  {
    id: '2',
    username: process.env.USER_USERNAME || 'user',
    name: '普通用户',
    avatar: '',
    email: 'user@example.com',
    role: 'user',
    permissions: []
  },
];

export async function GET(request: NextRequest) {
  try {
    // 从Authorization头部或Cookie获取token
    let token = request.headers.get('authorization');
    if (token && token.startsWith('Bearer ')) {
      token = token.substring(7);
    } else {
      token = request.cookies.get('token')?.value || null;
    }
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // 解析token
    const payload = parseToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    
    // 根据用户ID查找用户
    const user = users.find(u => u.id === payload.userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // 返回用户数据
    return NextResponse.json({
      id: parseInt(user.id),
      username: user.username,
      name: user.name,
      avatar: user.avatar,
      email: user.email,
      role: user.role,
      permissions: user.permissions
    });
    
  } catch (error) {
    console.error('获取用户信息失败:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 