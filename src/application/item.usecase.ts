import {
  createItem as createItemService,
  getItem as getItemService,
  listItems,
  updateItemVersion,
} from '../services/itemService';
import { listFreezes } from '../services/freezeService';

type ItemStatus = 'ACTIVE' | 'FROZEN' | 'EMPTY';

export interface CreateItemUseCaseInput {
  ownerId: string;
  name?: string;
}

export async function createItem(input: CreateItemUseCaseInput) {
  // business rules could be added here
  return createItemService(input.ownerId, input.name);
}

export async function getItemWithFreezes(id: string) {
  const item = await getItemService(id);
  return item;
}

export interface ListItemsInput {
  ownerId: string;
  cursor?: string;
  limit: number;
}

export async function getItemsPage(input: ListItemsInput) {
  const items = await listItems(input.ownerId, input.limit + 1, input.cursor);
  const hasMore = items.length > input.limit;
  const pageItems = hasMore ? items.slice(0, input.limit) : items;
  const nextCursor = hasMore ? (pageItems[pageItems.length - 1]?.id ?? null) : null;
  return { items: pageItems, nextCursor };
}

export async function renameItem(id: string, version: number, name?: string) {
  return updateItemVersion(id, version, name === undefined ? {} : { name });
}

function parseFreezeMetadata(raw: string): Record<string, unknown> {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>;
    }
    return {};
  } catch {
    return {};
  }
}

export async function getItemFull(id: string) {
  const item = await getItemService(id);
  if (!item) {
    return null;
  }

  const freezes = await listFreezes(id);
  const latestFreeze = freezes.length > 0 ? freezes[freezes.length - 1] : null;
  const status: ItemStatus =
    freezes.length === 0 ? 'EMPTY' : latestFreeze?.type === 'final' ? 'FROZEN' : 'ACTIVE';

  return {
    id: item.id,
    name: item.name,
    currentHash: item.currentHash,
    status,
    freezes: freezes.map((freeze) => ({
      id: freeze.id,
      type: freeze.type,
      hash: freeze.hash,
      parentHash: freeze.parentHash,
      metadata: parseFreezeMetadata(freeze.metadata),
    })),
  };
}
