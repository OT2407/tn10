import test, { beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import app from '../../api/server';
import { prisma } from '../../infrastructure/prisma';
import { ensureSqliteSchema } from '../../infrastructure/schema/bootstrap';
import { createFollow } from '../../services/followService';
import { createLike } from '../../services/likeService';
import { createSave } from '../../services/saveService';

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

test('GET /api/explore/:itemId/explain returns controlled-discovery layers and exact total formula', async () => {
  const token = await loginAndGetToken();
  const admin = await prisma.user.findUnique({ where: { email: 'admin' } });
  assert.ok(admin);

  const seller = await prisma.user.create({
    data: { email: 'explain-seller@test.local', password: 'x', role: 'user' },
  });

  const tagA = await prisma.tag.create({ data: { name: '3D' } });
  const tagB = await prisma.tag.create({ data: { name: 'Motion' } });

  const item = await prisma.item.create({
    data: {
      ownerId: seller.id,
      sellerId: seller.id,
      name: 'Explain Item',
      title: 'Explain Item',
      category: 'design',
      price: 500,
    },
  });

  await prisma.itemTag.create({ data: { itemId: item.id, tagId: tagA.id } });
  await prisma.itemTag.create({ data: { itemId: item.id, tagId: tagB.id } });

  await createLike(admin.id, item.id);
  await createSave(admin.id, item.id);
  await createFollow(admin.id, seller.id);

  const otherUser = await prisma.user.create({
    data: { email: 'explain-other@test.local', password: 'x', role: 'user' },
  });
  await createLike(otherUser.id, item.id);

  const response = await request(app)
    .get(`/api/explore/${item.id}/explain`)
    .set('authorization', `Bearer ${token}`);

  assert.equal(response.status, 200);
  assert.equal(response.body.success, true);

  const data = response.body.data as {
    itemId: string;
    totalScore: number;
    breakdown: {
      personalizationLayer: number;
      preferenceBoost: number;
      sessionBoost: number;
      engagementQualityLayer: number;
      freshnessLayer: number;
      creatorGrowthLayer: number;
      emergingBoost: number;
      explorationNoise: number;
      totalScore: number;
    };
  };

  assert.equal(data.itemId, item.id);
  assert.ok(data.breakdown.personalizationLayer > 0);
  assert.ok(data.breakdown.preferenceBoost > 0);
  assert.ok(data.breakdown.sessionBoost >= 0);
  assert.ok(data.breakdown.engagementQualityLayer > 0);
  assert.ok(data.breakdown.freshnessLayer > 0);
  assert.ok(data.breakdown.creatorGrowthLayer > 0);
  assert.ok(data.breakdown.explorationNoise >= 0 && data.breakdown.explorationNoise <= 0.2);

  const expectedTotal =
    data.breakdown.personalizationLayer +
    data.breakdown.preferenceBoost +
    data.breakdown.sessionBoost +
    data.breakdown.engagementQualityLayer +
    data.breakdown.freshnessLayer +
    data.breakdown.creatorGrowthLayer +
    data.breakdown.emergingBoost +
    data.breakdown.explorationNoise;

  assert.ok(Math.abs(data.totalScore - expectedTotal) < 0.000001);
  assert.ok(Math.abs(data.breakdown.totalScore - expectedTotal) < 0.000001);
});

test('feed stability keeps consistent scores within snapshot ttl', async () => {
  const token = await loginAndGetToken();
  const admin = await prisma.user.findUnique({ where: { email: 'admin' } });
  assert.ok(admin);

  const seller = await prisma.user.create({
    data: { email: 'stable-seller@test.local', password: 'x', role: 'user' },
  });
  const item = await prisma.item.create({
    data: {
      ownerId: seller.id,
      sellerId: seller.id,
      name: 'Stable Item',
      title: 'Stable Item',
      category: 'print',
      price: 300,
    },
  });

  const first = await request(app)
    .get('/api/explore?limit=10')
    .set('authorization', `Bearer ${token}`);
  assert.equal(first.status, 200);

  const second = await request(app)
    .get('/api/explore?limit=10')
    .set('authorization', `Bearer ${token}`);
  assert.equal(second.status, 200);

  const firstEntry = (first.body.data.items as Array<{ itemId: string; score: number }>).find((entry) => entry.itemId === item.id);
  const secondEntry = (second.body.data.items as Array<{ itemId: string; score: number }>).find((entry) => entry.itemId === item.id);

  assert.ok(firstEntry);
  assert.ok(secondEntry);
  assert.ok(Math.abs((firstEntry?.score ?? 0) - (secondEntry?.score ?? 0)) < 0.000001);
});
