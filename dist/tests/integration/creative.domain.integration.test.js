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
const collaborationService_1 = require("../../services/collaborationService");
const itemMarketplaceService_1 = require("../../services/itemMarketplaceService");
const order_usecase_1 = require("../../application/order.usecase");
const reviewService_1 = require("../../services/reviewService");
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
(0, node_test_1.default)('collaboration split credits member wallets on order completion', async () => {
    const buyer = await prisma_1.prisma.user.create({ data: { email: 'buyer-split@test.local', password: 'x', role: 'user' } });
    const seller = await prisma_1.prisma.user.create({ data: { email: 'seller-split@test.local', password: 'x', role: 'user' } });
    const coCreator = await prisma_1.prisma.user.create({ data: { email: 'cocreator-split@test.local', password: 'x', role: 'user' } });
    const collaboration = await (0, collaborationService_1.createCollaboration)('Album', 'Collab release');
    await (0, collaborationService_1.addMember)(collaboration.id, seller.id, 70, 'LEAD');
    await (0, collaborationService_1.addMember)(collaboration.id, coCreator.id, 30, 'GUEST');
    await (0, collaborationService_1.publishCollaboration)(collaboration.id);
    const item = await (0, itemMarketplaceService_1.createMarketplaceItem)({
        sellerId: seller.id,
        title: 'Track One',
        description: 'desc',
        category: 'music',
        price: 1000,
        previewUrl: 'https://example.com/preview',
        deliveryType: 'instant',
        metadata: { bpm: 120 },
        collaborationId: collaboration.id,
    });
    await (0, collaborationService_1.attachItemToCollaboration)(item.id, collaboration.id);
    const order = await (0, order_usecase_1.createOrder)({
        buyerId: buyer.id,
        sellerId: seller.id,
        itemId: item.id,
        amount: 1000,
    });
    await (0, order_usecase_1.completeOrder)(order.id);
    const sellerWallet = await prisma_1.prisma.wallet.findUnique({ where: { ownerId: seller.id } });
    const guestWallet = await prisma_1.prisma.wallet.findUnique({ where: { ownerId: coCreator.id } });
    strict_1.default.ok(sellerWallet);
    strict_1.default.ok(guestWallet);
    strict_1.default.equal(sellerWallet.balance, 700);
    strict_1.default.equal(guestWallet.balance, 300);
});
(0, node_test_1.default)('review is allowed only after delivered and only once per order', async () => {
    const buyer = await prisma_1.prisma.user.create({ data: { email: 'buyer-review@test.local', password: 'x', role: 'user' } });
    const seller = await prisma_1.prisma.user.create({ data: { email: 'seller-review@test.local', password: 'x', role: 'user' } });
    const item = await prisma_1.prisma.item.create({ data: { ownerId: seller.id, sellerId: seller.id, name: 'Review Item' } });
    const order = await (0, order_usecase_1.createOrder)({ buyerId: buyer.id, sellerId: seller.id, itemId: item.id, amount: 200 });
    await strict_1.default.rejects(() => (0, reviewService_1.createReview)(order.id, buyer.id, 5, 'too early'), (error) => {
        strict_1.default.equal(error.code, 'ORDER_NOT_DELIVERED');
        return true;
    });
    await prisma_1.prisma.order.update({ where: { id: order.id }, data: { status: 'DELIVERED' } });
    const review = await (0, reviewService_1.createReview)(order.id, buyer.id, 5, 'great');
    strict_1.default.equal(review.rating, 5);
    await strict_1.default.rejects(() => (0, reviewService_1.createReview)(order.id, buyer.id, 4, 'duplicate'), (error) => {
        strict_1.default.equal(error.code, 'REVIEW_ALREADY_EXISTS');
        return true;
    });
});
(0, node_test_1.default)('conversation is auto-created when contract becomes active', async () => {
    const buyer = await prisma_1.prisma.user.create({ data: { email: 'buyer-conv@test.local', password: 'x', role: 'user' } });
    const seller = await prisma_1.prisma.user.create({ data: { email: 'seller-conv@test.local', password: 'x', role: 'user' } });
    const item = await prisma_1.prisma.item.create({ data: { ownerId: seller.id, sellerId: seller.id, name: 'Conv Item' } });
    const tx = await (0, transaction_usecase_1.createTransaction)({
        buyerId: buyer.id,
        sellerId: seller.id,
        itemId: item.id,
        amount: 333,
    });
    const escrow = await (0, escrow_usecase_1.holdFunds)(tx.id);
    const contract = await (0, contractService_1.createContract)(seller.id, 'Contract Conversation', 'body');
    await (0, contractService_1.attachEscrow)(contract.id, escrow.id);
    const conversation = await prisma_1.prisma.conversation.findUnique({ where: { contractId: contract.id } });
    strict_1.default.ok(conversation);
    strict_1.default.equal(conversation.monitoringEnabled, true);
});
(0, node_test_1.default)('metadata is stored and retrieved on marketplace item', async () => {
    const seller = await prisma_1.prisma.user.create({ data: { email: 'seller-meta@test.local', password: 'x', role: 'user' } });
    const item = await (0, itemMarketplaceService_1.createMarketplaceItem)({
        sellerId: seller.id,
        title: 'Metadata Asset',
        description: 'metadata test',
        category: 'design',
        price: 450,
        previewUrl: 'https://example.com/meta',
        deliveryType: 'file',
        metadata: { format: 'svg', layers: 8, nested: { licensed: true } },
    });
    const loaded = await prisma_1.prisma.item.findUnique({ where: { id: item.id } });
    strict_1.default.ok(loaded);
    strict_1.default.deepEqual(loaded.metadata, { format: 'svg', layers: 8, nested: { licensed: true } });
});
//# sourceMappingURL=creative.domain.integration.test.js.map