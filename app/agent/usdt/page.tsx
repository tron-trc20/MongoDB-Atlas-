'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Loading from '@/app/components/Loading';

interface SiteConfig {
  customerService: {
    url: string;
    id: string;
  };
  usdtRate: number;
  usdtMinAmount: number;
  usdtMaxAmount: number;
  address: string;
  qrcode: string;
}

export default function USDTPage() {
  const router = useRouter();
  const [amount, setAmount] = useState('');
  const [account, setAccount] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [config, setConfig] = useState<SiteConfig | null>(null);

  const handleSubmit = () => {
    if (!amount || Number(amount) <= 0) {
      alert('请输入有效的USDT数量');
      return;
    }
    
    if (!account?.trim()) {
      alert('请输入QQ号/邮箱/Telegram');
      return;
    }
    
    const rmbAmount = Number(amount) * (config?.usdtRate || 7.2);
    const orderId = `${Date.now()}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
    
    router.push(`/payment?amount=${rmbAmount}&account=${account}&usdtAmount=${amount}&type=usdt&orderId=${orderId}`);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        // 从URL参数中获取代理用户名
        const searchParams = new URLSearchParams(window.location.search);
        const username = searchParams.get('agent');
        
        if (!username) {
          throw new Error('无效的代理链接');
        }

        // 验证代理是否存在
        const validateRes = await fetch('/api/agent/validate', {
          headers: {
            'X-Agent-Username': username
          }
        });

        if (!validateRes.ok) {
          throw new Error('无效的代理账号');
        }

        const validateData = await validateRes.json();
        if (!validateData.success) {
          throw new Error(validateData.error || '无效的代理账号');
        }
        
        // 获取代理配置
        const res = await fetch(`/api/agent/config`, {
          headers: {
            'X-Agent-Username': username,
            'X-Page-Type': 'usdt'
          }
        });

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
        // 如果是无效的代理账号，重定向到首页
        if (err.message === '无效的代理账号' || err.message === '无效的代理链接') {
          window.location.href = '/';
        }
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  if (loading) {
    return <Loading />;
  }

  if (error || !config) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg">
          <p className="text-red-500">{error || '配置加载失败'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <style jsx>{`
            @keyframes rainbow {
              0% { color: #ff0000; }
              17% { color: #ff8000; }
              33% { color: #ffff00; }
              50% { color: #00ff00; }
              67% { color: #0080ff; }
              83% { color: #8000ff; }
              100% { color: #ff0000; }
            }
            @keyframes glow {
              0%, 100% { text-shadow: 0 0 20px rgba(255, 0, 0, 0.5); }
              17% { text-shadow: 0 0 20px rgba(255, 128, 0, 0.5); }
              33% { text-shadow: 0 0 20px rgba(255, 255, 0, 0.5); }
              50% { text-shadow: 0 0 20px rgba(0, 255, 0, 0.5); }
              67% { text-shadow: 0 0 20px rgba(0, 128, 255, 0.5); }
              83% { text-shadow: 0 0 20px rgba(128, 0, 255, 0.5); }
            }
            .rainbow-text {
              animation: rainbow 5s linear infinite, glow 5s linear infinite;
              font-weight: bold;
            }
          `}</style>
          <h1 className="text-5xl md:text-6xl rainbow-text">
            USDT 充值
          </h1>
        </div>

        {/* 客服联系方式 */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <svg className="w-6 h-6 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
              </svg>
              <div>
                <h2 className="text-xl font-bold text-gray-900">在线客服</h2>
                <div className="flex items-center mt-1">
                  <p className="text-gray-500 text-sm">客服联系方式telegramID: </p>
                  <button
                    onClick={() => copyToClipboard(config.customerService.id)}
                    className="text-blue-500 hover:text-blue-600 text-sm ml-1 flex items-center"
                  >
                    {config.customerService.id}
                    {copied && (
                      <span className="text-green-500 text-xs ml-2">已复制!</span>
                    )}
                  </button>
                </div>
              </div>
            </div>
            <a
              href={config.customerService.url}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors duration-200 text-base font-medium flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 16h2v-6h-2v6zm0-8h2V8h-2v2z"/>
              </svg>
              联系客服
            </a>
          </div>
        </div>

        {/* USDT充值表单 */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="space-y-6">
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                充值金额 (USDT)
              </label>
              <div className="mt-1">
                <input
                  type="number"
                  id="amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder={`最低 ${config.usdtMinAmount} USDT`}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
              </div>
              <p className="mt-2 text-sm text-gray-500">
                当前汇率: 1 USDT = {config.usdtRate} CNY
              </p>
              {amount && (
                <p className="mt-1 text-sm text-blue-600">
                  预计支付: {(Number(amount) * config.usdtRate).toFixed(2)} CNY
                </p>
              )}
            </div>

            <div>
              <label htmlFor="account" className="block text-sm font-medium text-gray-700">
                QQ号/邮箱/Telegram
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  id="account"
                  value={account}
                  onChange={(e) => setAccount(e.target.value)}
                  placeholder="请输入您的联系方式"
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                USDT收款地址 (TRC20)
              </label>
              <div className="mt-1 flex items-center">
                <input
                  type="text"
                  value={config.address}
                  readOnly
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md bg-gray-50"
                />
                <button
                  onClick={() => copyToClipboard(config.address)}
                  className="ml-2 inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  复制
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                收款二维码
              </label>
              <div className="mt-1">
                <img
                  src={config.qrcode}
                  alt="USDT收款二维码"
                  className="w-48 h-48 mx-auto"
                />
              </div>
            </div>

            <div>
              <button
                onClick={handleSubmit}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                确认充值
              </button>
            </div>
          </div>
        </div>

        {/* 公告区域 */}
        <div className="bg-white shadow rounded-lg p-6 mt-6">
          <div className="flex items-center mb-4">
            <svg className="w-6 h-6 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
            </svg>
            <h2 className="text-xl font-bold text-gray-900">网站公告</h2>
          </div>
          <div className="space-y-2 text-gray-700">
            <p className="text-red-500 font-bold">请务必使用TRC20网络转账，其他网络充值无法到账！</p>
            <p className="text-red-500">转账时请确保金额与订单金额一致，否则可能导致充值失败。</p>
            <p>本平台支持24小时自动充值，充值完成后请等待系统确认。</p>
            <p className="mt-4">如遇到任何问题，请及时联系在线客服处理。</p>
            <p className="text-red-500 font-bold">温馨提示：请勿重复提交订单，以免造成不必要的麻烦。</p>
          </div>
        </div>
      </div>
    </div>
  );
} 