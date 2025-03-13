import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { Agent } from '@/app/models/agent';
import fs from 'fs/promises';
import path from 'path';

declare global {
  var agents: Agent[];
}

// 初始化全局变量
if (!global.agents) {
  global.agents = [];
}

// 获取代理的收款配置
async function getAgentConfig(agentId: string) {
  // 查找代理
  const agent = global.agents.find(a => a.id === agentId);
  if (!agent) return null;

  // 如果是1级代理，返回自己的配置
  if (agent.level === 1) {
    return agent.siteConfig;
  }

  // 查找上级代理
  if (agent.parentId) {
    const parentAgent = global.agents.find(a => a.id === agent.parentId);
    if (parentAgent?.level === 1) {
      // 如果上级是1级代理，使用上级的配置
      return parentAgent.siteConfig;
    }
  }

  // 其他情况（主站点直接开设的2/3/4级代理）返回null，表示使用主站点配置
  return null;
}

export async function GET(request: Request) {
  try {
    // 从URL中获取代理用户名和页面类型
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const username = pathParts[3]; // /api/agents/1111/agents/{username}/config
    
    // 检查是否是特定页面的配置请求
    const isUSDT = url.pathname.includes('/usdt/config');
    const isRedPacket = url.pathname.includes('/redpacket/config');

    if (!username) {
      return new NextResponse(
        JSON.stringify({ success: false, message: '无效的代理用户名' }),
        { status: 400 }
      );
    }

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

    return new NextResponse(
      JSON.stringify({ success: true, data: config }),
      { status: 200 }
    );
  } catch (err: any) {
    console.error('获取代理配置失败:', err);
    return new NextResponse(
      JSON.stringify({ 
        success: false, 
        message: `获取代理配置失败: ${err.message}` 
      }),
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
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

    const agent = global.agents.find(a => a.id === agentId);
    if (!agent) {
      return NextResponse.json(
        { success: false, message: '代理不存在' },
        { status: 404 }
      );
    }

    const body = await request.json();
    if (!body.address || !body.customerService?.url || !body.customerService?.id || !body.paymentSystem) {
      return NextResponse.json(
        { success: false, message: '配置信息不完整' },
        { status: 400 }
      );
    }

    // 更新代理的配置（包括支付系统配置）
    agent.siteConfig = {
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

    return NextResponse.json({
      success: true,
      message: '配置更新成功'
    });
  } catch (error) {
    console.error('Error in PUT /api/agents/1111/agent/config:', error);
    return NextResponse.json(
      { success: false, message: '服务器错误' },
      { status: 500 }
    );
  }
} 