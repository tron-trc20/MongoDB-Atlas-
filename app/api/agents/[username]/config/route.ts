import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import connectDb from '@/utils/connectDb';
import Config from '@/models-proper/Config';
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

// 从文件系统读取配置
async function readConfigFromFile(username: string, type: string) {
  try {
    let configPath;
    if (type === 'usdt') {
      configPath = path.join(process.cwd(), 'app/agents', username, 'usdt', 'config.json');
    } else if (type === 'redpacket') {
      configPath = path.join(process.cwd(), 'app/agents', username, 'redpacket', 'config.json');
    } else {
      configPath = path.join(process.cwd(), 'app/agents', username, 'config.json');
    }

    console.log('尝试从文件系统读取配置:', configPath);
    const configData = await fs.readFile(configPath, 'utf-8');
    return JSON.parse(configData);
  } catch (error) {
    console.log('从文件系统读取配置失败:', error);
    return null;
  }
}

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

    let config = null;

    try {
      // 尝试从数据库读取配置
      await connectDb();
      config = await Config.getConfig(username, type);
    } catch (dbError) {
      console.error('从数据库读取配置失败:', dbError);
      
      // 如果数据库读取失败，尝试从文件系统读取
      config = await readConfigFromFile(username, type);
    }

    // 如果配置不存在，使用默认配置
    if (!config) {
      console.log('使用默认配置');
      config = defaultConfig;

      // 尝试将默认配置保存到数据库
      try {
        await Config.updateConfig(username, type, defaultConfig);
      } catch (saveError) {
        console.error('保存默认配置到数据库失败:', saveError);
      }
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

    try {
      // 尝试保存到数据库
      await connectDb();
      await Config.updateConfig(username, 'default', configData);
    } catch (dbError) {
      console.error('保存配置到数据库失败:', dbError);
      
      // 如果数据库保存失败，尝试保存到文件系统
      try {
        const configPath = path.join(process.cwd(), 'app/agents', username, 'config.json');
        await fs.writeFile(configPath, JSON.stringify(configData, null, 2), 'utf-8');
      } catch (fileError) {
        console.error('保存配置到文件系统失败:', fileError);
        throw new Error('无法保存配置');
      }
    }

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