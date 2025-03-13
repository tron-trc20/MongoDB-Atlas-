#!/bin/bash

# 检查是否安装了必要的软件
command -v node >/dev/null 2>&1 || { echo "需要安装 Node.js"; exit 1; }
command -v npm >/dev/null 2>&1 || { echo "需要安装 npm"; exit 1; }
command -v pm2 >/dev/null 2>&1 || { echo "正在安装 pm2..."; npm install -g pm2; }

# 读取配置文件
CONFIG_FILE="config.json"
if [ ! -f "$CONFIG_FILE" ]; then
    echo "错误: 找不到配置文件 $CONFIG_FILE"
    exit 1
fi

# 安装依赖
echo "正在安装项目依赖..."
npm install

# 构建项目
echo "正在构建项目..."
npm run build

# 使用pm2启动服务
echo "正在启动服务..."
pm2 delete red-packet-platform >/dev/null 2>&1
pm2 start npm --name "red-packet-platform" -- start

# 设置开机自启
pm2 save
pm2 startup

echo "部署完成！"
echo "您可以通过以下命令管理服务："
echo "- 查看状态：pm2 status"
echo "- 查看日志：pm2 logs"
echo "- 重启服务：pm2 restart red-packet-platform"
echo "- 停止服务：pm2 stop red-packet-platform" 