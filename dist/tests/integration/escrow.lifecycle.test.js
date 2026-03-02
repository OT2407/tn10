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
const escrow_usecase_1 = require("../../application/escrow.usecase");
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
            email: 'escrow-buyer@test.local',
            password: 'hashed-buyer',
            role: 'user',
        },
    });
    const seller = await prisma_1.prisma.user.create({
        data: {
            email: 'escrow-seller@test.local',
            password: 'hashed-seller',
            role: 'user',
        },
    });
    const item = await prisma_1.prisma.item.create({
        data: {
            name: 'Escrow Item',
            ownerId: seller.id,
        },
    });
    return { buyer, seller, item };
}
(0, node_test_1.default)('escrow creation stores pending escrow for transaction', async () => {
    const { buyer, seller, item } = await seedUsersAndItem();
    const tx = await (0, transaction_usecase_1.createTransaction)({
        buyerId: buyer.id,
        sellerId: seller.id,
        itemId: item.id,
        amount: 1000,
    });
    const escrow = await (0, escrow_usecase_1.holdFunds)(tx.id);
    strict_1.default.equal(escrow.transactionId, tx.id);
    strict_1.default.equal(escrow.amount, 1000);
    strict_1.default.equal(escrow.status, 'PENDING');
});
(0, node_test_1.default)('milestone add persists percentage and enforces <= 100 total', async () => {
    const { buyer, seller, item } = await seedUsersAndItem();
    const tx = await (0, transaction_usecase_1.createTransaction)({
        buyerId: buyer.id,
        sellerId: seller.id,
        itemId: item.id,
        amount: 1200,
    });
    await (0, escrow_usecase_1.holdFunds)(tx.id);
    const first = await (0, escrow_usecase_1.addEscrowMilestone)(tx.id, { name: 'Phase 1', percentage: 60 });
    strict_1.default.equal(first.name, 'Phase 1');
    strict_1.default.equal(first.percentage, 60);
    strict_1.default.equal(first.status, 'PENDING');
    const second = await (0, escrow_usecase_1.addEscrowMilestone)(tx.id, { name: 'Phase 2', percentage: 40 });
    strict_1.default.equal(second.name, 'Phase 2');
    strict_1.default.equal(second.percentage, 40);
    await strict_1.default.rejects(() => (0, escrow_usecase_1.addEscrowMilestone)(tx.id, { name: 'Overflow', percentage: 1 }), (error) => {
        strict_1.default.equal(error.code, 'MILESTONE_PERCENTAGE_EXCEEDED');
        return true;
    });
});
(0, node_test_1.default)('milestone release updates status and releasedAt', async () => {
    const { buyer, seller, item } = await seedUsersAndItem();
    const tx = await (0, transaction_usecase_1.createTransaction)({
        buyerId: buyer.id,
        sellerId: seller.id,
        itemId: item.id,
        amount: 900,
    });
    await (0, escrow_usecase_1.holdFunds)(tx.id);
    const milestone = await (0, escrow_usecase_1.addEscrowMilestone)(tx.id, { name: 'Single', percentage: 100 });
    const released = await (0, escrow_usecase_1.releaseMilestone)(milestone.id);
    strict_1.default.equal(released.status, 'RELEASED');
    strict_1.default.ok(released.releasedAt);
});
(0, node_test_1.default)('total milestone release triggers escrow completion', async () => {
    const { buyer, seller, item } = await seedUsersAndItem();
    const tx = await (0, transaction_usecase_1.createTransaction)({
        buyerId: buyer.id,
        sellerId: seller.id,
        itemId: item.id,
        amount: 1500,
    });
    await (0, escrow_usecase_1.holdFunds)(tx.id);
    const m1 = await (0, escrow_usecase_1.addEscrowMilestone)(tx.id, { name: 'M1', percentage: 50 });
    const m2 = await (0, escrow_usecase_1.addEscrowMilestone)(tx.id, { name: 'M2', percentage: 50 });
    await (0, escrow_usecase_1.releaseMilestone)(m1.id);
    let details = await (0, escrow_usecase_1.getEscrowDetailsByTransaction)(tx.id);
    strict_1.default.equal(details.status, 'PENDING');
    await (0, escrow_usecase_1.releaseMilestone)(m2.id);
    details = await (0, escrow_usecase_1.getEscrowDetailsByTransaction)(tx.id);
    strict_1.default.equal(details.status, 'RELEASED');
    strict_1.default.equal(details.milestones.length, 2);
    strict_1.default.equal(details.milestones.every((m) => m.status === 'RELEASED'), true);
});
//# sourceMappingURL=escrow.lifecycle.test.js.map