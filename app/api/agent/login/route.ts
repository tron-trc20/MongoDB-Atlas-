import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(request: Request) {
  try {
    const { username, password, agentUsername } = await request.json();

    // 验证必填字段
    if (!username || !password || !agentUsername) {
      return NextResponse.json({
        success: false,
        message: '用户名和密码不能为空'
      }, { status: 400 });
    }

    // 读取代理数据
    const dataPath = path.join(process.cwd(), 'data');
    const agentsPath = path.join(dataPath, 'agents.json');
    
    if (!fs.existsSync(agentsPath)) {
      return NextResponse.json({
        success: false,
        message: '用户名或密码错误'
      }, { status: 401 });
    }

    const agents = JSON.parse(fs.readFileSync(agentsPath, 'utf-8'));
    
    // 查找代理
    const agent = agents.find((a: any) => 
      a.username === username && 
      a.password === password && 
      a.username === agentUsername
    );

    if (!agent) {
      return NextResponse.json({
        success: false,
        message: '用户名或密码错误'
      }, { status: 401 });
    }

    if (agent.status !== 'active') {
      return NextResponse.json({
        success: false,
        message: '账号已被禁用'
      }, { status: 403 });
    }

    // 生成JWT令牌
    const token = jwt.sign(
      { 
        id: agent.id,
        username: agent.username,
        level: agent.level
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // 返回不含敏感信息的代理数据
    const safeAgent = {
      id: agent.id,
      username: agent.username,
      level: agent.level,
      status: agent.status,
      createdAt: agent.createdAt,
      commissionRate: agent.commissionRate
    };

    return NextResponse.json({
      success: true,
      token,
      agent: safeAgent
    });

  } catch (error: any) {
    console.error('Error during login:', error);
    return NextResponse.json({
      success: false,
      message: error.message || '登录失败'
    }, { status: 500 });
  }
} 