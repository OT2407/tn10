"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logInfo = logInfo;
exports.logWarn = logWarn;
exports.logError = logError;
function write(level, message, meta) {
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
function logInfo(message, meta) {
    write('info', message, meta);
}
function logWarn(message, meta) {
    write('warn', message, meta);
}
function logError(message, meta) {
    write('error', message, meta);
}
//# sourceMappingURL=logger.js.map