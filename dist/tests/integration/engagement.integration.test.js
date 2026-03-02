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
    const login = await (0, supertest_1.default)(server_1.default)
        .post('/api/auth/login')
        .send({ username: 'admin', password: 'pass' });
    strict_1.default.equal(login.status, 200);
    return {
        token: login.body.data.token,
        userId: login.body.data.user?.id ?? (await prisma_1.prisma.user.findUnique({ where: { email: 'admin' } }))?.id ?? '',
    };
}
(0, node_test_1.default)('cannot like own item', async () => {
    const login = await (0, supertest_1.default)(server_1.default)
        .post('/api/auth/login')
        .send({ username: 'admin', password: 'pass' });
    const token = login.body.data.token;
    const admin = await prisma_1.prisma.user.findUnique({ where: { email: 'admin' } });
    strict_1.default.ok(admin);
    const ownItem = await prisma_1.prisma.item.create({
        data: {
            ownerId: admin.id,
            sellerId: admin.id,
            name: 'Own Item',
        },
    });
    const like = await (0, supertest_1.default)(server_1.default)
        .post(`/api/items/${ownItem.id}/like`)
        .set('authorization', `Bearer ${token}`)
        .send({});
    strict_1.default.equal(like.status, 400);
    strict_1.default.equal(like.body.code, 'OWN_ITEM_ENGAGEMENT_FORBIDDEN');
});
(0, node_test_1.default)('cannot follow self', async () => {
    const login = await (0, supertest_1.default)(server_1.default)
        .post('/api/auth/login')
        .send({ username: 'admin', password: 'pass' });
    const token = login.body.data.token;
    const admin = await prisma_1.prisma.user.findUnique({ where: { email: 'admin' } });
    strict_1.default.ok(admin);
    const follow = await (0, supertest_1.default)(server_1.default)
        .post(`/api/users/${admin.id}/follow`)
        .set('authorization', `Bearer ${token}`)
        .send({});
    strict_1.default.equal(follow.status, 400);
    strict_1.default.equal(follow.body.code, 'INVALID_FOLLOW');
});
(0, node_test_1.default)('duplicate like is idempotent and preference updates once', async () => {
    const login = await (0, supertest_1.default)(server_1.default)
        .post('/api/auth/login')
        .send({ username: 'admin', password: 'pass' });
    const token = login.body.data.token;
    const admin = await prisma_1.prisma.user.findUnique({ where: { email: 'admin' } });
    strict_1.default.ok(admin);
    const seller = await prisma_1.prisma.user.create({
        data: { email: 'engage-seller@test.local', password: 'x', role: 'user' },
    });
    const item = await prisma_1.prisma.item.create({
        data: {
            ownerId: seller.id,
            sellerId: seller.id,
            name: 'Like Target',
            category: 'design',
        },
    });
    const tag = await prisma_1.prisma.tag.create({ data: { name: 'Motion' } });
    await prisma_1.prisma.itemTag.create({ data: { itemId: item.id, tagId: tag.id } });
    const first = await (0, supertest_1.default)(server_1.default)
        .post(`/api/items/${item.id}/like`)
        .set('authorization', `Bearer ${token}`)
        .send({});
    strict_1.default.equal(first.status, 201);
    const second = await (0, supertest_1.default)(server_1.default)
        .post(`/api/items/${item.id}/like`)
        .set('authorization', `Bearer ${token}`)
        .send({});
    strict_1.default.equal(second.status, 200);
    const likeCount = await prisma_1.prisma.like.count({ where: { userId: admin.id, itemId: item.id } });
    strict_1.default.equal(likeCount, 1);
    const pref = await prisma_1.prisma.userPreference.findUnique({ where: { userId: admin.id } });
    strict_1.default.ok(pref);
    const tagWeights = pref.tagWeights;
    strict_1.default.equal(tagWeights.Motion, 1);
});
(0, node_test_1.default)('duplicate save is idempotent and preference updates once', async () => {
    const login = await (0, supertest_1.default)(server_1.default)
        .post('/api/auth/login')
        .send({ username: 'admin', password: 'pass' });
    const token = login.body.data.token;
    const admin = await prisma_1.prisma.user.findUnique({ where: { email: 'admin' } });
    strict_1.default.ok(admin);
    const seller = await prisma_1.prisma.user.create({
        data: { email: 'save-seller@test.local', password: 'x', role: 'user' },
    });
    const item = await prisma_1.prisma.item.create({
        data: {
            ownerId: seller.id,
            sellerId: seller.id,
            name: 'Save Target',
        },
    });
    const tag = await prisma_1.prisma.tag.create({ data: { name: 'Photo' } });
    await prisma_1.prisma.itemTag.create({ data: { itemId: item.id, tagId: tag.id } });
    const first = await (0, supertest_1.default)(server_1.default)
        .post(`/api/items/${item.id}/save`)
        .set('authorization', `Bearer ${token}`)
        .send({});
    strict_1.default.equal(first.status, 201);
    const second = await (0, supertest_1.default)(server_1.default)
        .post(`/api/items/${item.id}/save`)
        .set('authorization', `Bearer ${token}`)
        .send({});
    strict_1.default.equal(second.status, 200);
    const saveCount = await prisma_1.prisma.save.count({ where: { userId: admin.id, itemId: item.id } });
    strict_1.default.equal(saveCount, 1);
    const pref = await prisma_1.prisma.userPreference.findUnique({ where: { userId: admin.id } });
    strict_1.default.ok(pref);
    const tagWeights = pref.tagWeights;
    strict_1.default.equal(tagWeights.Photo, 3);
});
(0, node_test_1.default)('delete endpoints are safe when relation missing', async () => {
    const login = await (0, supertest_1.default)(server_1.default)
        .post('/api/auth/login')
        .send({ username: 'admin', password: 'pass' });
    const token = login.body.data.token;
    const admin = await prisma_1.prisma.user.findUnique({ where: { email: 'admin' } });
    strict_1.default.ok(admin);
    const seller = await prisma_1.prisma.user.create({
        data: { email: 'delete-seller@test.local', password: 'x', role: 'user' },
    });
    const item = await prisma_1.prisma.item.create({
        data: {
            ownerId: seller.id,
            sellerId: seller.id,
            name: 'Delete Target',
        },
    });
    const unlike = await (0, supertest_1.default)(server_1.default)
        .delete(`/api/items/${item.id}/like`)
        .set('authorization', `Bearer ${token}`)
        .send({});
    strict_1.default.equal(unlike.status, 204);
    const unsave = await (0, supertest_1.default)(server_1.default)
        .delete(`/api/items/${item.id}/save`)
        .set('authorization', `Bearer ${token}`)
        .send({});
    strict_1.default.equal(unsave.status, 204);
    const unfollow = await (0, supertest_1.default)(server_1.default)
        .delete(`/api/users/${seller.id}/follow`)
        .set('authorization', `Bearer ${token}`)
        .send({});
    strict_1.default.equal(unfollow.status, 204);
});
//# sourceMappingURL=engagement.integration.test.js.map