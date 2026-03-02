import { listFreezes, listFreezesPaginated } from '../services/freezeService';
import { CreateFreezeInput } from '../validation/freeze.schema';
import { Prisma } from '@prisma/client';
import { AppError } from './errors';
import { prisma } from '../infrastructure/prisma';

function extractIdempotencyKey(metadata: string): string | null {
  try {
    const parsed: unknown = JSON.parse(metadata);
    if (typeof parsed === 'object' && parsed !== null && 'idempotencyKey' in parsed) {
      const value = (parsed as { idempotencyKey?: unknown }).idempotencyKey;
      return typeof value === 'string' ? value : null;
    }
    return null;
  } catch {
    return null;
  }
}

function withIdempotencyKey(metadata: string, idempotencyKey: string): string {
  try {
    const parsed: unknown = JSON.parse(metadata);
    if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
      const enriched = parsed as Record<string, unknown>;
      return JSON.stringify({ ...enriched, idempotencyKey });
    }
    return JSON.stringify({ data: parsed, idempotencyKey });
  } catch {
    return JSON.stringify({ data: metadata, idempotencyKey });
  }
}

export async function freezeItem(itemId: string, input: CreateFreezeInput) {
  try {
    return await prisma.$transaction(async (tx) => {
      const item = await tx.item.findUnique({ where: { id: itemId } });
      if (!item) {
        throw new AppError(400, 'FOREIGN_KEY_VIOLATION', 'Foreign key violation');
      }

      // idempotency guard: return existing freeze for same item + key
      const freezesForItem = await tx.freeze.findMany({ where: { itemId } });
      const existingByIdempotency = freezesForItem.find(
        (freeze) => extractIdempotencyKey(freeze.metadata) === input.idempotencyKey
      );
      if (existingByIdempotency) {
        return existingByIdempotency;
      }

      if (item.version !== input.expectedVersion) {
        throw new AppError(409, 'STALE_VERSION', 'Stale item version');
      }

      // enforce parentHash chain integrity inside transaction
      if (input.parentHash) {
        const latest = await tx.freeze.findFirst({
          where: { itemId },
          orderBy: { createdAt: 'desc' },
        });
        if (!latest || latest.hash !== input.parentHash) {
          throw new AppError(409, 'PARENT_HASH_MISMATCH', 'Parent hash mismatch');
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
        throw new AppError(409, 'DUPLICATE_HASH', 'Duplicate freeze hash for item');
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
        throw new AppError(409, 'STALE_VERSION', 'Stale item version');
      }

      return freeze;
    });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        throw new AppError(409, 'DUPLICATE_HASH', 'Duplicate freeze hash for item');
      }
      if (error.code === 'P2003') {
        throw new AppError(400, 'FOREIGN_KEY_VIOLATION', 'Foreign key violation');
      }
    }

    throw new AppError(500, 'FREEZE_WRITE_FAILED', 'Failed to create freeze');
  }
}

export { listFreezes };

export interface ListFreezesInput {
  itemId: string;
  cursor?: string;
  limit: number;
}

export async function getFreezesPage(input: ListFreezesInput) {
  return listFreezesPaginated(input);
}
