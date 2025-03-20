import { NextResponse } from 'next/server';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { verifyToken } from '@/app/utils/auth';

export async function POST(request: Request) {
  try {
    // 验证管理员权限
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ success: false, message: '未授权' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const isValid = verifyToken(token);
    if (!isValid) {
      return NextResponse.json({ success: false, message: '未授权' }, { status: 401 });
    }

    // 获取请求数据
    const data = await request.json();
    const { customerService, usdtRate } = data;

    // 验证数据
    if (!customerService || !customerService.url || !customerService.id || !usdtRate) {
      return NextResponse.json({ success: false, message: '参数不完整' }, { status: 400 });
    }

    // 读取现有配置
    const configPath = join(process.cwd(), 'config.json');
    const currentConfig = JSON.parse(readFileSync(configPath, 'utf8'));

    // 更新配置
    const newConfig = {
      ...currentConfig,
      customerService,
      usdtRate
    };

    // 保存配置
    writeFileSync(configPath, JSON.stringify(newConfig, null, 2));

    return NextResponse.json({ success: true, message: '配置更新成功' });
  } catch (error) {
    console.error('更新站点配置失败:', error);
    return NextResponse.json(
      { success: false, message: '更新站点配置失败' },
      { status: 500 }
    );
  }
} 