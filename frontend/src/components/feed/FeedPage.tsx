import React, { useMemo, useState } from 'react';
import type { ExploreMode, FeedItem } from '../../types/domain';
import { TagPill } from '../common/TagPill';
import { FeedCard } from './FeedCard';
import { applyMode, toggleLike, toggleSave } from '../../services/exploreApi';

interface FeedPageProps {
  items: FeedItem[];
  tags: string[];
  authToken?: string;
  followingDesignerIds?: string[];
  onOpenDesigner?: (designerId: string) => void;
}

const PAGE_SIZE = 8;

export function FeedPage({
  items,
  tags,
  authToken,
  followingDesignerIds = [],
  onOpenDesigner,
}: FeedPageProps) {
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [mode, setMode] = useState<ExploreMode>('FOR_YOU');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [likePendingIds, setLikePendingIds] = useState<Set<string>>(new Set());
  const [savePendingIds, setSavePendingIds] = useState<Set<string>>(new Set());
  const [localItems, setLocalItems] = useState<FeedItem[]>(items);

  const baseFiltered = useMemo(
    () =>
      selectedTag === null
        ? localItems
        : localItems.filter((item) => item.tags.includes(selectedTag)),
    [localItems, selectedTag]
  );

  const modeFiltered = useMemo(
    () => applyMode(baseFiltered, mode, new Set(followingDesignerIds)),
    [baseFiltered, mode, followingDesignerIds]
  );

  const visible = modeFiltered.slice(0, visibleCount);
  const canLoadMore = visibleCount < modeFiltered.length;

  const updateItem = (itemId: string, updater: (item: FeedItem) => FeedItem) => {
    setLocalItems((prev) => prev.map((item) => (item.id === itemId ? updater(item) : item)));
  };

  const handleLike = async (itemId: string) => {
    setLikePendingIds((prev) => new Set(prev).add(itemId));

    let nextState = false;
    updateItem(itemId, (item) => {
      nextState = !Boolean(item.likedByMe);
      return {
        ...item,
        likedByMe: nextState,
        likes: item.likes + (nextState ? 1 : -1),
      };
    });

    const ok = await toggleLike(authToken, itemId);
    if (!ok) {
      updateItem(itemId, (item) => ({
        ...item,
        likedByMe: !nextState,
        likes: item.likes + (nextState ? -1 : 1),
      }));
    }

    setLikePendingIds((prev) => {
      const next = new Set(prev);
      next.delete(itemId);
      return next;
    });
  };

  const handleSave = async (itemId: string) => {
    setSavePendingIds((prev) => new Set(prev).add(itemId));

    let nextState = false;
    updateItem(itemId, (item) => {
      nextState = !Boolean(item.savedByMe);
      return {
        ...item,
        savedByMe: nextState,
        saves: item.saves + (nextState ? 1 : -1),
      };
    });

    const ok = await toggleSave(authToken, itemId);
    if (!ok) {
      updateItem(itemId, (item) => ({
        ...item,
        savedByMe: !nextState,
        saves: item.saves + (nextState ? -1 : 1),
      }));
    }

    setSavePendingIds((prev) => {
      const next = new Set(prev);
      next.delete(itemId);
      return next;
    });
  };

  return (
    <section className="mx-auto max-w-6xl space-y-6 px-4 py-6">
      <div className="flex flex-wrap gap-2">
        <TagPill label="For You" selected={mode === 'FOR_YOU'} onClick={() => setMode('FOR_YOU')} />
        <TagPill label="Following" selected={mode === 'FOLLOWING'} onClick={() => setMode('FOLLOWING')} />
        <TagPill label="Trending" selected={mode === 'TRENDING'} onClick={() => setMode('TRENDING')} />
        <TagPill label="Newest" selected={mode === 'NEWEST'} onClick={() => setMode('NEWEST')} />
      </div>

      <div className="flex flex-wrap gap-2">
        <TagPill label="All" selected={selectedTag === null} onClick={() => setSelectedTag(null)} />
        {tags.map((tag) => (
          <TagPill
            key={tag}
            label={tag}
            selected={selectedTag === tag}
            onClick={() => setSelectedTag(tag)}
          />
        ))}
      </div>

      {modeFiltered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-8 text-center text-sm text-zinc-500">
          {mode === 'FOLLOWING' ? 'No follows yet. Start following designers to shape your feed.' : 'No items yet.'}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((item) => (
            <FeedCard
              key={item.id}
              item={item}
              onLike={handleLike}
              onSave={handleSave}
              onOpenDesigner={onOpenDesigner}
              likePending={likePendingIds.has(item.id)}
              savePending={savePendingIds.has(item.id)}
            />
          ))}
        </div>
      )}

      {canLoadMore && (
        <div className="flex justify-center">
          <button
            type="button"
            className="rounded-full bg-zinc-900 px-5 py-2 text-sm text-white transition hover:bg-zinc-700"
            onClick={() => setVisibleCount((value) => Math.min(value + PAGE_SIZE, modeFiltered.length))}
          >
            Load More
          </button>
        </div>
      )}
    </section>
  );
}
