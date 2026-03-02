import express from 'express';
import { Server } from 'node:http';
import cors from 'cors';
import router from './routes';
import { errorHandler } from './middleware/error';
import { ensureSqliteSchema, verifySqliteSchema } from '../infrastructure/schema/bootstrap';
import { requestIdMiddleware } from './middleware/requestId';
import { apiRateLimiter } from './middleware/rateLimit';
import { validateRequiredEnv, getEnv } from '../infrastructure/env';
import { logError, logInfo } from '../infrastructure/logger';
import { disconnectPrisma, prisma } from '../infrastructure/prisma';

const app = express();
app.use(express.json());
app.use(requestIdMiddleware);
app.use(apiRateLimiter);

const corsOrigin = getEnv().CORS_ORIGIN;
app.use(
  cors({
    origin: corsOrigin === '*' ? true : corsOrigin.split(',').map((origin) => origin.trim()),
  })
);

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.get('/ready', async (_req, res, next) => {
  try {
    await prisma.$queryRawUnsafe('SELECT 1');
    res.status(200).json({ status: 'ok' });
  } catch (error) {
    next(error);
  }
});

app.use('/api', router);
app.use(errorHandler);

const port = getEnv().PORT;
let server: Server | null = null;
let isShuttingDown = false;

function shutdown(signal: string): void {
  if (isShuttingDown) {
    return;
  }
  isShuttingDown = true;

  const finalize = async (exitCode: number): Promise<void> => {
    try {
      await disconnectPrisma();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown prisma disconnect error';
      logError('Prisma disconnect failed', { signal, message });
    }
    process.exit(exitCode);
  };

  if (!server) {
    void finalize(0);
    return;
  }

  server.close((error?: Error) => {
    if (error) {
      logError('Server shutdown error', { signal, message: error.message });
      void finalize(1);
      return;
    }
    logInfo('Server shutdown complete', { signal });
    void finalize(0);
  });

  setTimeout(() => {
    void finalize(1);
  }, 10000).unref();
}

async function startServer(): Promise<void> {
  validateRequiredEnv();
  await ensureSqliteSchema();
  const verification = await verifySqliteSchema();
  if (!verification.ok) {
    const missingParts = [...verification.missingTables, ...verification.missingColumns];
    throw new Error(`Schema verification failed: missing ${missingParts.join(', ')}`);
  }

  server = app.listen(port, () => {
    logInfo('Server started', { port });
  });

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

if (require.main === module) {
  startServer().catch((error: unknown) => {
    const message = error instanceof Error ? error.message : 'Unknown startup failure';
    logError('Server startup failed', { message });
    process.exit(1);
  });
}

export default app;
