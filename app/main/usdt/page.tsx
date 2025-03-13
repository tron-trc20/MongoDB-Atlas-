'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Loading from '@/app/components/Loading';

const amounts = [
  { display: 500, rate: 7.9, name: 'USDT代购500U' },
  { display: 700, rate: 8.0, name: 'USDT代购700U' },
  { display: 1000, rate: 8.2, name: 'USDT代购1000U' },
  { display: 1500, rate: 8.3, name: 'USDT代购1500U' },
  { display: 2000, rate: 8.4, name: 'USDT代购2000U' },
  { display: 3000, rate: 8.5, name: 'USDT代购3000U' }
];

interface SiteConfig {
  address: string;
  qrcode: string;
  customerService: {
    url: string;
    id: string;
  };
}

interface Accounts {
  [key: string]: string;
}

export default function UsdtHome() {
  const router = useRouter();
  const [accounts, setAccounts] = useState<Accounts>({});
  const [copied, setCopied] = useState(false);
  const [customAmount, setCustomAmount] = useState('');
  const [customAccount, setCustomAccount] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [config, setConfig] = useState<SiteConfig | null>(null);

  const handleAmountSelect = (amount: number, rate: number) => {
    const key = amount.toString();
    if (!accounts[key]?.trim()) {
      alert('请输入QQ号/邮箱/Telegram');
      return;
    }
    const cashback = amount * rate;
    const orderId = `${Date.now()}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
    router.push(`/payment/usdt?amount=${amount}&account=${accounts[key]}&cashback=${cashback}&orderId=${orderId}`);
  };

  const handleAccountChange = (key: string, value: string) => {
    setAccounts(prev => ({
      ...prev,
      [key]: value
    }));
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

  const handleCustomAmountSubmit = () => {
    const amount = Number(customAmount);
    if (amount < 5000) {
      alert('自定义金额最小为5000 USDT');
      return;
    }
    if (!customAccount?.trim()) {
      alert('请输入QQ号/邮箱/Telegram');
      return;
    }
    const cashback = amount * 8.8;
    const orderId = `${Date.now()}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
    router.push(`/payment/usdt?amount=${amount}&account=${customAccount}&cashback=${cashback}&orderId=${orderId}`);
  };

  useEffect(() => {
    const init = async () => {
      try {
        const res = await fetch('/api/main/config');
        if (!res.ok) {
          throw new Error('获取配置失败');
        }

        const data = await res.json();
        if (!data.success) {
          throw new Error(data.message || '获取配置失败');
        }

        if (!data.data?.customerService?.id) {
          throw new Error('配置数据不完整');
        }

        setConfig(data.data);
      } catch (err: any) {
        console.error('Error initializing:', err);
        setError(err.message || '初始化失败');
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  if (loading) {
    return <Loading />;
  }

  if (error || !config?.customerService?.id) {
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
              0% { color: #0066ff; }
              50% { color: #00ccff; }
              100% { color: #0066ff; }
            }
            @keyframes glow {
              0%, 100% { text-shadow: 0 0 20px rgba(0, 102, 255, 0.5); }
              50% { text-shadow: 0 0 20px rgba(0, 204, 255, 0.5); }
            }
            .rainbow-text {
              animation: rainbow 5s linear infinite, glow 5s linear infinite;
              font-weight: bold;
            }
          `}</style>
          <h1 className="text-5xl md:text-6xl rainbow-text">
            USDT代购
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

        {/* USDT代购列表 */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="grid grid-cols-1 gap-4">
            {amounts.map(({ display, rate, name }) => (
              <div key={display} className="flex items-center justify-between bg-blue-50 p-4 rounded-lg hover:bg-blue-100 transition-colors duration-200">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-blue-500 rounded-lg flex items-center justify-center">
                    <span className="text-white text-2xl">₮</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-blue-600">{name}</h3>
                    <p className="text-gray-500 mt-1">汇率: {rate} CNY/USDT</p>
                    <div className="flex flex-col gap-1 mt-2">
                      <div className="bg-blue-100 px-3 py-1 rounded-full">
                        <p className="text-blue-600 font-bold">
                          支付金额: <span className="text-xl">{display} USDT</span>
                        </p>
                      </div>
                      <div className="bg-yellow-100 px-3 py-1 rounded-full">
                        <p className="text-red-600 font-bold">
                          返现金额: <span className="text-xl">¥{(display * rate).toFixed(2)}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col space-y-2 items-end">
                  <input
                    type="text"
                    placeholder="请输入QQ号/邮箱/Telegram"
                    value={accounts[display.toString()] || ''}
                    onChange={(e) => handleAccountChange(display.toString(), e.target.value)}
                    className="border border-gray-300 rounded px-3 py-2 text-sm w-56"
                  />
                  <button
                    onClick={() => handleAmountSelect(display, rate)}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors duration-200 text-base font-medium w-full"
                  >
                    立即购买
                  </button>
                </div>
              </div>
            ))}

            {/* 自定义金额 */}
            <div className="flex items-center justify-between bg-blue-50 p-4 rounded-lg hover:bg-blue-100 transition-colors duration-200">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-blue-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-2xl">₮</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-blue-600">自定义金额</h3>
                  <p className="text-gray-500 mt-1">汇率: 8.8 CNY/USDT</p>
                  <p className="text-red-500 text-sm mt-1">最小金额: 5000 USDT</p>
                  {customAmount && Number(customAmount) >= 5000 && (
                    <div className="flex flex-col gap-1 mt-2">
                      <div className="bg-blue-100 px-3 py-1 rounded-full">
                        <p className="text-blue-600 font-bold">
                          支付金额: <span className="text-xl">{customAmount} USDT</span>
                        </p>
                      </div>
                      <div className="bg-yellow-100 px-3 py-1 rounded-full">
                        <p className="text-red-600 font-bold">
                          返现金额: <span className="text-xl">¥{(Number(customAmount) * 8.8).toFixed(2)}</span>
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex flex-col space-y-2 items-end">
                <input
                  type="number"
                  min="5000"
                  step="100"
                  placeholder="输入USDT数量"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  className="border border-gray-300 rounded px-3 py-2 text-sm w-56"
                />
                <input
                  type="text"
                  placeholder="请输入QQ号/邮箱/Telegram"
                  value={customAccount}
                  onChange={(e) => setCustomAccount(e.target.value)}
                  className="border border-gray-300 rounded px-3 py-2 text-sm w-56"
                />
                <button
                  onClick={handleCustomAmountSubmit}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors duration-200 text-base font-medium w-full"
                >
                  立即购买
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 公告区域 */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center mb-4">
            <svg className="w-6 h-6 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
            </svg>
            <h2 className="text-xl font-bold text-gray-900">网站公告</h2>
          </div>
          <div className="space-y-2">
            <p className="text-red-500 font-bold">提取口令后请尽快使用或保存好，系统自动定期清除被提取的口令</p>
            <p className="text-red-500">为防止风控切勿连续发起订单登录操作如不跳转本站概不负责</p>
            <p className="mt-4">本项目是我公司最新推出的白资换u，由于我司目前需要移民到国外，虚拟币交易账户限额，资产太多，目前需要大量的交易来迅速换u，欢迎各位老板前来下单。</p>
            <p>为防止跑路，通过平台付款方式垫付，单笔就可循环操作。</p>
            <p>上手简单，提供用户和代理给与足够大力度的佣金</p>
            <p className="text-red-500 font-bold">不用担心跑路问题，无跑路历史。欢迎代理来抢单赚钱。</p>
          </div>
        </div>
      </div>
    </div>
  );
} 