import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

// 这里使用Base64编码的二维码数据，确保与收款地址匹配
const QR_CODE_BASE64 = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...`; // 这里需要替换为实际的Base64编码数据

export async function GET(request: Request) {
  const headersList = headers();
  const referer = headersList.get('referer');
  const host = headersList.get('host');

  // 验证请求是否来自我们的支付页面
  if (!referer || !host || !referer.includes(host) || !referer.includes('/payment')) {
    return new NextResponse('Unauthorized', { status: 403 });
  }

  try {
    // 设置响应头
    const headers = new Headers();
    headers.set('Content-Type', 'text/plain');
    headers.set('Cache-Control', 'no-store, max-age=0');
    
    return new NextResponse(QR_CODE_BASE64, {
      headers,
      status: 200,
    });
  } catch (error) {
    console.error('Error serving QR code:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 