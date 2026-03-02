import test, { beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import app from '../../api/server';
import { prisma } from '../../infrastructure/prisma';
import { ensureSqliteSchema } from '../../infrastructure/schema/bootstrap';

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

async function loginAndGetToken(): Promise<{ token: string; userId: string }> {
  const login = await request(app)
    .post('/api/auth/login')
    .send({ username: 'admin', password: 'pass' });

  assert.equal(login.status, 200);
  return {
    token: login.body.data.token as string,
    userId: login.body.data.user?.id ?? (await prisma.user.findUnique({ where: { email: 'admin' } }))?.id ?? '',
  };
}

test('cannot like own item', async () => {
  const login = await request(app)
    .post('/api/auth/login')
    .send({ username: 'admin', password: 'pass' });
  const token = login.body.data.token as string;
  const admin = await prisma.user.findUnique({ where: { email: 'admin' } });
  assert.ok(admin);

  const ownItem = await prisma.item.create({
    data: {
      ownerId: admin.id,
      sellerId: admin.id,
      name: 'Own Item',
    },
  });

  const like = await request(app)
    .post(`/api/items/${ownItem.id}/like`)
    .set('authorization', `Bearer ${token}`)
    .send({});

  assert.equal(like.status, 400);
  assert.equal(like.body.code, 'OWN_ITEM_ENGAGEMENT_FORBIDDEN');
});

test('cannot follow self', async () => {
  const login = await request(app)
    .post('/api/auth/login')
    .send({ username: 'admin', password: 'pass' });
  const token = login.body.data.token as string;
  const admin = await prisma.user.findUnique({ where: { email: 'admin' } });
  assert.ok(admin);

  const follow = await request(app)
    .post(`/api/users/${admin.id}/follow`)
    .set('authorization', `Bearer ${token}`)
    .send({});

  assert.equal(follow.status, 400);
  assert.equal(follow.body.code, 'INVALID_FOLLOW');
});

test('duplicate like is idempotent and preference updates once', async () => {
  const login = await request(app)
    .post('/api/auth/login')
    .send({ username: 'admin', password: 'pass' });
  const token = login.body.data.token as string;
  const admin = await prisma.user.findUnique({ where: { email: 'admin' } });
  assert.ok(admin);

  const seller = await prisma.user.create({
    data: { email: 'engage-seller@test.local', password: 'x', role: 'user' },
  });
  const item = await prisma.item.create({
    data: {
      ownerId: seller.id,
      sellerId: seller.id,
      name: 'Like Target',
      category: 'design',
    },
  });
  const tag = await prisma.tag.create({ data: { name: 'Motion' } });
  await prisma.itemTag.create({ data: { itemId: item.id, tagId: tag.id } });

  const first = await request(app)
    .post(`/api/items/${item.id}/like`)
    .set('authorization', `Bearer ${token}`)
    .send({});
  assert.equal(first.status, 201);

  const second = await request(app)
    .post(`/api/items/${item.id}/like`)
    .set('authorization', `Bearer ${token}`)
    .send({});
  assert.equal(second.status, 200);

  const likeCount = await prisma.like.count({ where: { userId: admin.id, itemId: item.id } });
  assert.equal(likeCount, 1);

  const pref = await prisma.userPreference.findUnique({ where: { userId: admin.id } });
  assert.ok(pref);
  const tagWeights = pref.tagWeights as Record<string, number>;
  assert.equal(tagWeights.Motion, 1);
});

test('duplicate save is idempotent and preference updates once', async () => {
  const login = await request(app)
    .post('/api/auth/login')
    .send({ username: 'admin', password: 'pass' });
  const token = login.body.data.token as string;
  const admin = await prisma.user.findUnique({ where: { email: 'admin' } });
  assert.ok(admin);

  const seller = await prisma.user.create({
    data: { email: 'save-seller@test.local', password: 'x', role: 'user' },
  });
  const item = await prisma.item.create({
    data: {
      ownerId: seller.id,
      sellerId: seller.id,
      name: 'Save Target',
    },
  });
  const tag = await prisma.tag.create({ data: { name: 'Photo' } });
  await prisma.itemTag.create({ data: { itemId: item.id, tagId: tag.id } });

  const first = await request(app)
    .post(`/api/items/${item.id}/save`)
    .set('authorization', `Bearer ${token}`)
    .send({});
  assert.equal(first.status, 201);

  const second = await request(app)
    .post(`/api/items/${item.id}/save`)
    .set('authorization', `Bearer ${token}`)
    .send({});
  assert.equal(second.status, 200);

  const saveCount = await prisma.save.count({ where: { userId: admin.id, itemId: item.id } });
  assert.equal(saveCount, 1);

  const pref = await prisma.userPreference.findUnique({ where: { userId: admin.id } });
  assert.ok(pref);
  const tagWeights = pref.tagWeights as Record<string, number>;
  assert.equal(tagWeights.Photo, 3);
});

test('delete endpoints are safe when relation missing', async () => {
  const login = await request(app)
    .post('/api/auth/login')
    .send({ username: 'admin', password: 'pass' });
  const token = login.body.data.token as string;
  const admin = await prisma.user.findUnique({ where: { email: 'admin' } });
  assert.ok(admin);

  const seller = await prisma.user.create({
    data: { email: 'delete-seller@test.local', password: 'x', role: 'user' },
  });

  const item = await prisma.item.create({
    data: {
      ownerId: seller.id,
      sellerId: seller.id,
      name: 'Delete Target',
    },
  });

  const unlike = await request(app)
    .delete(`/api/items/${item.id}/like`)
    .set('authorization', `Bearer ${token}`)
    .send({});
  assert.equal(unlike.status, 204);

  const unsave = await request(app)
    .delete(`/api/items/${item.id}/save`)
    .set('authorization', `Bearer ${token}`)
    .send({});
  assert.equal(unsave.status, 204);

  const unfollow = await request(app)
    .delete(`/api/users/${seller.id}/follow`)
    .set('authorization', `Bearer ${token}`)
    .send({});
  assert.equal(unfollow.status, 204);
});
