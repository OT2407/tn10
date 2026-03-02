"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signAccessToken = signAccessToken;
exports.authMiddleware = authMiddleware;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const errors_1 = require("../../application/errors");
const env_1 = require("../../infrastructure/env");
const userService_1 = require("../../services/userService");
function signAccessToken(userId) {
    const env = (0, env_1.getEnv)();
    return jsonwebtoken_1.default.sign({ sub: userId }, env.JWT_SECRET, {
        algorithm: 'HS256',
        expiresIn: '1h',
    });
}
async function authMiddleware(req, res, next) {
    const authHeader = req.header('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next(new errors_1.AppError(401, 'UNAUTHORIZED', 'Missing or invalid authorization token'));
    }
    const token = authHeader.slice('Bearer '.length).trim();
    if (token.length === 0) {
        return next(new errors_1.AppError(401, 'UNAUTHORIZED', 'Missing or invalid authorization token'));
    }
    try {
        const env = (0, env_1.getEnv)();
        const payload = jsonwebtoken_1.default.verify(token, env.JWT_SECRET);
        res.locals.userId = payload.sub;
        const user = await (0, userService_1.getUserById)(payload.sub);
        res.locals.userRole = user?.role ?? 'user';
        next();
    }
    catch {
        next(new errors_1.AppError(401, 'UNAUTHORIZED', 'Invalid token'));
    }
}
//# sourceMappingURL=auth.js.map