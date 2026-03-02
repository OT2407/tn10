import test, { beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { prisma } from '../../infrastructure/prisma';
import app from '../../api/server';
import { ensureSqliteSchema } from '../../infrastructure/schema/bootstrap';

async function loginAndGetToken(): Promise<string> {
  const response = await request(app).post('/api/auth/login').send({
    username: 'admin',
    password: 'pass',
  });
  assert.equal(response.status, 200);
  return response.body.data.token as string;
}

beforeEach(async () => {
  await ensureSqliteSchema();
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
  await prisma.walletTransaction.deleteMany();
  await prisma.wallet.deleteMany();
  await prisma.paymentIntent.deleteMany();
  await prisma.order.deleteMany();
  await prisma.contract.deleteMany();
  await prisma.escrowMilestone.deleteMany();
  await prisma.escrow.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.freeze.deleteMany();
  await prisma.item.deleteMany();
  await prisma.user.deleteMany();
});

test('wallet balance retrieval after credit and debit', async () => {
  const token = await loginAndGetToken();
  const admin = await prisma.user.findUnique({ where: { email: 'admin' } });
  assert.ok(admin);

  const credit = await request(app)
    .post(`/api/wallets/${admin.id}/credit`)
    .set('authorization', `Bearer ${token}`)
    .send({ amount: 500, reference: 'credit-001' });
  assert.equal(credit.status, 200);

  const debit = await request(app)
    .post(`/api/wallets/${admin.id}/debit`)
    .set('authorization', `Bearer ${token}`)
    .send({ amount: 120, reference: 'debit-001' });
  assert.equal(debit.status, 200);

  const balance = await request(app)
    .get(`/api/wallets/${admin.id}/balance`)
    .set('authorization', `Bearer ${token}`);
  assert.equal(balance.status, 200);
  assert.equal(balance.body.data.balance, 380);
});

test('wallet create/get routes work on /api/wallet', async () => {
  const token = await loginAndGetToken();

  const create = await request(app).post('/api/wallet').set('authorization', `Bearer ${token}`).send({});
  assert.equal(create.status, 201);
  assert.equal(create.body.success, true);

  const get = await request(app).get('/api/wallet').set('authorization', `Bearer ${token}`);
  assert.equal(get.status, 200);
  assert.equal(get.body.success, true);
  assert.equal(typeof get.body.data.walletId, 'string');
});

test('admin can adjust wallet via /api/wallet/adjust', async () => {
  const token = await loginAndGetToken();
  const admin = await prisma.user.findUnique({ where: { email: 'admin' } });
  assert.ok(admin);

  const adjust = await request(app)
    .post('/api/wallet/adjust')
    .set('authorization', `Bearer ${token}`)
    .send({
      ownerId: admin.id,
      amount: 75,
      type: 'CREDIT',
      referenceId: 'admin-adjust-001',
    });
  assert.equal(adjust.status, 200);
  assert.equal(adjust.body.success, true);

  const balance = await request(app).get('/api/wallet').set('authorization', `Bearer ${token}`);
  assert.equal(balance.status, 200);
  assert.equal(balance.body.data.balance, 75);
});

test('prevent negative wallet balance', async () => {
  const token = await loginAndGetToken();
  const admin = await prisma.user.findUnique({ where: { email: 'admin' } });
  assert.ok(admin);

  await request(app)
    .post(`/api/wallets/${admin.id}/credit`)
    .set('authorization', `Bearer ${token}`)
    .send({ amount: 100, reference: 'credit-negative-001' });

  const debit = await request(app)
    .post(`/api/wallets/${admin.id}/debit`)
    .set('authorization', `Bearer ${token}`)
    .send({ amount: 101, reference: 'debit-negative-001' });
  assert.equal(debit.status, 409);
  assert.equal(debit.body.code, 'INSUFFICIENT_FUNDS');
});

test('order payment with wallet discount debits wallet and reduces order amount', async () => {
  const previousDiscount = process.env.WALLET_DISCOUNT_PERCENT;
  process.env.WALLET_DISCOUNT_PERCENT = '10';
  try {
    const token = await loginAndGetToken();
    const buyer = await prisma.user.findUnique({ where: { email: 'admin' } });
    assert.ok(buyer);

    const seller = await prisma.user.create({
      data: { email: 'wallet-order-seller@test.local', password: 'hashed', role: 'user' },
    });
    const item = await prisma.item.create({
      data: { ownerId: seller.id, name: 'Wallet Pay Item' },
    });

    const credit = await request(app)
      .post(`/api/wallets/${buyer.id}/credit`)
      .set('authorization', `Bearer ${token}`)
      .send({ amount: 500, reference: 'credit-order-001' });
    assert.equal(credit.status, 200);

    const order = await request(app)
      .post('/api/orders')
      .set('authorization', `Bearer ${token}`)
      .send({
        sellerId: seller.id,
        itemId: item.id,
        amount: 1000,
        paymentWithWallet: { amount: 300 },
      });
    assert.equal(order.status, 201);
    assert.equal(order.body.data.amount, 900);

    const balance = await request(app)
      .get(`/api/wallets/${buyer.id}/balance`)
      .set('authorization', `Bearer ${token}`);
    assert.equal(balance.status, 200);
    assert.equal(balance.body.data.balance, 200);
  } finally {
    if (previousDiscount === undefined) {
      delete process.env.WALLET_DISCOUNT_PERCENT;
    } else {
      process.env.WALLET_DISCOUNT_PERCENT = previousDiscount;
    }
  }
});

test('wallet transactions pagination works', async () => {
  const token = await loginAndGetToken();
  const admin = await prisma.user.findUnique({ where: { email: 'admin' } });
  assert.ok(admin);

  for (let i = 1; i <= 3; i += 1) {
    const response = await request(app)
      .post(`/api/wallets/${admin.id}/credit`)
      .set('authorization', `Bearer ${token}`)
      .send({ amount: 10 * i, reference: `credit-page-${i}` });
    assert.equal(response.status, 200);
  }

  const firstPage = await request(app)
    .get(`/api/wallets/${admin.id}/transactions?limit=2`)
    .set('authorization', `Bearer ${token}`);
  assert.equal(firstPage.status, 200);
  assert.equal(firstPage.body.data.transactions.length, 2);
  assert.equal(typeof firstPage.body.data.nextCursor, 'string');

  const secondPage = await request(app)
    .get(
      `/api/wallets/${admin.id}/transactions?limit=2&cursor=${firstPage.body.data.nextCursor as string}`
    )
    .set('authorization', `Bearer ${token}`);
  assert.equal(secondPage.status, 200);
  assert.equal(secondPage.body.data.transactions.length, 1);
});

test('wallet transaction history works on /api/wallet/transactions', async () => {
  const token = await loginAndGetToken();
  const admin = await prisma.user.findUnique({ where: { email: 'admin' } });
  assert.ok(admin);

  await request(app)
    .post('/api/wallet/adjust')
    .set('authorization', `Bearer ${token}`)
    .send({ ownerId: admin.id, amount: 33, type: 'CREDIT' });

  const response = await request(app)
    .get('/api/wallet/transactions?limit=10')
    .set('authorization', `Bearer ${token}`);
  assert.equal(response.status, 200);
  assert.equal(response.body.success, true);
  assert.equal(Array.isArray(response.body.data.transactions), true);
});

test('wallet credit and debit are idempotent by reference', async () => {
  const token = await loginAndGetToken();
  const admin = await prisma.user.findUnique({ where: { email: 'admin' } });
  assert.ok(admin);

  const firstCredit = await request(app)
    .post(`/api/wallets/${admin.id}/credit`)
    .set('authorization', `Bearer ${token}`)
    .send({ amount: 250, reference: 'idem-credit-001' });
  const secondCredit = await request(app)
    .post(`/api/wallets/${admin.id}/credit`)
    .set('authorization', `Bearer ${token}`)
    .send({ amount: 250, reference: 'idem-credit-001' });

  assert.equal(firstCredit.status, 200);
  assert.equal(secondCredit.status, 200);

  const debitSeed = await request(app)
    .post(`/api/wallets/${admin.id}/credit`)
    .set('authorization', `Bearer ${token}`)
    .send({ amount: 100, reference: 'idem-credit-002' });
  assert.equal(debitSeed.status, 200);

  const firstDebit = await request(app)
    .post(`/api/wallets/${admin.id}/debit`)
    .set('authorization', `Bearer ${token}`)
    .send({ amount: 100, reference: 'idem-debit-001' });
  const secondDebit = await request(app)
    .post(`/api/wallets/${admin.id}/debit`)
    .set('authorization', `Bearer ${token}`)
    .send({ amount: 100, reference: 'idem-debit-001' });

  assert.equal(firstDebit.status, 200);
  assert.equal(secondDebit.status, 200);

  const txs = await request(app)
    .get(`/api/wallets/${admin.id}/transactions?limit=20`)
    .set('authorization', `Bearer ${token}`);
  assert.equal(txs.status, 200);
  const idemCredits = (txs.body.data.transactions as Array<{ type: string; reference: string }>).filter(
    (row) => row.type === 'CREDIT' && row.reference === 'idem-credit-001'
  );
  const idemDebits = (txs.body.data.transactions as Array<{ type: string; reference: string }>).filter(
    (row) => row.type === 'DEBIT' && row.reference === 'idem-debit-001'
  );
  assert.equal(idemCredits.length, 1);
  assert.equal(idemDebits.length, 1);
});
