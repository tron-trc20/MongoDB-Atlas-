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
    const db = await mongoose.connect(MONGODB_URI);
    isConnected = db.connections[0].readyState === 1;
    console.log('MongoDB连接成功!');
  } catch (error) {
    console.error('MongoDB连接失败：', error);
    isConnected = false;
    throw error;
  }
} 