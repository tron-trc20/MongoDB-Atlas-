import { NextResponse } from 'next/server';
import { PAYMENT_CONFIG } from '../../../config/payment';

// 主站点支付系统配置
const mainSitePaymentConfig = {
  paymentSystem: {
    apiEndpoint: 'https://api.mainsite.com/payment',  // 主站点支付系统API地址
    merchantId: 'MAIN_MERCHANT_ID',                   // 主站点商户ID
    secretKey: 'MAIN_SECRET_KEY',                     // 主站点密钥
    notifyUrl: 'https://mainsite.com/api/payment/notify'  // 主站点回调地址
  }
};

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      data: PAYMENT_CONFIG
    });
  } catch (error: any) {
    console.error('获取支付配置失败:', error);
    return NextResponse.json({
      success: false,
      message: error.message || '获取支付配置失败'
    });
  }
} 