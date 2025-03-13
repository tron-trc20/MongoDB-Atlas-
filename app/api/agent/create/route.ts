import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import crypto from 'crypto';
import { Agent } from '@/app/models/agent';

declare global {
  var agents: Agent[];
}

// 初始化全局变量
if (!global.agents) {
  global.agents = [];
}

export async function POST(request: Request) {
  try {
    const headersList = headers();
    const parentAgentId = headersList.get('x-agent-id');
    const parentAgentLevel = parseInt(headersList.get('x-agent-level') || '0');

    if (!parentAgentId) {
      return NextResponse.json(
        { success: false, message: '未授权访问' },
        { status: 401 }
      );
    }

    const { username, password, level } = await request.json();

    // 验证必填字段
    if (!username || !password || !level) {
      return NextResponse.json(
        { success: false, message: '用户名、密码和等级不能为空' },
        { status: 400 }
      );
    }

    // 验证用户名是否已存在
    if (global.agents.some(a => a.username === username)) {
      return NextResponse.json(
        { success: false, message: '用户名已存在' },
        { status: 400 }
      );
    }

    // 验证创建权限
    const parentAgent = global.agents.find(a => a.id === parentAgentId);
    if (!parentAgent) {
      return NextResponse.json(
        { success: false, message: '父级代理不存在' },
        { status: 404 }
      );
    }

    // 验证等级限制
    if (parentAgent.level === 1 && level <= 1) {
      return NextResponse.json(
        { success: false, message: '一级代理只能创建2-4级代理' },
        { status: 400 }
      );
    }

    // 生成唯一ID和邀请码
    const id = crypto.randomBytes(16).toString('hex');
    const inviteCode = crypto.randomBytes(6).toString('hex').toUpperCase();

    // 创建新代理
    const newAgent: Agent = {
      id,
      username,
      password: crypto.createHash('sha256').update(password).digest('hex'),
      level,
      inviteCode,
      parentId: parentAgentId,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // 如果是1级代理，继承父级代理的配置
    if (level === 1) {
      newAgent.siteConfig = {
        address: '',
        qrcode: '',
        customerService: {
          url: '',
          id: ''
        }
      };
    }

    // 保存新代理
    global.agents.push(newAgent);

    // 返回新代理信息（不包含密码）
    const { password: _, ...agentInfo } = newAgent;
    return NextResponse.json({
      success: true,
      data: agentInfo
    });
  } catch (error) {
    console.error('Error in POST /api/agent/create:', error);
    return NextResponse.json(
      { success: false, message: '服务器错误' },
      { status: 500 }
    );
  }
} 