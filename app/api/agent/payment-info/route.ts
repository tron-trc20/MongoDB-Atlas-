import { NextResponse } from 'next/server';
import { Agent } from '@/app/models/agent';

declare global {
  var agents: Agent[];
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const agentId = searchParams.get('agentId');

    if (!agentId) {
      return NextResponse.json(
        { success: false, message: '代理ID不能为空' },
        { status: 400 }
      );
    }

    // 查找代理
    const agent = global.agents.find(a => a.id === agentId);
    if (!agent) {
      return NextResponse.json(
        { success: false, message: '代理不存在' },
        { status: 404 }
      );
    }

    // 获取实际的收款配置
    let paymentConfig;
    if (agent.level === 1) {
      // 1级代理使用自己的配置
      paymentConfig = agent.siteConfig;
    } else {
      // 2-4级代理查找上级1级代理的配置
      const parentAgent = global.agents.find(a => a.id === agent.parentId);
      if (parentAgent?.level === 1) {
        paymentConfig = parentAgent.siteConfig;
      } else {
        // 如果上级不是1级代理，使用系统默认配置
        // 查找配置标识为系统默认的配置
        const mainSiteConfig = global.agents.find(a => a.level === 1 && a.username === 'admin')?.siteConfig;
        paymentConfig = mainSiteConfig;
      }
    }

    if (!paymentConfig) {
      return NextResponse.json(
        { success: false, message: '未找到收款配置' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: paymentConfig
    });
  } catch (error) {
    console.error('Error in GET /api/agent/payment-info:', error);
    return NextResponse.json(
      { success: false, message: '服务器错误' },
      { status: 500 }
    );
  }
} 