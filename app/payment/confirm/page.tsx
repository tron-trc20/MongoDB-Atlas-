'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Loading from '../../components/Loading';

export default function PaymentConfirm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<'waiting' | 'success' | 'failed'>('waiting');

  const orderId = searchParams.get('orderId');

  useEffect(() => {
    if (!orderId) {
      router.push('/');
      return;
    }

    const checkPaymentStatus = async () => {
      try {
        const res = await fetch(`/api/payment/status?orderId=${orderId}`);
        if (!res.ok) {
          throw new Error('获取支付状态失败');
        }

        const data = await res.json();
        if (!data.success) {
          throw new Error(data.message || '获取支付状态失败');
        }

        if (data.data.status === 'success') {
          setStatus('success');
          // 支付成功后3秒跳转到红包页面
          setTimeout(() => {
            router.push(`/redpacket?orderId=${orderId}`);
          }, 3000);
        } else if (data.data.status === 'failed') {
          setStatus('failed');
        }
      } catch (err: any) {
        console.error('检查支付状态失败:', err);
        setError(err.message || '检查支付状态失败');
      } finally {
        setLoading(false);
      }
    };

    // 首次检查
    checkPaymentStatus();

    // 每5秒检查一次支付状态
    const interval = setInterval(checkPaymentStatus, 5000);

    return () => clearInterval(interval);
  }, [orderId, router]);

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg">
          <p className="text-red-500">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            返回首页
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        {status === 'waiting' && (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">等待支付确认</h2>
            <p className="text-gray-600">
              请耐心等待，系统正在确认您的支付...
            </p>
          </div>
        )}

        {status === 'success' && (
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">支付成功</h2>
            <p className="text-gray-600">
              正在跳转到红包页面...
            </p>
          </div>
        )}

        {status === 'failed' && (
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">支付失败</h2>
            <p className="text-gray-600 mb-4">
              很抱歉，您的支付未能成功处理
            </p>
            <button
              onClick={() => router.push('/')}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              返回首页
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 