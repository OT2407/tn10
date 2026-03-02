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
const supertest_1 = __importDefault(require("supertest"));
const server_1 = __importDefault(require("../../api/server"));
const prisma_1 = require("../../infrastructure/prisma");
const bootstrap_1 = require("../../infrastructure/schema/bootstrap");
const followService_1 = require("../../services/followService");
const likeService_1 = require("../../services/likeService");
const saveService_1 = require("../../services/saveService");
const intelligenceService_1 = require("../../services/intelligenceService");
const order_usecase_1 = require("../../application/order.usecase");
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
async function loginAndGetToken() {
    const response = await (0, supertest_1.default)(server_1.default)
        .post('/api/auth/login')
        .send({ username: 'admin', password: 'pass' });
    strict_1.default.equal(response.status, 200);
    return response.body.data.token;
}
(0, node_test_1.default)('preference update rules apply for like/save/follow/purchase', async () => {
    const buyer = await prisma_1.prisma.user.create({ data: { email: 'intel-buyer@test.local', password: 'x', role: 'user' } });
    const seller = await prisma_1.prisma.user.create({ data: { email: 'intel-seller@test.local', password: 'x', role: 'user' } });
    const item = await prisma_1.prisma.item.create({
        data: {
            ownerId: seller.id,
            sellerId: seller.id,
            name: 'Synth Pack',
            title: 'Synth Pack',
            category: 'music',
            price: 300,
        },
    });
    const tag = await prisma_1.prisma.tag.create({ data: { name: 'Synth' } });
    await prisma_1.prisma.itemTag.create({ data: { itemId: item.id, tagId: tag.id } });
    await (0, likeService_1.createLike)(buyer.id, item.id);
    await (0, saveService_1.createSave)(buyer.id, item.id);
    await (0, followService_1.createFollow)(buyer.id, seller.id);
    const order = await (0, order_usecase_1.createOrder)({
        buyerId: buyer.id,
        sellerId: seller.id,
        itemId: item.id,
        amount: 300,
    });
    await (0, order_usecase_1.completeOrder)(order.id);
    const pref = await prisma_1.prisma.userPreference.findUnique({ where: { userId: buyer.id } });
    strict_1.default.ok(pref);
    const tagWeights = pref.tagWeights;
    const categoryWeights = pref.categoryWeights;
    const designerWeights = pref.designerWeights;
    strict_1.default.equal(tagWeights.Synth, 4);
    strict_1.default.equal(categoryWeights.music, 4);
    strict_1.default.equal(designerWeights[seller.id], 2);
});
(0, node_test_1.default)('ranked explore orders items by preference score and supports cursor pagination', async () => {
    const user = await prisma_1.prisma.user.create({ data: { email: 'rank-user@test.local', password: 'x', role: 'user' } });
    const sellerA = await prisma_1.prisma.user.create({ data: { email: 'rank-seller-a@test.local', password: 'x', role: 'user' } });
    const sellerB = await prisma_1.prisma.user.create({ data: { email: 'rank-seller-b@test.local', password: 'x', role: 'user' } });
    const preferredTag = await prisma_1.prisma.tag.create({ data: { name: '3D' } });
    const otherTag = await prisma_1.prisma.tag.create({ data: { name: 'Photo' } });
    const itemA = await prisma_1.prisma.item.create({
        data: {
            ownerId: sellerA.id,
            sellerId: sellerA.id,
            name: 'A',
            title: 'A',
            category: 'design',
            price: 100,
            createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        },
    });
    const itemB = await prisma_1.prisma.item.create({
        data: {
            ownerId: sellerB.id,
            sellerId: sellerB.id,
            name: 'B',
            title: 'B',
            category: 'photo',
            price: 100,
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        },
    });
    await prisma_1.prisma.itemTag.create({ data: { itemId: itemA.id, tagId: preferredTag.id } });
    await prisma_1.prisma.itemTag.create({ data: { itemId: itemB.id, tagId: otherTag.id } });
    await (0, likeService_1.createLike)(user.id, itemA.id);
    await (0, saveService_1.createSave)(user.id, itemA.id);
    await (0, followService_1.createFollow)(user.id, sellerA.id);
    await prisma_1.prisma.like.create({ data: { userId: sellerB.id, itemId: itemB.id } });
    const ranked = await (0, intelligenceService_1.getRankedExplorePage)({ userId: user.id, limit: 1 });
    strict_1.default.equal(ranked.items.length, 1);
    strict_1.default.equal(ranked.items[0]?.itemId, itemA.id);
    strict_1.default.ok(ranked.nextCursor);
    const nextPage = await (0, intelligenceService_1.getRankedExplorePage)({
        userId: user.id,
        limit: 2,
        cursor: ranked.nextCursor ?? undefined,
    });
    strict_1.default.equal(nextPage.items[0]?.itemId, itemB.id);
});
(0, node_test_1.default)('GET /api/explore returns ranked data for authenticated user', async () => {
    const token = await loginAndGetToken();
    const admin = await prisma_1.prisma.user.findUnique({ where: { email: 'admin' } });
    strict_1.default.ok(admin);
    const seller = await prisma_1.prisma.user.create({ data: { email: 'explore-seller@test.local', password: 'x', role: 'user' } });
    const tag = await prisma_1.prisma.tag.create({ data: { name: 'Typography' } });
    const item = await prisma_1.prisma.item.create({
        data: {
            ownerId: seller.id,
            sellerId: seller.id,
            name: 'Poster',
            title: 'Poster',
            category: 'print',
            price: 210,
        },
    });
    await prisma_1.prisma.itemTag.create({ data: { itemId: item.id, tagId: tag.id } });
    await (0, saveService_1.createSave)(admin.id, item.id);
    const response = await (0, supertest_1.default)(server_1.default)
        .get('/api/explore?limit=10')
        .set('authorization', `Bearer ${token}`);
    strict_1.default.equal(response.status, 200);
    strict_1.default.equal(response.body.success, true);
    strict_1.default.equal(Array.isArray(response.body.data.items), true);
    strict_1.default.equal(response.body.data.items[0].itemId, item.id);
});
//# sourceMappingURL=intelligence.integration.test.js.map