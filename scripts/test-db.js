const { SocksProxyAgent } = require('socks-proxy-agent');
const { MongoClient } = require('mongodb');
const tls = require('tls');

const proxyUrl = 'socks5://127.0.0.1:7890';
const agent = new SocksProxyAgent(proxyUrl);

// 在Node.js的TLS模块上设置全局代理
tls.connect = new Proxy(tls.connect, {
  apply: (target, thisArg, args) => {
    if (args[0]?.host?.includes('mongodb.net')) {
      args[0].agent = agent;
    }
    return target.apply(thisArg, args);
  }
});

// 使用直接连接而非SRV记录
const uri = "mongodb://panzer:DOOVc93kEDQKT7kL@cluster0-shard-00-00.28fll.mongodb.net:27017,cluster0-shard-00-01.28fll.mongodb.net:27017,cluster0-shard-00-02.28fll.mongodb.net:27017/red_packet_db?ssl=true&replicaSet=atlas-nf63t1-shard-0&authSource=admin&retryWrites=true&w=majority&appName=Cluster0";

async function testConnection() {
  try {
    const client = await MongoClient.connect(uri, {
      tls: true,
      tlsAllowInvalidCertificates: true
    });
    
    console.log('成功连接到MongoDB Atlas!');
    const db = client.db('red_packet_db');
    const collections = await db.listCollections().toArray();
    console.log('数据库中的集合:', collections);
    
    await client.close();
  } catch (error) {
    console.error('连接错误:', error);
  }
}

testConnection(); 