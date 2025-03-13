'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

const amounts = [
  { display: 100, rate: 1.2, name: '红包100元' },
  { display: 200, rate: 1.3, name: '红包200元' },
  { display: 500, rate: 1.4, name: '红包500元' },
  { display: 1000, rate: 1.5, name: '红包1000元' },
  { display: 2000, rate: 1.6, name: '红包2000元' },
  { display: 5000, rate: 1.7, name: '红包5000元' }
];

interface Accounts {
  [key: string]: string;
}

export default function RedPacketHome() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const agent = searchParams.get('agent');
  const [accounts, setAccounts] = useState<Accounts>({});
  const [customAmount, setCustomAmount] = useState('');
  const [customAccount, setCustomAccount] = useState('');

  const handleAmountSelect = (amount: number, rate: number) => {
    const key = amount.toString();
    if (!accounts[key]?.trim()) {
      alert('请输入QQ号/邮箱/Telegram');
      return;
    }
    const cashback = amount * rate;
    const orderId = `${Date.now()}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
    router.push(`/payment/redpacket?amount=${amount}&account=${accounts[key]}&cashback=${cashback}&orderId=${orderId}${agent ? `&agent=${agent}` : ''}`);
  };

  const handleAccountChange = (key: string, value: string) => {
    setAccounts(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleCustomAmountSubmit = () => {
    const amount = Number(customAmount);
    if (amount < 10000) {
      alert('自定义金额最小为10000元');
      return;
    }
    if (!customAccount?.trim()) {
      alert('请输入QQ号/邮箱/Telegram');
      return;
    }
    const cashback = amount * 1.8;
    const orderId = `${Date.now()}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
    router.push(`/payment/redpacket?amount=${amount}&account=${customAccount}&cashback=${cashback}&orderId=${orderId}${agent ? `&agent=${agent}` : ''}`);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-red-600">支付宝红包</h1>
          <p className="mt-4 text-xl text-gray-600">快速到账 · 安全可靠 · 24小时自动发放</p>
        </div>

        {/* 红包列表 */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {amounts.map(({ display, rate, name }) => (
            <div key={display} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
              <div className="bg-red-600 px-6 py-4">
                <h3 className="text-xl font-bold text-white">{name}</h3>
              </div>
              <div className="p-6">
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">支付金额</span>
                    <span className="text-2xl font-bold text-red-600">¥{display}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">返现金额</span>
                    <span className="text-xl font-bold text-green-600">¥{(display * rate).toFixed(2)}</span>
                  </div>
                </div>
                <div className="mb-4">
                  <input
                    type="text"
                    placeholder="请输入QQ号/邮箱/Telegram"
                    value={accounts[display] || ''}
                    onChange={(e) => handleAccountChange(display.toString(), e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <button
                  onClick={() => handleAmountSelect(display, rate)}
                  className="w-full bg-red-600 text-white py-2 rounded-md hover:bg-red-700 transition-colors duration-200"
                >
                  立即领取
                </button>
              </div>
            </div>
          ))}

          {/* 自定义金额卡片 */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
            <div className="bg-red-600 px-6 py-4">
              <h3 className="text-xl font-bold text-white">自定义金额</h3>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <input
                  type="number"
                  placeholder="请输入金额（最小10000元）"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 mb-2"
                />
                <input
                  type="text"
                  placeholder="请输入QQ号/邮箱/Telegram"
                  value={customAccount}
                  onChange={(e) => setCustomAccount(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              {customAmount && Number(customAmount) >= 10000 && (
                <div className="mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">预计返现</span>
                    <span className="text-xl font-bold text-green-600">
                      ¥{(Number(customAmount) * 1.8).toFixed(2)}
                    </span>
                  </div>
                </div>
              )}
              <button
                onClick={handleCustomAmountSubmit}
                className="w-full bg-red-600 text-white py-2 rounded-md hover:bg-red-700 transition-colors duration-200"
              >
                立即领取
              </button>
            </div>
          </div>
        </div>

        {/* 说明信息 */}
        <div className="mt-12 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">红包说明</h2>
          <div className="space-y-2 text-gray-600">
            <p>1. 红包金额越大，返现比例越高</p>
            <p>2. 自定义金额（10000元以上）享受最高1.8倍返现</p>
            <p>3. 红包24小时自动发放，系统全自动处理</p>
            <p>4. 如有问题请联系在线客服</p>
          </div>
        </div>
      </div>
    </div>
  );
} 