import React from 'react';

interface TagPillProps {
  label: string;
  selected?: boolean;
  onClick?: () => void;
}

export function TagPill({ label, selected = false, onClick }: TagPillProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
        selected ? 'border-zinc-900 bg-zinc-900 text-white' : 'border-zinc-300 bg-white text-zinc-700 hover:border-zinc-500'
      }`}
    >
      {label}
    </button>
  );
}
