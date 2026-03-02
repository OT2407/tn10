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
(0, node_test_1.default)('GET /api/explore/:itemId/explain returns controlled-discovery layers and exact total formula', async () => {
    const token = await loginAndGetToken();
    const admin = await prisma_1.prisma.user.findUnique({ where: { email: 'admin' } });
    strict_1.default.ok(admin);
    const seller = await prisma_1.prisma.user.create({
        data: { email: 'explain-seller@test.local', password: 'x', role: 'user' },
    });
    const tagA = await prisma_1.prisma.tag.create({ data: { name: '3D' } });
    const tagB = await prisma_1.prisma.tag.create({ data: { name: 'Motion' } });
    const item = await prisma_1.prisma.item.create({
        data: {
            ownerId: seller.id,
            sellerId: seller.id,
            name: 'Explain Item',
            title: 'Explain Item',
            category: 'design',
            price: 500,
        },
    });
    await prisma_1.prisma.itemTag.create({ data: { itemId: item.id, tagId: tagA.id } });
    await prisma_1.prisma.itemTag.create({ data: { itemId: item.id, tagId: tagB.id } });
    await (0, likeService_1.createLike)(admin.id, item.id);
    await (0, saveService_1.createSave)(admin.id, item.id);
    await (0, followService_1.createFollow)(admin.id, seller.id);
    const otherUser = await prisma_1.prisma.user.create({
        data: { email: 'explain-other@test.local', password: 'x', role: 'user' },
    });
    await (0, likeService_1.createLike)(otherUser.id, item.id);
    const response = await (0, supertest_1.default)(server_1.default)
        .get(`/api/explore/${item.id}/explain`)
        .set('authorization', `Bearer ${token}`);
    strict_1.default.equal(response.status, 200);
    strict_1.default.equal(response.body.success, true);
    const data = response.body.data;
    strict_1.default.equal(data.itemId, item.id);
    strict_1.default.ok(data.breakdown.personalizationLayer > 0);
    strict_1.default.ok(data.breakdown.engagementQualityLayer > 0);
    strict_1.default.ok(data.breakdown.freshnessLayer > 0);
    strict_1.default.ok(data.breakdown.creatorGrowthLayer > 0);
    strict_1.default.ok(data.breakdown.explorationNoise >= 0 && data.breakdown.explorationNoise <= 0.2);
    const expectedTotal = data.breakdown.personalizationLayer +
        data.breakdown.engagementQualityLayer +
        data.breakdown.freshnessLayer +
        data.breakdown.creatorGrowthLayer +
        data.breakdown.emergingBoost +
        data.breakdown.explorationNoise;
    strict_1.default.ok(Math.abs(data.totalScore - expectedTotal) < 0.000001);
    strict_1.default.ok(Math.abs(data.breakdown.totalScore - expectedTotal) < 0.000001);
});
(0, node_test_1.default)('feed stability keeps consistent scores within snapshot ttl', async () => {
    const token = await loginAndGetToken();
    const admin = await prisma_1.prisma.user.findUnique({ where: { email: 'admin' } });
    strict_1.default.ok(admin);
    const seller = await prisma_1.prisma.user.create({
        data: { email: 'stable-seller@test.local', password: 'x', role: 'user' },
    });
    const item = await prisma_1.prisma.item.create({
        data: {
            ownerId: seller.id,
            sellerId: seller.id,
            name: 'Stable Item',
            title: 'Stable Item',
            category: 'print',
            price: 300,
        },
    });
    const first = await (0, supertest_1.default)(server_1.default)
        .get('/api/explore?limit=10')
        .set('authorization', `Bearer ${token}`);
    strict_1.default.equal(first.status, 200);
    const second = await (0, supertest_1.default)(server_1.default)
        .get('/api/explore?limit=10')
        .set('authorization', `Bearer ${token}`);
    strict_1.default.equal(second.status, 200);
    const firstEntry = first.body.data.items.find((entry) => entry.itemId === item.id);
    const secondEntry = second.body.data.items.find((entry) => entry.itemId === item.id);
    strict_1.default.ok(firstEntry);
    strict_1.default.ok(secondEntry);
    strict_1.default.ok(Math.abs((firstEntry?.score ?? 0) - (secondEntry?.score ?? 0)) < 0.000001);
});
//# sourceMappingURL=ranking.explain.integration.test.js.map