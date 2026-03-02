import React, { useState } from 'react';

interface FollowButtonProps {
  initialFollowing: boolean;
  onToggle: (next: boolean) => Promise<boolean>;
}

export function FollowButton({ initialFollowing, onToggle }: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(initialFollowing);
  const [isPending, setIsPending] = useState(false);

  const handleClick = async () => {
    if (isPending) {
      return;
    }

    const next = !isFollowing;
    setIsFollowing(next);
    setIsPending(true);

    const ok = await onToggle(next);
    if (!ok) {
      setIsFollowing(!next);
    }

    setIsPending(false);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
        isFollowing
          ? 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
          : 'bg-zinc-900 text-white hover:bg-zinc-700'
      } ${isPending ? 'opacity-60' : ''}`}
    >
      {isFollowing ? 'Following' : 'Follow'}
    </button>
  );
}
