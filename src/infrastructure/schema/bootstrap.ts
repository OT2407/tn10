import { prisma } from '../prisma';

const SCHEMA_DDL: readonly string[] = [
  `CREATE TABLE IF NOT EXISTS "Item" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "sellerId" TEXT,
    "title" TEXT,
    "description" TEXT,
    "category" TEXT,
    "price" INTEGER,
    "previewUrl" TEXT,
    "deliveryType" TEXT,
    "metadata" TEXT,
    "brandId" TEXT,
    "collaborationId" TEXT,
    "originalityStatus" TEXT NOT NULL DEFAULT 'SELF_DECLARED',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "currentHash" TEXT,
    "version" INTEGER NOT NULL DEFAULT 0,
    "ownerId" TEXT,
    CONSTRAINT "Item_ownerId_fkey"
      FOREIGN KEY ("ownerId") REFERENCES "User" ("id")
      ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Item_sellerId_fkey"
      FOREIGN KEY ("sellerId") REFERENCES "User" ("id")
      ON DELETE SET NULL ON UPDATE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS "Freeze" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "itemId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "svg" TEXT NOT NULL,
    "metadata" TEXT NOT NULL,
    "parentHash" TEXT,
    "hash" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Freeze_itemId_fkey"
      FOREIGN KEY ("itemId") REFERENCES "Item" ("id")
      ON DELETE RESTRICT ON UPDATE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS "Link" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "freezeId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "note" TEXT,
    CONSTRAINT "Link_freezeId_fkey"
      FOREIGN KEY ("freezeId") REFERENCES "Freeze" ("id")
      ON DELETE RESTRICT ON UPDATE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL UNIQUE,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'user',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS "Transaction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "buyerId" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "amount" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Transaction_buyerId_fkey"
      FOREIGN KEY ("buyerId") REFERENCES "User" ("id")
      ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Transaction_sellerId_fkey"
      FOREIGN KEY ("sellerId") REFERENCES "User" ("id")
      ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Transaction_itemId_fkey"
      FOREIGN KEY ("itemId") REFERENCES "Item" ("id")
      ON DELETE RESTRICT ON UPDATE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS "Escrow" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "transactionId" TEXT NOT NULL UNIQUE,
    "amount" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "releasedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Escrow_transactionId_fkey"
      FOREIGN KEY ("transactionId") REFERENCES "Transaction" ("id")
      ON DELETE RESTRICT ON UPDATE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS "EscrowMilestone" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "escrowId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "percentage" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "releasedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "EscrowMilestone_escrowId_fkey"
      FOREIGN KEY ("escrowId") REFERENCES "Escrow" ("id")
      ON DELETE RESTRICT ON UPDATE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS "Contract" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ownerId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "escrowId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Contract_ownerId_fkey"
      FOREIGN KEY ("ownerId") REFERENCES "User" ("id")
      ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Contract_escrowId_fkey"
      FOREIGN KEY ("escrowId") REFERENCES "Escrow" ("id")
      ON DELETE RESTRICT ON UPDATE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS "Tag" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL UNIQUE
  )`,
  `CREATE TABLE IF NOT EXISTS "ItemTag" (
    "itemId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,
    PRIMARY KEY ("itemId","tagId"),
    CONSTRAINT "ItemTag_itemId_fkey"
      FOREIGN KEY ("itemId") REFERENCES "Item" ("id")
      ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ItemTag_tagId_fkey"
      FOREIGN KEY ("tagId") REFERENCES "Tag" ("id")
      ON DELETE CASCADE ON UPDATE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS "Collaboration" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS "CollaborationMember" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "collaborationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "percentage" INTEGER NOT NULL,
    "role" TEXT NOT NULL,
    CONSTRAINT "CollaborationMember_collaborationId_fkey"
      FOREIGN KEY ("collaborationId") REFERENCES "Collaboration" ("id")
      ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "CollaborationMember_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "User" ("id")
      ON DELETE RESTRICT ON UPDATE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS "Review" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderId" TEXT NOT NULL UNIQUE,
    "itemId" TEXT NOT NULL,
    "reviewerId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Review_orderId_fkey"
      FOREIGN KEY ("orderId") REFERENCES "Order" ("id")
      ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Review_itemId_fkey"
      FOREIGN KEY ("itemId") REFERENCES "Item" ("id")
      ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Review_reviewerId_fkey"
      FOREIGN KEY ("reviewerId") REFERENCES "User" ("id")
      ON DELETE RESTRICT ON UPDATE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS "Conversation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "contractId" TEXT NOT NULL UNIQUE,
    "monitoringEnabled" BOOLEAN NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Conversation_contractId_fkey"
      FOREIGN KEY ("contractId") REFERENCES "Contract" ("id")
      ON DELETE RESTRICT ON UPDATE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS "Message" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "conversationId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Message_conversationId_fkey"
      FOREIGN KEY ("conversationId") REFERENCES "Conversation" ("id")
      ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Message_senderId_fkey"
      FOREIGN KEY ("senderId") REFERENCES "User" ("id")
      ON DELETE RESTRICT ON UPDATE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS "Brand" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Brand_ownerId_fkey"
      FOREIGN KEY ("ownerId") REFERENCES "User" ("id")
      ON DELETE RESTRICT ON UPDATE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS "Follow" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "followerId" TEXT NOT NULL,
    "followingId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Follow_followerId_fkey"
      FOREIGN KEY ("followerId") REFERENCES "User" ("id")
      ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Follow_followingId_fkey"
      FOREIGN KEY ("followingId") REFERENCES "User" ("id")
      ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Follow_followerId_followingId_key" UNIQUE ("followerId","followingId")
  )`,
  `CREATE TABLE IF NOT EXISTS "Like" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Like_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "User" ("id")
      ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Like_itemId_fkey"
      FOREIGN KEY ("itemId") REFERENCES "Item" ("id")
      ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Like_userId_itemId_key" UNIQUE ("userId","itemId")
  )`,
  `CREATE TABLE IF NOT EXISTS "Save" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Save_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "User" ("id")
      ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Save_itemId_fkey"
      FOREIGN KEY ("itemId") REFERENCES "Item" ("id")
      ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Save_userId_itemId_key" UNIQUE ("userId","itemId")
  )`,
  `CREATE TABLE IF NOT EXISTS "UserPreference" (
    "userId" TEXT NOT NULL PRIMARY KEY,
    "tagWeights" TEXT NOT NULL DEFAULT '{}',
    "categoryWeights" TEXT NOT NULL DEFAULT '{}',
    "designerWeights" TEXT NOT NULL DEFAULT '{}',
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UserPreference_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "User" ("id")
      ON DELETE RESTRICT ON UPDATE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS "Order" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "buyerId" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Order_buyerId_fkey"
      FOREIGN KEY ("buyerId") REFERENCES "User" ("id")
      ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Order_sellerId_fkey"
      FOREIGN KEY ("sellerId") REFERENCES "User" ("id")
      ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Order_itemId_fkey"
      FOREIGN KEY ("itemId") REFERENCES "Item" ("id")
      ON DELETE RESTRICT ON UPDATE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS "PaymentIntent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'TRY',
    "status" TEXT NOT NULL DEFAULT 'requires_confirmation',
    "provider" TEXT NOT NULL DEFAULT 'placeholder',
    "externalRef" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PaymentIntent_orderId_fkey"
      FOREIGN KEY ("orderId") REFERENCES "Order" ("id")
      ON DELETE RESTRICT ON UPDATE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS "Wallet" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ownerId" TEXT NOT NULL UNIQUE,
    "balance" INTEGER NOT NULL DEFAULT 0 CHECK ("balance" >= 0),
    "version" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Wallet_ownerId_fkey"
      FOREIGN KEY ("ownerId") REFERENCES "User" ("id")
      ON DELETE RESTRICT ON UPDATE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS "WalletTransaction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "walletId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "reference" TEXT NOT NULL,
    "referenceId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "WalletTransaction_walletId_fkey"
      FOREIGN KEY ("walletId") REFERENCES "Wallet" ("id")
      ON DELETE RESTRICT ON UPDATE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS "RankingTelemetry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "itemId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "totalScore" REAL NOT NULL,
    "layerBreakdown" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RankingTelemetry_itemId_fkey"
      FOREIGN KEY ("itemId") REFERENCES "Item" ("id")
      ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "RankingTelemetry_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "User" ("id")
      ON DELETE CASCADE ON UPDATE CASCADE
  )`,
];

