import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { sign } from 'jsonwebtoken';

const AGENTS_DATA_FILE = path.join(process.cwd(), 'data', 'agents.json');
const JWT_SECRET = process.env.JWT_SECRET || 'agent-secret-key';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    // 读取代理数据
    const data = await fs.readFile(AGENTS_DATA_FILE, 'utf8');
    const agents = JSON.parse(data);

    // 查找代理
    const agent = agents.find((a: any) => 
      a.username === username && 
      a.password === password && 
      a.status === 'active'
    );

    if (agent) {
      // 生成JWT token
      const token = sign(
        { 
          id: agent.id,
          username: agent.username,
          level: agent.level,
          role: 'agent'
        },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      return NextResponse.json({
        success: true,
        data: {
          token,
          agent: {
            id: agent.id,
            username: agent.username,
            level: agent.level
          }
        }
      });
    }

    return NextResponse.json({
      success: false,
      message: '用户名或密码错误'
    }, { status: 401 });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({
      success: false,
      message: '登录失败，请重试'
    }, { status: 500 });
  }
} 