import { SNAPSHOT } from "../ranking/constants";

type SnapshotEntry = {
  itemIds: string[];
  expiresAt: number;
};

const snapshotStore = new Map<string, SnapshotEntry>();

export function getSnapshot(userId: string): string[] | null {
  const entry = snapshotStore.get(userId);
  if (!entry) return null;

  if (Date.now() > entry.expiresAt) {
    snapshotStore.delete(userId);
    return null;
  }

  return entry.itemIds;
}

export function setSnapshot(userId: string, itemIds: string[]): void {
  const ttl = SNAPSHOT.ttlMinutes * 60 * 1000;

  snapshotStore.set(userId, {
    itemIds,
    expiresAt: Date.now() + ttl,
  });
}
