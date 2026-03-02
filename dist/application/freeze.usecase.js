"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listFreezes = void 0;
exports.freezeItem = freezeItem;
exports.getFreezesPage = getFreezesPage;
const freezeService_1 = require("../services/freezeService");
Object.defineProperty(exports, "listFreezes", { enumerable: true, get: function () { return freezeService_1.listFreezes; } });
const client_1 = require("@prisma/client");
const errors_1 = require("./errors");
const prisma_1 = require("../infrastructure/prisma");
function extractIdempotencyKey(metadata) {
    try {
        const parsed = JSON.parse(metadata);
        if (typeof parsed === 'object' && parsed !== null && 'idempotencyKey' in parsed) {
            const value = parsed.idempotencyKey;
            return typeof value === 'string' ? value : null;
        }
        return null;
    }
    catch {
        return null;
    }
}
function withIdempotencyKey(metadata, idempotencyKey) {
    try {
        const parsed = JSON.parse(metadata);
        if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
            const enriched = parsed;
            return JSON.stringify({ ...enriched, idempotencyKey });
        }
        return JSON.stringify({ data: parsed, idempotencyKey });
    }
    catch {
        return JSON.stringify({ data: metadata, idempotencyKey });
    }
}
async function freezeItem(itemId, input) {
    try {
        return await prisma_1.prisma.$transaction(async (tx) => {
            const item = await tx.item.findUnique({ where: { id: itemId } });
            if (!item) {
                throw new errors_1.AppError(400, 'FOREIGN_KEY_VIOLATION', 'Foreign key violation');
            }
            // idempotency guard: return existing freeze for same item + key
            const freezesForItem = await tx.freeze.findMany({ where: { itemId } });
            const existingByIdempotency = freezesForItem.find((freeze) => extractIdempotencyKey(freeze.metadata) === input.idempotencyKey);
            if (existingByIdempotency) {
                return existingByIdempotency;
            }
            if (item.version !== input.expectedVersion) {
                throw new errors_1.AppError(409, 'STALE_VERSION', 'Stale item version');
            }
            // enforce parentHash chain integrity inside transaction
            if (input.parentHash) {
                const latest = await tx.freeze.findFirst({
                    where: { itemId },
                    orderBy: { createdAt: 'desc' },
                });
                if (!latest || latest.hash !== input.parentHash) {
                    throw new errors_1.AppError(409, 'PARENT_HASH_MISMATCH', 'Parent hash mismatch');
                }
            }
            // guard against duplicate hash for the same item
            const existingByHash = await tx.freeze.findFirst({
                where: {
                    itemId,
                    hash: input.hash,
                },
            });
            if (existingByHash) {
                throw new errors_1.AppError(409, 'DUPLICATE_HASH', 'Duplicate freeze hash for item');
            }
            // create freeze and update item.currentHash atomically
            const freeze = await tx.freeze.create({
                data: {
                    itemId,
                    type: input.type,
                    svg: input.svg,
                    metadata: withIdempotencyKey(input.metadata, input.idempotencyKey),
                    ...(input.parentHash === undefined ? {} : { parentHash: input.parentHash }),
                    hash: input.hash,
                },
            });
            const updateResult = await tx.item.updateMany({
                where: { id: itemId, version: input.expectedVersion },
                data: { currentHash: input.hash, version: { increment: 1 } },
            });
            if (updateResult.count === 0) {
                throw new errors_1.AppError(409, 'STALE_VERSION', 'Stale item version');
            }
            return freeze;
        });
    }
    catch (error) {
        if (error instanceof errors_1.AppError) {
            throw error;
        }
        if (error instanceof client_1.Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2002') {
                throw new errors_1.AppError(409, 'DUPLICATE_HASH', 'Duplicate freeze hash for item');
            }
            if (error.code === 'P2003') {
                throw new errors_1.AppError(400, 'FOREIGN_KEY_VIOLATION', 'Foreign key violation');
            }
        }
        throw new errors_1.AppError(500, 'FREEZE_WRITE_FAILED', 'Failed to create freeze');
    }
}
async function getFreezesPage(input) {
    return (0, freezeService_1.listFreezesPaginated)(input);
}
//# sourceMappingURL=freeze.usecase.js.map