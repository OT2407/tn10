export type LogLevel = 'info' | 'warn' | 'error';
interface LogMeta {
    requestId?: string;
    errorCode?: string;
    [key: string]: unknown;
}
export declare function logInfo(message: string, meta?: LogMeta): void;
export declare function logWarn(message: string, meta?: LogMeta): void;
export declare function logError(message: string, meta?: LogMeta): void;
export {};
//# sourceMappingURL=logger.d.ts.map