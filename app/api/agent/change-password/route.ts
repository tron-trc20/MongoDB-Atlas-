import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(request: Request) {
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

    const { oldPassword, newPassword } = await request.json();

    // 验证必填字段
    if (!oldPassword || !newPassword) {
      return NextResponse.json({
        success: false,
        message: '原密码和新密码不能为空'
      }, { status: 400 });
    }

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
    const agentIndex = agents.findIndex((a: any) => 
      a.id === decoded.id && 
      a.username === decoded.username && 
      a.password === oldPassword
    );

    if (agentIndex === -1) {
      return NextResponse.json({
        success: false,
        message: '原密码错误'
      }, { status: 401 });
    }

    // 更新密码
    agents[agentIndex].password = newPassword;

    // 保存更新后的代理数据
    fs.writeFileSync(agentsPath, JSON.stringify(agents, null, 2));

    return NextResponse.json({
      success: true,
      message: '密码修改成功'
    });

  } catch (error: any) {
    console.error('Error changing password:', error);
    return NextResponse.json({
      success: false,
      message: error.message || '修改密码失败'
    }, { status: 500 });
  }
} 