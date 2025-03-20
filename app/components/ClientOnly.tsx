'use client';

import { useEffect, useState, ReactNode, Suspense } from 'react';

// 一个简单的加载组件
const Loading = () => (
  <div className="flex items-center justify-center p-4">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
  </div>
);

interface ClientOnlyProps {
  children: ReactNode;
  fallback?: ReactNode;
}

// 这个组件确保其子组件只在客户端渲染
export default function ClientOnly({ children, fallback = <Loading /> }: ClientOnlyProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <>{fallback}</>;
  }

  return <Suspense fallback={fallback}>{children}</Suspense>;
} 