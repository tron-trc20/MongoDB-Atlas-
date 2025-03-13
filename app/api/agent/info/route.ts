import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function GET(request: Request) {
  try {
    // 验证token
    const token = request.headers.get('Authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({
        success: false,
        message: '未登录'
      }, { status: 401 });
    }

    // 解析token
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; username: string };

    // 读取代理数据
    const dataPath = path.join(process.cwd(), 'data');
    const agentsPath = path.join(dataPath, 'agents.json');
    
    if (!fs.existsSync(agentsPath)) {
      return NextResponse.json({
        success: false,
        message: '代理不存在'
      }, { status: 404 });
    }

    const agents = JSON.parse(fs.readFileSync(agentsPath, 'utf-8'));
    
    // 查找代理
    const agent = agents.find((a: any) => 
      a.id === decoded.id && 
      a.username === decoded.username
    );

    if (!agent) {
      return NextResponse.json({
        success: false,
        message: '代理不存在'
      }, { status: 404 });
    }

    // 移除敏感信息
    const { password, ...safeAgent } = agent;

    return NextResponse.json({
      success: true,
      data: safeAgent
    });

  } catch (error: any) {
    console.error('Error fetching agent info:', error);
    return NextResponse.json({
      success: false,
      message: error.message || '获取代理信息失败'
    }, { status: 500 });
  }
} 