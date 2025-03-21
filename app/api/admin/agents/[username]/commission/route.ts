import { NextResponse } from 'next/server';
import { verifyToken } from '@/app/utils/auth';
import connectDb from '@/utils/connectDb';

// 导入Agent模型
const Agent = require('@/models/Agent');

// 确保API路由动态运行
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function PATCH(
  request: Request,
  { params }: { params: { username: string } }
) {
  try {
    // 验证管理员权限
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ success: false, message: '未授权' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    if (!decoded || decoded.username !== 'admin') {
      return NextResponse.json({ success: false, message: '需要管理员权限' }, { status: 403 });
    }

    const { username } = params;
    const { commissionRate } = await request.json();

    // 验证佣金率
    if (typeof commissionRate !== 'number' || commissionRate < 0 || commissionRate > 100) {
      return NextResponse.json(
        { success: false, message: '无效的佣金率，必须在0-100之间' },
        { status: 400 }
      );
    }

    // 连接数据库
    await connectDb();

    // 查找目标代理
    const agent = await Agent.findAgentByUsername(username);
    if (!agent) {
      return NextResponse.json(
        { success: false, message: '代理不存在' },
        { status: 404 }
      );
    }

    // 如果是系统代理，不允许修改佣金率
    if (agent.source === 'system') {
      return NextResponse.json(
        { success: false, message: '系统代理的佣金率不可修改' },
        { status: 403 }
      );
    }

    // 更新佣金率（存储为小数形式）
    console.log('更新代理佣金率:', username, commissionRate);
    const updatedAgent = await Agent.updateAgent(agent.id, {
      commissionRate: commissionRate / 100
    });
    console.log('佣金率已更新:', updatedAgent.id);

    return NextResponse.json({ 
      success: true,
      message: '佣金率更新成功',
      data: {
        commissionRate: commissionRate,
        displayCommissionRate: commissionRate // 前端显示用
      }
    });
  } catch (error) {
    console.error('更新佣金率失败:', error);
    return NextResponse.json(
      { success: false, message: '更新佣金率失败' },
      { status: 500 }
    );
  }
} 