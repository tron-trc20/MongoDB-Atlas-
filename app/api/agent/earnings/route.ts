import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

// 定义收益率
const COMMISSION_RATES = {
  1: 0.5, // 1级代理 50%
  2: 0.3, // 2级代理 30%
  3: 0.2, // 3级代理 20%
  4: 0.1  // 4级代理 10%
};

export async function GET(request: Request) {
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

    // 返回默认数据
    const defaultData = {
      earnings: 0,
      transactionCount: 0,
      rate: 0.1 // 10%的默认分成比例
    };

    return NextResponse.json({
      success: true,
      data: defaultData
    });
  } catch (error) {
    console.error('Error in GET /api/agent/earnings:', error);
    return NextResponse.json(
      { success: false, message: '获取收益失败' },
      { status: 500 }
    );
  }
} 