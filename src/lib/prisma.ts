import 'server-only';
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  isDbOffline?: boolean;
  lastDbProbe?: number;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['error'],
  });

globalForPrisma.prisma = prisma;

export function isDatabaseKnownOffline(): boolean {
  if (globalForPrisma.isDbOffline) {
    if (Date.now() - (globalForPrisma.lastDbProbe || 0) < 30000) {
      return true;
    }
  }
  return false;
}

export function markDatabaseOffline() {
  globalForPrisma.isDbOffline = true;
  globalForPrisma.lastDbProbe = Date.now();
}

export function markDatabaseOnline() {
  globalForPrisma.isDbOffline = false;
  globalForPrisma.lastDbProbe = Date.now();
}

// Process level resilience - prevent unhandled rejections or connection drops from crashing the server
if (typeof process !== 'undefined') {
  process.on('unhandledRejection', (reason) => {
    markDatabaseOffline();
    const msg = String(reason);
    if (!msg.includes("Can't reach database server")) {
      console.warn('Recovered from unhandled rejection:', msg);
    }
  });
}

export default prisma;
