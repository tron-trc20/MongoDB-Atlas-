'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface Config {
  customerService: {
    qq: string;
    wechat: string;
    url: string;
    id: string;
  };
  usdtRate: number;
  usdtMinAmount: number;
  usdtMaxAmount: number;
  redpacketMinAmount: number;
  redpacketMaxAmount: number;
  cashbackRate: number;
  address: string;
  qrcode: string;
}

export default function AgentHome() {
  const router = useRouter();
  const [config, setConfig] = useState<Config | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const init = async () => {
      try {
        // 从URL路径中获取代理用户名
        const pathParts = window.location.pathname.split('/');
        const username = pathParts[2]; // agents/{username}

        if (!username) {
          throw new Error('无效的代理链接');
        }

        // 获取代理配置
        const res = await fetch(`/api/agents/${username}/config`);
        if (!res.ok) {
          throw new Error('获取配置失败');
        }

        const data = await res.json();
        if (!data.success) {
          throw new Error(data.message || '获取配置失败');
        }

        setConfig(data.data);
      } catch (err: any) {
        console.error('Error:', err);
        setError(err.message || '加载失败');
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  // 从URL路径中获取代理用户名
  const pathParts = typeof window !== 'undefined' ? window.location.pathname.split('/') : [];
  const username = pathParts[2]; // agents/{username}

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!config || !username) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:p-6">
            <h1 className="text-2xl font-bold text-center mb-8">代理支付系统</h1>
            
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {/* USDT代购入口 */}
              <div 
                onClick={() => router.push(`/agents/${username}/usdt`)}
                className="bg-blue-50 p-6 rounded-lg shadow cursor-pointer hover:shadow-md transition-shadow"
              >
                <h2 className="text-xl font-semibold text-blue-600 mb-2">USDT代购</h2>
                <p className="text-gray-600">当前汇率：{config.usdtRate}</p>
                <p className="text-gray-600">最小金额：{config.usdtMinAmount}</p>
                <p className="text-gray-600">最大金额：{config.usdtMaxAmount}</p>
                <p className="text-blue-500 mt-4">点击进入 →</p>
              </div>

              {/* 支付宝红包入口 */}
              <div 
                onClick={() => router.push(`/agents/${username}/redpacket`)}
                className="bg-red-50 p-6 rounded-lg shadow cursor-pointer hover:shadow-md transition-shadow"
              >
                <h2 className="text-xl font-semibold text-red-600 mb-2">支付宝红包</h2>
                <p className="text-gray-600">最小金额：{config.redpacketMinAmount}</p>
                <p className="text-gray-600">最大金额：{config.redpacketMaxAmount}</p>
                <p className="text-gray-600">返现比例：{(config.cashbackRate * 100).toFixed(1)}%</p>
                <p className="text-red-500 mt-4">点击进入 →</p>
              </div>
            </div>

            {/* 客服信息 */}
            <div className="mt-8 border-t pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">联系客服</h3>
              <div className="space-y-2">
                <p className="text-gray-600">QQ：{config.customerService.qq}</p>
                <p className="text-gray-600">微信：{config.customerService.wechat}</p>
                {config.customerService.url && (
                  <a 
                    href={config.customerService.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800"
                  >
                    点击联系在线客服
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 