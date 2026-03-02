"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = __importStar(require("node:test"));
const strict_1 = __importDefault(require("node:assert/strict"));
const prisma_1 = require("../../infrastructure/prisma");
const bootstrap_1 = require("../../infrastructure/schema/bootstrap");
const transaction_usecase_1 = require("../../application/transaction.usecase");
(0, node_test_1.beforeEach)(async () => {
    await (0, bootstrap_1.ensureSqliteSchema)();
    await prisma_1.prisma.message.deleteMany();
    await prisma_1.prisma.conversation.deleteMany();
    await prisma_1.prisma.review.deleteMany();
    await prisma_1.prisma.itemTag.deleteMany();
    await prisma_1.prisma.tag.deleteMany();
    await prisma_1.prisma.collaborationMember.deleteMany();
    await prisma_1.prisma.collaboration.deleteMany();
    await prisma_1.prisma.brand.deleteMany();
    await prisma_1.prisma.rankingTelemetry.deleteMany();
    await prisma_1.prisma.like.deleteMany();
    await prisma_1.prisma.save.deleteMany();
    await prisma_1.prisma.follow.deleteMany();
    await prisma_1.prisma.userPreference.deleteMany();
    await prisma_1.prisma.paymentIntent.deleteMany();
    await prisma_1.prisma.order.deleteMany();
    await prisma_1.prisma.contract.deleteMany();
    await prisma_1.prisma.escrowMilestone.deleteMany();
    await prisma_1.prisma.escrow.deleteMany();
    await prisma_1.prisma.transaction.deleteMany();
    await prisma_1.prisma.freeze.deleteMany();
    await prisma_1.prisma.item.deleteMany();
    await prisma_1.prisma.walletTransaction.deleteMany();
    await prisma_1.prisma.wallet.deleteMany();
    await prisma_1.prisma.user.deleteMany();
});
async function seedUsersAndItem() {
    const buyer = await prisma_1.prisma.user.create({
        data: {
            email: 'buyer@test.local',
            password: 'hashed-buyer',
            role: 'user',
        },
    });
    const seller = await prisma_1.prisma.user.create({
        data: {
            email: 'seller@test.local',
            password: 'hashed-seller',
            role: 'user',
        },
    });
    const item = await prisma_1.prisma.item.create({
        data: {
            name: 'Transaction Item',
            ownerId: seller.id,
        },
    });
    return { buyer, seller, item };
}
(0, node_test_1.default)('createTransaction creates pending transaction', async () => {
    const { buyer, seller, item } = await seedUsersAndItem();
    const tx = await (0, transaction_usecase_1.createTransaction)({
        buyerId: buyer.id,
        sellerId: seller.id,
        itemId: item.id,
        amount: 100,
    });
    strict_1.default.equal(tx.status, 'pending');
    strict_1.default.equal(tx.amount, 100);
    strict_1.default.equal(tx.buyerId, buyer.id);
    strict_1.default.equal(tx.sellerId, seller.id);
    strict_1.default.equal(tx.itemId, item.id);
});
(0, node_test_1.default)('completeTransaction moves pending to completed', async () => {
    const { buyer, seller, item } = await seedUsersAndItem();
    const tx = await (0, transaction_usecase_1.createTransaction)({
        buyerId: buyer.id,
        sellerId: seller.id,
        itemId: item.id,
        amount: 200,
    });
    const completed = await (0, transaction_usecase_1.completeTransaction)(tx.id);
    strict_1.default.equal(completed.status, 'completed');
});
(0, node_test_1.default)('cancelTransaction moves pending to cancelled', async () => {
    const { buyer, seller, item } = await seedUsersAndItem();
    const tx = await (0, transaction_usecase_1.createTransaction)({
        buyerId: buyer.id,
        sellerId: seller.id,
        itemId: item.id,
        amount: 300,
    });
    const cancelled = await (0, transaction_usecase_1.cancelTransaction)(tx.id);
    strict_1.default.equal(cancelled.status, 'cancelled');
});
(0, node_test_1.default)('cancelTransaction rejects completed transaction', async () => {
    const { buyer, seller, item } = await seedUsersAndItem();
    const tx = await (0, transaction_usecase_1.createTransaction)({
        buyerId: buyer.id,
        sellerId: seller.id,
        itemId: item.id,
        amount: 400,
    });
    await (0, transaction_usecase_1.completeTransaction)(tx.id);
    await strict_1.default.rejects(async () => (0, transaction_usecase_1.cancelTransaction)(tx.id), (error) => {
        if (!(error instanceof Error)) {
            return false;
        }
        return error.message === 'Completed transaction cannot be cancelled';
    });
});
(0, node_test_1.default)('completeTransaction rejects cancelled transaction', async () => {
    const { buyer, seller, item } = await seedUsersAndItem();
    const tx = await (0, transaction_usecase_1.createTransaction)({
        buyerId: buyer.id,
        sellerId: seller.id,
        itemId: item.id,
        amount: 500,
    });
    await (0, transaction_usecase_1.cancelTransaction)(tx.id);
    await strict_1.default.rejects(async () => (0, transaction_usecase_1.completeTransaction)(tx.id), (error) => {
        if (!(error instanceof Error)) {
            return false;
        }
        return error.message === 'Cancelled transaction cannot be completed';
    });
});
//# sourceMappingURL=transaction.lifecycle.test.js.map