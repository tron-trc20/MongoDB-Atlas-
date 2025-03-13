import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function DELETE(
  request: Request,
  { params }: { params: { username: string } }
) {
  try {
    const { username } = params;

    // 读取agents.json文件
    const dataPath = path.join(process.cwd(), 'data');
    const agentsPath = path.join(dataPath, 'agents.json');

    if (!fs.existsSync(agentsPath)) {
      return NextResponse.json(
        { error: 'Agents data not found' },
        { status: 404 }
      );
    }

    const agentsData = JSON.parse(fs.readFileSync(agentsPath, 'utf8'));
    const agentIndex = agentsData.findIndex(
      (agent: any) => agent.username === username
    );

    if (agentIndex === -1) {
      return NextResponse.json(
        { error: 'Agent not found' },
        { status: 404 }
      );
    }

    // 删除代理目录
    const agentDir = path.join(process.cwd(), 'app/agents', username);
    if (fs.existsSync(agentDir)) {
      fs.rmSync(agentDir, { recursive: true, force: true });
    }

    // 从数组中删除代理
    agentsData.splice(agentIndex, 1);

    // 写回文件
    fs.writeFileSync(agentsPath, JSON.stringify(agentsData, null, 2));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/admin/agents/[username]/delete:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 