import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('请在环境变量中设置 MONGODB_URI');
}

let isConnected = false;

export default async function connectDb() {
  if (isConnected) {
    console.log('使用现有的数据库连接');
    return;
  }

  try {
    console.log('正在连接MongoDB...');
    console.log('MongoDB URI:', MONGODB_URI.replace(/\/\/[^:]+:[^@]+@/, '//****:****@')); // 安全地打印URI
    
    const db = await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // 超时时间
      socketTimeoutMS: 45000, // Socket超时
    });

    isConnected = db.connections[0].readyState === 1;
    
    if (isConnected) {
      console.log('MongoDB连接成功!');
      console.log('数据库名称:', db.connection.db.databaseName);
      console.log('连接状态:', db.connection.readyState);
    } else {
      console.error('MongoDB连接失败：连接状态异常');
      throw new Error('MongoDB连接失败：连接状态异常');
    }
  } catch (error) {
    console.error('MongoDB连接失败：', error);
    isConnected = false;
    throw error;
  }

  mongoose.connection.on('error', (err) => {
    console.error('MongoDB连接错误：', err);
    isConnected = false;
  });

  mongoose.connection.on('disconnected', () => {
    console.log('MongoDB连接断开');
    isConnected = false;
  });
} 