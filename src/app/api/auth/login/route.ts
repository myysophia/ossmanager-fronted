import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

// 从环境变量获取管理员凭据
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || '$2a$10$defaultHashForDemo'; // 这应该是bcrypt哈希
const USER_USERNAME = process.env.USER_USERNAME || 'user';
const USER_PASSWORD_HASH = process.env.USER_PASSWORD_HASH || '$2a$10$defaultHashForDemo';

// 模拟用户数据 - 生产环境应该从数据库获取
const users = [
  {
    id: '1',
    username: ADMIN_USERNAME,
    passwordHash: ADMIN_PASSWORD_HASH,
    name: '管理员',
    avatar: '',
    email: 'admin@example.com',
    role: 'admin',
    permissions: [{ resource: 'MANAGER', action: 'ALL' }]
  },
  {
    id: '2',
    username: USER_USERNAME,
    passwordHash: USER_PASSWORD_HASH,
    name: '普通用户',
    avatar: '',
    email: 'user@example.com',
    role: 'user',
    permissions: []
  },
];

// 验证密码的辅助函数
async function verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
  try {
    // 如果是默认哈希，直接比较明文（仅开发环境）
    if (hashedPassword === '$2a$10$defaultHashForDemo') {
      // 默认密码：admin123 和 user123
      const defaultPasswords: Record<string, string> = {
        [ADMIN_USERNAME]: 'admin123',
        [USER_USERNAME]: 'user123'
      };
      return plainPassword === defaultPasswords[ADMIN_USERNAME] || plainPassword === defaultPasswords[USER_USERNAME];
    }
    
    return await bcrypt.compare(plainPassword, hashedPassword);
  } catch (error) {
    console.error('密码验证失败:', error);
    return false;
  }
}

// 生成JWT token的辅助函数
function generateToken(user: any): string {
  // 这里应该使用真正的JWT库，如jsonwebtoken
  const payload = {
    userId: user.id,
    username: user.username,
    role: user.role,
    permissions: user.permissions,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24小时过期
  };
  
  // 简化的token生成 - 生产环境应该使用JWT
  return `Bearer_${Buffer.from(JSON.stringify(payload)).toString('base64')}`;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password } = body;
    
    // 输入验证
    if (!username || !password) {
      return NextResponse.json(
        { message: '用户名和密码不能为空' },
        { status: 400 }
      );
    }

    if (typeof username !== 'string' || typeof password !== 'string') {
      return NextResponse.json(
        { message: '无效的输入格式' },
        { status: 400 }
      );
    }

    // 限制尝试次数 - 简单的内存计数器（生产环境应该使用Redis等）
    const attempts = global.loginAttempts || new Map();
    const attemptCount = attempts.get(username) || 0;
    
    if (attemptCount >= 5) {
      return NextResponse.json(
        { message: '登录尝试次数过多，请稍后再试' },
        { status: 429 }
      );
    }
    
    // 查找用户
    const user = users.find(u => u.username === username);
    
    if (!user) {
      // 增加失败尝试计数
      attempts.set(username, attemptCount + 1);
      global.loginAttempts = attempts;
      
      return NextResponse.json(
        { message: '用户名或密码错误' },
        { status: 401 }
      );
    }
    
    // 验证密码
    const isValidPassword = await verifyPassword(password, user.passwordHash);
    
    if (!isValidPassword) {
      // 增加失败尝试计数
      attempts.set(username, attemptCount + 1);
      global.loginAttempts = attempts;
      
      return NextResponse.json(
        { message: '用户名或密码错误' },
        { status: 401 }
      );
    }
    
    // 登录成功，清除失败计数
    attempts.delete(username);
    global.loginAttempts = attempts;
    
    // 生成令牌
    const token = generateToken(user);
    const refreshToken = `refresh_${user.id}_${Date.now()}`;
    
    // 返回用户数据（不包含密码哈希）
    const { passwordHash: _, ...userWithoutPassword } = user;
    
    const response = NextResponse.json({
      token,
      refreshToken,
      user: userWithoutPassword,
    });
    
    // 设置HttpOnly cookie
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000, // 24小时
      path: '/'
    });
    
    return response;
  } catch (error) {
    console.error('登录处理失败:', error);
    return NextResponse.json(
      { message: '登录处理失败' },
      { status: 500 }
    );
  }
}

// 添加全局类型声明
declare global {
  var loginAttempts: Map<string, number> | undefined;
} 