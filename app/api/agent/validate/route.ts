import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: Request) {
  try {
    const agentUsername = request.headers.get('X-Agent-Username');
    
    if (!agentUsername) {
      return NextResponse.json(
        { success: false, error: '缺少代理用户名' },
        { status: 400 }
      );
    }

    // 读取agents.json文件
    const dataPath = path.join(process.cwd(), 'data');
    const agentsPath = path.join(dataPath, 'agents.json');

    if (!fs.existsSync(agentsPath)) {
      return NextResponse.json(
        { success: false, error: '代理数据不存在' },
        { status: 404 }
      );
    }

    const agents = JSON.parse(fs.readFileSync(agentsPath, 'utf8'));
    
    // 查找代理
    const agent = agents.find((a: any) => a.username === agentUsername);
    
    if (!agent) {
      return NextResponse.json(
        { success: false, error: '代理不存在' },
        { status: 404 }
      );
    }

    // 检查代理状态
    if (agent.status !== 'active') {
      return NextResponse.json(
        { success: false, error: '代理账号已被禁用' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        username: agent.username,
        level: agent.level
      }
    });
  } catch (error) {
    console.error('Error in GET /api/agent/validate:', error);
    return NextResponse.json(
      { success: false, error: '验证失败' },
      { status: 500 }
    );
  }
} 