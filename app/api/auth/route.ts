import { NextResponse } from 'next/server';
import CryptoJS from 'crypto-js';

const HASH_SALT = '9c4e2f8a1d7b';
const TIME_WINDOW = 300000; // 5分钟
const MASTER_KEY = 'your_very_long_and_secure_master_key_2024';

export async function POST(request: Request) {
  try {
    const { password, timestamp } = await request.json();
    
    if (!password || !timestamp) {
      return NextResponse.json({ success: false }, { status: 400 });
    }

    // 验证时间戳是否在有效范围内（防止重放攻击）
    const now = Date.now();
    if (Math.abs(now - timestamp) > TIME_WINDOW) {
      return NextResponse.json({ success: false }, { status: 400 });
    }

    // 生成验证令牌
    const combined = `${password}${HASH_SALT}${Math.floor(timestamp / TIME_WINDOW)}`;
    const hash = CryptoJS.SHA256(combined).toString();
    const token = CryptoJS.AES.encrypt(hash, MASTER_KEY).toString();

    return NextResponse.json({ success: true, token });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
} 