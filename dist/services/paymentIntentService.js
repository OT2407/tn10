"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPaymentIntentRecord = createPaymentIntentRecord;
const prisma_1 = require("../infrastructure/prisma");
async function createPaymentIntentRecord(input) {
    return prisma_1.prisma.paymentIntent.create({
        data: {
            orderId: input.orderId,
            amount: input.amount,
            currency: input.currency,
            status: input.status,
            provider: input.provider,
            ...(input.externalRef === undefined ? {} : { externalRef: input.externalRef }),
        },
    });
}
//# sourceMappingURL=paymentIntentService.js.map