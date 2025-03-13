import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { Agent } from '@/app/models/agent';

declare global {
  var agents: Agent[];
}

export async function DELETE(request: Request) {
  try {
    const headersList = headers();
    const agentId = headersList.get('x-agent-id');
    const agentLevel = parseInt(headersList.get('x-agent-level') || '0');

    if (!agentId) {
      return NextResponse.json(
        { success: false, message: '未授权访问' },
        { status: 401 }
      );
    }

    // 获取要删除的代理ID
    const body = await request.json();
    const { agentId: targetAgentId } = body;

    if (!targetAgentId) {
      return NextResponse.json(
        { success: false, message: '缺少目标代理ID' },
        { status: 400 }
      );
    }

    // 查找要删除的代理
    const targetAgent = global.agents.find(a => a.id === targetAgentId);
    if (!targetAgent) {
      return NextResponse.json(
        { success: false, message: '目标代理不存在' },
        { status: 404 }
      );
    }

    // 检查权限
    // 1. 只有0级和1级代理可以删除下级
    // 2. 只能删除自己的直接下级或间接下级
    if (agentLevel > 1) {
      return NextResponse.json(
        { success: false, message: '无权限执行此操作' },
        { status: 403 }
      );
    }

    // 检查是否是自己的下级
    let isSubordinate = false;
    let currentAgent = targetAgent;
    while (currentAgent.parentId) {
      if (currentAgent.parentId === agentId) {
        isSubordinate = true;
        break;
      }
      currentAgent = global.agents.find(a => a.id === currentAgent.parentId)!;
      if (!currentAgent) break;
    }

    if (!isSubordinate && agentLevel !== 0) {
      return NextResponse.json(
        { success: false, message: '只能删除自己的下级代理' },
        { status: 403 }
      );
    }

    // 删除代理及其所有下级
    const agentsToDelete = new Set<string>();
    
    // 递归查找所有下级
    const findSubordinates = (id: string) => {
      agentsToDelete.add(id);
      const subs = global.agents.filter(a => a.parentId === id);
      subs.forEach(sub => findSubordinates(sub.id));
    };

    findSubordinates(targetAgentId);

    // 从全局代理列表中移除
    global.agents = global.agents.filter(a => !agentsToDelete.has(a.id));

    return NextResponse.json({
      success: true,
      message: '代理删除成功'
    });
  } catch (error) {
    console.error('Error in DELETE /api/agent/delete:', error);
    return NextResponse.json(
      { success: false, message: '服务器错误' },
      { status: 500 }
    );
  }
} 