import { PrismaClient, Prisma } from '@prisma/client';
import { AppError } from '../application/errors';

const prisma = new PrismaClient();

export interface CreateMarketplaceItemInput {
  sellerId: string;
  title: string;
  description: string;
  category: string;
  price: number;
  previewUrl: string;
  deliveryType: string;
  metadata: Prisma.InputJsonValue;
  brandId?: string;
  collaborationId?: string;
  originalityStatus?: 'SELF_DECLARED' | 'VERIFIED' | 'FLAGGED';
}

export async function createMarketplaceItem(input: CreateMarketplaceItemInput) {
  if (!Number.isInteger(input.price) || input.price <= 0) {
    throw new AppError(422, 'INVALID_PRICE', 'Price must be a positive integer');
  }

  if (input.collaborationId) {
    const collaboration = await prisma.collaboration.findUnique({ where: { id: input.collaborationId } });
    if (!collaboration) {
      throw new AppError(404, 'COLLABORATION_NOT_FOUND', 'Collaboration not found');
    }
    if (collaboration.status !== 'ACTIVE') {
      throw new AppError(409, 'COLLABORATION_NOT_ACTIVE', 'Only ACTIVE collaboration can publish items');
    }
  }

  return prisma.item.create({
    data: {
      ownerId: input.sellerId,
      sellerId: input.sellerId,
      name: input.title,
      title: input.title,
      description: input.description,
      category: input.category,
      price: input.price,
      previewUrl: input.previewUrl,
      deliveryType: input.deliveryType,
      metadata: input.metadata,
      ...(input.brandId === undefined ? {} : { brandId: input.brandId }),
      ...(input.collaborationId === undefined ? {} : { collaborationId: input.collaborationId }),
      originalityStatus: input.originalityStatus ?? 'SELF_DECLARED',
    },
  });
}

export async function addTagsToItem(itemId: string, tagNames: string[]) {
  return prisma.$transaction(async (tx) => {
    const item = await tx.item.findUnique({ where: { id: itemId } });
    if (!item) {
      throw new AppError(404, 'ITEM_NOT_FOUND', 'Item not found');
    }

    for (const rawName of tagNames) {
      const name = rawName.trim().toLowerCase();
      if (name.length === 0) {
        continue;
      }
      const tag = await tx.tag.upsert({
        where: { name },
        update: {},
        create: { name },
      });

      await tx.itemTag.upsert({
        where: { itemId_tagId: { itemId, tagId: tag.id } },
        update: {},
        create: { itemId, tagId: tag.id },
      });
    }

    return tx.item.findUnique({
      where: { id: itemId },
      include: {
        tags: {
          include: { tag: true },
        },
      },
    });
  });
}
