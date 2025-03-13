import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
  try {
    const { transactionId, confirmed } = await request.json();

    // 读取交易数据
    const dataPath = path.join(process.cwd(), 'data');
    const transactionsPath = path.join(dataPath, 'transactions.json');
    
    if (!fs.existsSync(transactionsPath)) {
      return NextResponse.json({
        success: false,
        message: '交易不存在'
      }, { status: 404 });
    }

    const transactions = JSON.parse(fs.readFileSync(transactionsPath, 'utf-8'));
    
    // 查找要确认的交易
    const transactionIndex = transactions.findIndex((t: any) => t.id === transactionId);
    
    if (transactionIndex === -1) {
      return NextResponse.json({
        success: false,
        message: '交易不存在'
      }, { status: 404 });
    }

    const transaction = transactions[transactionIndex];

    // 只有USDT交易可以确认
    if (transaction.type !== 'usdt') {
      return NextResponse.json({
        success: false,
        message: '只能确认USDT交易'
      }, { status: 400 });
    }

    // 更新交易状态
    transaction.status = confirmed ? 'completed' : 'failed';
    transaction.confirmedAt = new Date().toISOString();
    transactions[transactionIndex] = transaction;

    // 如果确认到账，计算并分配佣金
    if (confirmed) {
      // 读取代理数据
      const agentsPath = path.join(dataPath, 'agents.json');
      const agents = JSON.parse(fs.readFileSync(agentsPath, 'utf-8'));
      
      // 获取交易相关的代理
      const agent = agents.find((a: any) => a.id === transaction.agentId);
      if (agent) {
        // 计算佣金
        const commission = transaction.amount * agent.commissionRate;
        transaction.commission = commission;

        // 如果是二级及以上代理，还需要给上级代理分配佣金
        if (agent.level > 1) {
          const parentAgent = agents.find((a: any) => a.id === agent.parentId);
          if (parentAgent) {
            const parentCommission = transaction.amount * (parentAgent.commissionRate - agent.commissionRate);
            transaction.parentCommission = parentCommission;
          }
        }
      }
    }

    // 保存更新后的交易数据
    fs.writeFileSync(transactionsPath, JSON.stringify(transactions, null, 2));

    return NextResponse.json({
      success: true,
      data: transaction
    });

  } catch (error: any) {
    console.error('Error confirming transaction:', error);
    return NextResponse.json({
      success: false,
      message: error.message || '确认交易失败'
    }, { status: 500 });
  }
} 