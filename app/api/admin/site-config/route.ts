import { NextResponse } from 'next/server';
import connectDb from '@/utils/connectDb';
import { verifyToken } from '@/app/utils/auth';

// 导入SiteConfig模型
const SiteConfig = require('@/models/SiteConfig');

// 添加动态配置，确保API路由不被静态生成
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request: Request) {
  try {
    // 验证管理员权限
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ success: false, message: '未授权' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const isValid = verifyToken(token);
    if (!isValid) {
      return NextResponse.json({ success: false, message: '未授权' }, { status: 401 });
    }

    // 获取请求数据
    const data = await request.json();
    const { customerService, usdtRate } = data;

    console.log('接收到更新配置请求:', JSON.stringify(data));

    // 验证数据
    if (!customerService || !customerService.url || !customerService.id || !usdtRate) {
      return NextResponse.json({ success: false, message: '参数不完整' }, { status: 400 });
    }

    // 连接数据库
    await connectDb();

    // 更新配置
    const updatedConfig = await SiteConfig.updateConfig({
      customerService,
      usdtRate,
      payment: {
        usdt: {
          rate: usdtRate
        }
      }
    });

    console.log('配置已更新:', JSON.stringify(updatedConfig));

    return NextResponse.json({ 
      success: true, 
      message: '配置更新成功',
      data: { customerService, usdtRate }
    }, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error) {
    console.error('更新站点配置失败:', error);
    return NextResponse.json(
      { success: false, message: '更新站点配置失败' },
      { status: 500 }
    );
  }
} 