'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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

interface Agent {
  id: string;
  username: string;
  level: 0 | 1 | 2 | 3 | 4;
  siteConfig?: SiteConfig;
  parentId?: string;
  inviteCode?: string;
  createdAt?: string;
  earnings?: {
    total: number;
    count: number;
    rate: number;
  };
}

interface CreateAgentForm {
  username: string;
  password: string;
  level: number;
}

interface ConfigResponse {
  config: SiteConfig;
  useMainSite: boolean;
  parentId: string | null;
}

interface Transaction {
  id: string;
  amount: number;
  agentId: string;
  status: 'pending' | 'confirmed' | 'rejected';
  customerView: 'pending';
  createdAt: Date;
  confirmedAt?: Date;
  confirmedBy?: string;
  remarks?: string;
}

interface AgentInfo {
  id: string;
  username: string;
  level: number;
  status: string;
  commissionRate: number;
  createdAt: string;
}

export default function Dashboard() {
  const router = useRouter();
  
  // 初始化状态
  const [agent, setAgent] = useState<Agent | null>(null);
  const [config, setConfig] = useState<SiteConfig | null>(null);
  const [mainSiteConfig, setMainSiteConfig] = useState<SiteConfig | null>(null);
  const [earnings, setEarnings] = useState({
    total: 0,
    count: 0,
    rate: 0
  });
  const [isEditing, setIsEditing] = useState(false);
  const [newConfig, setNewConfig] = useState<SiteConfig | null>(null);
  const [qrcodeFile, setQrcodeFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateAgent, setShowCreateAgent] = useState(false);
  const [createAgentForm, setCreateAgentForm] = useState<CreateAgentForm>({
    username: '',
    password: '',
    level: 2
  });
  const [createAgentError, setCreateAgentError] = useState('');
  const [useMainSite, setUseMainSite] = useState(false);
  const [parentId, setParentId] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [transactionFilter, setTransactionFilter] = useState({
    status: '',
    startDate: '',
    endDate: ''
  });
  const [allAgentEarnings, setAllAgentEarnings] = useState<any[]>([]);
  const [mounted, setMounted] = useState(false);
  const [subordinates, setSubordinates] = useState<Agent[]>([]);
  const [copied, setCopied] = useState(false);
  const [agentInfo, setAgentInfo] = useState<AgentInfo | null>(null);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // 初始化代理信息
  useEffect(() => {
    const init = async () => {
      try {
        setMounted(true);
        const storedAgent = localStorage.getItem('agent');
        const storedToken = localStorage.getItem('token');
        
        if (!storedAgent || !storedToken) {
          console.log('No agent or token found, redirecting to login');
          localStorage.removeItem('agent');
          localStorage.removeItem('token');
          router.replace('/agent/login');
          return;
        }

        let agentData;
        try {
          agentData = JSON.parse(storedAgent);
          if (!agentData.id || !agentData.username || !agentData.level) {
            throw new Error('Invalid agent data');
          }
        } catch (e) {
          console.error('Error parsing agent data:', e);
          localStorage.removeItem('agent');
          localStorage.removeItem('token');
          router.replace('/agent/login');
          return;
        }

        setAgent(agentData);
        
        // 创建一个临时的默认配置
        const defaultConfig: SiteConfig = {
          address: '',
          qrcode: '',
          customerService: {
            url: '',
            id: ''
          }
        };

        if (agentData.siteConfig) {
          setConfig(agentData.siteConfig);
          setNewConfig(agentData.siteConfig);
        } else {
          setConfig(defaultConfig);
          setNewConfig(defaultConfig);
        }

        // 获取配置信息
        try {
          const configRes = await fetch(`/api/agents/${agentData.username}/config`, {
            headers: {
              'Authorization': `Bearer ${storedToken}`,
              'x-agent-id': agentData.id,
              'x-agent-level': agentData.level.toString()
            }
          });

          if (!configRes.ok) {
            throw new Error('Failed to fetch config');
          }

          const configData = await configRes.json();
          if (configData.success) {
            setConfig(configData.data);
            setNewConfig(configData.data);
          }
        } catch (error) {
          console.error('Error fetching config:', error);
          setError('获取配置失败');
        }

        // 获取收益信息
        try {
          const earningsRes = await fetch('/api/agent/earnings', {
            headers: {
              'Authorization': `Bearer ${storedToken}`,
              'x-agent-id': agentData.id,
              'x-agent-level': agentData.level.toString()
            }
          });

          if (!earningsRes.ok) {
            throw new Error('Failed to fetch earnings');
          }

          const earningsData = await earningsRes.json();
          if (earningsData.success) {
            setEarnings({
              total: earningsData.data?.earnings || 0,
              count: earningsData.data?.transactionCount || 0,
              rate: (earningsData.data?.rate || 0) * 100
            });
          }
        } catch (error) {
          console.error('Error fetching earnings:', error);
          setError('获取收益信息失败');
        }

        // 获取代理信息
        try {
          const agentInfoRes = await fetch('/api/agent/info', {
            headers: {
              'Authorization': `Bearer ${storedToken}`
            }
          });

          if (!agentInfoRes.ok) {
            throw new Error('Failed to fetch agent info');
          }

          const agentInfoData = await agentInfoRes.json();
          if (agentInfoData.success) {
            setAgentInfo(agentInfoData.data);
          }
        } catch (error) {
          console.error('Error fetching agent info:', error);
          setError('获取代理信息失败');
        }
      } catch (err) {
        console.error('Error initializing dashboard:', err);
        setError('初始化失败，请重新登录');
        localStorage.removeItem('agent');
        localStorage.removeItem('token');
        router.replace('/agent/login');
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [router]);

  // 获取交易列表
  useEffect(() => {
    if (!agent || !mounted) return;

    const queryParams = new URLSearchParams();
    if (transactionFilter.status) queryParams.append('status', transactionFilter.status);
    if (transactionFilter.startDate) queryParams.append('startDate', transactionFilter.startDate);
    if (transactionFilter.endDate) queryParams.append('endDate', transactionFilter.endDate);

    fetch(`/api/agent/transactions/list?${queryParams}`, {
      headers: {
        'x-agent-id': agent.id,
        'x-agent-level': agent.level.toString()
      }
    })
      .then(async res => {
        if (!res.ok) throw new Error('获取交易列表失败');
        return res.json();
      })
      .then(data => {
        if (data.success) {
          setTransactions(data.data);
        }
      })
      .catch(err => {
        console.error('Error fetching transactions:', err);
        setError('获取交易列表失败');
      });
  }, [agent, transactionFilter, mounted]);

  // 获取所有代理收益（仅主站点）
  useEffect(() => {
    if (!agent || agent.level !== 0 || !mounted) return;

    fetch('/api/agent/earnings', {
      headers: {
        'x-agent-id': agent.id,
        'x-agent-level': agent.level.toString()
      }
    })
      .then(async res => {
        if (!res.ok) throw new Error('获取代理收益失败');
        return res.json();
      })
      .then(data => {
        if (data.success) {
          setAllAgentEarnings(data.data);
        }
      })
      .catch(err => {
        console.error('Error fetching all agent earnings:', err);
        setError('获取代理收益失败');
      });
  }, [agent, mounted]);

  // 获取下级代理列表
  useEffect(() => {
    if (!agent || !mounted) return;

    fetch('/api/agent/subordinates', {
      headers: {
        'x-agent-id': agent.id,
        'x-agent-level': agent.level.toString()
      }
    })
      .then(async res => {
        if (!res.ok) throw new Error('获取下级代理列表失败');
        return res.json();
      })
      .then(data => {
        if (data.success) {
          setSubordinates(data.data);
        }
      })
      .catch(err => {
        console.error('Error fetching subordinates:', err);
        setError('获取下级代理列表失败');
      });
  }, [agent, mounted]);

  // 处理配置更新
  const handleConfigUpdate = async () => {
    if (!agent || !newConfig || agent.level !== 1) return;

    try {
      // 如果有新的二维码文件，先转换为Base64
      if (qrcodeFile) {
        const base64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(qrcodeFile);
        });
        newConfig.qrcode = base64;
      }

      const res = await fetch('/api/agent/config', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-agent-id': agent.id,
          'x-agent-level': agent.level.toString()
        },
        body: JSON.stringify(newConfig)
      });

      if (!res.ok) {
        throw new Error('更新配置失败');
      }

      const data = await res.json();
      if (data.success) {
        // 更新本地配置
        setConfig(newConfig);
        // 更新本地存储的代理信息
        const updatedAgent = { ...agent, siteConfig: newConfig };
        localStorage.setItem('agent', JSON.stringify(updatedAgent));
        setAgent(updatedAgent);
        setIsEditing(false);
        setError('配置更新成功');
      } else {
        throw new Error(data.message || '更新配置失败');
      }
    } catch (error: any) {
      console.error('Error updating config:', error);
      setError(error.message || '更新配置失败');
    }
  };

  // 处理创建代理
  const handleCreateAgent = async () => {
    try {
      setCreateAgentError('');
      const res = await fetch('/api/agent/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-agent-id': agent!.id,
          'x-agent-level': agent!.level.toString()
        },
        body: JSON.stringify(createAgentForm)
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.message);
      }

      // 重置表单
      setCreateAgentForm({
        username: '',
        password: '',
        level: 2
      });
      setShowCreateAgent(false);
      setError('代理创建成功');
    } catch (err: any) {
      setCreateAgentError(err.message || '创建代理失败');
    }
  };

  // 确认交易
  const handleVerifyTransaction = async (transactionId: string, status: 'confirmed' | 'rejected', remarks?: string) => {
    if (!agent || (agent.level !== 0 && agent.level !== 1)) return;

    try {
      const res = await fetch('/api/agent/transactions/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-agent-id': agent.id,
          'x-agent-level': agent.level.toString()
        },
        body: JSON.stringify({ transactionId, status, remarks })
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.message);
      }

      // 更新交易列表
      setTransactions(prev => 
        prev.map(t => t.id === transactionId ? { ...t, status, confirmedAt: new Date(), confirmedBy: agent.id } : t)
      );

      setError('交易状态已更新');
    } catch (err: any) {
      console.error('Error verifying transaction:', err);
      setError('更新交易状态失败：' + err.message);
    }
  };

  // 在 Dashboard 组件内部添加删除代理的处理函数
  const handleDeleteAgent = async (agentId: string) => {
    if (!agent) return;
    
    try {
      const res = await fetch('/api/agent/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-agent-id': agent.id,
          'x-agent-level': agent.level.toString()
        },
        body: JSON.stringify({ agentId })
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.message);
      }

      // 从列表中移除被删除的代理
      setSubordinates(prev => prev.filter(sub => sub.id !== agentId));
      setError('代理删除成功');
    } catch (err: any) {
      console.error('Error deleting agent:', err);
      setError('删除代理失败：' + err.message);
    }
  };

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('两次输入的新密码不一致');
      return;
    }

    try {
      const res = await fetch('/api/agent/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('agent_token')}`
        },
        body: JSON.stringify({
          oldPassword: passwordForm.oldPassword,
          newPassword: passwordForm.newPassword
        })
      });

      const data = await res.json();
      if (data.success) {
        alert('密码修改成功');
        setShowChangePassword(false);
        setPasswordForm({
          oldPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        setError(data.message || '密码修改失败');
      }
    } catch (err) {
      setError('密码修改失败');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('agent_token');
    localStorage.removeItem('agent_info');
    router.replace('./login');
  };

  const calculateTotalIncome = () => {
    return transactions
      .filter(t => t.status === 'confirmed')
      .reduce((sum, t) => sum + t.amount, 0);
  };

  if (!mounted || loading) {
    return <Loading />;
  }

  if (!agent) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* 顶部导航栏 */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-gray-900">代理后台</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowChangePassword(true)}
                className="px-4 py-2 text-sm text-blue-600 hover:text-blue-900"
              >
                修改密码
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm text-red-600 hover:text-red-900"
              >
                退出登录
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* 主内容区 */}
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded relative">
            {error}
          </div>
        )}

        {/* 代理信息卡片 */}
        {agentInfo && (
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">代理信息</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <p className="text-sm font-medium text-gray-500">用户名</p>
                <p className="mt-1 text-sm text-gray-900">{agentInfo.username}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">代理等级</p>
                <p className="mt-1 text-sm text-gray-900">{agentInfo.level}级代理</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">佣金比例</p>
                <p className="mt-1 text-sm text-gray-900">{agentInfo.commissionRate.toFixed(1)}%</p>
              </div>
            </div>
          </div>
        )}

        {/* 推广链接卡片 */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">推广链接</h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-2">USDT充值链接</p>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  readOnly
                  value={`${window.location.origin}/usdt?agent=${agent?.username}`}
                  className="flex-1 p-2 border border-gray-300 rounded-md bg-gray-50"
                />
                <button
                  onClick={() => navigator.clipboard.writeText(`${window.location.origin}/usdt?agent=${agent?.username}`)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  复制
                </button>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 mb-2">支付宝红包链接</p>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  readOnly
                  value={`${window.location.origin}/redpacket?agent=${agent?.username}`}
                  className="flex-1 p-2 border border-gray-300 rounded-md bg-gray-50"
                />
                <button
                  onClick={() => navigator.clipboard.writeText(`${window.location.origin}/redpacket?agent=${agent?.username}`)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  复制
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 收益统计卡片 */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">收益统计</h2>
          <div className="text-2xl font-bold text-blue-600">
            ¥{calculateTotalIncome().toFixed(2)}
          </div>
        </div>

        {/* 交易记录表格 */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">交易记录</h2>
          </div>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  交易ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  金额
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  佣金
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  类型
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  状态
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  用户
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  时间
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transactions.map((transaction) => (
                <tr key={transaction.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {transaction.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ¥{transaction.amount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ¥{transaction.amount * (agent?.earnings?.rate || 0)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {transaction.amount > 0 ? '充值' : '提现'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      transaction.status === 'confirmed'
                        ? 'bg-green-100 text-green-800'
                        : transaction.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {transaction.status === 'confirmed' ? '已完成' :
                       transaction.status === 'pending' ? '处理中' : '失败'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {transaction.agentId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(transaction.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 修改密码弹窗 */}
      {showChangePassword && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">修改密码</h3>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  原密码
                </label>
                <input
                  type="password"
                  required
                  value={passwordForm.oldPassword}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, oldPassword: e.target.value }))}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  新密码
                </label>
                <input
                  type="password"
                  required
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  确认新密码
                </label>
                <input
                  type="password"
                  required
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowChangePassword(false)}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  确认修改
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 