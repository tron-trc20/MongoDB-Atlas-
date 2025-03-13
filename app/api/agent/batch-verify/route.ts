import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { Transaction } from '@/app/models/agent';

declare global {
  var transactions: Transaction[];
}

// 模拟WebSocket通知（实际项目中应该使用真实的WebSocket服务）
const notifyTransaction = (transaction: Transaction) => {
  console.log('Transaction notification:', {
    id: transaction.id,
    status: transaction.status,
    amount: transaction.amount,
    verifiedBy: transaction.verificationStatus.verifiedBy
  });
};

export async function POST(request: Request) {
  const headersList = headers();
  const agentId = headersList.get('x-agent-id');
  const agentLevel = Number(headersList.get('x-agent-level'));

  // 只有管理员和1级代理可以验证交易
  if (!agentId || (agentLevel !== 1 && agentLevel !== 0)) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const { transactionIds, verified, remarks } = await request.json();

    if (!Array.isArray(transactionIds) || transactionIds.length === 0) {
      return new NextResponse('Invalid transaction IDs', { status: 400 });
    }

    const results = [];
    const errors = [];

    // 批量处理交易
    for (const transactionId of transactionIds) {
      const transaction = global.transactions.find(t => t.id === transactionId);
      
      if (!transaction) {
        errors.push({ id: transactionId, error: 'Transaction not found' });
        continue;
      }

      // 检查权限
      if (agentLevel !== 0 && transaction.referralAgentId !== agentId) {
        errors.push({ id: transactionId, error: 'Permission denied' });
        continue;
      }

      // 更新交易状态
      transaction.verificationStatus = {
        customerView: 'not_found',  // 对客户端始终显示未找到
        adminView: verified ? 'verified' : 'rejected',
        verifiedBy: agentId,
        verifiedAt: new Date(),
        remarks: remarks || ''
      };

      if (verified) {
        transaction.status = 'completed';
        transaction.completedAt = new Date();
      } else {
        transaction.status = 'failed';
      }

      // 发送通知
      notifyTransaction(transaction);

      results.push({
        id: transactionId,
        status: 'success',
        transaction
      });
    }

    return NextResponse.json({
      success: true,
      results,
      errors
    });
  } catch (error) {
    console.error('Error batch verifying transactions:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 