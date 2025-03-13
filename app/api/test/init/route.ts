import { NextResponse } from 'next/server';
import { Agent, Transaction } from '@/app/models/agent';
import crypto from 'crypto';

// 声明为全局变量，方便其他API访问
declare global {
  var agents: Agent[];
  var transactions: Transaction[];
}

// 初始化全局变量
if (!global.agents) {
  global.agents = [];
}
if (!global.transactions) {
  global.transactions = [];
}

export async function POST() {
  try {
    // 清空现有数据
    global.agents = [];
    global.transactions = [];

    // 创建管理员
    const admin: Agent = {
      id: 'admin',
      username: 'admin',
      password: crypto.createHash('sha256').update('admin123').digest('hex'),
      level: 1,
      parentId: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // 创建一级代理
    const agent1: Agent = {
      id: 'agent1',
      username: 'agent1',
      password: crypto.createHash('sha256').update('123456').digest('hex'),
      level: 1,
      parentId: null,
      siteConfig: {
        address: 'TRx1234567890',
        qrcode: 'base64...', // 实际使用时需要真实的二维码数据
        customerService: {
          url: 'https://t.me/agent1',
          id: '@agent1'
        }
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // 创建测试交易
    const createTestTransaction = (id: string, amount: number, referralAgentId: string): Transaction => ({
      id,
      amount,
      agentId: referralAgentId,
      referralAgentId,
      status: 'pending',
      verificationStatus: {
        customerView: 'not_found',
        adminView: 'pending',
      },
      createdAt: new Date(),
      txHash: `0x${crypto.randomBytes(32).toString('hex')}`,
      senderAddress: `0x${crypto.randomBytes(20).toString('hex')}`
    });

    // 创建10笔测试交易
    const testTransactions: Transaction[] = Array.from({ length: 10 }, (_, i) => 
      createTestTransaction(
        `tx${i + 1}`,
        Math.random() * 1000 + 100, // 100-1100 USDT
        i < 5 ? 'admin' : 'agent1' // 前5笔属于管理员，后5笔属于代理
      )
    );

    // 保存测试数据
    global.agents.push(admin, agent1);
    global.transactions.push(...testTransactions);

    return NextResponse.json({
      success: true,
      data: {
        agents: global.agents.map(({ password, ...agent }) => agent), // 不返回密码
        transactions: global.transactions
      }
    });
  } catch (error) {
    console.error('Error initializing test data:', error);
    return NextResponse.json({ success: false, error: 'Failed to initialize test data' }, { status: 500 });
  }
} 