import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    // 读取agents.json文件
    const dataPath = path.join(process.cwd(), 'data');
    const agentsPath = path.join(dataPath, 'agents.json');

    // 如果文件不存在，创建一个空的agents数组
    if (!fs.existsSync(dataPath)) {
      fs.mkdirSync(dataPath, { recursive: true });
    }

    if (!fs.existsSync(agentsPath)) {
      fs.writeFileSync(agentsPath, JSON.stringify([], null, 2));
      return NextResponse.json({ agents: [] });
    }

    // 读取代理数据
    const agentsData = JSON.parse(fs.readFileSync(agentsPath, 'utf8'));

    // 读取transactions.json文件以计算收入
    const transactionsPath = path.join(dataPath, 'transactions.json');
    let transactions = [];
    if (fs.existsSync(transactionsPath)) {
      transactions = JSON.parse(fs.readFileSync(transactionsPath, 'utf8'));
    }

    // 计算每个代理的总收入和用户数量
    const agentsWithStats = agentsData.map((agent: any) => {
      const agentTransactions = transactions.filter((t: any) => 
        t.status === 'completed' && t.agent === agent.username
      );

      const totalIncome = agentTransactions.reduce((sum: number, t: any) => 
        sum + (parseFloat(t.commission) || 0), 0
      );

      const uniqueUsers = new Set(
        agentTransactions.map((t: any) => t.userId)
      ).size;

      return {
        ...agent,
        totalIncome,
        userCount: uniqueUsers
      };
    });

    return NextResponse.json({ agents: agentsWithStats });
  } catch (error) {
    console.error('Error in GET /api/admin/agents:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 