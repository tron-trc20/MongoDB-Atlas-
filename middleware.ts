import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // 如果访问 /agent，重定向到登录页
  if (path === '/agent') {
    return NextResponse.redirect(new URL('/agent/login', request.url));
  }

  return NextResponse.next();
}

// 配置中间件匹配的路由
export const config = {
  matcher: ['/agent']
}; 