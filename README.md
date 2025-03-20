# 返现网站

这是一个基于Next.js和MongoDB的返现网站项目。

## 功能特点

- 用户注册和登录
- 红包创建和领取
- 订单管理
- 系统配置管理

## 技术栈

- Next.js 14
- React 18
- MongoDB Atlas
- TypeScript
- TailwindCSS

## 本地开发

1. 克隆项目
```bash
git clone https://github.com/yourusername/red-packet-website.git
cd red-packet-website
```

2. 安装依赖
```bash
npm install
```

3. 配置环境变量
```bash
cp .env.example .env.local
# 编辑 .env.local 文件，填入必要的环境变量
```

4. 启动开发服务器
```bash
npm run dev
```

## 部署

本项目使用Render进行部署。部署步骤：

1. 在Render上创建新的Web Service
2. 连接GitHub仓库
3. 配置环境变量
4. 设置构建命令：`npm run build`
5. 设置启动命令：`npm start`

## 环境变量

- `MONGODB_URI`: MongoDB连接字符串
- `JWT_SECRET`: JWT密钥
- `NEXTAUTH_URL`: NextAuth.js的URL
- `NEXTAUTH_SECRET`: NextAuth.js的密钥

## 许可证

MIT 