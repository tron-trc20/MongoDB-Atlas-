'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Loading from '../components/Loading';

const USDT_RATE = 7.2;

interface PaymentInfo {
  orderId: string;
  amount: number;
  type: string;
  account: string;
}

interface SiteConfig {
  customerService: {
    url: string;
    id: string;
  };
  usdtRate: number;
}

export default function Payment() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedType, setCopiedType] = useState<'account' | 'amount' | 'customerService' | null>(null);
  const [address, setAddress] = useState('');
  const [isConfirming, setIsConfirming] = useState(false);
  const [config, setConfig] = useState<SiteConfig | null>(null);
  
  const amount = Number(searchParams.get('amount'));
  const redPacketAmount = Number(searchParams.get('redPacketAmount'));
  const account = searchParams.get('account');
  const orderId = searchParams.get('orderId');
  const type = searchParams.get('type');
  const usdtAmount = (amount / USDT_RATE).toFixed(2);

  useEffect(() => {
    const initPayment = async () => {
      try {
        if (!amount || !account || !orderId || !type) {
          throw new Error('缺少必要的支付参数');
        }

        // 获取支付配置
        const res = await fetch('/api/site/config');
        if (!res.ok) {
          throw new Error('获取支付配置失败');
        }

        const data = await res.json();
        if (!data.success) {
          throw new Error(data.message || '获取支付配置失败');
        }

        setConfig(data.data);

        // 创建支付订单
        const paymentRes = await fetch('/api/payment/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            orderId,
            amount,
            redPacketAmount,
            account,
            type
          })
        });

        if (!paymentRes.ok) {
          throw new Error('创建支付订单失败');
        }

        const paymentData = await paymentRes.json();
        if (!paymentData.success) {
          throw new Error(paymentData.message || '创建支付订单失败');
        }

        // 设置USDT收款地址
        setAddress('TNE7mTdTQmYgy8ZgsxUkYeYVH6BnjKFzAU');
        setLoading(false);
      } catch (err: any) {
        console.error('支付初始化失败:', err);
        setError(err.message || '支付初始化失败');
        setLoading(false);
      }
    };

    initPayment();
  }, [amount, redPacketAmount, account, orderId, type]);

  const copyToClipboard = async (text: string, type: 'account' | 'amount' | 'customerService') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedType(type);
      setTimeout(() => setCopiedType(null), 2000);
    } catch (err) {
      console.error('复制失败:', err);
    }
  };

  const handleConfirmPayment = async () => {
    setIsConfirming(true);
    
    try {
      // 检查支付状态
      const res = await fetch(`/api/payment/status?orderId=${orderId}`);
      if (!res.ok) {
        throw new Error('获取支付状态失败');
      }

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.message || '获取支付状态失败');
      }

      // 等待3秒后跳转到确认页面
      setTimeout(() => {
        router.push(`/payment/confirm?orderId=${orderId}`);
      }, 3000);
    } catch (err: any) {
      console.error('支付确认失败:', err);
      setError(err.message || '支付确认失败');
      setIsConfirming(false);
    }
  };

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
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        {/* 客服联系方式 - 始终显示在最上方 */}
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

        {/* 支付信息卡片 */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="p-6">
            {!isConfirming ? (
              <>
                <div className="text-center mb-6">
                  <p className="text-gray-600 text-sm">订单编号：{orderId}</p>
                  <div className="mt-2">
                    {type === 'redPacket' ? (
                      <>
                        <p className="text-red-600 font-bold text-xl">口令红包金额：¥{redPacketAmount.toFixed(2)}</p>
                        <p className="text-blue-600 font-bold mt-1">实际支付金额：¥{amount.toFixed(2)}</p>
                      </>
                    ) : (
                      <p className="text-blue-600 font-bold text-xl">支付金额：¥{amount.toFixed(2)}</p>
                    )}
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

                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <div className="flex flex-col items-center space-y-4">
                        <div className="relative w-48 h-48">
                          <Image
                            src="/qrcode_tron.png"
                            alt="TRON USDT收款码"
                            width={192}
                            height={192}
                            className="rounded-lg"
                          />
                        </div>

                        <div className="text-center text-gray-500 text-sm">
                          仅支持接收 TRON 资产
                        </div>

                        <div className="w-full bg-gray-50 p-3 rounded-lg">
                          <p className="text-gray-500 text-sm mb-2 text-center">收款地址</p>
                          <div className="font-mono text-sm text-gray-800 bg-white p-3 rounded border border-gray-200 break-all text-center mb-2">
                            {address}
                          </div>
                          <button
                            onClick={() => copyToClipboard(address, 'account')}
                            className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center space-x-2"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                            </svg>
                            <span>复制地址</span>
                            {copiedType === 'account' && <span className="text-green-300 text-xs">已复制!</span>}
                          </button>
                        </div>

                        <div className="w-full">
                          <p className="text-gray-500 text-sm mb-2 text-center">USDT支付金额</p>
                          <div className="flex items-center justify-between bg-gray-50 px-4 py-3 rounded-lg">
                            <span className="text-xl font-bold text-blue-600">{usdtAmount} USDT</span>
                            <button
                              onClick={() => copyToClipboard(usdtAmount, 'amount')}
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

                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <h3 className="text-lg font-bold text-yellow-800 mb-2">安全提示</h3>
                    <ul className="space-y-2 text-yellow-700 text-sm">
                      <li>• 请确保您是从正确的网址访问本站</li>
                      <li>• 收款金额请以页面显示为准</li>
                      <li>• 支付前请仔细核对金额</li>
                      <li>• 如有疑问请立即联系客服</li>
                    </ul>
                  </div>

                  <div className="flex space-x-4">
                    <button
                      className="flex-1 bg-gray-400 text-white py-3 rounded-lg font-medium text-sm cursor-not-allowed"
                      disabled
                    >
                      等待区块链确认后领取支付宝红包
                    </button>
                    <button
                      onClick={handleConfirmPayment}
                      className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg font-medium"
                    >
                      我已完成支付
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <h2 className="text-xl font-semibold text-gray-800 mb-2">等待区块链确认</h2>
                <p className="text-gray-600">
                  请耐心等待，系统正在确认您的支付...
                </p>
                <p className="text-gray-500 text-sm mt-2">
                  {type === 'redPacket' ? '确认后可领取支付宝红包' : '等待区块链确认后领取支付宝红包'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 