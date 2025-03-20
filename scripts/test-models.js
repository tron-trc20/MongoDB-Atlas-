const connectDB = require('../lib/db');
const User = require('../models/User');
const RedPacket = require('../models/RedPacket');
const Order = require('../models/Order');
const Config = require('../models/Config');

async function testModels() {
  try {
    await connectDB();
    
    // 测试创建用户
    const user = await User.create({
      username: 'testuser',
      password: 'testpassword',
      telegramId: '123456789',
      balance: 100,
      role: 'user'
    });
    console.log('用户创建成功:', user);

    // 测试创建红包
    const redPacket = await RedPacket.create({
      sender: user._id,
      amount: 100,
      count: 5,
      type: 'alipay',
      remainingAmount: 100,
      remainingCount: 5,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
    });
    console.log('红包创建成功:', redPacket);

    // 测试创建订单
    const order = await Order.create({
      user: user._id,
      redPacket: redPacket._id,
      amount: 20,
      type: 'alipay'
    });
    console.log('订单创建成功:', order);

    // 测试创建配置
    const config = await Config.create({
      key: 'site_name',
      value: '返现网站',
      description: '网站名称'
    });
    console.log('配置创建成功:', config);

    // 清理测试数据
    await User.deleteMany({});
    await RedPacket.deleteMany({});
    await Order.deleteMany({});
    await Config.deleteMany({});
    console.log('测试数据清理完成');

    process.exit(0);
  } catch (error) {
    console.error('测试失败:', error);
    process.exit(1);
  }
}

testModels(); 