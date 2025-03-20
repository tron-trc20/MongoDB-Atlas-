export interface PaymentSystem {
  apiEndpoint: string;  // 支付系统API地址
  merchantId: string;   // 商户ID
  secretKey: string;    // 密钥
  notifyUrl: string;    // 回调通知地址
}

export interface SiteConfig {
  address: string;  // USDT收款地址
  qrcode: string;  // 二维码Base64或URL
  customerService: {
    url: string;
    id: string;
  };
  paymentSystem?: PaymentSystem;  // 一级代理的独立支付系统配置
}

// 代理等级对应的默认佣金率
export const DEFAULT_COMMISSION_RATES = {
  2: 50, // 50%
  3: 20, // 20%
  4: 10  // 10%
};

// 代理状态
export type AgentStatus = 'active' | 'disabled';

// 代理来源
export type AgentSource = 'admin' | 'agent';

// 代理信息
export interface Agent {
  id: string;
  username: string;
  password: string;
  level: 1 | 2 | 3 | 4;
  status: AgentStatus;
  source: AgentSource;
  commissionRate: number;
  createdAt: string;
  updatedAt?: string;
  inviteCode?: string;
  siteConfig?: SiteConfig;
  parentId?: string;
}

// 代理配置
export interface AgentConfig {
  username: string;
  level: 1 | 2 | 3 | 4;
  status: AgentStatus;
  commissionRate: number;
  createdAt: string;
}

export interface Transaction {
  id: string;
  amount: number;  // USDT金额
  agentId: string;  // 所属代理ID
  referralAgentId: string;  // 推荐代理ID (通过哪个代理的链接进来的)
  status: 'pending' | 'completed' | 'failed' | 'manual_review';  // 添加人工审核状态
  verificationStatus: {
    customerView: 'pending' | 'not_found' | 'completed';  // 客户端显示状态
    adminView: 'pending' | 'verified' | 'rejected';       // 管理端实际状态
    verifiedBy?: string;  // 验证人ID（代理或管理员）
    verifiedAt?: Date;    // 验证时间
    remarks?: string;     // 备注信息
  };
  createdAt: Date;
  completedAt?: Date;
  txHash?: string;  // 交易哈希
  senderAddress?: string;  // 发送方地址
}

export interface Commission {
  agentId: string;
  transactionId: string;
  amount: number;  // 佣金金额
  level: 1 | 2 | 3 | 4;  // 代理等级
  rate: number;  // 分成比例
  createdAt: Date;
}

// 代理等级对应的分成比例
export const COMMISSION_RATES = {
  1: 1.0,    // 100% (自己的收款)
  2: 0.5,    // 50%
  3: 0.2,    // 20%
  4: 0.1     // 10%
}; 