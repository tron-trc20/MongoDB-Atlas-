import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { nanoid } from 'nanoid';
import connectDb from '@/utils/connectDb';

// 导入模型
const Agent = require('@/models/Agent');
const SiteConfig = require('@/models/SiteConfig');

// 确保API路由动态运行
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    // 连接数据库
    await connectDb();

    // 初始化SiteConfig
    try {
      // 获取或创建站点配置
      const config = await SiteConfig.getConfig();
      console.log('初始化站点配置成功:', config);
    } catch (err) {
      console.error('初始化站点配置失败:', err);
    }

    // 创建管理员账户
    let admin = await Agent.findAgentByUsername('admin');
    
    if (!admin) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      // 创建管理员
      admin = await Agent.createAgent({
        id: 'admin',
        username: 'admin',
        password: hashedPassword,
        level: 1,
        status: 'active',
        source: 'admin',
        commissionRate: 100,
        createdAt: new Date(),
        inviteCode: nanoid(8),
        siteConfig: {
          usdt: {
            address: 'USDT地址示例',
            qrcode: 'USDT二维码链接'
          },
          alipay: {
            name: '管理员收款姓名',
            account: '管理员支付宝账号',
            qrcode: '管理员支付宝二维码'
          },
          customerService: {
            url: 'https://t.me/Juyy2',
            id: '@juyy21'
          }
        }
      });
      
      console.log('创建管理员成功:', admin);
    } else {
      console.log('管理员已存在，跳过创建');
    }

    // 创建测试2级代理账户
    let agent1 = await Agent.findAgentByUsername('agent1');
    
    if (!agent1) {
      const hashedPassword = await bcrypt.hash('123456', 10);
      
      // 创建2级代理
      agent1 = await Agent.createAgent({
        id: nanoid(),
        username: 'agent1',
        password: hashedPassword,
        level: 2,
        status: 'active',
        source: 'admin',
        commissionRate: 50,
        createdAt: new Date(),
        inviteCode: nanoid(8),
        parentId: 'admin',
        siteConfig: admin.siteConfig
      });
      
      console.log('创建测试2级代理成功:', agent1);
    } else {
      console.log('测试2级代理已存在，跳过创建');
    }

    // 返回初始化结果
    const agents = await Agent.getAllAgents();
    return NextResponse.json({
      success: true,
      message: '系统初始化成功',
      data: {
        agents: agents.map(agent => {
          const data = agent.toObject();
          delete data.password;
          return data;
        })
      }
    });
  } catch (error) {
    console.error('初始化系统错误:', error);
    return NextResponse.json(
      { success: false, message: '初始化系统失败' },
      { status: 500 }
    );
  }
} 