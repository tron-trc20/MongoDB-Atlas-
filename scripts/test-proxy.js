const { SocksProxyAgent } = require('socks-proxy-agent');
const https = require('https');

console.log('测试代理连接到github.com...');
const proxyUrl = 'socks5://127.0.0.1:7890';
const agent = new SocksProxyAgent(proxyUrl);

https.get('https://api.github.com/users/octocat', {
  agent,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3'
  }
}, (res) => {
  console.log('状态码:', res.statusCode);
  console.log('响应头:', res.headers);

  res.on('data', (chunk) => {
    console.log(`响应数据: ${chunk}`);
  });

  res.on('end', () => {
    console.log('响应结束');
  });

}).on('error', (e) => {
  console.error(`请求遇到问题: ${e.message}`);
}); 