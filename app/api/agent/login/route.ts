import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { generateToken } from '@/app/utils/auth';
import connectDb from '@/utils/connectDb';

// 导入Agent模型
const Agent = require('@/models/Agent');

// 确保API路由动态运行
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    // 验证必填字段
    if (!username || !password) {
      return NextResponse.json({ 
        success: false, 
        message: '用户名和密码不能为空' 
      }, { status: 400 });
    }

    // 连接数据库
    await connectDb();

    // 查找代理
    const agent = await Agent.findAgentByUsername(username);
    if (!agent) {
      return NextResponse.json({ 
        success: false, 
        message: '用户名或密码错误' 
      }, { status: 401 });
    }

    // 检查代理状态
    if (agent.status !== 'active') {
      return NextResponse.json({ 
        success: false, 
        message: '账号已被禁用' 
      }, { status: 403 });
    }

    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, agent.password);
    if (!isPasswordValid) {
      return NextResponse.json({ 
        success: false, 
        message: '用户名或密码错误' 
      }, { status: 401 });
    }

    // 更新登录时间
    await Agent.updateAgent(agent.id, { 
      lastLogin: new Date() 
    });

    // 生成令牌
    const token = generateToken({
      id: agent.id,
      username: agent.username,
      level: agent.level,
      role: agent.username === 'admin' ? 'admin' : 'agent'
    });

    // 返回代理信息（不包含密码）
    const { password: _, ...agentData } = agent.toObject();
    
    console.log('登录成功', username);

    return NextResponse.json({
      success: true,
      message: '登录成功',
      data: {
        token,
        agent: agentData
      }
    });
  } catch (error) {
    console.error('登录失败:', error);
    return NextResponse.json(
      { success: false, message: '服务器错误' },
      { status: 500 }
    );
  }
} 