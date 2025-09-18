import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Attempt to load .env from common locations regardless of ts-node or compiled dist
const candidates = [
  // When running via ts-node from backend/, __dirname will be backend/config
  path.resolve(__dirname, '..', '.env'),
  // When running compiled code from backend/dist, __dirname will be backend/config
  path.resolve(__dirname, '..', 'dist', '.env'),
  // Project root fallback
  path.resolve(process.cwd(), '.env')
];

for (const p of candidates) {
  try {
    if (fs.existsSync(p)) {
      dotenv.config({ path: p });
      // Stop after first successful load
      break;
    }
  } catch {
    // ignore
  }
}