const REQUIRED_TABLES = [
  'Item',
  'Freeze',
  'Link',
  'User',
  'Transaction',
  'Escrow',
  'Order',
  'PaymentIntent',
  'Wallet',
  'WalletTransaction',
  'EscrowMilestone',
  'Contract',
  'Tag',
  'ItemTag',
  'Collaboration',
  'CollaborationMember',
  'Review',
  'Conversation',
  'Message',
  'Brand',
  'Follow',
  'Like',
  'Save',
  'UserPreference',
  'RankingTelemetry',
] as const;
const REQUIRED_ITEM_COLUMNS = ['id', 'name', 'createdAt', 'currentHash', 'version', 'ownerId'] as const;
const REQUIRED_TRANSACTION_COLUMNS = [
  'id',
  'buyerId',
  'sellerId',
  'itemId',
  'status',
  'amount',
  'createdAt',
  'updatedAt',
] as const;
const REQUIRED_ESCROW_COLUMNS = [
  'id',
  'transactionId',
  'amount',
  'status',
  'releasedAt',
  'createdAt',
  'updatedAt',
] as const;
const REQUIRED_ORDER_COLUMNS = [
  'id',
  'buyerId',
  'sellerId',
  'itemId',
  'amount',
  'status',
  'createdAt',
  'updatedAt',
] as const;
const REQUIRED_PAYMENT_INTENT_COLUMNS = [
  'id',
  'orderId',
  'amount',
  'currency',
  'status',
  'provider',
  'externalRef',
  'createdAt',
  'updatedAt',
] as const;
const REQUIRED_WALLET_COLUMNS = ['id', 'ownerId', 'balance', 'version', 'createdAt', 'updatedAt'] as const;
const REQUIRED_WALLET_TX_COLUMNS = [
  'id',
  'walletId',
  'type',
  'amount',
  'reference',
  'referenceId',
  'createdAt',
] as const;
const REQUIRED_ESCROW_MILESTONE_COLUMNS = [
  'id',
  'escrowId',
  'name',
  'percentage',
  'status',
  'releasedAt',
  'createdAt',
] as const;
const REQUIRED_CONTRACT_COLUMNS = [
  'id',
  'ownerId',
  'title',
  'body',
  'escrowId',
  'status',
  'createdAt',
  'updatedAt',
] as const;

