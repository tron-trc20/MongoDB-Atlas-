import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import jwt from 'jsonwebtoken';

// 定义Transaction接口
interface Transaction {
  id: string;
  agentId: string;
  amount: number;
  status: 'pending' | 'completed' | 'rejected';
  createdAt: Date | string;
  completedAt?: Date | string;
  [key: string]: any;
}

declare global {
  var agentTransactions: Transaction[];
}

// 初始化全局变量
if (!global.agentTransactions) {
  global.agentTransactions = [];
}

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// 获取代理的交易列表
export async function GET(request: Request) {
  try {
    // 验证token
    const token = request.headers.get('Authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({
        success: false,
        message: '未登录'
      }, { status: 401 });
    }

    // 解析token
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; username: string };

    // 读取交易数据
    const dataPath = path.join(process.cwd(), 'data');
    const transactionsPath = path.join(dataPath, 'transactions.json');
    
    if (!fs.existsSync(transactionsPath)) {
      return NextResponse.json({
        success: true,
        data: []
      });
    }

    const transactions: Transaction[] = JSON.parse(fs.readFileSync(transactionsPath, 'utf-8'));
    
    // 过滤出当前代理的交易记录
    const agentTransactions = transactions.filter((t: Transaction) => 
      t.agentId === decoded.id
    );

    return NextResponse.json({
      success: true,
      data: agentTransactions
    });

  } catch (error: any) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json({
      success: false,
      message: error.message || '获取交易记录失败'
    }, { status: 500 });
  }
}

// 创建新交易
export async function POST(request: Request) {
  try {
    const headersList = headers();
    const agentId = headersList.get('x-agent-id');

    if (!agentId) {
      return NextResponse.json(
        { success: false, message: '未授权访问' },
        { status: 401 }
      );
    }

    const { amount } = await request.json();

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { success: false, message: '无效的金额' },
        { status: 400 }
      );
    }

    // 创建新交易
    const transaction: Transaction = {
      id: crypto.randomBytes(16).toString('hex'),
      agentId,
      amount,
      status: 'pending',
      createdAt: new Date()
    };

    global.agentTransactions.push(transaction);

    return NextResponse.json({
      success: true,
      data: transaction
    });
  } catch (error) {
    console.error('Error in POST /api/agent/transactions:', error);
    return NextResponse.json(
      { success: false, message: '服务器错误' },
      { status: 500 }
    );
  }
} 