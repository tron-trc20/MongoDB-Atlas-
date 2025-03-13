import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function PATCH(
  request: Request,
  { params }: { params: { username: string } }
) {
  try {
    const { username } = params;
    const { status } = await request.json();
    const adminToken = request.headers.get('Authorization')?.split(' ')[1];

    if (!adminToken) {
      return NextResponse.json(
        { error: '未授权访问' },
        { status: 401 }
      );
    }

    // 验证状态值
    if (status !== 'active' && status !== 'disabled') {
      return NextResponse.json(
        { error: '无效的状态值' },
        { status: 400 }
      );
    }

    // 读取agents.json文件
    const dataPath = path.join(process.cwd(), 'data');
    const agentsPath = path.join(dataPath, 'agents.json');

    if (!fs.existsSync(agentsPath)) {
      return NextResponse.json(
        { error: '代理数据不存在' },
        { status: 404 }
      );
    }

    const agents = JSON.parse(fs.readFileSync(agentsPath, 'utf8'));
    
    // 查找目标代理
    const targetAgent = agents.find((a: any) => a.username === username);
    if (!targetAgent) {
      return NextResponse.json(
        { error: '代理不存在' },
        { status: 404 }
      );
    }

    // 如果是系统代理，不允许修改状态
    if (targetAgent.source === 'system') {
      return NextResponse.json(
        { error: '系统代理的状态不可修改' },
        { status: 403 }
      );
    }

    // 更新状态
    const agentIndex = agents.findIndex((a: any) => a.username === username);
    agents[agentIndex].status = status;

    // 更新代理的配置文件
    const agentConfigPath = path.join(process.cwd(), 'app/agents', username, 'config.json');
    if (fs.existsSync(agentConfigPath)) {
      const agentConfig = JSON.parse(fs.readFileSync(agentConfigPath, 'utf8'));
      agentConfig.status = status;
      fs.writeFileSync(agentConfigPath, JSON.stringify(agentConfig, null, 2));
    }

    // 写回agents.json文件
    fs.writeFileSync(agentsPath, JSON.stringify(agents, null, 2));

    return NextResponse.json({ 
      success: true,
      message: '代理状态更新成功'
    });
  } catch (error) {
    console.error('Error in PATCH /api/admin/agents/[username]/status:', error);
    return NextResponse.json(
      { error: '更新代理状态失败' },
      { status: 500 }
    );
  }
} 