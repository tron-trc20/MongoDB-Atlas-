import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function PATCH(
  request: Request,
  { params }: { params: { username: string } }
) {
  try {
    const { username } = params;
    const { commissionRate } = await request.json();
    const adminToken = request.headers.get('Authorization')?.split(' ')[1];

    if (!adminToken) {
      return NextResponse.json(
        { error: '未授权访问' },
        { status: 401 }
      );
    }

    // 验证佣金率
    if (typeof commissionRate !== 'number' || commissionRate < 0 || commissionRate > 100) {
      return NextResponse.json(
        { error: '无效的佣金率，必须在0-100之间' },
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

    // 如果是系统代理，不允许修改佣金率
    if (targetAgent.source === 'system') {
      return NextResponse.json(
        { error: '系统代理的佣金率不可修改' },
        { status: 403 }
      );
    }

    // 更新佣金率（agents.json中存储为百分比形式）
    const agentIndex = agents.findIndex((a: any) => a.username === username);
    agents[agentIndex].commissionRate = commissionRate;

    // 更新代理的配置文件（config.json中存储为小数形式）
    const agentConfigPath = path.join(process.cwd(), 'app/agents', username, 'config.json');
    if (fs.existsSync(agentConfigPath)) {
      const agentConfig = JSON.parse(fs.readFileSync(agentConfigPath, 'utf8'));
      agentConfig.commissionRate = commissionRate / 100; // 转换为小数形式（0.5表示50%）
      fs.writeFileSync(agentConfigPath, JSON.stringify(agentConfig, null, 2));
      
      console.log('Updated agent config:', {
        username,
        commissionRate: commissionRate,
        configCommissionRate: agentConfig.commissionRate
      });
    }

    // 写回agents.json文件
    fs.writeFileSync(agentsPath, JSON.stringify(agents, null, 2));

    return NextResponse.json({ 
      success: true,
      message: '佣金率更新成功',
      data: {
        commissionRate: commissionRate,
        displayCommissionRate: commissionRate // 前端显示用
      }
    });
  } catch (error) {
    console.error('Error in PATCH /api/admin/agents/[username]/commission:', error);
    return NextResponse.json(
      { error: '更新佣金率失败' },
      { status: 500 }
    );
  }
} 