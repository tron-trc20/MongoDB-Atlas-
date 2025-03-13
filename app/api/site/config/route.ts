import { NextResponse } from 'next/server';

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
    return NextResponse.json({
      success: true,
      data: mainSiteConfig
    });
  } catch (error) {
    console.error('Error in GET /api/site/config:', error);
    return NextResponse.json(
      { success: false, message: '获取主站点配置失败' },
      { status: 500 }
    );
  }
} 