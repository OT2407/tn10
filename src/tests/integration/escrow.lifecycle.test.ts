import test, { beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { prisma } from '../../infrastructure/prisma';
import { ensureSqliteSchema } from '../../infrastructure/schema/bootstrap';
import { createTransaction } from '../../application/transaction.usecase';
import {
  addEscrowMilestone,
  getEscrowDetailsByTransaction,
  holdFunds,
  releaseMilestone,
} from '../../application/escrow.usecase';

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
      email: 'escrow-buyer@test.local',
      password: 'hashed-buyer',
      role: 'user',
    },
  });

  const seller = await prisma.user.create({
    data: {
      email: 'escrow-seller@test.local',
      password: 'hashed-seller',
      role: 'user',
    },
  });

  const item = await prisma.item.create({
    data: {
      name: 'Escrow Item',
      ownerId: seller.id,
    },
  });

  return { buyer, seller, item };
}

test('escrow creation stores pending escrow for transaction', async () => {
  const { buyer, seller, item } = await seedUsersAndItem();
  const tx = await createTransaction({
    buyerId: buyer.id,
    sellerId: seller.id,
    itemId: item.id,
    amount: 1000,
  });

  const escrow = await holdFunds(tx.id);

  assert.equal(escrow.transactionId, tx.id);
  assert.equal(escrow.amount, 1000);
  assert.equal(escrow.status, 'PENDING');
});

test('milestone add persists percentage and enforces <= 100 total', async () => {
  const { buyer, seller, item } = await seedUsersAndItem();
  const tx = await createTransaction({
    buyerId: buyer.id,
    sellerId: seller.id,
    itemId: item.id,
    amount: 1200,
  });

  await holdFunds(tx.id);

  const first = await addEscrowMilestone(tx.id, { name: 'Phase 1', percentage: 60 });
  assert.equal(first.name, 'Phase 1');
  assert.equal(first.percentage, 60);
  assert.equal(first.status, 'PENDING');

  const second = await addEscrowMilestone(tx.id, { name: 'Phase 2', percentage: 40 });
  assert.equal(second.name, 'Phase 2');
  assert.equal(second.percentage, 40);

  await assert.rejects(
    () => addEscrowMilestone(tx.id, { name: 'Overflow', percentage: 1 }),
    (error: unknown) => {
      assert.equal((error as { code?: string }).code, 'MILESTONE_PERCENTAGE_EXCEEDED');
      return true;
    }
  );
});

test('milestone release updates status and releasedAt', async () => {
  const { buyer, seller, item } = await seedUsersAndItem();
  const tx = await createTransaction({
    buyerId: buyer.id,
    sellerId: seller.id,
    itemId: item.id,
    amount: 900,
  });

  await holdFunds(tx.id);
  const milestone = await addEscrowMilestone(tx.id, { name: 'Single', percentage: 100 });

  const released = await releaseMilestone(milestone.id);
  assert.equal(released.status, 'RELEASED');
  assert.ok(released.releasedAt);
});

test('total milestone release triggers escrow completion', async () => {
  const { buyer, seller, item } = await seedUsersAndItem();
  const tx = await createTransaction({
    buyerId: buyer.id,
    sellerId: seller.id,
    itemId: item.id,
    amount: 1500,
  });

  await holdFunds(tx.id);
  const m1 = await addEscrowMilestone(tx.id, { name: 'M1', percentage: 50 });
  const m2 = await addEscrowMilestone(tx.id, { name: 'M2', percentage: 50 });

  await releaseMilestone(m1.id);
  let details = await getEscrowDetailsByTransaction(tx.id);
  assert.equal(details.status, 'PENDING');

  await releaseMilestone(m2.id);
  details = await getEscrowDetailsByTransaction(tx.id);
  assert.equal(details.status, 'RELEASED');
  assert.equal(details.milestones.length, 2);
  assert.equal(details.milestones.every((m) => m.status === 'RELEASED'), true);
});
