import 'server-only';
import { prisma } from '@/lib/prisma';

/**
 * Health check utility to verify database connectivity.
 */
export async function checkDatabaseConnection(): Promise<{ connected: boolean; latencyMs?: number; error?: string }> {
  const start = Date.now();
  try {
    // Ping PostgreSQL using a light raw query
    await prisma.$queryRaw`SELECT 1`;
    return {
      connected: true,
      latencyMs: Date.now() - start,
    };
  } catch (error) {
    return {
      connected: false,
      error: error instanceof Error ? error.message : 'Unknown database error',
    };
  }
}

/**
 * Safe database transaction helper with typed execution.
 */
export async function executeTransaction<T>(
  action: (tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0]) => Promise<T>
): Promise<T> {
  return prisma.$transaction(async (tx) => {
    return await action(tx);
  });
}
