import test, { beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import app from '../../api/server';
import { prisma } from '../../infrastructure/prisma';
import { ensureSqliteSchema } from '../../infrastructure/schema/bootstrap';
import { createFollow } from '../../services/followService';
import { createLike } from '../../services/likeService';
import { createSave } from '../../services/saveService';
import { getRankedExplorePage } from '../../services/intelligenceService';
import { createOrder, completeOrder } from '../../application/order.usecase';

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

async function loginAndGetToken(): Promise<string> {
  const response = await request(app)
    .post('/api/auth/login')
    .send({ username: 'admin', password: 'pass' });
  assert.equal(response.status, 200);
  return response.body.data.token as string;
}

test('preference update rules apply for like/save/follow/purchase', async () => {
  const buyer = await prisma.user.create({ data: { email: 'intel-buyer@test.local', password: 'x', role: 'user' } });
  const seller = await prisma.user.create({ data: { email: 'intel-seller@test.local', password: 'x', role: 'user' } });

  const item = await prisma.item.create({
    data: {
      ownerId: seller.id,
      sellerId: seller.id,
      name: 'Synth Pack',
      title: 'Synth Pack',
      category: 'music',
      price: 300,
    },
  });

  const tag = await prisma.tag.create({ data: { name: 'Synth' } });
  await prisma.itemTag.create({ data: { itemId: item.id, tagId: tag.id } });

  await createLike(buyer.id, item.id);
  await createSave(buyer.id, item.id);
  await createFollow(buyer.id, seller.id);

  const order = await createOrder({
    buyerId: buyer.id,
    sellerId: seller.id,
    itemId: item.id,
    amount: 300,
  });
  await completeOrder(order.id);

  const pref = await prisma.userPreference.findUnique({ where: { userId: buyer.id } });
  assert.ok(pref);

  const tagWeights = pref.tagWeights as Record<string, number>;
  const categoryWeights = pref.categoryWeights as Record<string, number>;
  const designerWeights = pref.designerWeights as Record<string, number>;

  assert.equal(tagWeights.Synth, 4);
  assert.equal(categoryWeights.music, 4);
  assert.equal(designerWeights[seller.id], 2);
});

test('ranked explore orders items by preference score and supports cursor pagination', async () => {
  const user = await prisma.user.create({ data: { email: 'rank-user@test.local', password: 'x', role: 'user' } });
  const sellerA = await prisma.user.create({ data: { email: 'rank-seller-a@test.local', password: 'x', role: 'user' } });
  const sellerB = await prisma.user.create({ data: { email: 'rank-seller-b@test.local', password: 'x', role: 'user' } });

  const preferredTag = await prisma.tag.create({ data: { name: '3D' } });
  const otherTag = await prisma.tag.create({ data: { name: 'Photo' } });

  const itemA = await prisma.item.create({
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
  const itemB = await prisma.item.create({
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

  await prisma.itemTag.create({ data: { itemId: itemA.id, tagId: preferredTag.id } });
  await prisma.itemTag.create({ data: { itemId: itemB.id, tagId: otherTag.id } });

  await createLike(user.id, itemA.id);
  await createSave(user.id, itemA.id);
  await createFollow(user.id, sellerA.id);

  await prisma.like.create({ data: { userId: sellerB.id, itemId: itemB.id } });

  const ranked = await getRankedExplorePage({ userId: user.id, limit: 1 });
  assert.equal(ranked.items.length, 1);
  assert.equal(ranked.items[0]?.itemId, itemA.id);
  assert.ok(ranked.nextCursor);

  const nextPage = await getRankedExplorePage({
    userId: user.id,
    limit: 2,
    cursor: ranked.nextCursor ?? undefined,
  });
  assert.equal(nextPage.items[0]?.itemId, itemB.id);
});

test('GET /api/explore returns ranked data for authenticated user', async () => {
  const token = await loginAndGetToken();
  const admin = await prisma.user.findUnique({ where: { email: 'admin' } });
  assert.ok(admin);

  const seller = await prisma.user.create({ data: { email: 'explore-seller@test.local', password: 'x', role: 'user' } });
  const tag = await prisma.tag.create({ data: { name: 'Typography' } });

  const item = await prisma.item.create({
    data: {
      ownerId: seller.id,
      sellerId: seller.id,
      name: 'Poster',
      title: 'Poster',
      category: 'print',
      price: 210,
    },
  });
  await prisma.itemTag.create({ data: { itemId: item.id, tagId: tag.id } });

  await createSave(admin.id, item.id);

  const response = await request(app)
    .get('/api/explore?limit=10')
    .set('authorization', `Bearer ${token}`);

  assert.equal(response.status, 200);
  assert.equal(response.body.success, true);
  assert.equal(Array.isArray(response.body.data.items), true);
  assert.equal(response.body.data.items[0].itemId, item.id);
});
