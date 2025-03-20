'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Loading from '@/app/components/Loading';

interface SiteConfig {
  address: string;
  qrcode: string;
  customerService: {
    url: string;
    id: string;
  };
}

export default function UsdtPayment() {
  const searchParams = useSearchParams();
  const amount = Number(searchParams.get('amount')) || 0;
  const cashback = Number(searchParams.get('cashback')) || 0;
  const account = searchParams.get('account') || '';
  const orderId = searchParams.get('orderId') || '';
  const [copiedType, setCopiedType] = useState<'address' | 'amount' | 'customerService' | null>(null);
  const [orderStatus, setOrderStatus] = useState('waiting'); // waiting, checking
  const [config, setConfig] = useState<SiteConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deadline, setDeadline] = useState('');

  useEffect(() => {
    const init = async () => {
      try {
        console.log('Fetching config...');
        const res = await fetch('/api/site/config');
        if (!res.ok) {
          throw new Error('获取配置失败');
        }

        const data = await res.json();
        console.log('Config data:', data);

        if (!data.success) {
          throw new Error(data.message || '获取配置失败');
        }

        // 设置默认值
        const configData = {
          address: 'TNE7mTdTQmYgy8ZgsxUkYeYVH6BnjKFzAU', // 更新为正确的收款地址
          qrcode: '/images/qrcode_tron.png',
          customerService: {
            url: data.data?.customerService?.url || '',
            id: data.data?.customerService?.id || ''
          }
        };

        console.log('Processed config:', configData);
        setConfig(configData);
      } catch (err: any) {
        console.error('Error initializing:', err);
        setError(err.message || '初始化失败');
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  // 生成截止时间
  useEffect(() => {
    const now = new Date();
    // 设置10分钟后的截止时间
    const deadlineTime = new Date(now.getTime() + 10 * 60 * 1000);
    
    // 格式化为北京时间
    const year = deadlineTime.getFullYear();
    const month = String(deadlineTime.getMonth() + 1).padStart(2, '0');
    const day = String(deadlineTime.getDate()).padStart(2, '0');
    const hours = String(deadlineTime.getHours()).padStart(2, '0');
    const minutes = String(deadlineTime.getMinutes()).padStart(2, '0');
    const seconds = String(deadlineTime.getSeconds()).padStart(2, '0');

    const formattedDeadline = `！请在北京时间${year}/${month}/${day} ${hours}:${minutes}:${seconds}前支付！`;
    setDeadline(formattedDeadline);
  }, []);

  const copyToClipboard = async (text: string, type: 'address' | 'amount' | 'customerService') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedType(type);
      setTimeout(() => setCopiedType(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleTransferConfirm = async () => {
    setOrderStatus('checking');
    
    try {
      // 创建交易记录
      const res = await fetch('/api/transactions/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount,
          account,
          cashback,
          orderId,
          type: 'usdt'
        })
      });

      if (!res.ok) {
        throw new Error('区块链交易确认中，请稍后再试');
      }

      const data = await res.json();
      
      if (data.success) {
        // 跳转到等待确认页面
        window.location.href = `/payment/waiting?orderId=${orderId}`;
      } else {
        throw new Error(data.message || '区块链交易确认中，请稍后再试');
      }
    } catch (error: any) {
      console.error('Error creating transaction:', error);
      alert('区块链网络确认中，请等待3-5分钟后再点击已转账按钮，如有疑问请联系客服');
      setOrderStatus('waiting');
    }
  };

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

  // 使用正确的二维码图片路径
  const qrcodeUrl = '/images/qrcode_tron.png';

  console.log('Using qrcode URL:', qrcodeUrl);
  console.log('Config data in render:', config);

  return (
    <>
      <head>
        <title>USDT付款 - TRC20链上支付</title>
      </head>
      <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto">
          {/* 客服联系方式 */}
          {config && (
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
                        onClick={() => copyToClipboard(config.customerService.id, 'customerService')}
                        className="text-blue-500 hover:text-blue-600 text-sm ml-1 flex items-center"
                      >
                        {config.customerService.id}
                        {copiedType === 'customerService' && (
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
          )}

          <div className="bg-white shadow rounded-lg overflow-hidden">
            {/* USDT Logo */}
            <div className="flex justify-center p-6 bg-gray-50">
              <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-3xl font-bold">₮</span>
              </div>
            </div>

            {/* Order Info */}
            <div className="p-6">
              <div className="text-center mb-6">
                <p className="text-gray-600 text-sm">订单编号：{orderId}</p>
                <div className="mt-2">
                  <p className="text-blue-600 font-bold text-xl">USDT金额：{amount} USDT</p>
                  <p className="text-red-600 font-bold mt-1">支付宝返现：¥{cashback.toFixed(2)}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg">
                  <div className="text-center space-y-2 mb-4">
                    <p className="text-blue-800 font-medium">
                      当前USDT支付区块网络协议为TRC20
                    </p>
                    <p className="text-red-500 font-bold text-sm">
                      到账金额需要与下方显示的金额一致，否则系统无法确认！
                    </p>
                    <p className="text-red-500 font-bold text-sm">
                      交易所充值用户请自行补加手续费，否则系统无法确认！
                    </p>
                  </div>

                  {/* 收款信息卡片 */}
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="flex flex-col items-center space-y-4">
                      {/* 二维码 */}
                      <div className="relative w-48 h-48 bg-gray-100 rounded-lg overflow-hidden">
                        <img
                          src={qrcodeUrl}
                          alt="TRON USDT收款码"
                          className="w-full h-full object-contain"
                        />
                      </div>
                      
                      {/* TRON提示 */}
                      <div className="text-center text-gray-500 text-sm">
                        仅支持接收 TRON 资产
                      </div>

                      {/* 地址显示 */}
                      <div className="w-full bg-gray-50 p-3 rounded-lg">
                        <p className="text-gray-500 text-sm mb-2 text-center">收款地址</p>
                        <div className="font-mono text-sm text-gray-800 bg-white p-3 rounded border border-gray-200 break-all text-center mb-2">
                          TNE7mTdTQmYgy8ZgsxUkYeYVH6BnjKFzAU
                        </div>
                        <button
                          onClick={() => copyToClipboard('TNE7mTdTQmYgy8ZgsxUkYeYVH6BnjKFzAU', 'address')}
                          className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center space-x-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                          </svg>
                          <span>复制地址</span>
                          {copiedType === 'address' && <span className="text-green-300 text-xs">已复制!</span>}
                        </button>
                      </div>

                      {/* 金额显示 */}
                      <div className="w-full">
                        <p className="text-gray-500 text-sm mb-2 text-center">支付金额</p>
                        <div className="flex items-center justify-between bg-gray-50 px-4 py-3 rounded-lg">
                          <span className="text-xl font-bold text-blue-600">{amount} USDT</span>
                          <button
                            onClick={() => copyToClipboard(amount.toString(), 'amount')}
                            className="bg-blue-500 text-white px-3 py-1.5 rounded hover:bg-blue-600 flex items-center text-sm"
                          >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                            </svg>
                            复制金额
                            {copiedType === 'amount' && <span className="text-green-300 text-xs ml-1">已复制!</span>}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 p-4">
                  <h3 className="text-yellow-800 font-medium mb-2">安全提示</h3>
                  <ul className="text-yellow-700 text-sm space-y-1">
                    <li>• 请确保您是从正确的网站访问</li>
                    <li>• 收款地址请以二维码为准</li>
                    <li>• 转账前请仔细核对地址和金额</li>
                    <li>• 如果地址异常请勿转账并联系客服</li>
                  </ul>
                </div>

                {/* 倒计时提示 */}
                <div className="text-center text-red-500 font-bold p-4">
                  {deadline}
                </div>

                <div className="flex space-x-4">
                  <button
                    className="flex-1 bg-gray-500 text-white py-3 rounded-lg font-medium text-sm"
                    disabled
                  >
                    等待区块链确认后领取支付宝红包
                  </button>
                  <button
                    onClick={handleTransferConfirm}
                    disabled={orderStatus === 'checking'}
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg font-medium text-sm disabled:bg-gray-400"
                  >
                    {orderStatus === 'checking' ? '确认中...' : '已转账'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 