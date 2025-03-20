'use client';

import { Suspense, ReactNode } from 'react';

interface SuspenseBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

// 用于包装使用useSearchParams的组件
export default function SuspenseBoundary({ 
  children, 
  fallback = <div className="p-4 text-center">页面加载中...</div> 
}: SuspenseBoundaryProps) {
  return <Suspense fallback={fallback}>{children}</Suspense>;
} 