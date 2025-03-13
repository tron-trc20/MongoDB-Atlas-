import { NextResponse } from 'next/server';
import { sign } from 'jsonwebtoken';

// 管理员账号信息
const ADMIN_CREDENTIALS = {
  username: 'panzertuzki',
  password: 'Aa563214aa.'  // 直接使用明文密码进行测试
};

// JWT密钥
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    console.log('Received login attempt:', { username, password });

    // 直接比较用户名和密码
    if (username === ADMIN_CREDENTIALS.username && 
        password === ADMIN_CREDENTIALS.password) {
      
      // 生成JWT token
      const token = sign(
        { username, role: 'admin' },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      console.log('Login successful');

      return NextResponse.json({
        success: true,
        data: {
          token,
          admin: {
            username,
            role: 'admin'
          }
        }
      });
    }

    console.log('Login failed: invalid credentials');
    return NextResponse.json({
      success: false,
      message: '用户名或密码错误'
    }, { status: 401 });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({
      success: false,
      message: '登录失败，请重试'
    }, { status: 500 });
  }
} 