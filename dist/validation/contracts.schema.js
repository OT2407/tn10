"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentIntentPlaceholderSchema = exports.EscrowTransitionSchema = void 0;
const zod_1 = require("zod");
exports.EscrowTransitionSchema = zod_1.z.object({
    currentStatus: zod_1.z.enum(['PENDING', 'HOLDING', 'RELEASED', 'CANCELLED']),
    event: zod_1.z.enum(['HOLD', 'RELEASE', 'CANCEL']),
});
exports.PaymentIntentPlaceholderSchema = zod_1.z.object({
    transactionId: zod_1.z.string().min(1),
    amount: zod_1.z.number().int().positive(),
    currency: zod_1.z.string().min(3).max(3).default('TRY'),
    requestId: zod_1.z.string().min(1).optional(),
});
//# sourceMappingURL=contracts.schema.js.map