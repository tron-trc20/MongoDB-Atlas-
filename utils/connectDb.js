import mongoose from 'mongoose';
import { SocksProxyAgent } from 'socks-proxy-agent';
import tls from 'tls';

// MongoDB连接URL，从环境变量获取或使用默认值
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://panzer:DOOVc93kEDQKT7kL@cluster0-shard-00-00.28fll.mongodb.net:27017,cluster0-shard-00-01.28fll.mongodb.net:27017,cluster0-shard-00-02.28fll.mongodb.net:27017/red_packet_db?ssl=true&replicaSet=atlas-nf63t1-shard-0&authSource=admin&retryWrites=true&w=majority&appName=Cluster0";

// 判断是否为开发环境
const isDev = process.env.NODE_ENV === 'development';

if (isDev) {
  // 在开发环境中设置代理
  try {
    const proxyUrl = 'socks5://127.0.0.1:7890';
    const agent = new SocksProxyAgent(proxyUrl);

    // 在Node.js的TLS模块上设置全局代理
    // @ts-ignore - 代理扩展原生API
    tls.connect = new Proxy(tls.connect, {
      apply: (target, thisArg, args) => {
        if (args[0]?.host?.includes('mongodb.net')) {
          args[0].agent = agent;
        }
        return target.apply(thisArg, args);
      }
    });
  } catch (error) {
    console.error('设置代理失败:', error);
  }
}

// 连接选项
const options = {
  tls: true,
  tlsAllowInvalidCertificates: true
};

// 全局变量缓存连接
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDb() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    console.log('正在连接MongoDB...');
    
    cached.promise = mongoose.connect(MONGODB_URI, options)
      .then(mongoose => {
        console.log('MongoDB连接成功!');
        return mongoose;
      })
      .catch(err => {
        console.error('MongoDB连接失败:', err);
        throw err;
      });
  }
  
  cached.conn = await cached.promise;
  return cached.conn;
}

export default connectDb; 