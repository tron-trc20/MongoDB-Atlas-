import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: { username: string } }
) {
  try {
    const { username } = params;
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    if (!type) {
      return NextResponse.json({
        success: false,
        message: '缺少类型参数'
      }, { status: 400 });
    }

    const configPath = path.join(process.cwd(), 'app', 'agents', username, type, 'config.json');

    if (!fs.existsSync(configPath)) {
      return NextResponse.json({
        success: false,
        message: '配置文件不存在'
      }, { status: 404 });
    }

    const configData = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

    return NextResponse.json({
      success: true,
      data: configData
    });
  } catch (error: any) {
    console.error('Error reading config:', error);
    return NextResponse.json({
      success: false,
      message: error.message || '获取配置失败'
    }, { status: 500 });
  }
} 