import { NextResponse } from 'next/server';
import { createAgent } from '@/app/utils/createAgent';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // 验证必要的字段
    if (!body.id || !body.name || !body.domain || !body.customerService || !body.payment) {
      return NextResponse.json(
        { success: false, message: '缺少必要的配置信息' },
        { status: 400 }
      );
    }

    // 创建新的一级代理
    const result = await createAgent(body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: '创建代理失败' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '创建代理成功',
      data: {
        id: body.id,
        name: body.name,
        domain: body.domain
      }
    });
  } catch (error) {
    console.error('Error in POST /api/agents/create:', error);
    return NextResponse.json(
      { success: false, message: '服务器错误' },
      { status: 500 }
    );
  }
} 