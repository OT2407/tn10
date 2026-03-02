import test, { beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { prisma } from '../../infrastructure/prisma';
import { ensureSqliteSchema } from '../../infrastructure/schema/bootstrap';
import {
  addMember,
  attachItemToCollaboration,
  createCollaboration,
  publishCollaboration,
} from '../../services/collaborationService';
import { createMarketplaceItem } from '../../services/itemMarketplaceService';
import { createOrder, completeOrder } from '../../application/order.usecase';
import { createReview } from '../../services/reviewService';
import { createTransaction } from '../../application/transaction.usecase';
import { holdFunds } from '../../application/escrow.usecase';
import { attachEscrow, createContract } from '../../services/contractService';

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

test('collaboration split credits member wallets on order completion', async () => {
  const buyer = await prisma.user.create({ data: { email: 'buyer-split@test.local', password: 'x', role: 'user' } });
  const seller = await prisma.user.create({ data: { email: 'seller-split@test.local', password: 'x', role: 'user' } });
  const coCreator = await prisma.user.create({ data: { email: 'cocreator-split@test.local', password: 'x', role: 'user' } });

  const collaboration = await createCollaboration('Album', 'Collab release');
  await addMember(collaboration.id, seller.id, 70, 'LEAD');
  await addMember(collaboration.id, coCreator.id, 30, 'GUEST');
  await publishCollaboration(collaboration.id);

  const item = await createMarketplaceItem({
    sellerId: seller.id,
    title: 'Track One',
    description: 'desc',
    category: 'music',
    price: 1000,
    previewUrl: 'https://example.com/preview',
    deliveryType: 'instant',
    metadata: { bpm: 120 },
    collaborationId: collaboration.id,
  });
  await attachItemToCollaboration(item.id, collaboration.id);

  const order = await createOrder({
    buyerId: buyer.id,
    sellerId: seller.id,
    itemId: item.id,
    amount: 1000,
  });

  await completeOrder(order.id);

  const sellerWallet = await prisma.wallet.findUnique({ where: { ownerId: seller.id } });
  const guestWallet = await prisma.wallet.findUnique({ where: { ownerId: coCreator.id } });
  assert.ok(sellerWallet);
  assert.ok(guestWallet);
  assert.equal(sellerWallet.balance, 700);
  assert.equal(guestWallet.balance, 300);
});

test('review is allowed only after delivered and only once per order', async () => {
  const buyer = await prisma.user.create({ data: { email: 'buyer-review@test.local', password: 'x', role: 'user' } });
  const seller = await prisma.user.create({ data: { email: 'seller-review@test.local', password: 'x', role: 'user' } });
  const item = await prisma.item.create({ data: { ownerId: seller.id, sellerId: seller.id, name: 'Review Item' } });
  const order = await createOrder({ buyerId: buyer.id, sellerId: seller.id, itemId: item.id, amount: 200 });

  await assert.rejects(
    () => createReview(order.id, buyer.id, 5, 'too early'),
    (error: unknown) => {
      assert.equal((error as { code?: string }).code, 'ORDER_NOT_DELIVERED');
      return true;
    }
  );

  await prisma.order.update({ where: { id: order.id }, data: { status: 'DELIVERED' } });

  const review = await createReview(order.id, buyer.id, 5, 'great');
  assert.equal(review.rating, 5);

  await assert.rejects(
    () => createReview(order.id, buyer.id, 4, 'duplicate'),
    (error: unknown) => {
      assert.equal((error as { code?: string }).code, 'REVIEW_ALREADY_EXISTS');
      return true;
    }
  );
});

test('conversation is auto-created when contract becomes active', async () => {
  const buyer = await prisma.user.create({ data: { email: 'buyer-conv@test.local', password: 'x', role: 'user' } });
  const seller = await prisma.user.create({ data: { email: 'seller-conv@test.local', password: 'x', role: 'user' } });
  const item = await prisma.item.create({ data: { ownerId: seller.id, sellerId: seller.id, name: 'Conv Item' } });

  const tx = await createTransaction({
    buyerId: buyer.id,
    sellerId: seller.id,
    itemId: item.id,
    amount: 333,
  });
  const escrow = await holdFunds(tx.id);
  const contract = await createContract(seller.id, 'Contract Conversation', 'body');

  await attachEscrow(contract.id, escrow.id);

  const conversation = await prisma.conversation.findUnique({ where: { contractId: contract.id } });
  assert.ok(conversation);
  assert.equal(conversation.monitoringEnabled, true);
});

test('metadata is stored and retrieved on marketplace item', async () => {
  const seller = await prisma.user.create({ data: { email: 'seller-meta@test.local', password: 'x', role: 'user' } });

  const item = await createMarketplaceItem({
    sellerId: seller.id,
    title: 'Metadata Asset',
    description: 'metadata test',
    category: 'design',
    price: 450,
    previewUrl: 'https://example.com/meta',
    deliveryType: 'file',
    metadata: { format: 'svg', layers: 8, nested: { licensed: true } },
  });

  const loaded = await prisma.item.findUnique({ where: { id: item.id } });
  assert.ok(loaded);
  assert.deepEqual(loaded.metadata, { format: 'svg', layers: 8, nested: { licensed: true } });
});
