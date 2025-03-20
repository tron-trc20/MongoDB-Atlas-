# 红包平台部署指南

## 系统要求

- Node.js 18.x 或更高版本
- MongoDB 4.x 或更高版本
- PM2 (全局安装)

## 一键部署步骤

1. 将项目文件上传到服务器

```bash
git clone https://github.com/your-username/red-packet-platform.git
cd red-packet-platform
```

2. 赋予部署脚本执行权限

```bash
chmod +x deploy.sh
```

3. 运行部署脚本

```bash
./deploy.sh
```

部署脚本会自动：
- 检查并安装必要的系统依赖
- 配置环境变量
- 安装项目依赖
- 构建项目
- 启动服务

## 手动配置（如需要）

1. 修改配置文件 `deploy.config.js`
2. 修改环境变量文件 `.env.local`

## 常用命令

```bash
# 查看服务状态
pm2 status

# 查看日志
pm2 logs red-packet-platform

# 重启服务
pm2 restart red-packet-platform

# 停止服务
pm2 stop red-packet-platform
```

## 目录结构

```
red-packet-platform/
├── app/                # 主应用代码
├── public/            # 静态资源
├── deploy.config.js   # 部署配置
├── deploy.sh          # 部署脚本
├── package.json       # 项目依赖
└── README.md          # 说明文档
```

## 注意事项

1. 确保服务器防火墙允许应用端口访问
2. 建议使用 HTTPS 协议（需要配置 SSL 证书）
3. 定期备份数据库
4. 及时更新系统安全补丁

## 常见问题

1. 如果遇到权限问题，请使用 sudo 运行部署脚本
2. 如果端口被占用，可以在部署时选择其他端口
3. 如果服务无法启动，请检查日志：`pm2 logs`

## 技术支持

如有问题，请联系技术支持。 