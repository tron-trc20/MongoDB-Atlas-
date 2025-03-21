import { NextResponse } from 'next/server';
import { verifyToken } from '@/app/utils/auth';
import connectDb from '@/utils/connectDb';

// 导入Agent模型
const Agent = require('@/models/Agent');

// 确保API路由动态运行
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
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

    // 连接数据库
    await connectDb();

    // 获取所有代理
    const agents = await Agent.getAllAgents();
    
    console.log('获取代理列表:', agents.length);

    return NextResponse.json({
      success: true,
      data: agents
    }, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error) {
    console.error('获取代理列表失败:', error);
    return NextResponse.json(
      { success: false, message: '获取代理列表失败' },
      { status: 500 }
    );
  }
} 