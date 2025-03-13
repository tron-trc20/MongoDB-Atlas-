import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// 默认佣金率
const DEFAULT_COMMISSION_RATES = {
  2: 50, // 50%
  3: 20, // 20%
  4: 10  // 10%
};

export async function POST(request: Request) {
  try {
    const { username, password, level } = await request.json();

    // 验证必填字段
    if (!username || !password || !level) {
      return NextResponse.json(
        { error: '缺少必要参数' },
        { status: 400 }
      );
    }

    // 验证代理等级
    if (level < 2 || level > 4) {
      return NextResponse.json(
        { error: '无效的代理等级' },
        { status: 400 }
      );
    }

    // 读取agents.json文件
    const dataPath = path.join(process.cwd(), 'data');
    const agentsPath = path.join(dataPath, 'agents.json');

    // 如果目录不存在，创建目录
    if (!fs.existsSync(dataPath)) {
      fs.mkdirSync(dataPath, { recursive: true });
    }

    // 如果文件不存在，创建空数组
    if (!fs.existsSync(agentsPath)) {
      fs.writeFileSync(agentsPath, '[]');
    }

    // 读取现有代理数据
    const agentsData = JSON.parse(fs.readFileSync(agentsPath, 'utf8'));

    // 检查用户名是否已存在
    if (agentsData.some((agent: any) => agent.username === username)) {
      return NextResponse.json(
        { error: '用户名已存在' },
        { status: 400 }
      );
    }

    // 获取默认佣金率
    const commissionRate = DEFAULT_COMMISSION_RATES[level as keyof typeof DEFAULT_COMMISSION_RATES] || 0;

    // 创建新代理
    const newAgent = {
      id: Date.now().toString(),
      username,
      password,
      level,
      status: 'active',
      createdAt: new Date().toISOString(),
      source: 'admin',
      commissionRate
    };

    // 添加到数组
    agentsData.push(newAgent);

    // 写回文件
    fs.writeFileSync(agentsPath, JSON.stringify(agentsData, null, 2));

    // 创建代理配置文件
    const agentDir = path.join(process.cwd(), 'app/agents', username);
    if (!fs.existsSync(agentDir)) {
      fs.mkdirSync(agentDir, { recursive: true });
    }

    const configPath = path.join(agentDir, 'config.json');
    const configData = {
      username,
      level,
      status: 'active',
      commissionRate: commissionRate / 100, // 存储为小数形式
      createdAt: new Date().toISOString()
    };

    fs.writeFileSync(configPath, JSON.stringify(configData, null, 2));

    return NextResponse.json({ 
      success: true,
      message: '代理创建成功',
      data: newAgent
    });
  } catch (error) {
    console.error('Error in POST /api/admin/agents/create:', error);
    return NextResponse.json(
      { error: '创建代理失败' },
      { status: 500 }
    );
  }
} 