export interface SchemaVerificationResult {
  ok: boolean;
  missingTables: string[];
  missingColumns: string[];
}

async function ensureItemVersionColumn(): Promise<void> {
  const columns = await prisma.$queryRawUnsafe<Array<{ name: string }>>(`PRAGMA table_info("Item")`);
  const hasVersion = columns.some((column) => column.name === 'version');
  if (!hasVersion) {
    await prisma.$executeRawUnsafe(
      `ALTER TABLE "Item" ADD COLUMN "version" INTEGER NOT NULL DEFAULT 0`
    );
  }
}

async function ensureItemOwnerColumn(): Promise<void> {
  const columns = await prisma.$queryRawUnsafe<Array<{ name: string }>>(`PRAGMA table_info("Item")`);
  const hasOwnerId = columns.some((column) => column.name === 'ownerId');
  if (!hasOwnerId) {
    await prisma.$executeRawUnsafe(`ALTER TABLE "Item" ADD COLUMN "ownerId" TEXT`);
  }

  const hasUserId = columns.some((column) => column.name === 'userId');
  if (hasUserId) {
    await prisma.$executeRawUnsafe(
      `UPDATE "Item" SET "ownerId" = COALESCE("ownerId", "userId") WHERE "ownerId" IS NULL`
    );
  }
}

