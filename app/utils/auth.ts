import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

// JWT密钥，应从环境变量获取
const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret-key';

// 生成JWT令牌
export function generateToken(payload: any, expiresIn = '7d') {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

// 验证JWT令牌
export function verifyToken(token: string) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
  } catch (error) {
    console.error('Token验证失败:', error);
    return null;
  }
}

// 哈希密码
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

// 比较密码
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// 从请求头中获取令牌
export function getTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.split(' ')[1];
}

// 验证是否为管理员
export function isAdmin(decoded: any): boolean {
  return decoded && (decoded.username === 'admin' || decoded.role === 'admin');
} 