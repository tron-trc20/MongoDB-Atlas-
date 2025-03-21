import { NextResponse } from "next/server";
import { verifyToken, isAdmin } from "@/app/utils/auth";
import connectDb from "@/utils/connectDb";
import Agent from "@/models/Agent";

export const dynamic = "force-dynamic";

export async function GET(req) {
  try {
    // 验证管理员权限
    const token = req.headers.get("authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json({ success: false, message: "未授权访问" }, { status: 401 });
    }

    const decoded = await verifyToken(token);
    if (!decoded || !isAdmin(decoded)) {
      return NextResponse.json({ success: false, message: "无管理员权限" }, { status: 403 });
    }

    // 连接数据库
    await connectDb();

    // 获取所有代理数据
    const agents = await Agent.find({}).select("-password");

    return NextResponse.json({ 
      success: true, 
      data: agents 
    });
  } catch (error) {
    console.error("获取代理列表失败:", error);
    return NextResponse.json({ success: false, message: "获取数据失败" }, { status: 500 });
  }
} 