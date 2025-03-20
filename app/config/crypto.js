// USDT支付相关配置
export const getConfig = () => {
  return {
    address: 'TYQraWpB5VsfuaAKCG6G9GHKnM3hCm5JUt', // TRON网络USDT钱包地址
    network: 'TRC20'
  };
};

// 验证管理路径
export const verifyAdminPath = (path) => {
  // 这里可以添加您的验证逻辑
  return true;
}; 