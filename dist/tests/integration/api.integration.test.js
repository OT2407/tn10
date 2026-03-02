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
const client_1 = require("@prisma/client");
const server_1 = __importDefault(require("../../api/server"));
const bootstrap_1 = require("../../infrastructure/schema/bootstrap");
const env_1 = require("../../infrastructure/env");
const prisma = new client_1.PrismaClient();
async function loginAndGetToken() {
    const response = await (0, supertest_1.default)(server_1.default)
        .post('/api/auth/login')
        .send({
        username: 'admin',
        password: 'pass',
    });
    strict_1.default.equal(response.status, 200);
    strict_1.default.equal(response.body.success, true);
    return response.body.data.token;
}
(0, node_test_1.beforeEach)(async () => {
    await (0, bootstrap_1.ensureSqliteSchema)();
    await prisma.message.deleteMany();
    await prisma.conversation.deleteMany();
    await prisma.review.deleteMany();
    await prisma.itemTag.deleteMany();
    await prisma.tag.deleteMany();
    await prisma.collaborationMember.deleteMany();
    await prisma.collaboration.deleteMany();
    await prisma.brand.deleteMany();
    await prisma.rankingTelemetry.deleteMany();
    await prisma.like.deleteMany();
    await prisma.save.deleteMany();
    await prisma.follow.deleteMany();
    await prisma.userPreference.deleteMany();
    await prisma.paymentIntent.deleteMany();
    await prisma.order.deleteMany();
    await prisma.contract.deleteMany();
    await prisma.escrowMilestone.deleteMany();
    await prisma.escrow.deleteMany();
    await prisma.transaction.deleteMany();
    await prisma.freeze.deleteMany();
    await prisma.item.deleteMany();
    await prisma.walletTransaction.deleteMany();
    await prisma.wallet.deleteMany();
    await prisma.user.deleteMany();
});
(0, node_test_1.default)('schema bootstrap verify succeeds', async () => {
    await (0, bootstrap_1.ensureSqliteSchema)();
    const verification = await (0, bootstrap_1.verifySqliteSchema)();
    strict_1.default.equal(verification.ok, true);
    strict_1.default.deepEqual(verification.missingTables, []);
});
(0, node_test_1.default)('GET /health returns ok', async () => {
    const response = await (0, supertest_1.default)(server_1.default).get('/health');
    strict_1.default.equal(response.status, 200);
    strict_1.default.deepEqual(response.body, { status: 'ok' });
});
(0, node_test_1.default)('GET /ready returns ok', async () => {
    const response = await (0, supertest_1.default)(server_1.default).get('/ready');
    strict_1.default.equal(response.status, 200);
    strict_1.default.deepEqual(response.body, { status: 'ok' });
});
(0, node_test_1.default)('POST /api/auth/login returns token with valid credentials', async () => {
    const token = await loginAndGetToken();
    strict_1.default.equal(typeof token, 'string');
    strict_1.default.ok(token.length > 10);
});
(0, node_test_1.default)('GET /api/contracts/schema returns contracts schema', async () => {
    const response = await (0, supertest_1.default)(server_1.default).get('/api/contracts/schema');
    strict_1.default.equal(response.status, 200);
    strict_1.default.equal(response.body.success, true);
    strict_1.default.equal(Array.isArray(response.body.data.escrowTransition.currentStatus), true);
    strict_1.default.equal(Array.isArray(response.body.data.escrowTransition.event), true);
});
(0, node_test_1.default)('protected POST routes require token (401)', async () => {
    const createItemResponse = await (0, supertest_1.default)(server_1.default)
        .post('/api/items')
        .send({ name: 'Unauthorized Item' });
    strict_1.default.equal(createItemResponse.status, 401);
    strict_1.default.equal(createItemResponse.body.code, 'UNAUTHORIZED');
    const freezeResponse = await (0, supertest_1.default)(server_1.default)
        .post('/api/items/some-id/freeze')
        .send({
        type: 'base',
        svg: '<svg/>',
        metadata: '{}',
        idempotencyKey: 'idem-key-auth-01',
        expectedVersion: 0,
        hash: 'hash-auth-01',
    });
    strict_1.default.equal(freezeResponse.status, 401);
    strict_1.default.equal(freezeResponse.body.code, 'UNAUTHORIZED');
    const contractsResponse = await (0, supertest_1.default)(server_1.default)
        .post('/api/contracts/escrow/transition')
        .send({ currentStatus: 'PENDING', event: 'HOLD' });
    strict_1.default.equal(contractsResponse.status, 401);
    strict_1.default.equal(contractsResponse.body.code, 'UNAUTHORIZED');
});
(0, node_test_1.default)('POST /api/contracts/escrow/transition validates state machine', async () => {
    const token = await loginAndGetToken();
    const ok = await (0, supertest_1.default)(server_1.default)
        .post('/api/contracts/escrow/transition')
        .set('authorization', `Bearer ${token}`)
        .send({ currentStatus: 'PENDING', event: 'HOLD' });
    strict_1.default.equal(ok.status, 200);
    strict_1.default.equal(ok.body.success, true);
    strict_1.default.equal(ok.body.data.to, 'HOLDING');
    const invalid = await (0, supertest_1.default)(server_1.default)
        .post('/api/contracts/escrow/transition')
        .set('authorization', `Bearer ${token}`)
        .send({ currentStatus: 'RELEASED', event: 'HOLD' });
    strict_1.default.equal(invalid.status, 409);
    strict_1.default.equal(invalid.body.code, 'INVALID_ESCROW_TRANSITION');
});
(0, node_test_1.default)('POST /api/contracts/payment-intents returns placeholder payload', async () => {
    const token = await loginAndGetToken();
    const response = await (0, supertest_1.default)(server_1.default)
        .post('/api/contracts/payment-intents')
        .set('authorization', `Bearer ${token}`)
        .send({
        transactionId: 'tx_placeholder_1',
        amount: 1250,
        currency: 'TRY',
        requestId: 'req-contract-1',
    });
    strict_1.default.equal(response.status, 201);
    strict_1.default.equal(response.body.success, true);
    strict_1.default.equal(response.body.data.transactionId, 'tx_placeholder_1');
    strict_1.default.equal(response.body.data.amount, 1250);
    strict_1.default.equal(response.body.data.currency, 'TRY');
    strict_1.default.equal(response.body.data.status, 'requires_confirmation');
    strict_1.default.equal(response.body.data.provider, 'placeholder');
});
(0, node_test_1.default)('POST /api/orders creates order and payment-intent lifecycle works', async () => {
    const seller = await prisma.user.create({
        data: {
            email: 'order-seller@test.local',
            password: 'hashed-seller',
            role: 'user',
        },
    });
    const item = await prisma.item.create({
        data: {
            ownerId: seller.id,
            name: 'Order Item',
        },
    });
    const token = await loginAndGetToken();
    const createOrderResponse = await (0, supertest_1.default)(server_1.default)
        .post('/api/orders')
        .set('authorization', `Bearer ${token}`)
        .send({
        sellerId: seller.id,
        itemId: item.id,
        amount: 1450,
    });
    strict_1.default.equal(createOrderResponse.status, 201);
    strict_1.default.equal(createOrderResponse.body.success, true);
    strict_1.default.equal(createOrderResponse.body.data.status, 'pending');
    const orderId = createOrderResponse.body.data.id;
    const paymentIntentResponse = await (0, supertest_1.default)(server_1.default)
        .post(`/api/orders/${orderId}/payment-intents`)
        .set('authorization', `Bearer ${token}`)
        .send({ currency: 'TRY' });
    strict_1.default.equal(paymentIntentResponse.status, 201);
    strict_1.default.equal(paymentIntentResponse.body.success, true);
    strict_1.default.equal(paymentIntentResponse.body.data.orderId, orderId);
    strict_1.default.equal(paymentIntentResponse.body.data.status, 'requires_confirmation');
    strict_1.default.equal(paymentIntentResponse.body.data.provider, 'placeholder');
    const completeResponse = await (0, supertest_1.default)(server_1.default)
        .post(`/api/orders/${orderId}/complete`)
        .set('authorization', `Bearer ${token}`)
        .send({});
    strict_1.default.equal(completeResponse.status, 200);
    strict_1.default.equal(completeResponse.body.data.status, 'completed');
});
(0, node_test_1.default)('POST /api/orders/:id/cancel rejects completed order', async () => {
    const seller = await prisma.user.create({
        data: {
            email: 'order-seller-2@test.local',
            password: 'hashed-seller',
            role: 'user',
        },
    });
    const item = await prisma.item.create({
        data: {
            ownerId: seller.id,
            name: 'Order Item 2',
        },
    });
    const token = await loginAndGetToken();
    const created = await (0, supertest_1.default)(server_1.default)
        .post('/api/orders')
        .set('authorization', `Bearer ${token}`)
        .send({
        sellerId: seller.id,
        itemId: item.id,
        amount: 950,
    });
    const orderId = created.body.data.id;
    await (0, supertest_1.default)(server_1.default)
        .post(`/api/orders/${orderId}/complete`)
        .set('authorization', `Bearer ${token}`)
        .send({});
    const cancelResponse = await (0, supertest_1.default)(server_1.default)
        .post(`/api/orders/${orderId}/cancel`)
        .set('authorization', `Bearer ${token}`)
        .send({});
    strict_1.default.equal(cancelResponse.status, 409);
    strict_1.default.equal(cancelResponse.body.code, 'INVALID_STATE');
});
(0, node_test_1.default)('POST /api/items creates item (201)', async () => {
    const token = await loginAndGetToken();
    const response = await (0, supertest_1.default)(server_1.default)
        .post('/api/items')
        .set('authorization', `Bearer ${token}`)
        .send({ name: 'Test Item' });
    strict_1.default.equal(response.status, 201);
    strict_1.default.equal(response.body.success, true);
    strict_1.default.equal(typeof response.body.data.id, 'string');
    strict_1.default.equal(response.body.data.name, 'Test Item');
});
(0, node_test_1.default)('POST /api/items returns 422 for invalid payload', async () => {
    const token = await loginAndGetToken();
    const response = await (0, supertest_1.default)(server_1.default)
        .post('/api/items')
        .set('authorization', `Bearer ${token}`)
        .send({ name: '' });
    strict_1.default.equal(response.status, 422);
    strict_1.default.equal(response.body.code, 'VALIDATION_ERROR');
    strict_1.default.equal(typeof response.body.message, 'string');
});
(0, node_test_1.default)('GET /api/items supports cursor pagination', async () => {
    const token = await loginAndGetToken();
    const names = ['Paginate A', 'Paginate B', 'Paginate C'];
    for (const name of names) {
        const response = await (0, supertest_1.default)(server_1.default)
            .post('/api/items')
            .set('authorization', `Bearer ${token}`)
            .send({ name });
        strict_1.default.equal(response.status, 201);
    }
    const firstPage = await (0, supertest_1.default)(server_1.default)
        .get('/api/items?limit=2')
        .set('authorization', `Bearer ${token}`);
    strict_1.default.equal(firstPage.status, 200);
    strict_1.default.equal(firstPage.body.success, true);
    strict_1.default.equal(firstPage.body.data.items.length, 2);
    strict_1.default.equal(typeof firstPage.body.data.nextCursor, 'string');
    const secondPage = await (0, supertest_1.default)(server_1.default)
        .get(`/api/items?limit=2&cursor=${firstPage.body.data.nextCursor}`)
        .set('authorization', `Bearer ${token}`);
    strict_1.default.equal(secondPage.status, 200);
    strict_1.default.equal(secondPage.body.success, true);
    strict_1.default.equal(secondPage.body.data.items.length, 1);
});
(0, node_test_1.default)('GET /api/items/:id returns created item (200)', async () => {
    const token = await loginAndGetToken();
    const created = await (0, supertest_1.default)(server_1.default)
        .post('/api/items')
        .set('authorization', `Bearer ${token}`)
        .send({ name: 'Lookup Item' });
    const id = created.body.data.id;
    const response = await (0, supertest_1.default)(server_1.default).get(`/api/items/${id}`);
    strict_1.default.equal(response.status, 200);
    strict_1.default.equal(response.body.success, true);
    strict_1.default.equal(response.body.data.id, id);
    strict_1.default.equal(response.body.data.name, 'Lookup Item');
});
(0, node_test_1.default)('GET /api/items/:id/full returns item with freezes shape', async () => {
    const token = await loginAndGetToken();
    const created = await (0, supertest_1.default)(server_1.default)
        .post('/api/items')
        .set('authorization', `Bearer ${token}`)
        .send({ name: 'Full Item' });
    const id = created.body.data.id;
    const freezePayload = {
        type: 'base',
        svg: '<svg/>',
        metadata: JSON.stringify({ source: 'integration' }),
        idempotencyKey: 'idem-key-full-01',
        expectedVersion: 0,
        hash: 'hash-full-01',
    };
    const freezeResponse = await (0, supertest_1.default)(server_1.default)
        .post(`/api/items/${id}/freeze`)
        .set('authorization', `Bearer ${token}`)
        .send(freezePayload);
    strict_1.default.equal(freezeResponse.status, 201);
    const response = await (0, supertest_1.default)(server_1.default).get(`/api/items/${id}/full`);
    strict_1.default.equal(response.status, 200);
    strict_1.default.equal(response.body.success, true);
    strict_1.default.equal(response.body.data.id, id);
    strict_1.default.equal(response.body.data.name, 'Full Item');
    strict_1.default.equal(response.body.data.currentHash, 'hash-full-01');
    strict_1.default.equal(response.body.data.status, 'ACTIVE');
    strict_1.default.equal(Array.isArray(response.body.data.freezes), true);
    strict_1.default.equal(response.body.data.freezes.length, 1);
    strict_1.default.equal(response.body.data.freezes[0].hash, 'hash-full-01');
    strict_1.default.equal(response.body.data.freezes[0].metadata.source, 'integration');
});
(0, node_test_1.default)('GET /api/items/:id/full derives EMPTY and FROZEN statuses', async () => {
    const token = await loginAndGetToken();
    const emptyCreated = await (0, supertest_1.default)(server_1.default)
        .post('/api/items')
        .set('authorization', `Bearer ${token}`)
        .send({ name: 'Empty Item' });
    const emptyId = emptyCreated.body.data.id;
    const emptyView = await (0, supertest_1.default)(server_1.default).get(`/api/items/${emptyId}/full`);
    strict_1.default.equal(emptyView.status, 200);
    strict_1.default.equal(emptyView.body.data.status, 'EMPTY');
    const frozenCreated = await (0, supertest_1.default)(server_1.default)
        .post('/api/items')
        .set('authorization', `Bearer ${token}`)
        .send({ name: 'Frozen Item' });
    const frozenId = frozenCreated.body.data.id;
    const baseFreeze = await (0, supertest_1.default)(server_1.default)
        .post(`/api/items/${frozenId}/freeze`)
        .set('authorization', `Bearer ${token}`)
        .send({
        type: 'base',
        svg: '<svg/>',
        metadata: '{}',
        idempotencyKey: 'idem-key-status-01',
        expectedVersion: 0,
        hash: 'status-hash-01',
    });
    strict_1.default.equal(baseFreeze.status, 201);
    const finalFreeze = await (0, supertest_1.default)(server_1.default)
        .post(`/api/items/${frozenId}/freeze`)
        .set('authorization', `Bearer ${token}`)
        .send({
        type: 'final',
        svg: '<svg><final/></svg>',
        metadata: '{}',
        idempotencyKey: 'idem-key-status-02',
        expectedVersion: 1,
        parentHash: 'status-hash-01',
        hash: 'status-hash-02',
    });
    strict_1.default.equal(finalFreeze.status, 201);
    const frozenView = await (0, supertest_1.default)(server_1.default).get(`/api/items/${frozenId}/full`);
    strict_1.default.equal(frozenView.status, 200);
    strict_1.default.equal(frozenView.body.data.status, 'FROZEN');
});
(0, node_test_1.default)('GET /api/items/:id/verify returns valid report for intact chain', async () => {
    const token = await loginAndGetToken();
    const created = await (0, supertest_1.default)(server_1.default)
        .post('/api/items')
        .set('authorization', `Bearer ${token}`)
        .send({ name: 'Verify Item' });
    const itemId = created.body.data.id;
    const first = await (0, supertest_1.default)(server_1.default)
        .post(`/api/items/${itemId}/freeze`)
        .set('authorization', `Bearer ${token}`)
        .send({
        type: 'base',
        svg: '<svg/>',
        metadata: '{}',
        idempotencyKey: 'idem-verify-01',
        expectedVersion: 0,
        hash: 'verify-hash-01',
    });
    strict_1.default.equal(first.status, 201);
    const second = await (0, supertest_1.default)(server_1.default)
        .post(`/api/items/${itemId}/freeze`)
        .set('authorization', `Bearer ${token}`)
        .send({
        type: 'intervention',
        svg: '<svg/>',
        metadata: '{}',
        idempotencyKey: 'idem-verify-02',
        expectedVersion: 1,
        parentHash: 'verify-hash-01',
        hash: 'verify-hash-02',
    });
    strict_1.default.equal(second.status, 201);
    const verification = await (0, supertest_1.default)(server_1.default).get(`/api/items/${itemId}/verify`);
    strict_1.default.equal(verification.status, 200);
    strict_1.default.equal(verification.body.success, true);
    strict_1.default.equal(verification.body.data.itemId, itemId);
    strict_1.default.equal(verification.body.data.isValid, true);
    strict_1.default.equal(verification.body.data.freezeCount, 2);
    strict_1.default.equal(verification.body.data.currentHash, 'verify-hash-02');
    strict_1.default.equal(verification.body.data.latestHash, 'verify-hash-02');
});
(0, node_test_1.default)('GET /api/items/:id/verify returns invalid report for tampered chain', async () => {
    const token = await loginAndGetToken();
    const created = await (0, supertest_1.default)(server_1.default)
        .post('/api/items')
        .set('authorization', `Bearer ${token}`)
        .send({ name: 'Tampered Verify Item' });
    const itemId = created.body.data.id;
    const first = await (0, supertest_1.default)(server_1.default)
        .post(`/api/items/${itemId}/freeze`)
        .set('authorization', `Bearer ${token}`)
        .send({
        type: 'base',
        svg: '<svg/>',
        metadata: '{}',
        idempotencyKey: 'idem-verify-tamper-01',
        expectedVersion: 0,
        hash: 'verify-tamper-hash-01',
    });
    strict_1.default.equal(first.status, 201);
    const second = await (0, supertest_1.default)(server_1.default)
        .post(`/api/items/${itemId}/freeze`)
        .set('authorization', `Bearer ${token}`)
        .send({
        type: 'intervention',
        svg: '<svg/>',
        metadata: '{}',
        idempotencyKey: 'idem-verify-tamper-02',
        expectedVersion: 1,
        parentHash: 'verify-tamper-hash-01',
        hash: 'verify-tamper-hash-02',
    });
    strict_1.default.equal(second.status, 201);
    await prisma.freeze.update({
        where: { id: second.body.data.id },
        data: { parentHash: 'BROKEN_PARENT' },
    });
    const verification = await (0, supertest_1.default)(server_1.default).get(`/api/items/${itemId}/verify`);
    strict_1.default.equal(verification.status, 200);
    strict_1.default.equal(verification.body.success, true);
    strict_1.default.equal(verification.body.data.isValid, false);
    strict_1.default.equal(verification.body.data.freezeCount, 2);
    strict_1.default.equal(verification.body.data.checks.some((check) => check.code.startsWith('PARENT_HASH_') && check.ok === false), true);
});
(0, node_test_1.default)('GET /api/items/:id/freezes supports cursor pagination', async () => {
    const token = await loginAndGetToken();
    const created = await (0, supertest_1.default)(server_1.default)
        .post('/api/items')
        .set('authorization', `Bearer ${token}`)
        .send({ name: 'Freeze Page Item' });
    const itemId = created.body.data.id;
    const freeze1 = await (0, supertest_1.default)(server_1.default)
        .post(`/api/items/${itemId}/freeze`)
        .set('authorization', `Bearer ${token}`)
        .send({
        type: 'base',
        svg: '<svg/>',
        metadata: '{}',
        idempotencyKey: 'idem-page-01',
        expectedVersion: 0,
        hash: 'page-hash-01',
    });
    strict_1.default.equal(freeze1.status, 201);
    const freeze2 = await (0, supertest_1.default)(server_1.default)
        .post(`/api/items/${itemId}/freeze`)
        .set('authorization', `Bearer ${token}`)
        .send({
        type: 'intervention',
        svg: '<svg/>',
        metadata: '{}',
        idempotencyKey: 'idem-page-02',
        expectedVersion: 1,
        parentHash: 'page-hash-01',
        hash: 'page-hash-02',
    });
    strict_1.default.equal(freeze2.status, 201);
    const freeze3 = await (0, supertest_1.default)(server_1.default)
        .post(`/api/items/${itemId}/freeze`)
        .set('authorization', `Bearer ${token}`)
        .send({
        type: 'final',
        svg: '<svg/>',
        metadata: '{}',
        idempotencyKey: 'idem-page-03',
        expectedVersion: 2,
        parentHash: 'page-hash-02',
        hash: 'page-hash-03',
    });
    strict_1.default.equal(freeze3.status, 201);
    const firstPage = await (0, supertest_1.default)(server_1.default).get(`/api/items/${itemId}/freezes?limit=2`);
    strict_1.default.equal(firstPage.status, 200);
    strict_1.default.equal(firstPage.body.success, true);
    strict_1.default.equal(firstPage.body.data.freezes.length, 2);
    strict_1.default.equal(typeof firstPage.body.data.nextCursor, 'string');
    const secondPage = await (0, supertest_1.default)(server_1.default).get(`/api/items/${itemId}/freezes?limit=2&cursor=${firstPage.body.data.nextCursor}`);
    strict_1.default.equal(secondPage.status, 200);
    strict_1.default.equal(secondPage.body.success, true);
    strict_1.default.equal(secondPage.body.data.freezes.length, 1);
});
(0, node_test_1.default)('POST /api/items/:id/freeze is idempotent for same idempotencyKey', async () => {
    const token = await loginAndGetToken();
    const created = await (0, supertest_1.default)(server_1.default)
        .post('/api/items')
        .set('authorization', `Bearer ${token}`)
        .send({ name: 'Freeze Item' });
    const id = created.body.data.id;
    const payload = {
        type: 'base',
        svg: '<svg/>',
        metadata: '{}',
        idempotencyKey: 'idem-key-0001',
        expectedVersion: 0,
        hash: 'hash-001',
    };
    const first = await (0, supertest_1.default)(server_1.default)
        .post(`/api/items/${id}/freeze`)
        .set('authorization', `Bearer ${token}`)
        .send(payload);
    const second = await (0, supertest_1.default)(server_1.default)
        .post(`/api/items/${id}/freeze`)
        .set('authorization', `Bearer ${token}`)
        .send(payload);
    strict_1.default.equal(first.status, 201);
    strict_1.default.equal(second.status, 201);
    strict_1.default.equal(first.body.success, true);
    strict_1.default.equal(second.body.success, true);
    strict_1.default.equal(first.body.data.id, second.body.data.id);
    const freezeCount = await prisma.freeze.count({ where: { itemId: id } });
    strict_1.default.equal(freezeCount, 1);
});
(0, node_test_1.default)('POST /api/items/:id/freeze returns 409 for duplicate hash with different idempotencyKey', async () => {
    const token = await loginAndGetToken();
    const created = await (0, supertest_1.default)(server_1.default)
        .post('/api/items')
        .set('authorization', `Bearer ${token}`)
        .send({ name: 'Dup Hash Item' });
    const id = created.body.data.id;
    const firstPayload = {
        type: 'base',
        svg: '<svg/>',
        metadata: '{}',
        idempotencyKey: 'idem-key-1001',
        expectedVersion: 0,
        hash: 'dup-hash-01',
    };
    const secondPayload = {
        type: 'intervention',
        svg: '<svg><g/></svg>',
        metadata: '{}',
        idempotencyKey: 'idem-key-1002',
        expectedVersion: 1,
        hash: 'dup-hash-01',
    };
    const first = await (0, supertest_1.default)(server_1.default)
        .post(`/api/items/${id}/freeze`)
        .set('authorization', `Bearer ${token}`)
        .send(firstPayload);
    const second = await (0, supertest_1.default)(server_1.default)
        .post(`/api/items/${id}/freeze`)
        .set('authorization', `Bearer ${token}`)
        .send(secondPayload);
    strict_1.default.equal(first.status, 201);
    strict_1.default.equal(second.status, 409);
    strict_1.default.equal(second.body.code, 'DUPLICATE_HASH');
});
(0, node_test_1.default)('POST /api/items/:id/freeze rejects stale version with 409', async () => {
    const token = await loginAndGetToken();
    const created = await (0, supertest_1.default)(server_1.default)
        .post('/api/items')
        .set('authorization', `Bearer ${token}`)
        .send({ name: 'Stale Item' });
    const id = created.body.data.id;
    const first = await (0, supertest_1.default)(server_1.default)
        .post(`/api/items/${id}/freeze`)
        .set('authorization', `Bearer ${token}`)
        .send({
        type: 'base',
        svg: '<svg/>',
        metadata: '{}',
        idempotencyKey: 'idem-stale-01',
        expectedVersion: 0,
        hash: 'stale-hash-01',
    });
    strict_1.default.equal(first.status, 201);
    const stale = await (0, supertest_1.default)(server_1.default)
        .post(`/api/items/${id}/freeze`)
        .set('authorization', `Bearer ${token}`)
        .send({
        type: 'intervention',
        svg: '<svg/>',
        metadata: '{}',
        idempotencyKey: 'idem-stale-02',
        expectedVersion: 0,
        parentHash: 'stale-hash-01',
        hash: 'stale-hash-02',
    });
    strict_1.default.equal(stale.status, 409);
    strict_1.default.equal(stale.body.code, 'STALE_VERSION');
});
(0, node_test_1.default)('POST /api/items/:id/freeze returns 400 for foreign key violation', async () => {
    const token = await loginAndGetToken();
    const response = await (0, supertest_1.default)(server_1.default)
        .post('/api/items/non-existent-id/freeze')
        .set('authorization', `Bearer ${token}`)
        .send({
        type: 'base',
        svg: '<svg/>',
        metadata: '{}',
        idempotencyKey: 'idem-key-2001',
        expectedVersion: 0,
        hash: 'hash-fk-001',
    });
    strict_1.default.equal(response.status, 400);
    strict_1.default.equal(response.body.code, 'FOREIGN_KEY_VIOLATION');
});
(0, node_test_1.default)('restart-read cycle keeps data after bootstrap rerun', async () => {
    const token = await loginAndGetToken();
    const created = await (0, supertest_1.default)(server_1.default)
        .post('/api/items')
        .set('authorization', `Bearer ${token}`)
        .send({ name: 'Restart Item' });
    const id = created.body.data.id;
    strict_1.default.equal(created.status, 201);
    await (0, bootstrap_1.ensureSqliteSchema)();
    const verification = await (0, bootstrap_1.verifySqliteSchema)();
    strict_1.default.equal(verification.ok, true);
    const response = await (0, supertest_1.default)(server_1.default).get(`/api/items/${id}`);
    strict_1.default.equal(response.status, 200);
    strict_1.default.equal(response.body.success, true);
    strict_1.default.equal(response.body.data.id, id);
    strict_1.default.equal(response.body.data.name, 'Restart Item');
});
(0, node_test_1.default)('rate limiter enforces 429', async () => {
    const env = (0, env_1.getEnv)();
    const attempts = env.RATE_LIMIT_MAX + 20;
    let rateLimitedResponse = null;
    for (let i = 0; i < attempts; i += 1) {
        const response = await (0, supertest_1.default)(server_1.default)
            .post('/api/auth/login')
            .send({ username: 'admin', password: 'pass' });
        if (response.status === 429) {
            rateLimitedResponse = { status: response.status, body: response.body };
            break;
        }
    }
    strict_1.default.notEqual(rateLimitedResponse, null);
    strict_1.default.equal(rateLimitedResponse?.status, 429);
    strict_1.default.equal((rateLimitedResponse?.body).code, 'RATE_LIMITED');
});
//# sourceMappingURL=api.integration.test.js.map