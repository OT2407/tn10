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
const contractService_1 = require("../../services/contractService");
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
            email: 'contract-buyer@test.local',
            password: 'hashed-buyer',
            role: 'user',
        },
    });
    const seller = await prisma_1.prisma.user.create({
        data: {
            email: 'contract-seller@test.local',
            password: 'hashed-seller',
            role: 'user',
        },
    });
    const item = await prisma_1.prisma.item.create({
        data: {
            name: 'Contract Item',
            ownerId: seller.id,
        },
    });
    return { buyer, seller, item };
}
(0, node_test_1.default)('contract creation stores draft contract', async () => {
    const { seller } = await seedUsersAndItem();
    const contract = await (0, contractService_1.createContract)(seller.id, 'Milestone Contract', 'Body text');
    strict_1.default.equal(contract.ownerId, seller.id);
    strict_1.default.equal(contract.title, 'Milestone Contract');
    strict_1.default.equal(contract.status, 'DRAFT');
});
(0, node_test_1.default)('escrow attachment requires pending escrow and sets contract active', async () => {
    const { buyer, seller, item } = await seedUsersAndItem();
    const tx = await (0, transaction_usecase_1.createTransaction)({
        buyerId: buyer.id,
        sellerId: seller.id,
        itemId: item.id,
        amount: 1000,
    });
    const escrow = await (0, escrow_usecase_1.holdFunds)(tx.id);
    const contract = await (0, contractService_1.createContract)(seller.id, 'Attach Escrow', 'Escrow body');
    const attached = await (0, contractService_1.attachEscrow)(contract.id, escrow.id);
    strict_1.default.equal(attached.escrowId, escrow.id);
    strict_1.default.equal(attached.status, 'ACTIVE');
});
(0, node_test_1.default)('completion transitions contract and releases escrow milestones', async () => {
    const { buyer, seller, item } = await seedUsersAndItem();
    const tx = await (0, transaction_usecase_1.createTransaction)({
        buyerId: buyer.id,
        sellerId: seller.id,
        itemId: item.id,
        amount: 1500,
    });
    const escrow = await (0, escrow_usecase_1.holdFunds)(tx.id);
    await (0, escrow_usecase_1.addEscrowMilestone)(tx.id, { name: 'M1', percentage: 40 });
    await (0, escrow_usecase_1.addEscrowMilestone)(tx.id, { name: 'M2', percentage: 60 });
    const contract = await (0, contractService_1.createContract)(seller.id, 'Complete Contract', 'Complete body');
    await (0, contractService_1.attachEscrow)(contract.id, escrow.id);
    const completed = await (0, contractService_1.completeContract)(contract.id);
    strict_1.default.equal(completed.status, 'COMPLETED');
    const loaded = await (0, contractService_1.getContract)(contract.id);
    strict_1.default.ok(loaded);
    strict_1.default.ok(loaded.escrow);
    strict_1.default.equal(loaded.escrow?.status, 'RELEASED');
    strict_1.default.equal(loaded.escrow?.milestones.every((m) => m.status === 'RELEASED'), true);
});
//# sourceMappingURL=contract.lifecycle.test.js.map