import React from 'react';

interface LikeButtonProps {
  count: number;
  active?: boolean;
  pending?: boolean;
  onClick?: () => void;
}

export function LikeButton({ count, active = false, pending = false, onClick }: LikeButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3 py-1 text-xs transition ${
        active ? 'bg-rose-100 text-rose-700' : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
      } ${pending ? 'opacity-60' : ''}`}
    >
      ♥ {count}
    </button>
  );
}
