"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalletMutationSchema = exports.WalletDebitBodySchema = exports.WalletCreditBodySchema = exports.WalletAdjustBodySchema = exports.WalletTransactionsQuerySchema = exports.WalletBalanceQuerySchema = exports.WalletParamsSchema = void 0;
const zod_1 = require("zod");
exports.WalletParamsSchema = zod_1.z.object({
    userId: zod_1.z.string().min(1),
});
exports.WalletBalanceQuerySchema = zod_1.z.object({
    userId: zod_1.z.string().min(1),
});
exports.WalletTransactionsQuerySchema = zod_1.z.object({
    cursor: zod_1.z.string().min(1).optional(),
    limit: zod_1.z.coerce.number().int().min(1).max(50).default(10),
});
exports.WalletAdjustBodySchema = zod_1.z.object({
    ownerId: zod_1.z.string().min(1),
    amount: zod_1.z.number().int().positive(),
    type: zod_1.z.enum(['CREDIT', 'DEBIT', 'REFUND']),
    referenceId: zod_1.z.string().min(1).optional(),
});
exports.WalletCreditBodySchema = zod_1.z.object({
    amount: zod_1.z.number().int().positive(),
    reference: zod_1.z.string().min(1),
});
exports.WalletDebitBodySchema = zod_1.z.object({
    amount: zod_1.z.number().int().positive(),
    reference: zod_1.z.string().min(1),
});
// Backward-compatible alias used by existing routes.
exports.WalletMutationSchema = exports.WalletCreditBodySchema;
//# sourceMappingURL=wallet.schema.js.map