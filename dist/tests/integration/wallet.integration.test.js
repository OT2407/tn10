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
const prisma_1 = require("../../infrastructure/prisma");
const server_1 = __importDefault(require("../../api/server"));
const bootstrap_1 = require("../../infrastructure/schema/bootstrap");
async function loginAndGetToken() {
    const response = await (0, supertest_1.default)(server_1.default).post('/api/auth/login').send({
        username: 'admin',
        password: 'pass',
    });
    strict_1.default.equal(response.status, 200);
    return response.body.data.token;
}
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
    await prisma_1.prisma.walletTransaction.deleteMany();
    await prisma_1.prisma.wallet.deleteMany();
    await prisma_1.prisma.paymentIntent.deleteMany();
    await prisma_1.prisma.order.deleteMany();
    await prisma_1.prisma.contract.deleteMany();
    await prisma_1.prisma.escrowMilestone.deleteMany();
    await prisma_1.prisma.escrow.deleteMany();
    await prisma_1.prisma.transaction.deleteMany();
    await prisma_1.prisma.freeze.deleteMany();
    await prisma_1.prisma.item.deleteMany();
    await prisma_1.prisma.user.deleteMany();
});
(0, node_test_1.default)('wallet balance retrieval after credit and debit', async () => {
    const token = await loginAndGetToken();
    const admin = await prisma_1.prisma.user.findUnique({ where: { email: 'admin' } });
    strict_1.default.ok(admin);
    const credit = await (0, supertest_1.default)(server_1.default)
        .post(`/api/wallets/${admin.id}/credit`)
        .set('authorization', `Bearer ${token}`)
        .send({ amount: 500, reference: 'credit-001' });
    strict_1.default.equal(credit.status, 200);
    const debit = await (0, supertest_1.default)(server_1.default)
        .post(`/api/wallets/${admin.id}/debit`)
        .set('authorization', `Bearer ${token}`)
        .send({ amount: 120, reference: 'debit-001' });
    strict_1.default.equal(debit.status, 200);
    const balance = await (0, supertest_1.default)(server_1.default)
        .get(`/api/wallets/${admin.id}/balance`)
        .set('authorization', `Bearer ${token}`);
    strict_1.default.equal(balance.status, 200);
    strict_1.default.equal(balance.body.data.balance, 380);
});
(0, node_test_1.default)('wallet create/get routes work on /api/wallet', async () => {
    const token = await loginAndGetToken();
    const create = await (0, supertest_1.default)(server_1.default).post('/api/wallet').set('authorization', `Bearer ${token}`).send({});
    strict_1.default.equal(create.status, 201);
    strict_1.default.equal(create.body.success, true);
    const get = await (0, supertest_1.default)(server_1.default).get('/api/wallet').set('authorization', `Bearer ${token}`);
    strict_1.default.equal(get.status, 200);
    strict_1.default.equal(get.body.success, true);
    strict_1.default.equal(typeof get.body.data.walletId, 'string');
});
(0, node_test_1.default)('admin can adjust wallet via /api/wallet/adjust', async () => {
    const token = await loginAndGetToken();
    const admin = await prisma_1.prisma.user.findUnique({ where: { email: 'admin' } });
    strict_1.default.ok(admin);
    const adjust = await (0, supertest_1.default)(server_1.default)
        .post('/api/wallet/adjust')
        .set('authorization', `Bearer ${token}`)
        .send({
        ownerId: admin.id,
        amount: 75,
        type: 'CREDIT',
        referenceId: 'admin-adjust-001',
    });
    strict_1.default.equal(adjust.status, 200);
    strict_1.default.equal(adjust.body.success, true);
    const balance = await (0, supertest_1.default)(server_1.default).get('/api/wallet').set('authorization', `Bearer ${token}`);
    strict_1.default.equal(balance.status, 200);
    strict_1.default.equal(balance.body.data.balance, 75);
});
(0, node_test_1.default)('prevent negative wallet balance', async () => {
    const token = await loginAndGetToken();
    const admin = await prisma_1.prisma.user.findUnique({ where: { email: 'admin' } });
    strict_1.default.ok(admin);
    await (0, supertest_1.default)(server_1.default)
        .post(`/api/wallets/${admin.id}/credit`)
        .set('authorization', `Bearer ${token}`)
        .send({ amount: 100, reference: 'credit-negative-001' });
    const debit = await (0, supertest_1.default)(server_1.default)
        .post(`/api/wallets/${admin.id}/debit`)
        .set('authorization', `Bearer ${token}`)
        .send({ amount: 101, reference: 'debit-negative-001' });
    strict_1.default.equal(debit.status, 409);
    strict_1.default.equal(debit.body.code, 'INSUFFICIENT_FUNDS');
});
(0, node_test_1.default)('order payment with wallet discount debits wallet and reduces order amount', async () => {
    const previousDiscount = process.env.WALLET_DISCOUNT_PERCENT;
    process.env.WALLET_DISCOUNT_PERCENT = '10';
    try {
        const token = await loginAndGetToken();
        const buyer = await prisma_1.prisma.user.findUnique({ where: { email: 'admin' } });
        strict_1.default.ok(buyer);
        const seller = await prisma_1.prisma.user.create({
            data: { email: 'wallet-order-seller@test.local', password: 'hashed', role: 'user' },
        });
        const item = await prisma_1.prisma.item.create({
            data: { ownerId: seller.id, name: 'Wallet Pay Item' },
        });
        const credit = await (0, supertest_1.default)(server_1.default)
            .post(`/api/wallets/${buyer.id}/credit`)
            .set('authorization', `Bearer ${token}`)
            .send({ amount: 500, reference: 'credit-order-001' });
        strict_1.default.equal(credit.status, 200);
        const order = await (0, supertest_1.default)(server_1.default)
            .post('/api/orders')
            .set('authorization', `Bearer ${token}`)
            .send({
            sellerId: seller.id,
            itemId: item.id,
            amount: 1000,
            paymentWithWallet: { amount: 300 },
        });
        strict_1.default.equal(order.status, 201);
        strict_1.default.equal(order.body.data.amount, 900);
        const balance = await (0, supertest_1.default)(server_1.default)
            .get(`/api/wallets/${buyer.id}/balance`)
            .set('authorization', `Bearer ${token}`);
        strict_1.default.equal(balance.status, 200);
        strict_1.default.equal(balance.body.data.balance, 200);
    }
    finally {
        if (previousDiscount === undefined) {
            delete process.env.WALLET_DISCOUNT_PERCENT;
        }
        else {
            process.env.WALLET_DISCOUNT_PERCENT = previousDiscount;
        }
    }
});
(0, node_test_1.default)('wallet transactions pagination works', async () => {
    const token = await loginAndGetToken();
    const admin = await prisma_1.prisma.user.findUnique({ where: { email: 'admin' } });
    strict_1.default.ok(admin);
    for (let i = 1; i <= 3; i += 1) {
        const response = await (0, supertest_1.default)(server_1.default)
            .post(`/api/wallets/${admin.id}/credit`)
            .set('authorization', `Bearer ${token}`)
            .send({ amount: 10 * i, reference: `credit-page-${i}` });
        strict_1.default.equal(response.status, 200);
    }
    const firstPage = await (0, supertest_1.default)(server_1.default)
        .get(`/api/wallets/${admin.id}/transactions?limit=2`)
        .set('authorization', `Bearer ${token}`);
    strict_1.default.equal(firstPage.status, 200);
    strict_1.default.equal(firstPage.body.data.transactions.length, 2);
    strict_1.default.equal(typeof firstPage.body.data.nextCursor, 'string');
    const secondPage = await (0, supertest_1.default)(server_1.default)
        .get(`/api/wallets/${admin.id}/transactions?limit=2&cursor=${firstPage.body.data.nextCursor}`)
        .set('authorization', `Bearer ${token}`);
    strict_1.default.equal(secondPage.status, 200);
    strict_1.default.equal(secondPage.body.data.transactions.length, 1);
});
(0, node_test_1.default)('wallet transaction history works on /api/wallet/transactions', async () => {
    const token = await loginAndGetToken();
    const admin = await prisma_1.prisma.user.findUnique({ where: { email: 'admin' } });
    strict_1.default.ok(admin);
    await (0, supertest_1.default)(server_1.default)
        .post('/api/wallet/adjust')
        .set('authorization', `Bearer ${token}`)
        .send({ ownerId: admin.id, amount: 33, type: 'CREDIT' });
    const response = await (0, supertest_1.default)(server_1.default)
        .get('/api/wallet/transactions?limit=10')
        .set('authorization', `Bearer ${token}`);
    strict_1.default.equal(response.status, 200);
    strict_1.default.equal(response.body.success, true);
    strict_1.default.equal(Array.isArray(response.body.data.transactions), true);
});
(0, node_test_1.default)('wallet credit and debit are idempotent by reference', async () => {
    const token = await loginAndGetToken();
    const admin = await prisma_1.prisma.user.findUnique({ where: { email: 'admin' } });
    strict_1.default.ok(admin);
    const firstCredit = await (0, supertest_1.default)(server_1.default)
        .post(`/api/wallets/${admin.id}/credit`)
        .set('authorization', `Bearer ${token}`)
        .send({ amount: 250, reference: 'idem-credit-001' });
    const secondCredit = await (0, supertest_1.default)(server_1.default)
        .post(`/api/wallets/${admin.id}/credit`)
        .set('authorization', `Bearer ${token}`)
        .send({ amount: 250, reference: 'idem-credit-001' });
    strict_1.default.equal(firstCredit.status, 200);
    strict_1.default.equal(secondCredit.status, 200);
    const debitSeed = await (0, supertest_1.default)(server_1.default)
        .post(`/api/wallets/${admin.id}/credit`)
        .set('authorization', `Bearer ${token}`)
        .send({ amount: 100, reference: 'idem-credit-002' });
    strict_1.default.equal(debitSeed.status, 200);
    const firstDebit = await (0, supertest_1.default)(server_1.default)
        .post(`/api/wallets/${admin.id}/debit`)
        .set('authorization', `Bearer ${token}`)
        .send({ amount: 100, reference: 'idem-debit-001' });
    const secondDebit = await (0, supertest_1.default)(server_1.default)
        .post(`/api/wallets/${admin.id}/debit`)
        .set('authorization', `Bearer ${token}`)
        .send({ amount: 100, reference: 'idem-debit-001' });
    strict_1.default.equal(firstDebit.status, 200);
    strict_1.default.equal(secondDebit.status, 200);
    const txs = await (0, supertest_1.default)(server_1.default)
        .get(`/api/wallets/${admin.id}/transactions?limit=20`)
        .set('authorization', `Bearer ${token}`);
    strict_1.default.equal(txs.status, 200);
    const idemCredits = txs.body.data.transactions.filter((row) => row.type === 'CREDIT' && row.reference === 'idem-credit-001');
    const idemDebits = txs.body.data.transactions.filter((row) => row.type === 'DEBIT' && row.reference === 'idem-debit-001');
    strict_1.default.equal(idemCredits.length, 1);
    strict_1.default.equal(idemDebits.length, 1);
});
//# sourceMappingURL=wallet.integration.test.js.map