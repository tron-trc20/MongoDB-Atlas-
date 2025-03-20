#!/bin/bash

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# 检查是否安装了必要的软件
check_requirements() {
    echo -e "${YELLOW}正在检查系统要求...${NC}"
    
    # 检查 Node.js
    if ! command -v node &> /dev/null; then
        echo -e "${RED}未安装 Node.js${NC}"
        echo "正在安装 Node.js..."
        curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
        sudo apt-get install -y nodejs
    fi
    
    # 检查 PM2
    if ! command -v pm2 &> /dev/null; then
        echo -e "${RED}未安装 PM2${NC}"
        echo "正在安装 PM2..."
        sudo npm install -g pm2
    fi
    
    # 检查 MongoDB
    if ! command -v mongod &> /dev/null; then
        echo -e "${RED}未安装 MongoDB${NC}"
        echo "正在安装 MongoDB..."
        sudo apt-get install -y mongodb
        sudo systemctl start mongodb
        sudo systemctl enable mongodb
    fi
}

# 配置环境
setup_environment() {
    echo -e "${YELLOW}正在配置环境...${NC}"
    
    # 读取用户输入
    read -p "请输入您的域名或公网IP: " DOMAIN
    read -p "请输入要使用的端口号(默认3000): " PORT
    PORT=${PORT:-3000}
    
    # 更新配置文件
    sed -i "s/localhost/$DOMAIN/" deploy.config.js
    sed -i "s/port: 3000/port: $PORT/" deploy.config.js
    
    # 创建环境变量文件
    echo "NEXT_PUBLIC_API_URL=http://$DOMAIN:$PORT/api" > .env.local
    echo "MONGODB_URI=mongodb://localhost:27017/red_packet_db" >> .env.local
}

# 安装依赖
install_dependencies() {
    echo -e "${YELLOW}正在安装项目依赖...${NC}"
    npm install
}

# 构建项目
build_project() {
    echo -e "${YELLOW}正在构建项目...${NC}"
    npm run build
}

# 启动服务
start_service() {
    echo -e "${YELLOW}正在启动服务...${NC}"
    pm2 delete red-packet-platform 2>/dev/null || true
    pm2 start npm --name "red-packet-platform" -- start
    pm2 save
    
    echo -e "${GREEN}部署完成！${NC}"
    echo -e "您可以通过以下地址访问您的应用："
    echo -e "${GREEN}http://$DOMAIN:$PORT${NC}"
}

# 主函数
main() {
    echo "=== 红包平台部署脚本 ==="
    
    check_requirements
    setup_environment
    install_dependencies
    build_project
    start_service
}

# 执行主函数
main 