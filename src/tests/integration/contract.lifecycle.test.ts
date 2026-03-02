import test, { beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { prisma } from '../../infrastructure/prisma';
import { ensureSqliteSchema } from '../../infrastructure/schema/bootstrap';
import { createTransaction } from '../../application/transaction.usecase';
import { addEscrowMilestone, holdFunds } from '../../application/escrow.usecase';
import {
  attachEscrow,
  completeContract,
  createContract,
  getContract,
} from '../../services/contractService';

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
      email: 'contract-buyer@test.local',
      password: 'hashed-buyer',
      role: 'user',
    },
  });

  const seller = await prisma.user.create({
    data: {
      email: 'contract-seller@test.local',
      password: 'hashed-seller',
      role: 'user',
    },
  });

  const item = await prisma.item.create({
    data: {
      name: 'Contract Item',
      ownerId: seller.id,
    },
  });

  return { buyer, seller, item };
}

test('contract creation stores draft contract', async () => {
  const { seller } = await seedUsersAndItem();

  const contract = await createContract(seller.id, 'Milestone Contract', 'Body text');

  assert.equal(contract.ownerId, seller.id);
  assert.equal(contract.title, 'Milestone Contract');
  assert.equal(contract.status, 'DRAFT');
});

test('escrow attachment requires pending escrow and sets contract active', async () => {
  const { buyer, seller, item } = await seedUsersAndItem();
  const tx = await createTransaction({
    buyerId: buyer.id,
    sellerId: seller.id,
    itemId: item.id,
    amount: 1000,
  });

  const escrow = await holdFunds(tx.id);
  const contract = await createContract(seller.id, 'Attach Escrow', 'Escrow body');

  const attached = await attachEscrow(contract.id, escrow.id);
  assert.equal(attached.escrowId, escrow.id);
  assert.equal(attached.status, 'ACTIVE');
});

test('completion transitions contract and releases escrow milestones', async () => {
  const { buyer, seller, item } = await seedUsersAndItem();
  const tx = await createTransaction({
    buyerId: buyer.id,
    sellerId: seller.id,
    itemId: item.id,
    amount: 1500,
  });

  const escrow = await holdFunds(tx.id);
  await addEscrowMilestone(tx.id, { name: 'M1', percentage: 40 });
  await addEscrowMilestone(tx.id, { name: 'M2', percentage: 60 });

  const contract = await createContract(seller.id, 'Complete Contract', 'Complete body');
  await attachEscrow(contract.id, escrow.id);

  const completed = await completeContract(contract.id);
  assert.equal(completed.status, 'COMPLETED');

  const loaded = await getContract(contract.id);
  assert.ok(loaded);
  assert.ok(loaded.escrow);
  assert.equal(loaded.escrow?.status, 'RELEASED');
  assert.equal(loaded.escrow?.milestones.every((m) => m.status === 'RELEASED'), true);
});
