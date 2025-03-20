import { NextResponse } from 'next/server';
import { Transaction } from '@/app/models/agent';

declare global {
  var transactions: Transaction[];
}

// 初始化全局变量
if (!global.transactions) {
  global.transactions = [];
}

export async function POST(request: Request) {
  try {
    const { amount, usdtAmount, agentId, orderNumber } = await request.json();

    // 验证必填字段
    if (!amount || !usdtAmount || !orderNumber) {
      return NextResponse.json(
        { success: false, message: '缺少必要参数' },
        { status: 400 }
      );
    }

    // 查找代理信息
    const agent = global.agents.find(a => a.id === agentId);
    if (!agent) {
      return NextResponse.json(
        { success: false, message: '代理不存在' },
        { status: 404 }
      );
    }

    // 确定实际收款代理（如果是2-4级代理，使用其上级1级代理或主站点的收款信息）
    let receivingAgentId = agentId;
    if (agent.level > 1) {
      const parentAgent = global.agents.find(a => a.id === agent.parentId);
      if (parentAgent?.level === 1) {
        receivingAgentId = parentAgent.id;
      } else {
        // 如果上级不是1级代理，使用主站点
        const mainSite = global.agents.find(a => a.level === 1 && a.id === 'admin');
        receivingAgentId = mainSite?.id || agentId;
      }
    }

    // 创建交易记录
    const transaction: Transaction = {
      id: orderNumber,
      amount: usdtAmount,
      agentId: receivingAgentId, // 实际收款代理
      referralAgentId: agentId, // 推荐代理
      status: 'pending',
      verificationStatus: {
        customerView: 'pending',
        adminView: 'pending'
      },
      createdAt: new Date()
    };

    // 保存交易记录
    global.transactions.push(transaction);

    return NextResponse.json({
      success: true,
      data: transaction
    });
  } catch (error) {
    console.error('Error in POST /api/transactions/create:', error);
    return NextResponse.json(
      { success: false, message: '服务器错误' },
      { status: 500 }
    );
  }
} 