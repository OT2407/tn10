"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestIdMiddleware = requestIdMiddleware;
const node_crypto_1 = require("node:crypto");
function requestIdMiddleware(req, res, next) {
    const rawRequestId = req.header('x-request-id');
    const requestId = typeof rawRequestId === 'string' && rawRequestId.length > 0 ? rawRequestId : (0, node_crypto_1.randomUUID)();
    res.setHeader('x-request-id', requestId);
    next();
}
//# sourceMappingURL=requestId.js.map