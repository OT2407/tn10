export type LogLevel = 'info' | 'warn' | 'error';

interface LogMeta {
  requestId?: string;
  errorCode?: string;
  [key: string]: unknown;
}

function write(level: LogLevel, message: string, meta?: LogMeta): void {
  const payload = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...(meta ?? {}),
  };

  const serialized = JSON.stringify(payload);
  if (level === 'error') {
    process.stderr.write(`${serialized}\n`);
    return;
  }
  process.stdout.write(`${serialized}\n`);
}

export function logInfo(message: string, meta?: LogMeta): void {
  write('info', message, meta);
}

export function logWarn(message: string, meta?: LogMeta): void {
  write('warn', message, meta);
}

export function logError(message: string, meta?: LogMeta): void {
  write('error', message, meta);
}
