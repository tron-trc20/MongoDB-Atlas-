import { NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';

// 主站点配置
const mainSiteConfig = {
  address: '主站点收款地址',
  qrcode: '主站点二维码',
  customerService: {
    url: 'https://t.me/Juyy2',
    id: 'juyy2'
  }
};

export async function GET() {
  try {
    const configPath = join(process.cwd(), 'config.json');
    const config = JSON.parse(readFileSync(configPath, 'utf8'));

    return NextResponse.json(
      { success: true, data: config },
      {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      }
    );
  } catch (error) {
    console.error('获取配置失败:', error);
    return NextResponse.json(
      { success: false, message: '获取配置失败' },
      { status: 500 }
    );
  }
} 