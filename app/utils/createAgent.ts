import fs from 'fs';
import path from 'path';
import { PaymentConfig } from '@/app/main/config/payment';

interface AgentConfig {
  id: string;
  name: string;
  domain: string;
  customerService: {
    url: string;
    id: string;
  };
  payment: {
    redPacket: PaymentConfig;  // 支付宝口令红包支付系统
    usdt: PaymentConfig;       // USDT代购支付系统
  };
}

export async function createAgent(config: AgentConfig) {
  const agentDir = path.join(process.cwd(), 'app', 'agents', config.id);

  try {
    // 创建代理目录结构
    const directories = [
      agentDir,
      path.join(agentDir, 'config'),
      path.join(agentDir, 'agents'),
      path.join(agentDir, 'zfb'),
      path.join(agentDir, 'usdt'),
      path.join(agentDir, 'payment')
    ];

    for (const dir of directories) {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    }

    // 创建站点配置文件
    const siteConfig = `
import { SiteConfig } from '@/app/main/config/site';

export const agentSiteConfig: SiteConfig = {
  customerService: {
    url: '${config.customerService.url}',
    id: '${config.customerService.id}'
  },
  name: '${config.name}',
  domain: '${config.domain}'
};`;

    fs.writeFileSync(
      path.join(agentDir, 'config', 'site.ts'),
      siteConfig.trim()
    );

    // 创建支付系统配置文件
    const paymentConfig = `
import { PaymentSystems } from '@/app/main/config/payment';

export const agentPaymentConfig: PaymentSystems = {
  // 支付宝口令红包支付系统
  redPacket: {
    apiEndpoint: '${config.payment.redPacket.apiEndpoint}',
    merchantId: '${config.payment.redPacket.merchantId}',
    secretKey: '${config.payment.redPacket.secretKey}',
    notifyUrl: '${config.payment.redPacket.notifyUrl}'
  },
  // USDT代购支付系统
  usdt: {
    apiEndpoint: '${config.payment.usdt.apiEndpoint}',
    merchantId: '${config.payment.usdt.merchantId}',
    secretKey: '${config.payment.usdt.secretKey}',
    notifyUrl: '${config.payment.usdt.notifyUrl}'
  }
};`;

    fs.writeFileSync(
      path.join(agentDir, 'config', 'payment.ts'),
      paymentConfig.trim()
    );

    // 复制模板文件
    const templateDir = path.join(process.cwd(), 'app', 'agents', 'template');
    const filesToCopy = [
      { from: 'zfb/page.tsx', to: 'zfb/page.tsx' },
      { from: 'usdt/page.tsx', to: 'usdt/page.tsx' },
      { from: 'payment/page.tsx', to: 'payment/page.tsx' }
    ];

    for (const file of filesToCopy) {
      if (fs.existsSync(path.join(templateDir, file.from))) {
        fs.copyFileSync(
          path.join(templateDir, file.from),
          path.join(agentDir, file.to)
        );
      }
    }

    return { success: true };
  } catch (error) {
    console.error('Error creating agent:', error);
    return { success: false, error };
  }
} 