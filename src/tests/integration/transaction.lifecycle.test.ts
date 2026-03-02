import test, { beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { prisma } from '../../infrastructure/prisma';
import { ensureSqliteSchema } from '../../infrastructure/schema/bootstrap';
import {
  cancelTransaction,
  completeTransaction,
  createTransaction,
} from '../../application/transaction.usecase';

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

async function seedUsersAndItem() {
  const buyer = await prisma.user.create({
    data: {
      email: 'buyer@test.local',
      password: 'hashed-buyer',
      role: 'user',
    },
  });

  const seller = await prisma.user.create({
    data: {
      email: 'seller@test.local',
      password: 'hashed-seller',
      role: 'user',
    },
  });

  const item = await prisma.item.create({
    data: {
      name: 'Transaction Item',
      ownerId: seller.id,
    },
  });

  return { buyer, seller, item };
}

test('createTransaction creates pending transaction', async () => {
  const { buyer, seller, item } = await seedUsersAndItem();

  const tx = await createTransaction({
    buyerId: buyer.id,
    sellerId: seller.id,
    itemId: item.id,
    amount: 100,
  });

  assert.equal(tx.status, 'pending');
  assert.equal(tx.amount, 100);
  assert.equal(tx.buyerId, buyer.id);
  assert.equal(tx.sellerId, seller.id);
  assert.equal(tx.itemId, item.id);
});

test('completeTransaction moves pending to completed', async () => {
  const { buyer, seller, item } = await seedUsersAndItem();
  const tx = await createTransaction({
    buyerId: buyer.id,
    sellerId: seller.id,
    itemId: item.id,
    amount: 200,
  });

  const completed = await completeTransaction(tx.id);
  assert.equal(completed.status, 'completed');
});

test('cancelTransaction moves pending to cancelled', async () => {
  const { buyer, seller, item } = await seedUsersAndItem();
  const tx = await createTransaction({
    buyerId: buyer.id,
    sellerId: seller.id,
    itemId: item.id,
    amount: 300,
  });

  const cancelled = await cancelTransaction(tx.id);
  assert.equal(cancelled.status, 'cancelled');
});

test('cancelTransaction rejects completed transaction', async () => {
  const { buyer, seller, item } = await seedUsersAndItem();
  const tx = await createTransaction({
    buyerId: buyer.id,
    sellerId: seller.id,
    itemId: item.id,
    amount: 400,
  });

  await completeTransaction(tx.id);

  await assert.rejects(
    async () => cancelTransaction(tx.id),
    (error: unknown) => {
      if (!(error instanceof Error)) {
        return false;
      }
      return error.message === 'Completed transaction cannot be cancelled';
    }
  );
});

test('completeTransaction rejects cancelled transaction', async () => {
  const { buyer, seller, item } = await seedUsersAndItem();
  const tx = await createTransaction({
    buyerId: buyer.id,
    sellerId: seller.id,
    itemId: item.id,
    amount: 500,
  });

  await cancelTransaction(tx.id);

  await assert.rejects(
    async () => completeTransaction(tx.id),
    (error: unknown) => {
      if (!(error instanceof Error)) {
        return false;
      }
      return error.message === 'Cancelled transaction cannot be completed';
    }
  );
});
