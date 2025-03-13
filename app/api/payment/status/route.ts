import { NextRequest, NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';

export async function GET(request: NextRequest) {
  try {
    const orderId = request.nextUrl.searchParams.get('orderId');
    if (!orderId) {
      return NextResponse.json({
        success: false,
        message: '订单ID不能为空'
      });
    }

    // 从数据文件中读取订单状态
    const ordersPath = join(process.cwd(), 'data', 'orders.json');
    const ordersData = JSON.parse(readFileSync(ordersPath, 'utf-8'));
    
    const order = ordersData.find((order: any) => order.orderId === orderId);
    if (!order) {
      return NextResponse.json({
        success: false,
        message: '订单不存在'
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        status: order.status
      }
    });
  } catch (error: any) {
    console.error('获取支付状态失败:', error);
    return NextResponse.json({
      success: false,
      message: error.message || '获取支付状态失败'
    });
  }
} 