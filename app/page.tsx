'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // 将根目录访问重定向到支付宝页面
    router.replace('/zfb');
  }, [router]);

  return null; // 不渲染任何内容，因为会立即重定向
} 