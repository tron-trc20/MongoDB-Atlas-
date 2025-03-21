import { NextResponse } from 'next/server';
import connectDb from '@/utils/connectDb';

// 导入SiteConfig模型
const SiteConfig = require('@/models/SiteConfig');

// 添加动态配置，确保API路由不被静态生成
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    // 连接数据库
    await connectDb();
    
    // 从数据库获取配置
    const config = await SiteConfig.getConfig();
    
    // 转换为前端需要的格式
    const responseData = {
      customerService: config.customerService,
      usdtRate: config.usdtRate,
      payment: config.payment
    };

    console.log('返回站点配置:', JSON.stringify(responseData));

    return NextResponse.json(
      { success: true, data: responseData },
      {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
          'Content-Type': 'application/json',
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