'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export default function RedPacketRedirect() {
  const searchParams = useSearchParams();
  const agent = searchParams.get('agent');

  useEffect(() => {
    // 重定向到主站的红包页面
    window.location.href = `/zfb${agent ? `?agent=${agent}` : ''}`;
  }, [agent]);

  return null;
} 