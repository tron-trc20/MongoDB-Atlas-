import fs from 'fs/promises';
import path from 'path';

export async function ensureDataFile(filePath: string, defaultContent: any) {
  const dataDir = path.dirname(filePath);
  await fs.mkdir(dataDir, { recursive: true });
  
  try {
    await fs.access(filePath);
  } catch {
    await fs.writeFile(filePath, JSON.stringify(defaultContent, null, 2));
  }
} 