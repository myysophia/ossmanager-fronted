import { NextResponse } from 'next/server';

// 模拟用户数据
const users = [
  {
    id: '1',
    username: 'admin',
    password: 'admin123',
    name: '管理员',
    avatar: '',
    email: 'admin@example.com',
    role: 'admin',
  },
  {
    id: '2',
    username: 'user',
    password: 'user123',
    name: '普通用户',
    avatar: '',
    email: 'user@example.com',
    role: 'user',
  },
];

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password } = body;
    
    // 查找用户
    const user = users.find(u => 
      u.username === username && u.password === password
    );
    
    if (!user) {
      return NextResponse.json(
        { message: '用户名或密码错误' },
        { status: 401 }
      );
    }
    
    // 模拟生成令牌
    const token = `mock_token_${user.id}_${Date.now()}`;
    const refreshToken = `mock_refresh_${user.id}_${Date.now()}`;
    
    // 返回用户数据（不包含密码）
    const { password: _, ...userWithoutPassword } = user;
    
    return NextResponse.json({
      token,
      refreshToken,
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error('登录失败:', error);
    return NextResponse.json(
      { message: '登录处理失败' },
      { status: 500 }
    );
  }
} 