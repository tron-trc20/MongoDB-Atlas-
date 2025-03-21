import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import fs from 'fs/promises';
import path from 'path';

// 确保API路由动态运行
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// 默认配置
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
    
    // 根据页面类型选择配置文件路径
    let configPath;
    if (isUSDT) {
      configPath = path.join(process.cwd(), 'app/agents', username, 'usdt', 'config.json');
    } else if (isRedPacket) {
      configPath = path.join(process.cwd(), 'app/agents', username, 'redpacket', 'config.json');
    } else {
      configPath = path.join(process.cwd(), 'app/agents', username, 'config.json');
    }

    console.log('读取配置文件:', configPath);
    const configData = await fs.readFile(configPath, 'utf-8');
    const config = JSON.parse(configData);

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

    // 保存配置到文件
    const configPath = path.join(process.cwd(), 'app/agents', username, 'config.json');
    await fs.writeFile(configPath, JSON.stringify(configData, null, 2), 'utf-8');

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