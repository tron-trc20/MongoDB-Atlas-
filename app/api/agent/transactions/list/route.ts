import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { Agent } from '@/app/models/agent';

// 定义Transaction接口
interface Transaction {
  agentId: string;
  [key: string]: any;
}

// 获取所有下级代理ID
function getAllSubAgentIds(agents: Agent[], currentAgent: Agent): string[] {
  const subAgentIds = agents
    .filter(agent => agent.level > currentAgent.level)
    .map(agent => agent.username);
  return subAgentIds;
}

export async function GET(request: NextRequest) {
  try {
    const agentUsername = request.headers.get('X-Agent-Username');
    if (!agentUsername) {
      return NextResponse.json({ success: false, message: '未提供代理用户名' });
    }

    // 读取所有代理配置
    const agentsDir = path.join(process.cwd(), 'app/agents');
    const agents: Agent[] = [];
    
    if (fs.existsSync(agentsDir)) {
      const files = fs.readdirSync(agentsDir);
      for (const file of files) {
        const configPath = path.join(agentsDir, file, 'config.json');
        if (fs.existsSync(configPath)) {
          const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
          agents.push(config);
        }
      }
    }

    // 获取当前代理
    const currentAgent = agents.find(a => a.username === agentUsername);
    if (!currentAgent) {
      return NextResponse.json({ success: false, message: '代理不存在' });
    }

    // 获取所有下级代理ID
    const subAgentIds = getAllSubAgentIds(agents, currentAgent);

    // 读取交易记录
    const transactionsPath = path.join(process.cwd(), 'data/transactions.json');
    let transactions: Transaction[] = [];
    if (fs.existsSync(transactionsPath)) {
      transactions = JSON.parse(fs.readFileSync(transactionsPath, 'utf-8'));
    }

    // 过滤出相关交易
    const relevantTransactions = transactions.filter((tx: Transaction) => {
      return tx.agentId === agentUsername || subAgentIds.includes(tx.agentId);
    });

    return NextResponse.json({ success: true, data: relevantTransactions });
  } catch (error) {
    console.error('获取交易列表失败:', error);
    return NextResponse.json({ success: false, message: '获取交易列表失败' });
  }
} 