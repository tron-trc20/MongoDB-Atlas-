import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/app/utils/auth';
import { nanoid } from 'nanoid';
import bcrypt from 'bcryptjs';
import connectDb from '@/utils/connectDb';

// 导入Agent模型
const Agent = require('@/models/Agent');

// 确保API路由动态运行
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request: NextRequest) {
  try {
    // 验证身份
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ success: false, message: '未授权访问' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token) as { id: string } | null;
    if (!decoded) {
      return NextResponse.json({ success: false, message: '无效的令牌' }, { status: 401 });
    }

    // 获取当前代理ID
    const currentAgentId = decoded.id;

    // 获取请求数据
    const { username, password, level, commissionRate, parentAgentId = currentAgentId } = await request.json();

    // 连接数据库
    await connectDb();

    // 验证用户名是否存在
    const existingAgent = await Agent.findAgentByUsername(username);
    if (existingAgent) {
      return NextResponse.json({ success: false, message: '用户名已存在' }, { status: 400 });
    }

    // 获取当前代理信息（创建者）
    const currentAgent = await Agent.findAgentById(currentAgentId);
    if (!currentAgent) {
      return NextResponse.json({ success: false, message: '当前代理不存在' }, { status: 404 });
    }

    // 获取父级代理信息
    const parentAgent = await Agent.findAgentById(parentAgentId);
    if (!parentAgent) {
      return NextResponse.json({ success: false, message: '父级代理不存在' }, { status: 404 });
    }

    // 检查当前代理是否有权限创建指定级别的代理
    if (currentAgent.level >= level) {
      return NextResponse.json({ success: false, message: '无权创建此级别的代理' }, { status: 403 });
    }

    // 检查佣金设置是否合法
    if (level === 2 && (commissionRate < 0 || commissionRate > 100)) {
      return NextResponse.json({ success: false, message: '佣金比例必须在0-100之间' }, { status: 400 });
    }

    // 检查代理等级是否合法
    if (level < 2 || level > 4) {
      return NextResponse.json({ success: false, message: '代理等级必须在2-4之间' }, { status: 400 });
    }

    // 生成邀请码
    const inviteCode = nanoid(8);

    // 哈希密码
    const hashedPassword = await bcrypt.hash(password, 10);

    // 创建新代理
    const newAgent = {
      id: nanoid(),
      username,
      password: hashedPassword,
      level,
      status: 'active',
      source: currentAgent.id === 'admin' ? 'admin' : 'agent',
      commissionRate,
      createdAt: new Date(),
      updatedAt: new Date(),
      inviteCode,
      parentId: parentAgentId,
      balance: 0,
      totalEarnings: 0,
      totalTransactions: 0,
      // 继承父级代理的站点配置
      siteConfig: parentAgent.siteConfig
    };

    // 保存新代理到数据库
    const createdAgent = await Agent.createAgent(newAgent);

    // 返回成功响应，不包含密码
    const { password: _, ...agentWithoutPassword } = createdAgent.toObject();
    
    return NextResponse.json({
      success: true,
      message: '代理创建成功',
      data: agentWithoutPassword
    });
  } catch (error) {
    console.error('创建代理失败:', error);
    return NextResponse.json({ success: false, message: '服务器错误' }, { status: 500 });
  }
} 