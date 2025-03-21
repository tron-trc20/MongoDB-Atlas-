'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Agent {
  id: string;
  username: string;
  level: number;
  status: 'active' | 'disabled';
  createdAt: string;
  totalUsers: number;
  totalIncome: number;
  source: 'admin' | 'system' | 'agent';
  parentId: string;
  commissionRate: number;
}

interface User {
  id: string;
  username: string;
  agentId: string;
  agentUsername: string;
  totalSpent: number;
  createdAt: string;
}

interface Transaction {
  id: string;
  amount: number;
  type: string;
  status: string;
  createdAt: string;
  agentId: string;
  agentUsername: string;
  userId: string;
  userUsername: string;
  commission: number;
}

interface SiteConfig {
  customerService: {
    url: string;
    id: string;
  };
  usdtRate: number;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('agents'); // agents, users, transactions, settings
  const [agents, setAgents] = useState<Agent[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedAgent, setSelectedAgent] = useState<string>('all');
  const [siteConfig, setSiteConfig] = useState<SiteConfig>({
    customerService: {
      url: '',
      id: ''
    },
    usdtRate: 7.2
  });

  // 新建代理表单
  const [newAgentForm, setNewAgentForm] = useState({
    username: '',
    password: '',
    level: 2
  });

  // 检查登录状态
  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      router.replace('/main/manager/login');
    } else {
      fetchData();
      fetchSiteConfig();
    }
  }, [router]);

  const fetchData = async () => {
    try {
      setLoading(true);
      // 获取代理列表
      const agentsRes = await fetch('/api/admin/agents', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
        }
      });
      const agentsData = await agentsRes.json();
      if (agentsData.agents) {
        setAgents(agentsData.agents);
      }

      // 获取用户列表
      const usersRes = await fetch('/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
        }
      });
      const usersData = await usersRes.json();
      if (usersData.success) {
        setUsers(usersData.data);
      }

      // 获取交易记录
      const transactionsRes = await fetch('/api/admin/transactions', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
        }
      });
      const transactionsData = await transactionsRes.json();
      if (transactionsData.success) {
        setTransactions(transactionsData.data);
      }
    } catch (err) {
      setError('获取数据失败');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/agents/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
        },
        body: JSON.stringify(newAgentForm)
      });

      const data = await res.json();
      if (data.success) {
        alert('代理创建成功');
        setNewAgentForm({ username: '', password: '', level: 2 });
        fetchData(); // 刷新代理列表
      } else {
        setError(data.message || '创建失败');
      }
    } catch (err) {
      setError('创建代理失败');
    }
  };

  const handleUpdateAgentStatus = async (username: string, newStatus: 'active' | 'disabled') => {
    try {
      const res = await fetch(`/api/admin/agents/${username}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      const data = await res.json();
      if (data.success) {
        fetchData(); // 刷新代理列表
      } else {
        setError(data.error || '更新代理状态失败');
      }
    } catch (err) {
      setError('更新代理状态失败');
    }
  };

  const handleDeleteAgent = async (username: string) => {
    if (!confirm('确定要删除此代理吗？此操作不可恢复。')) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/agents/${username}/delete`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
        }
      });

      const data = await res.json();
      if (data.success) {
        fetchData(); // 刷新代理列表
      } else {
        setError(data.message || '删除失败');
      }
    } catch (err) {
      setError('删除代理失败');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_info');
    router.replace('/main/manager/login');
  };

  const handleViewUserTransactions = (userId: string) => {
    setActiveTab('transactions');
    // 获取特定用户的交易记录
    const userTransactions = transactions.filter(t => t.userId === userId);
    setTransactions(userTransactions);
  };

  const handleConfirmTransaction = async (transactionId: string, confirmed: boolean) => {
    try {
      const res = await fetch('/api/admin/transactions/confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
        },
        body: JSON.stringify({ transactionId, confirmed })
      });

      const data = await res.json();
      if (data.success) {
        fetchData(); // 刷新交易列表
      } else {
        setError(data.message || '确认交易失败');
      }
    } catch (err) {
      setError('确认交易失败');
    }
  };

  const handleCommissionRateChange = async (username: string, newRate: number) => {
    try {
      // 验证佣金率范围
      if (newRate < 0 || newRate > 100) {
        setError('佣金率必须在0-100之间');
        return;
      }

      const res = await fetch(`/api/admin/agents/${username}/commission`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
        },
        body: JSON.stringify({ commissionRate: newRate })
      });

      const data = await res.json();
      if (data.success) {
        fetchData(); // 刷新代理列表
      } else {
        setError(data.error || '更新佣金率失败');
      }
    } catch (err) {
      setError('更新佣金率失败');
    }
  };

  // 获取站点配置
  const fetchSiteConfig = async () => {
    try {
      const res = await fetch('/api/site/config', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        },
        cache: 'no-store',
        next: { revalidate: 0 }
      });
      const data = await res.json();
      if (data.success) {
        setSiteConfig(data.data);
      }
    } catch (err) {
      setError('获取站点配置失败');
    }
  };

  // 更新站点配置
  const handleUpdateSiteConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/site-config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
        },
        body: JSON.stringify(siteConfig)
      });

      const data = await res.json();
      if (data.success) {
        alert('配置更新成功');
        // 强制重新获取最新配置
        await fetchSiteConfig();
      } else {
        setError(data.message || '更新失败');
      }
    } catch (err) {
      setError('更新站点配置失败');
    }
  };

  if (loading) {
    return <div className="text-center p-4">加载中...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* 顶部导航栏 */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-gray-900">管理后台</h1>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <button
                  onClick={() => setActiveTab('agents')}
                  className={`${
                    activeTab === 'agents'
                      ? 'border-blue-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                >
                  代理管理
                </button>
                <button
                  onClick={() => setActiveTab('users')}
                  className={`${
                    activeTab === 'users'
                      ? 'border-blue-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                >
                  用户管理
                </button>
                <button
                  onClick={() => setActiveTab('transactions')}
                  className={`${
                    activeTab === 'transactions'
                      ? 'border-blue-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                >
                  交易记录
                </button>
                <button
                  onClick={() => setActiveTab('settings')}
                  className={`${
                    activeTab === 'settings'
                      ? 'border-blue-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                >
                  网站设置
                </button>
              </div>
            </div>
            <div className="flex items-center">
              <button
                onClick={handleLogout}
                className="ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                退出登录
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* 主内容区 */}
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* 标签页切换 */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex">
            <button
              onClick={() => setActiveTab('agents')}
              className={`mr-8 py-4 px-1 ${
                activeTab === 'agents'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              代理管理
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`mr-8 py-4 px-1 ${
                activeTab === 'users'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              用户管理
            </button>
            <button
              onClick={() => setActiveTab('transactions')}
              className={`py-4 px-1 ${
                activeTab === 'transactions'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              交易记录
            </button>
          </nav>
        </div>

        {/* 代理筛选 */}
        {activeTab !== 'agents' && (
          <div className="mb-4">
            <select
              value={selectedAgent}
              onChange={(e) => setSelectedAgent(e.target.value)}
              className="block w-48 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">所有代理</option>
              {agents.map((agent) => (
                <option key={agent.id} value={agent.id}>
                  {agent.username}
                </option>
              ))}
            </select>
          </div>
        )}

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded relative">
            {error}
          </div>
        )}

        {/* 代理管理面板 */}
        {activeTab === 'agents' && (
          <div className="space-y-6">
            {/* 创建代理表单 */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">创建新代理</h2>
              <form onSubmit={handleCreateAgent} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      用户名
                    </label>
                    <input
                      type="text"
                      required
                      value={newAgentForm.username}
                      onChange={(e) => setNewAgentForm(prev => ({ ...prev, username: e.target.value }))}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      密码
                    </label>
                    <input
                      type="password"
                      required
                      value={newAgentForm.password}
                      onChange={(e) => setNewAgentForm(prev => ({ ...prev, password: e.target.value }))}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      代理等级
                    </label>
                    <select
                      required
                      value={newAgentForm.level}
                      onChange={(e) => setNewAgentForm(prev => ({ ...prev, level: parseInt(e.target.value) }))}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value={2}>二级代理</option>
                      <option value={3}>三级代理</option>
                      <option value={4}>四级代理</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    创建代理
                  </button>
                </div>
              </form>
            </div>

            {/* 代理列表 */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      用户名
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      代理等级
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      佣金率
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      状态
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      创建时间
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {agents.map((agent) => (
                    <tr key={agent.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {agent.username}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {agent.level}级代理
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            step="0.1"
                            value={agent.commissionRate}
                            onChange={(e) => {
                              const value = parseFloat(e.target.value);
                              if (!isNaN(value)) {
                                handleCommissionRateChange(agent.username, value);
                              }
                            }}
                            className="w-20 border border-gray-300 rounded-md shadow-sm px-2 py-1 mr-2"
                          />
                          <span className="text-gray-500">%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {agent.status === 'active' ? (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            启用
                          </span>
                        ) : (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                            禁用
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(agent.createdAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleUpdateAgentStatus(agent.username, agent.status === 'active' ? 'disabled' : 'active')}
                          className={`text-${agent.status === 'active' ? 'red' : 'green'}-600 hover:text-${agent.status === 'active' ? 'red' : 'green'}-900`}
                        >
                          {agent.status === 'active' ? '禁用' : '启用'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 用户管理面板 */}
        {activeTab === 'users' && (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    用户名
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    所属代理
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    消费总额
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    注册时间
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users
                  .filter(user => selectedAgent === 'all' || user.agentId === selectedAgent)
                  .map((user) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.username}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.agentUsername}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ¥{user.totalSpent.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(user.createdAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleViewUserTransactions(user.id)}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          查看交易
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 交易记录面板 */}
        {activeTab === 'transactions' && (
          <div className="bg-white shadow rounded-lg overflow-hidden">
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
                    代理
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    用户
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    时间
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {transactions
                  .filter(transaction => selectedAgent === 'all' || transaction.agentId === selectedAgent)
                  .map((transaction) => (
                    <tr key={transaction.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {transaction.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ¥{transaction.amount.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ¥{transaction.commission.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {transaction.type === 'redPacket' ? '支付宝红包' : 'USDT'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          transaction.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : transaction.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {transaction.status === 'completed' ? '已完成' :
                           transaction.status === 'pending' ? '处理中' : '失败'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {transaction.agentUsername}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {transaction.userUsername}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(transaction.createdAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {transaction.type === 'usdt' && transaction.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleConfirmTransaction(transaction.id, true)}
                              className="text-green-600 hover:text-green-900 mr-4"
                            >
                              确认到账
                            </button>
                            <button
                              onClick={() => handleConfirmTransaction(transaction.id, false)}
                              className="text-red-600 hover:text-red-900"
                            >
                              未到账
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 网站设置面板 */}
        {activeTab === 'settings' && (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">网站设置</h2>
            <form onSubmit={handleUpdateSiteConfig} className="space-y-6">
              <div>
                <h3 className="text-md font-medium text-gray-900 mb-2">客服设置</h3>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      客服链接
                    </label>
                    <input
                      type="text"
                      value={siteConfig.customerService.url}
                      onChange={(e) =>
                        setSiteConfig({
                          ...siteConfig,
                          customerService: {
                            ...siteConfig.customerService,
                            url: e.target.value
                          }
                        })
                      }
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      客服ID
                    </label>
                    <input
                      type="text"
                      value={siteConfig.customerService.id}
                      onChange={(e) =>
                        setSiteConfig({
                          ...siteConfig,
                          customerService: {
                            ...siteConfig.customerService,
                            id: e.target.value
                          }
                        })
                      }
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-md font-medium text-gray-900 mb-2">USDT汇率设置</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    USDT汇率 (1 USDT = ? CNY)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={siteConfig.usdtRate}
                    onChange={(e) =>
                      setSiteConfig({
                        ...siteConfig,
                        usdtRate: parseFloat(e.target.value)
                      })
                    }
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  保存设置
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
} 