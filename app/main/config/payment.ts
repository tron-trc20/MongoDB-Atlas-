export interface PaymentConfig {
  apiEndpoint: string;
  merchantId: string;
  secretKey: string;
  notifyUrl: string;
}

export interface PaymentSystems {
  redPacket: PaymentConfig;  // 支付宝口令红包支付系统
  usdt: PaymentConfig;       // USDT代购支付系统
}

// 主站点支付系统配置
export const mainPaymentConfig: PaymentSystems = {
  // 支付宝口令红包支付系统
  redPacket: {
    apiEndpoint: 'https://api.mainsite.com/redpacket/payment',
    merchantId: 'MAIN_REDPACKET_MERCHANT_ID',
    secretKey: 'MAIN_REDPACKET_SECRET_KEY',
    notifyUrl: 'https://example.com/api/payment/redpacket/notify'
  },
  // USDT代购支付系统
  usdt: {
    apiEndpoint: 'https://api.mainsite.com/usdt/payment',
    merchantId: 'MAIN_USDT_MERCHANT_ID',
    secretKey: 'MAIN_USDT_SECRET_KEY',
    notifyUrl: 'https://example.com/api/payment/usdt/notify'
  }
}; 