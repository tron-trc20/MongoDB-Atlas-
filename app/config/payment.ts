export const PAYMENT_CONFIG = {
  redPacket: {
    apiEndpoint: '/api/payment/redpacket',
    notifyUrl: '/api/payment/notify/redpacket',
    merchantId: 'RP_MERCHANT_001'
  },
  usdt: {
    apiEndpoint: '/api/payment/usdt',
    notifyUrl: '/api/payment/notify/usdt',
    merchantId: 'USDT_MERCHANT_001'
  }
}; 