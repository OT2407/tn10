import React from 'react';

interface SaveButtonProps {
  count: number;
  active?: boolean;
  pending?: boolean;
  onClick?: () => void;
}

export function SaveButton({ count, active = false, pending = false, onClick }: SaveButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3 py-1 text-xs transition ${
        active ? 'bg-emerald-100 text-emerald-700' : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
      } ${pending ? 'opacity-60' : ''}`}
    >
      ★ {count}
    </button>
  );
}
