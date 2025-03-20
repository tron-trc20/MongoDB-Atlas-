import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { Transaction } from '@/app/models/agent';

declare global {
  var transactions: Transaction[];
}

// 初始化全局变量
if (!global.transactions) {
  global.transactions = [];
}

// 验证代理是否有权限确认交易
function canVerifyTransactions(agentLevel: number) {
  return agentLevel === 0 || agentLevel === 1; // 只有主站点和1级代理可以确认
}

export async function POST(request: Request) {
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

    if (!canVerifyTransactions(agentLevel)) {
      return NextResponse.json(
        { success: false, message: '无权确认交易' },
        { status: 403 }
      );
    }

    const body = await request.json();
    // 这里添加验证交易的逻辑
    return NextResponse.json({
      success: true,
      data: {
        ...body,
        confirmedAt: new Date(),
      }
    });
  } catch (error) {
    console.error('Error in POST /api/agent/transactions/verify:', error);
    return NextResponse.json(
      { success: false, message: '验证交易失败' },
      { status: 500 }
    );
  }
} 