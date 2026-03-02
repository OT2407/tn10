-- CreateTable
CREATE TABLE "Item" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "currentHash" TEXT
);

-- CreateTable
CREATE TABLE "Freeze" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "itemId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "svg" TEXT NOT NULL,
    "metadata" TEXT NOT NULL,
    "parentHash" TEXT,
    "hash" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Freeze_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Link" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "freezeId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "note" TEXT,
    CONSTRAINT "Link_freezeId_fkey" FOREIGN KEY ("freezeId") REFERENCES "Freeze" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Freeze_itemId_idx" ON "Freeze"("itemId");

-- CreateIndex
CREATE INDEX "Link_freezeId_idx" ON "Link"("freezeId");
