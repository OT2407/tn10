"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const routes_1 = __importDefault(require("./routes"));
const error_1 = require("./middleware/error");
const bootstrap_1 = require("../infrastructure/schema/bootstrap");
const requestId_1 = require("./middleware/requestId");
const rateLimit_1 = require("./middleware/rateLimit");
const env_1 = require("../infrastructure/env");
const logger_1 = require("../infrastructure/logger");
const prisma_1 = require("../infrastructure/prisma");
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use(requestId_1.requestIdMiddleware);
app.use(rateLimit_1.apiRateLimiter);
const corsOrigin = (0, env_1.getEnv)().CORS_ORIGIN;
app.use((0, cors_1.default)({
    origin: corsOrigin === '*' ? true : corsOrigin.split(',').map((origin) => origin.trim()),
}));
app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok' });
});
app.get('/ready', async (_req, res, next) => {
    try {
        await prisma_1.prisma.$queryRawUnsafe('SELECT 1');
        res.status(200).json({ status: 'ok' });
    }
    catch (error) {
        next(error);
    }
});
app.use('/api', routes_1.default);
app.use(error_1.errorHandler);
const port = (0, env_1.getEnv)().PORT;
let server = null;
let isShuttingDown = false;
function shutdown(signal) {
    if (isShuttingDown) {
        return;
    }
    isShuttingDown = true;
    const finalize = async (exitCode) => {
        try {
            await (0, prisma_1.disconnectPrisma)();
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown prisma disconnect error';
            (0, logger_1.logError)('Prisma disconnect failed', { signal, message });
        }
        process.exit(exitCode);
    };
    if (!server) {
        void finalize(0);
        return;
    }
    server.close((error) => {
        if (error) {
            (0, logger_1.logError)('Server shutdown error', { signal, message: error.message });
            void finalize(1);
            return;
        }
        (0, logger_1.logInfo)('Server shutdown complete', { signal });
        void finalize(0);
    });
    setTimeout(() => {
        void finalize(1);
    }, 10000).unref();
}
async function startServer() {
    (0, env_1.validateRequiredEnv)();
    await (0, bootstrap_1.ensureSqliteSchema)();
    const verification = await (0, bootstrap_1.verifySqliteSchema)();
    if (!verification.ok) {
        const missingParts = [...verification.missingTables, ...verification.missingColumns];
        throw new Error(`Schema verification failed: missing ${missingParts.join(', ')}`);
    }
    server = app.listen(port, () => {
        (0, logger_1.logInfo)('Server started', { port });
    });
    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
}
if (require.main === module) {
    startServer().catch((error) => {
        const message = error instanceof Error ? error.message : 'Unknown startup failure';
        (0, logger_1.logError)('Server startup failed', { message });
        process.exit(1);
    });
}
exports.default = app;
//# sourceMappingURL=server.js.map