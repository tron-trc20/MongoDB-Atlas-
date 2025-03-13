import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
  try {
    const { transactionId, status, remarks } = await request.json();
    const adminToken = request.headers.get('Authorization')?.split(' ')[1];

    if (!adminToken) {
      return NextResponse.json(
        { error: '未授权访问' },
        { status: 401 }
      );
    }

    if (!transactionId || !status) {
      return NextResponse.json(
        { error: '缺少必要参数' },
        { status: 400 }
      );
    }

    // 读取交易记录
    const dataPath = path.join(process.cwd(), 'data');
    const transactionsPath = path.join(dataPath, 'transactions.json');

    if (!fs.existsSync(transactionsPath)) {
      return NextResponse.json(
        { error: '交易记录不存在' },
        { status: 404 }
      );
    }

    const transactions = JSON.parse(fs.readFileSync(transactionsPath, 'utf8'));
    const transactionIndex = transactions.findIndex((t: any) => t.id === transactionId);

    if (transactionIndex === -1) {
      return NextResponse.json(
        { error: '交易不存在' },
        { status: 404 }
      );
    }

    // 更新交易状态
    transactions[transactionIndex] = {
      ...transactions[transactionIndex],
      status,
      remarks,
      confirmedAt: new Date().toISOString(),
      confirmedBy: 'admin'
    };

    // 写回文件
    fs.writeFileSync(transactionsPath, JSON.stringify(transactions, null, 2));

    return NextResponse.json({
      success: true,
      message: '交易状态已更新',
      data: transactions[transactionIndex]
    });
  } catch (error) {
    console.error('Error in POST /api/admin/transactions/verify:', error);
    return NextResponse.json(
      { error: '更新交易状态失败' },
      { status: 500 }
    );
  }
} 