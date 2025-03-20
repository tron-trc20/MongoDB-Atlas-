module.exports = {
  // 部署配置
  app: {
    name: 'red-packet-platform', // 应用名称
    port: 3000, // 应用端口
  },

  // 默认配置
  default: {
    host: 'localhost', // 默认主机
    protocol: 'http', // 默认协议
  },

  // 数据库配置
  database: {
    host: 'localhost',
    port: 27017,
    name: 'red_packet_db'
  },

  // API配置
  api: {
    prefix: '/api',
  },

  // 支付配置
  payment: {
    usdt: {
      address: 'TNE7mTdTQmYgy8ZgsxUkYeYVH6BnjKFzAU', // USDT收款地址
      network: 'TRC20' // 网络类型
    }
  }
}; 