async function ensureItemMarketplaceColumns(): Promise<void> {
  const columns = await prisma.$queryRawUnsafe<Array<{ name: string }>>(`PRAGMA table_info("Item")`);
  const existing = new Set(columns.map((column) => column.name));
  const maybeAdd: Array<{ name: string; ddl: string }> = [
    { name: 'sellerId', ddl: `ALTER TABLE "Item" ADD COLUMN "sellerId" TEXT` },
    { name: 'title', ddl: `ALTER TABLE "Item" ADD COLUMN "title" TEXT` },
    { name: 'description', ddl: `ALTER TABLE "Item" ADD COLUMN "description" TEXT` },
    { name: 'category', ddl: `ALTER TABLE "Item" ADD COLUMN "category" TEXT` },
    { name: 'price', ddl: `ALTER TABLE "Item" ADD COLUMN "price" INTEGER` },
    { name: 'previewUrl', ddl: `ALTER TABLE "Item" ADD COLUMN "previewUrl" TEXT` },
    { name: 'deliveryType', ddl: `ALTER TABLE "Item" ADD COLUMN "deliveryType" TEXT` },
    { name: 'metadata', ddl: `ALTER TABLE "Item" ADD COLUMN "metadata" TEXT` },
    { name: 'brandId', ddl: `ALTER TABLE "Item" ADD COLUMN "brandId" TEXT` },
    { name: 'collaborationId', ddl: `ALTER TABLE "Item" ADD COLUMN "collaborationId" TEXT` },
    {
      name: 'originalityStatus',
      ddl: `ALTER TABLE "Item" ADD COLUMN "originalityStatus" TEXT NOT NULL DEFAULT 'SELF_DECLARED'`,
    },
  ];

  for (const candidate of maybeAdd) {
    if (!existing.has(candidate.name)) {
      await prisma.$executeRawUnsafe(candidate.ddl);
    }
  }

  await prisma.$executeRawUnsafe(
    `UPDATE "Item" SET "sellerId" = COALESCE("sellerId", "ownerId") WHERE "sellerId" IS NULL`
  );
}

async function ensureTransactionTableShape(): Promise<void> {
  const tableRows = await prisma.$queryRawUnsafe<Array<{ name: string }>>(
    `SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'Transaction'`
  );
  if (tableRows.length === 0) {
    return;
  }

  const columns = await prisma.$queryRawUnsafe<Array<{ name: string }>>(`PRAGMA table_info("Transaction")`);
  const existingColumns = new Set(columns.map((column) => column.name));
  const hasAllRequiredColumns = REQUIRED_TRANSACTION_COLUMNS.every((name) => existingColumns.has(name));
  if (hasAllRequiredColumns) {
    return;
  }

  await prisma.$executeRawUnsafe(`DROP TABLE "Transaction"`);
  await prisma.$executeRawUnsafe(
    `CREATE TABLE IF NOT EXISTS "Transaction" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "buyerId" TEXT NOT NULL,
      "sellerId" TEXT NOT NULL,
      "itemId" TEXT NOT NULL,
      "status" TEXT NOT NULL DEFAULT 'pending',
      "amount" INTEGER NOT NULL,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "Transaction_buyerId_fkey"
        FOREIGN KEY ("buyerId") REFERENCES "User" ("id")
        ON DELETE RESTRICT ON UPDATE CASCADE,
      CONSTRAINT "Transaction_sellerId_fkey"
        FOREIGN KEY ("sellerId") REFERENCES "User" ("id")
        ON DELETE RESTRICT ON UPDATE CASCADE,
      CONSTRAINT "Transaction_itemId_fkey"
        FOREIGN KEY ("itemId") REFERENCES "Item" ("id")
        ON DELETE RESTRICT ON UPDATE CASCADE
    )`
  );
}

