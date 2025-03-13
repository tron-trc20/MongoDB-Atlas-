import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { Transaction } from '@/app/models/agent';

// 模拟数据库操作
let transactions: Transaction[] = [];

export async function POST(request: Request) {
  const headersList = headers();
  const agentId = headersList.get('x-agent-id');
  const agentLevel = Number(headersList.get('x-agent-level'));

  if (!agentId || !agentLevel) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const { transactionId, verified, remarks } = await request.json();

    // 查找交易
    const transaction = transactions.find(t => t.id === transactionId);
    if (!transaction) {
      return new NextResponse('Transaction not found', { status: 404 });
    }

    // 检查权限
    // 只有交易所属的代理或1级代理可以验证
    if (agentLevel !== 1 && transaction.referralAgentId !== agentId) {
      return new NextResponse('Permission denied', { status: 403 });
    }

    // 更新交易状态
    transaction.verificationStatus = {
      customerView: 'not_found',  // 对客户端始终显示未找到
      adminView: verified ? 'verified' : 'rejected',
      verifiedBy: agentId,
      verifiedAt: new Date(),
      remarks: remarks || ''
    };

    // 更新交易状态
    if (verified) {
      transaction.status = 'completed';
      transaction.completedAt = new Date();
    } else {
      transaction.status = 'failed';
    }

    return NextResponse.json({
      success: true,
      transaction
    });
  } catch (error) {
    console.error('Error verifying transaction:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// 获取交易验证状态
export async function GET(request: Request) {
  const headersList = headers();
  const agentId = headersList.get('x-agent-id');
  const agentLevel = Number(headersList.get('x-agent-level'));

  if (!agentId) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const transactionId = searchParams.get('id');

  if (!transactionId) {
    return new NextResponse('Transaction ID is required', { status: 400 });
  }

  try {
    const transaction = transactions.find(t => t.id === transactionId);
    if (!transaction) {
      return new NextResponse('Transaction not found', { status: 404 });
    }

    // 根据请求者身份返回不同的状态
    if (agentLevel >= 1) {
      // 代理和管理员可以看到完整信息
      return NextResponse.json(transaction);
    } else {
      // 普通用户只能看到customerView状态
      return NextResponse.json({
        id: transaction.id,
        status: transaction.verificationStatus.customerView,
        amount: transaction.amount
      });
    }
  } catch (error) {
    console.error('Error getting transaction status:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 