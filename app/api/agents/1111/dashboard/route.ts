import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    // 这里添加获取代理信息的逻辑
    return NextResponse.json({
      success: true,
      data: {
        // 示例数据
        earnings: 0,
        transactionCount: 0,
        rate: 0
      }
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: '获取数据失败' },
      { status: 500 }
    );
  }
} 