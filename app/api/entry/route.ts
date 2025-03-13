import { NextResponse } from 'next/server';
import CryptoJS from 'crypto-js';

const VALID_ORIGINS = ['http://localhost:3000', 'https://your-domain.com'];

export async function POST(request: Request) {
  try {
    // 验证请求来源
    const origin = request.headers.get('origin');
    if (!VALID_ORIGINS.includes(origin || '')) {
      return NextResponse.json({ error: 'Invalid origin' }, { status: 403 });
    }

    // 使用与 verifyAdminPath 相同的逻辑生成路径
    const timestamp = Math.floor(Date.now() / 60000);
    const address = 'TNE7mTdTQmYgy8ZgsxUkYeYVH6BnjKFzAU';
    const combined = `${timestamp}${address}`;
    const path = CryptoJS.MD5(combined).toString();
    
    // 生成一次性token
    const token = CryptoJS.AES.encrypt(
      JSON.stringify({ timestamp, path }),
      '8a1f876c2e4d'
    ).toString();

    return NextResponse.json({ 
      path,
      token
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
} 