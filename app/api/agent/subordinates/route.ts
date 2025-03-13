import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { Agent } from '@/app/models/agent';

declare global {
  var agents: Agent[];
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

    // 过滤出下级代理
    const currentAgent = agents.find(a => a.username === agentUsername);
    if (!currentAgent) {
      return NextResponse.json({ success: false, message: '代理不存在' });
    }

    const subordinates = agents.filter(agent => {
      return agent.level > currentAgent.level;
    });

    return NextResponse.json({ success: true, data: subordinates });
  } catch (error) {
    console.error('获取下级代理失败:', error);
    return NextResponse.json({ success: false, message: '获取下级代理失败' });
  }
} 