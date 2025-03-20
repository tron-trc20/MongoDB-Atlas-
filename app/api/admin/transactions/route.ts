import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// 定义Agent接口
interface Agent {
  id: string;
  username: string;
  [key: string]: any;
}

// 定义Transaction接口
interface Transaction {
  agentId: string;
  commission?: number;
  parentCommission?: number;
  [key: string]: any;
}

export async function GET(request: Request) {
  try {
    const dataPath = path.join(process.cwd(), 'data');
    
    // 确保data目录存在
    if (!fs.existsSync(dataPath)) {
      fs.mkdirSync(dataPath, { recursive: true });
    }

    // 读取交易数据
    const transactionsPath = path.join(dataPath, 'transactions.json');
    
    // 如果transactions.json不存在，创建空文件
    if (!fs.existsSync(transactionsPath)) {
      fs.writeFileSync(transactionsPath, JSON.stringify([], null, 2));
      return NextResponse.json({
        success: true,
        data: []
      });
    }

    const transactions: Transaction[] = JSON.parse(fs.readFileSync(transactionsPath, 'utf-8'));

    // 读取代理数据以获取代理信息
    const agentsPath = path.join(dataPath, 'agents.json');
    let agents: Agent[] = [];
    
    if (fs.existsSync(agentsPath)) {
      agents = JSON.parse(fs.readFileSync(agentsPath, 'utf-8'));
    }

    // 添加代理和用户名称到交易记录
    const transactionsWithDetails = transactions.map((transaction: Transaction) => {
      const agent = agents.find((a: Agent) => a.id === transaction.agentId);
      return {
        ...transaction,
        agentUsername: agent ? agent.username : '未知代理',
        commission: transaction.commission || 0,
        parentCommission: transaction.parentCommission || 0
      };
    });

    return NextResponse.json({
      success: true,
      data: transactionsWithDetails
    });

  } catch (error: any) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json({
      success: false,
      message: error.message || '获取交易记录失败'
    }, { status: 500 });
  }
} 