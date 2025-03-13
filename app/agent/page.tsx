'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AgentHome() {
  const router = useRouter();

  useEffect(() => {
    try {
      const token = localStorage.getItem('token');
      const agent = localStorage.getItem('agent');
      
      if (token && agent) {
        router.replace('/agent/dashboard');
      } else {
        router.replace('/agent/login');
      }
    } catch (error) {
      console.error('Error in agent home:', error);
      router.replace('/agent/login');
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="text-xl text-gray-600">加载中...</div>
      </div>
    </div>
  );
} 