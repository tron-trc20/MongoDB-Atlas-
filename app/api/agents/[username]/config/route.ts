import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import connectDb from '@/utils/connectDb';
import Config from '@/models-proper/Config';

// 确保API路由动态运行
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(
  request: Request,
  { params }: { params: { username: string } }
) {
  try {
    const { username } = params;
    
    // 从URL中获取配置类型
    const url = new URL(request.url);
    const isUSDT = url.pathname.includes('/usdt/config');
    const isRedPacket = url.pathname.includes('/redpacket/config');
    
    // 确定配置类型
    const type = isUSDT ? 'usdt' : isRedPacket ? 'redpacket' : 'default';

    // 连接数据库
    await connectDb();

    // 获取配置
    const config = await Config.getConfig(username, type);
    
    if (!config) {
      // 如果配置不存在，返回默认配置
      const defaultConfig = {
        customerService: {
          url: 'https://t.me/Juyy2',
          id: '@juyy2'
        },
        usdtRate: 7.2,
        payment: {
          usdt: {
            address: '',
            rate: 7.2
          }
        }
      };

      // 保存默认配置
      await Config.updateConfig(username, type, defaultConfig);
      
      return NextResponse.json({ 
        success: true, 
        data: defaultConfig 
      });
    }

    return NextResponse.json({ 
      success: true, 
      data: config 
    });
  } catch (error) {
    console.error('获取配置失败:', error);
    return NextResponse.json(
      { success: false, message: '获取配置失败' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { username: string } }
) {
  try {
    const { username } = params;
    const headersList = headers();
    const agentId = headersList.get('x-agent-id');
    const agentLevel = parseInt(headersList.get('x-agent-level') || '0');

    if (!agentId) {
      return NextResponse.json(
        { success: false, message: '未授权访问' },
        { status: 401 }
      );
    }

    // 只允许一级代理修改配置
    if (agentLevel !== 1) {
      return NextResponse.json(
        { success: false, message: '只有一级代理可以修改配置' },
        { status: 403 }
      );
    }

    const body = await request.json();
    if (!body.address || !body.customerService?.url || !body.customerService?.id || !body.paymentSystem) {
      return NextResponse.json(
        { success: false, message: '配置信息不完整' },
        { status: 400 }
      );
    }

    // 连接数据库
    await connectDb();

    // 准备配置数据
    const configData = {
      address: body.address,
      qrcode: body.qrcode || '',
      customerService: {
        url: body.customerService.url,
        id: body.customerService.id
      },
      paymentSystem: {
        apiEndpoint: body.paymentSystem.apiEndpoint,
        merchantId: body.paymentSystem.merchantId,
        secretKey: body.paymentSystem.secretKey,
        notifyUrl: body.paymentSystem.notifyUrl
      }
    };

    // 更新配置
    await Config.updateConfig(username, 'default', configData);

    return NextResponse.json({
      success: true,
      message: '配置更新成功'
    });
  } catch (error) {
    console.error('更新配置失败:', error);
    return NextResponse.json(
      { success: false, message: '更新配置失败' },
      { status: 500 }
    );
  }
} 