async function ensureEscrowTableShape(): Promise<void> {
  const tableRows = await prisma.$queryRawUnsafe<Array<{ name: string }>>(
    `SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'Escrow'`
  );
  if (tableRows.length === 0) {
    return;
  }

  const columns = await prisma.$queryRawUnsafe<Array<{ name: string }>>(`PRAGMA table_info("Escrow")`);
  const existingColumns = new Set(columns.map((column) => column.name));
  const hasAllRequiredColumns = REQUIRED_ESCROW_COLUMNS.every((name) => existingColumns.has(name));
  if (hasAllRequiredColumns) {
    return;
  }

  await prisma.$executeRawUnsafe(`DROP TABLE "Escrow"`);
  await prisma.$executeRawUnsafe(
    `CREATE TABLE IF NOT EXISTS "Escrow" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "transactionId" TEXT NOT NULL UNIQUE,
      "amount" INTEGER NOT NULL,
      "status" TEXT NOT NULL DEFAULT 'PENDING',
      "releasedAt" DATETIME,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "Escrow_transactionId_fkey"
        FOREIGN KEY ("transactionId") REFERENCES "Transaction" ("id")
        ON DELETE RESTRICT ON UPDATE CASCADE
    )`
  );
}

async function ensureOrderTableShape(): Promise<void> {
  const tableRows = await prisma.$queryRawUnsafe<Array<{ name: string }>>(
    `SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'Order'`
  );
  if (tableRows.length === 0) {
    return;
  }

  const columns = await prisma.$queryRawUnsafe<Array<{ name: string }>>(`PRAGMA table_info("Order")`);
  const existingColumns = new Set(columns.map((column) => column.name));
  const hasAllRequiredColumns = REQUIRED_ORDER_COLUMNS.every((name) => existingColumns.has(name));
  if (hasAllRequiredColumns) {
    return;
  }

  await prisma.$executeRawUnsafe(`DROP TABLE "Order"`);
  await prisma.$executeRawUnsafe(
    `CREATE TABLE IF NOT EXISTS "Order" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "buyerId" TEXT NOT NULL,
      "sellerId" TEXT NOT NULL,
      "itemId" TEXT NOT NULL,
      "amount" INTEGER NOT NULL,
      "status" TEXT NOT NULL DEFAULT 'pending',
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "Order_buyerId_fkey"
        FOREIGN KEY ("buyerId") REFERENCES "User" ("id")
        ON DELETE RESTRICT ON UPDATE CASCADE,
      CONSTRAINT "Order_sellerId_fkey"
        FOREIGN KEY ("sellerId") REFERENCES "User" ("id")
        ON DELETE RESTRICT ON UPDATE CASCADE,
      CONSTRAINT "Order_itemId_fkey"
        FOREIGN KEY ("itemId") REFERENCES "Item" ("id")
        ON DELETE RESTRICT ON UPDATE CASCADE
    )`
  );
}

async function ensurePaymentIntentTableShape(): Promise<void> {
  const tableRows = await prisma.$queryRawUnsafe<Array<{ name: string }>>(
    `SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'PaymentIntent'`
  );
  if (tableRows.length === 0) {
    return;
  }

  const columns = await prisma.$queryRawUnsafe<Array<{ name: string }>>(`PRAGMA table_info("PaymentIntent")`);
  const existingColumns = new Set(columns.map((column) => column.name));
  const hasAllRequiredColumns = REQUIRED_PAYMENT_INTENT_COLUMNS.every((name) => existingColumns.has(name));
  if (hasAllRequiredColumns) {
    return;
  }

  await prisma.$executeRawUnsafe(`DROP TABLE "PaymentIntent"`);
  await prisma.$executeRawUnsafe(
    `CREATE TABLE IF NOT EXISTS "PaymentIntent" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "orderId" TEXT NOT NULL,
      "amount" INTEGER NOT NULL,
      "currency" TEXT NOT NULL DEFAULT 'TRY',
      "status" TEXT NOT NULL DEFAULT 'requires_confirmation',
      "provider" TEXT NOT NULL DEFAULT 'placeholder',
      "externalRef" TEXT,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "PaymentIntent_orderId_fkey"
        FOREIGN KEY ("orderId") REFERENCES "Order" ("id")
        ON DELETE RESTRICT ON UPDATE CASCADE
    )`
  );
}

