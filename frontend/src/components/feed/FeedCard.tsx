import React from 'react';
import type { FeedItem } from '../../types/domain';
import { LikeButton } from '../common/LikeButton';
import { SaveButton } from '../common/SaveButton';
import { TagPill } from '../common/TagPill';

interface FeedCardProps {
  item: FeedItem;
  onLike?: (itemId: string) => void;
  onSave?: (itemId: string) => void;
  onOpenDesigner?: (designerId: string) => void;
  likePending?: boolean;
  savePending?: boolean;
}

export function FeedCard({
  item,
  onLike,
  onSave,
  onOpenDesigner,
  likePending = false,
  savePending = false,
}: FeedCardProps) {
  return (
    <article className="group relative overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl">
      <div className="relative overflow-hidden">
        <img
          src={item.coverUrl}
          alt={item.title}
          className="h-56 w-full object-cover transition duration-700 ease-out group-hover:scale-105"
        />
        <div className="absolute left-3 top-3 flex items-center gap-2 text-xs">
          {item.hasCollab && (
            <span className="animate-pulse rounded bg-sky-100 px-2 py-0.5 text-sky-700">Collab</span>
          )}
          {item.isVerified && (
            <span className="rounded bg-emerald-100 px-2 py-0.5 text-emerald-700">✓ Verified</span>
          )}
        </div>

        <button
          type="button"
          onClick={() => onOpenDesigner?.(item.seller.id)}
          className="absolute bottom-3 left-3 hidden items-center gap-2 rounded-full bg-white/90 px-2 py-1 text-xs text-zinc-800 shadow-sm transition group-hover:flex"
        >
          <img src={item.seller.avatarUrl} alt={item.seller.displayName} className="h-6 w-6 rounded-full object-cover" />
          <span>{item.seller.displayName}</span>
        </button>
      </div>

      <div className="space-y-3 p-4">
        <h3 className="text-base font-semibold text-zinc-900">{item.title}</h3>
        <p className="text-xs text-zinc-500">
          {item.seller.displayName} · {item.currency} {item.price}
        </p>
        <div className="flex flex-wrap gap-2">
          {item.tags.map((tag) => (
            <TagPill key={tag} label={tag} />
          ))}
        </div>
        <div className="flex items-center gap-2">
          <LikeButton
            count={item.likes}
            active={Boolean(item.likedByMe)}
            pending={likePending}
            onClick={() => onLike?.(item.id)}
          />
          <SaveButton
            count={item.saves}
            active={Boolean(item.savedByMe)}
            pending={savePending}
            onClick={() => onSave?.(item.id)}
          />
        </div>
      </div>
    </article>
  );
}
