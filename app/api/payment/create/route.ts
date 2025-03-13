import { NextRequest, NextResponse } from 'next/server';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, amount, redPacketAmount, account, type } = body;

    // 验证必要参数
    if (!orderId || !amount || !redPacketAmount || !account || !type) {
      return NextResponse.json({
        success: false,
        message: '缺少必要参数'
      });
    }

    // 创建新订单
    const newOrder = {
      orderId,
      amount,
      redPacketAmount,
      account,
      type,
      status: 'waiting',
      createdAt: new Date().toISOString()
    };

    // 读取现有订单数据
    const ordersPath = join(process.cwd(), 'data', 'orders.json');
    let ordersData = [];
    try {
      ordersData = JSON.parse(readFileSync(ordersPath, 'utf-8'));
    } catch (error) {
      // 如果文件不存在或为空，使用空数组
      ordersData = [];
    }

    // 添加新订单
    ordersData.push(newOrder);

    // 保存更新后的订单数据
    writeFileSync(ordersPath, JSON.stringify(ordersData, null, 2));

    return NextResponse.json({
      success: true,
      data: newOrder
    });
  } catch (error: any) {
    console.error('创建支付订单失败:', error);
    return NextResponse.json({
      success: false,
      message: error.message || '创建支付订单失败'
    });
  }
} 