async function ensureWalletTableShape(): Promise<void> {
  const tableRows = await prisma.$queryRawUnsafe<Array<{ name: string }>>(
    `SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'Wallet'`
  );
  if (tableRows.length === 0) {
    return;
  }

  const columns = await prisma.$queryRawUnsafe<Array<{ name: string }>>(`PRAGMA table_info("Wallet")`);
  const existingColumns = new Set(columns.map((column) => column.name));
  const hasAllRequiredColumns = REQUIRED_WALLET_COLUMNS.every((name) => existingColumns.has(name));
  if (hasAllRequiredColumns) {
    return;
  }

  await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS "WalletTransaction"`);
  await prisma.$executeRawUnsafe(`DROP TABLE "Wallet"`);
  await prisma.$executeRawUnsafe(
    `CREATE TABLE IF NOT EXISTS "Wallet" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "ownerId" TEXT NOT NULL UNIQUE,
      "balance" INTEGER NOT NULL DEFAULT 0 CHECK ("balance" >= 0),
      "version" INTEGER NOT NULL DEFAULT 0,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "Wallet_ownerId_fkey"
        FOREIGN KEY ("ownerId") REFERENCES "User" ("id")
        ON DELETE RESTRICT ON UPDATE CASCADE
    )`
  );
}

async function ensureWalletTransactionTableShape(): Promise<void> {
  const tableRows = await prisma.$queryRawUnsafe<Array<{ name: string }>>(
    `SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'WalletTransaction'`
  );
  if (tableRows.length === 0) {
    return;
  }

  const columns = await prisma.$queryRawUnsafe<Array<{ name: string }>>(`PRAGMA table_info("WalletTransaction")`);
  const existingColumns = new Set(columns.map((column) => column.name));
  const hasAllRequiredColumns = REQUIRED_WALLET_TX_COLUMNS.every((name) => existingColumns.has(name));
  if (hasAllRequiredColumns) {
    return;
  }

  await prisma.$executeRawUnsafe(`DROP TABLE "WalletTransaction"`);
  await prisma.$executeRawUnsafe(
    `CREATE TABLE IF NOT EXISTS "WalletTransaction" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "walletId" TEXT NOT NULL,
      "type" TEXT NOT NULL,
      "amount" INTEGER NOT NULL,
      "reference" TEXT NOT NULL,
      "referenceId" TEXT,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "WalletTransaction_walletId_fkey"
        FOREIGN KEY ("walletId") REFERENCES "Wallet" ("id")
        ON DELETE RESTRICT ON UPDATE CASCADE
    )`
  );
}

async function ensureEscrowMilestoneTableShape(): Promise<void> {
  const tableRows = await prisma.$queryRawUnsafe<Array<{ name: string }>>(
    `SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'EscrowMilestone'`
  );
  if (tableRows.length === 0) {
    return;
  }

  const columns = await prisma.$queryRawUnsafe<Array<{ name: string }>>(`PRAGMA table_info("EscrowMilestone")`);
  const existingColumns = new Set(columns.map((column) => column.name));
  const hasAllRequiredColumns = REQUIRED_ESCROW_MILESTONE_COLUMNS.every((name) =>
    existingColumns.has(name)
  );
  if (hasAllRequiredColumns) {
    return;
  }

  await prisma.$executeRawUnsafe(`DROP TABLE "EscrowMilestone"`);
  await prisma.$executeRawUnsafe(
    `CREATE TABLE IF NOT EXISTS "EscrowMilestone" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "escrowId" TEXT NOT NULL,
      "name" TEXT NOT NULL,
      "percentage" INTEGER NOT NULL,
      "status" TEXT NOT NULL DEFAULT 'PENDING',
      "releasedAt" DATETIME,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "EscrowMilestone_escrowId_fkey"
        FOREIGN KEY ("escrowId") REFERENCES "Escrow" ("id")
        ON DELETE RESTRICT ON UPDATE CASCADE
    )`
  );
}

async function ensureContractTableShape(): Promise<void> {
  const tableRows = await prisma.$queryRawUnsafe<Array<{ name: string }>>(
    `SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'Contract'`
  );
  if (tableRows.length === 0) {
    return;
  }

  const columns = await prisma.$queryRawUnsafe<Array<{ name: string }>>(`PRAGMA table_info("Contract")`);
  const existingColumns = new Set(columns.map((column) => column.name));
  const hasAllRequiredColumns = REQUIRED_CONTRACT_COLUMNS.every((name) => existingColumns.has(name));
  if (hasAllRequiredColumns) {
    return;
  }

  await prisma.$executeRawUnsafe(`DROP TABLE "Contract"`);
  await prisma.$executeRawUnsafe(
    `CREATE TABLE IF NOT EXISTS "Contract" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "ownerId" TEXT NOT NULL,
      "title" TEXT NOT NULL,
      "body" TEXT NOT NULL,
      "escrowId" TEXT,
      "status" TEXT NOT NULL DEFAULT 'DRAFT',
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "Contract_ownerId_fkey"
        FOREIGN KEY ("ownerId") REFERENCES "User" ("id")
        ON DELETE RESTRICT ON UPDATE CASCADE,
      CONSTRAINT "Contract_escrowId_fkey"
        FOREIGN KEY ("escrowId") REFERENCES "Escrow" ("id")
        ON DELETE RESTRICT ON UPDATE CASCADE
    )`
  );
}

export async function ensureSqliteSchema(): Promise<void> {
  for (const ddl of SCHEMA_DDL) {
    await prisma.$executeRawUnsafe(ddl);
  }
  await ensureItemVersionColumn();
  await ensureItemOwnerColumn();
  await ensureItemMarketplaceColumns();
  await ensureTransactionTableShape();
  await ensureEscrowTableShape();
  await ensureOrderTableShape();
  await ensurePaymentIntentTableShape();
  await ensureWalletTableShape();
  await ensureWalletTransactionTableShape();
  await ensureEscrowMilestoneTableShape();
  await ensureContractTableShape();
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Item_sellerId_idx" ON "Item" ("sellerId")`);
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Item_category_idx" ON "Item" ("category")`);
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "ItemTag_tagId_idx" ON "ItemTag" ("tagId")`);
  await prisma.$executeRawUnsafe(
    `CREATE INDEX IF NOT EXISTS "CollaborationMember_collaborationId_idx" ON "CollaborationMember" ("collaborationId")`
  );
  await prisma.$executeRawUnsafe(
    `CREATE INDEX IF NOT EXISTS "CollaborationMember_userId_idx" ON "CollaborationMember" ("userId")`
  );
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Review_itemId_idx" ON "Review" ("itemId")`);
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Review_reviewerId_idx" ON "Review" ("reviewerId")`);
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Message_conversationId_idx" ON "Message" ("conversationId")`);
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Message_senderId_idx" ON "Message" ("senderId")`);
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Brand_ownerId_idx" ON "Brand" ("ownerId")`);
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Follow_followingId_idx" ON "Follow" ("followingId")`);
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Like_itemId_idx" ON "Like" ("itemId")`);
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Save_itemId_idx" ON "Save" ("itemId")`);
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "RankingTelemetry_itemId_idx" ON "RankingTelemetry" ("itemId")`);
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "RankingTelemetry_userId_idx" ON "RankingTelemetry" ("userId")`);
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "RankingTelemetry_createdAt_idx" ON "RankingTelemetry" ("createdAt")`);
}

export async function verifySqliteSchema(): Promise<SchemaVerificationResult> {
  const rows = await prisma.$queryRawUnsafe<Array<{ name: string }>>(
    `SELECT name FROM sqlite_master WHERE type = 'table'`
  );

  const existing = new Set(rows.map((row) => row.name));
  const missingTables = REQUIRED_TABLES.filter((tableName) => !existing.has(tableName));
  const missingColumns: string[] = [];

  if (existing.has('Item')) {
    const itemColumns = await prisma.$queryRawUnsafe<Array<{ name: string }>>(`PRAGMA table_info("Item")`);
    const existingColumns = new Set(itemColumns.map((column) => column.name));
    for (const requiredColumn of REQUIRED_ITEM_COLUMNS) {
      if (!existingColumns.has(requiredColumn)) {
        missingColumns.push(`Item.${requiredColumn}`);
      }
    }
  }

  return {
    ok: missingTables.length === 0 && missingColumns.length === 0,
    missingTables,
    missingColumns,
  };
}
