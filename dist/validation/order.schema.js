"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateOrderPaymentIntentSchema = exports.CreateOrderSchema = void 0;
const zod_1 = require("zod");
exports.CreateOrderSchema = zod_1.z.object({
    sellerId: zod_1.z.string().min(1),
    itemId: zod_1.z.string().min(1),
    amount: zod_1.z.number().int().positive(),
    paymentWithWallet: zod_1.z
        .object({
        amount: zod_1.z.number().int().positive(),
    })
        .optional(),
});
exports.CreateOrderPaymentIntentSchema = zod_1.z.object({
    currency: zod_1.z.string().min(3).max(3).default('TRY'),
});
//# sourceMappingURL=order.schema.js.map