import test, { beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import app from '../../api/server';
import { ensureSqliteSchema, verifySqliteSchema } from '../../infrastructure/schema/bootstrap';
import { getEnv } from '../../infrastructure/env';

const prisma = new PrismaClient();

async function loginAndGetToken(): Promise<string> {
  const response = await request(app)
    .post('/api/auth/login')
    .send({
      username: 'admin',
      password: 'pass',
    });

  assert.equal(response.status, 200);
  assert.equal(response.body.success, true);
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

test('schema bootstrap verify succeeds', async () => {
  await ensureSqliteSchema();
  const verification = await verifySqliteSchema();
  assert.equal(verification.ok, true);
  assert.deepEqual(verification.missingTables, []);
});

test('GET /health returns ok', async () => {
  const response = await request(app).get('/health');

  assert.equal(response.status, 200);
  assert.deepEqual(response.body, { status: 'ok' });
});

test('GET /ready returns ok', async () => {
  const response = await request(app).get('/ready');

  assert.equal(response.status, 200);
  assert.deepEqual(response.body, { status: 'ok' });
});

test('POST /api/auth/login returns token with valid credentials', async () => {
  const token = await loginAndGetToken();
  assert.equal(typeof token, 'string');
  assert.ok(token.length > 10);
});

test('GET /api/contracts/schema returns contracts schema', async () => {
  const response = await request(app).get('/api/contracts/schema');

  assert.equal(response.status, 200);
  assert.equal(response.body.success, true);
  assert.equal(Array.isArray(response.body.data.escrowTransition.currentStatus), true);
  assert.equal(Array.isArray(response.body.data.escrowTransition.event), true);
});

test('protected POST routes require token (401)', async () => {
  const createItemResponse = await request(app)
    .post('/api/items')
    .send({ name: 'Unauthorized Item' });

  assert.equal(createItemResponse.status, 401);
  assert.equal(createItemResponse.body.code, 'UNAUTHORIZED');

  const freezeResponse = await request(app)
    .post('/api/items/some-id/freeze')
    .send({
      type: 'base',
      svg: '<svg/>',
      metadata: '{}',
      idempotencyKey: 'idem-key-auth-01',
      expectedVersion: 0,
      hash: 'hash-auth-01',
    });

  assert.equal(freezeResponse.status, 401);
  assert.equal(freezeResponse.body.code, 'UNAUTHORIZED');

  const contractsResponse = await request(app)
    .post('/api/contracts/escrow/transition')
    .send({ currentStatus: 'PENDING', event: 'HOLD' });

  assert.equal(contractsResponse.status, 401);
  assert.equal(contractsResponse.body.code, 'UNAUTHORIZED');
});

test('POST /api/contracts/escrow/transition validates state machine', async () => {
  const token = await loginAndGetToken();

  const ok = await request(app)
    .post('/api/contracts/escrow/transition')
    .set('authorization', `Bearer ${token}`)
    .send({ currentStatus: 'PENDING', event: 'HOLD' });
  assert.equal(ok.status, 200);
  assert.equal(ok.body.success, true);
  assert.equal(ok.body.data.to, 'HOLDING');

  const invalid = await request(app)
    .post('/api/contracts/escrow/transition')
    .set('authorization', `Bearer ${token}`)
    .send({ currentStatus: 'RELEASED', event: 'HOLD' });
  assert.equal(invalid.status, 409);
  assert.equal(invalid.body.code, 'INVALID_ESCROW_TRANSITION');
});

test('POST /api/contracts/payment-intents returns placeholder payload', async () => {
  const token = await loginAndGetToken();

  const response = await request(app)
    .post('/api/contracts/payment-intents')
    .set('authorization', `Bearer ${token}`)
    .send({
      transactionId: 'tx_placeholder_1',
      amount: 1250,
      currency: 'TRY',
      requestId: 'req-contract-1',
    });

  assert.equal(response.status, 201);
  assert.equal(response.body.success, true);
  assert.equal(response.body.data.transactionId, 'tx_placeholder_1');
  assert.equal(response.body.data.amount, 1250);
  assert.equal(response.body.data.currency, 'TRY');
  assert.equal(response.body.data.status, 'requires_confirmation');
  assert.equal(response.body.data.provider, 'placeholder');
});

test('POST /api/orders creates order and payment-intent lifecycle works', async () => {
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
  const createOrderResponse = await request(app)
    .post('/api/orders')
    .set('authorization', `Bearer ${token}`)
    .send({
      sellerId: seller.id,
      itemId: item.id,
      amount: 1450,
    });

  assert.equal(createOrderResponse.status, 201);
  assert.equal(createOrderResponse.body.success, true);
  assert.equal(createOrderResponse.body.data.status, 'pending');
  const orderId = createOrderResponse.body.data.id as string;

  const paymentIntentResponse = await request(app)
    .post(`/api/orders/${orderId}/payment-intents`)
    .set('authorization', `Bearer ${token}`)
    .send({ currency: 'TRY' });

  assert.equal(paymentIntentResponse.status, 201);
  assert.equal(paymentIntentResponse.body.success, true);
  assert.equal(paymentIntentResponse.body.data.orderId, orderId);
  assert.equal(paymentIntentResponse.body.data.status, 'requires_confirmation');
  assert.equal(paymentIntentResponse.body.data.provider, 'placeholder');

  const completeResponse = await request(app)
    .post(`/api/orders/${orderId}/complete`)
    .set('authorization', `Bearer ${token}`)
    .send({});
  assert.equal(completeResponse.status, 200);
  assert.equal(completeResponse.body.data.status, 'completed');
});

test('POST /api/orders/:id/cancel rejects completed order', async () => {
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
  const created = await request(app)
    .post('/api/orders')
    .set('authorization', `Bearer ${token}`)
    .send({
      sellerId: seller.id,
      itemId: item.id,
      amount: 950,
    });
  const orderId = created.body.data.id as string;

  await request(app)
    .post(`/api/orders/${orderId}/complete`)
    .set('authorization', `Bearer ${token}`)
    .send({});

  const cancelResponse = await request(app)
    .post(`/api/orders/${orderId}/cancel`)
    .set('authorization', `Bearer ${token}`)
    .send({});

  assert.equal(cancelResponse.status, 409);
  assert.equal(cancelResponse.body.code, 'INVALID_STATE');
});

test('POST /api/items creates item (201)', async () => {
  const token = await loginAndGetToken();

  const response = await request(app)
    .post('/api/items')
    .set('authorization', `Bearer ${token}`)
    .send({ name: 'Test Item' });

  assert.equal(response.status, 201);
  assert.equal(response.body.success, true);
  assert.equal(typeof response.body.data.id, 'string');
  assert.equal(response.body.data.name, 'Test Item');
});

test('POST /api/items returns 422 for invalid payload', async () => {
  const token = await loginAndGetToken();

  const response = await request(app)
    .post('/api/items')
    .set('authorization', `Bearer ${token}`)
    .send({ name: '' });

  assert.equal(response.status, 422);
  assert.equal(response.body.code, 'VALIDATION_ERROR');
  assert.equal(typeof response.body.message, 'string');
});

test('GET /api/items supports cursor pagination', async () => {
  const token = await loginAndGetToken();

  const names = ['Paginate A', 'Paginate B', 'Paginate C'];
  for (const name of names) {
    const response = await request(app)
      .post('/api/items')
      .set('authorization', `Bearer ${token}`)
      .send({ name });
    assert.equal(response.status, 201);
  }

  const firstPage = await request(app)
    .get('/api/items?limit=2')
    .set('authorization', `Bearer ${token}`);
  assert.equal(firstPage.status, 200);
  assert.equal(firstPage.body.success, true);
  assert.equal(firstPage.body.data.items.length, 2);
  assert.equal(typeof firstPage.body.data.nextCursor, 'string');

  const secondPage = await request(app)
    .get(`/api/items?limit=2&cursor=${firstPage.body.data.nextCursor as string}`)
    .set('authorization', `Bearer ${token}`);
  assert.equal(secondPage.status, 200);
  assert.equal(secondPage.body.success, true);
  assert.equal(secondPage.body.data.items.length, 1);
});

test('GET /api/items/:id returns created item (200)', async () => {
  const token = await loginAndGetToken();

  const created = await request(app)
    .post('/api/items')
    .set('authorization', `Bearer ${token}`)
    .send({ name: 'Lookup Item' });

  const id = created.body.data.id as string;

  const response = await request(app).get(`/api/items/${id}`);

  assert.equal(response.status, 200);
  assert.equal(response.body.success, true);
  assert.equal(response.body.data.id, id);
  assert.equal(response.body.data.name, 'Lookup Item');
});

test('GET /api/items/:id/full returns item with freezes shape', async () => {
  const token = await loginAndGetToken();

  const created = await request(app)
    .post('/api/items')
    .set('authorization', `Bearer ${token}`)
    .send({ name: 'Full Item' });

  const id = created.body.data.id as string;

  const freezePayload = {
    type: 'base',
    svg: '<svg/>',
    metadata: JSON.stringify({ source: 'integration' }),
    idempotencyKey: 'idem-key-full-01',
    expectedVersion: 0,
    hash: 'hash-full-01',
  };

  const freezeResponse = await request(app)
    .post(`/api/items/${id}/freeze`)
    .set('authorization', `Bearer ${token}`)
    .send(freezePayload);

  assert.equal(freezeResponse.status, 201);

  const response = await request(app).get(`/api/items/${id}/full`);
  assert.equal(response.status, 200);
  assert.equal(response.body.success, true);
  assert.equal(response.body.data.id, id);
  assert.equal(response.body.data.name, 'Full Item');
  assert.equal(response.body.data.currentHash, 'hash-full-01');
  assert.equal(response.body.data.status, 'ACTIVE');
  assert.equal(Array.isArray(response.body.data.freezes), true);
  assert.equal(response.body.data.freezes.length, 1);
  assert.equal(response.body.data.freezes[0].hash, 'hash-full-01');
  assert.equal(response.body.data.freezes[0].metadata.source, 'integration');
});

test('GET /api/items/:id/full derives EMPTY and FROZEN statuses', async () => {
  const token = await loginAndGetToken();

  const emptyCreated = await request(app)
    .post('/api/items')
    .set('authorization', `Bearer ${token}`)
    .send({ name: 'Empty Item' });
  const emptyId = emptyCreated.body.data.id as string;

  const emptyView = await request(app).get(`/api/items/${emptyId}/full`);
  assert.equal(emptyView.status, 200);
  assert.equal(emptyView.body.data.status, 'EMPTY');

  const frozenCreated = await request(app)
    .post('/api/items')
    .set('authorization', `Bearer ${token}`)
    .send({ name: 'Frozen Item' });
  const frozenId = frozenCreated.body.data.id as string;

  const baseFreeze = await request(app)
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
  assert.equal(baseFreeze.status, 201);

  const finalFreeze = await request(app)
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
  assert.equal(finalFreeze.status, 201);

  const frozenView = await request(app).get(`/api/items/${frozenId}/full`);
  assert.equal(frozenView.status, 200);
  assert.equal(frozenView.body.data.status, 'FROZEN');
});

test('GET /api/items/:id/verify returns valid report for intact chain', async () => {
  const token = await loginAndGetToken();

  const created = await request(app)
    .post('/api/items')
    .set('authorization', `Bearer ${token}`)
    .send({ name: 'Verify Item' });
  const itemId = created.body.data.id as string;

  const first = await request(app)
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
  assert.equal(first.status, 201);

  const second = await request(app)
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
  assert.equal(second.status, 201);

  const verification = await request(app).get(`/api/items/${itemId}/verify`);
  assert.equal(verification.status, 200);
  assert.equal(verification.body.success, true);
  assert.equal(verification.body.data.itemId, itemId);
  assert.equal(verification.body.data.isValid, true);
  assert.equal(verification.body.data.freezeCount, 2);
  assert.equal(verification.body.data.currentHash, 'verify-hash-02');
  assert.equal(verification.body.data.latestHash, 'verify-hash-02');
});

test('GET /api/items/:id/verify returns invalid report for tampered chain', async () => {
  const token = await loginAndGetToken();

  const created = await request(app)
    .post('/api/items')
    .set('authorization', `Bearer ${token}`)
    .send({ name: 'Tampered Verify Item' });
  const itemId = created.body.data.id as string;

  const first = await request(app)
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
  assert.equal(first.status, 201);

  const second = await request(app)
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
  assert.equal(second.status, 201);

  await prisma.freeze.update({
    where: { id: second.body.data.id as string },
    data: { parentHash: 'BROKEN_PARENT' },
  });

  const verification = await request(app).get(`/api/items/${itemId}/verify`);
  assert.equal(verification.status, 200);
  assert.equal(verification.body.success, true);
  assert.equal(verification.body.data.isValid, false);
  assert.equal(verification.body.data.freezeCount, 2);
  assert.equal(
    verification.body.data.checks.some(
      (check: { code: string; ok: boolean }) => check.code.startsWith('PARENT_HASH_') && check.ok === false
    ),
    true
  );
});

test('GET /api/items/:id/freezes supports cursor pagination', async () => {
  const token = await loginAndGetToken();

  const created = await request(app)
    .post('/api/items')
    .set('authorization', `Bearer ${token}`)
    .send({ name: 'Freeze Page Item' });
  const itemId = created.body.data.id as string;

  const freeze1 = await request(app)
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
  assert.equal(freeze1.status, 201);

  const freeze2 = await request(app)
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
  assert.equal(freeze2.status, 201);

  const freeze3 = await request(app)
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
  assert.equal(freeze3.status, 201);

  const firstPage = await request(app).get(`/api/items/${itemId}/freezes?limit=2`);
  assert.equal(firstPage.status, 200);
  assert.equal(firstPage.body.success, true);
  assert.equal(firstPage.body.data.freezes.length, 2);
  assert.equal(typeof firstPage.body.data.nextCursor, 'string');

  const secondPage = await request(app).get(
    `/api/items/${itemId}/freezes?limit=2&cursor=${firstPage.body.data.nextCursor as string}`
  );
  assert.equal(secondPage.status, 200);
  assert.equal(secondPage.body.success, true);
  assert.equal(secondPage.body.data.freezes.length, 1);
});

test('POST /api/items/:id/freeze is idempotent for same idempotencyKey', async () => {
  const token = await loginAndGetToken();

  const created = await request(app)
    .post('/api/items')
    .set('authorization', `Bearer ${token}`)
    .send({ name: 'Freeze Item' });

  const id = created.body.data.id as string;

  const payload = {
    type: 'base',
    svg: '<svg/>',
    metadata: '{}',
    idempotencyKey: 'idem-key-0001',
    expectedVersion: 0,
    hash: 'hash-001',
  };

  const first = await request(app)
    .post(`/api/items/${id}/freeze`)
    .set('authorization', `Bearer ${token}`)
    .send(payload);

  const second = await request(app)
    .post(`/api/items/${id}/freeze`)
    .set('authorization', `Bearer ${token}`)
    .send(payload);

  assert.equal(first.status, 201);
  assert.equal(second.status, 201);
  assert.equal(first.body.success, true);
  assert.equal(second.body.success, true);
  assert.equal(first.body.data.id, second.body.data.id);

  const freezeCount = await prisma.freeze.count({ where: { itemId: id } });
  assert.equal(freezeCount, 1);
});

test('POST /api/items/:id/freeze returns 409 for duplicate hash with different idempotencyKey', async () => {
  const token = await loginAndGetToken();

  const created = await request(app)
    .post('/api/items')
    .set('authorization', `Bearer ${token}`)
    .send({ name: 'Dup Hash Item' });

  const id = created.body.data.id as string;

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

  const first = await request(app)
    .post(`/api/items/${id}/freeze`)
    .set('authorization', `Bearer ${token}`)
    .send(firstPayload);
  const second = await request(app)
    .post(`/api/items/${id}/freeze`)
    .set('authorization', `Bearer ${token}`)
    .send(secondPayload);

  assert.equal(first.status, 201);
  assert.equal(second.status, 409);
  assert.equal(second.body.code, 'DUPLICATE_HASH');
});

test('POST /api/items/:id/freeze rejects stale version with 409', async () => {
  const token = await loginAndGetToken();
  const created = await request(app)
    .post('/api/items')
    .set('authorization', `Bearer ${token}`)
    .send({ name: 'Stale Item' });
  const id = created.body.data.id as string;

  const first = await request(app)
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
  assert.equal(first.status, 201);

  const stale = await request(app)
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

  assert.equal(stale.status, 409);
  assert.equal(stale.body.code, 'STALE_VERSION');
});

test('POST /api/items/:id/freeze returns 400 for foreign key violation', async () => {
  const token = await loginAndGetToken();

  const response = await request(app)
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

  assert.equal(response.status, 400);
  assert.equal(response.body.code, 'FOREIGN_KEY_VIOLATION');
});

test('restart-read cycle keeps data after bootstrap rerun', async () => {
  const token = await loginAndGetToken();

  const created = await request(app)
    .post('/api/items')
    .set('authorization', `Bearer ${token}`)
    .send({ name: 'Restart Item' });

  const id = created.body.data.id as string;
  assert.equal(created.status, 201);

  await ensureSqliteSchema();
  const verification = await verifySqliteSchema();
  assert.equal(verification.ok, true);

  const response = await request(app).get(`/api/items/${id}`);
  assert.equal(response.status, 200);
  assert.equal(response.body.success, true);
  assert.equal(response.body.data.id, id);
  assert.equal(response.body.data.name, 'Restart Item');
});

test('rate limiter enforces 429', async () => {
  const env = getEnv();
  const attempts = env.RATE_LIMIT_MAX + 20;
  let rateLimitedResponse: { status: number; body: unknown } | null = null;

  for (let i = 0; i < attempts; i += 1) {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ username: 'admin', password: 'pass' });

    if (response.status === 429) {
      rateLimitedResponse = { status: response.status, body: response.body };
      break;
    }
  }

  assert.notEqual(rateLimitedResponse, null);
  assert.equal(rateLimitedResponse?.status, 429);
  assert.equal((rateLimitedResponse?.body as { code?: string }).code, 'RATE_LIMITED');
});
