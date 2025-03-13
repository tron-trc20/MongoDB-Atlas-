import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { Agent } from '@/app/models/agent';
import * as fs from 'fs';
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
    const agentUsername = request.headers.get('X-Agent-Username');
    const pageType = request.headers.get('X-Page-Type');
    
    if (!agentUsername) {
      return NextResponse.json(
        { success: false, error: '缺少代理用户名' },
        { status: 400 }
      );
    }

    if (!pageType) {
      return NextResponse.json(
        { success: false, error: '缺少页面类型' },
        { status: 400 }
      );
    }

    // 验证代理是否存在
    const dataPath = path.join(process.cwd(), 'data');
    const agentsPath = path.join(dataPath, 'agents.json');

    if (!fs.existsSync(agentsPath)) {
      return NextResponse.json(
        { success: false, error: '代理数据不存在' },
        { status: 404 }
      );
    }

    const agents = JSON.parse(fs.readFileSync(agentsPath, 'utf8'));
    const agent = agents.find((a: any) => a.username === agentUsername);

    if (!agent) {
      return NextResponse.json(
        { success: false, error: '代理不存在' },
        { status: 404 }
      );
    }

    // 检查代理状态
    if (agent.status !== 'active') {
      return NextResponse.json(
        { success: false, error: '代理账号已被禁用' },
        { status: 403 }
      );
    }

    // 读取代理配置文件
    const configPath = path.join(process.cwd(), 'app/agents', agentUsername, 'config.json');
    
    if (!fs.existsSync(configPath)) {
      return NextResponse.json(
        { success: false, error: '代理配置不存在' },
        { status: 404 }
      );
    }

    const configData = JSON.parse(fs.readFileSync(configPath, 'utf8'));

    // 根据页面类型返回不同的配置
    const config = {
      ...configData,
      pageType,
      commissionRate: configData.commissionRate * 100 // 转换为百分比
    };

    console.log('Agent config response:', {
      username: agentUsername,
      pageType,
      commissionRate: config.commissionRate
    });

    return NextResponse.json({
      success: true,
      data: config
    });
  } catch (error) {
    console.error('Error in GET /api/agent/config:', error);
    return NextResponse.json(
      { success: false, error: '获取配置失败' },
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
    console.error('Error in PUT /api/agent/config:', error);
    return NextResponse.json(
      { success: false, message: '服务器错误' },
      { status: 500 }
    );
  }
} 