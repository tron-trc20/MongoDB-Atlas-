import CryptoJS from 'crypto-js';

const HASH_SALT = '9c4e2f8a1d7b';
const ADMIN_PATH_KEY = 'f3a1b8c9d7e6';

export function verifyAdminPath(path: string): boolean {
  try {
    const hash = CryptoJS.SHA256(path + ADMIN_PATH_KEY).toString();
    return hash.startsWith('0000');
  } catch (error) {
    return false;
  }
}

export function encryptData(data: any, key: string): string {
  return CryptoJS.AES.encrypt(JSON.stringify(data), key).toString();
}

export function decryptData(encrypted: string, key: string): any {
  const bytes = CryptoJS.AES.decrypt(encrypted, key);
  return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
} 