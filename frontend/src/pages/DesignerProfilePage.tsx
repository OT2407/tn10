import React, { useState } from 'react';
import type { DesignerProfile } from '../types/domain';
import { FeedCard } from '../components/feed/FeedCard';
import { FollowButton } from '../components/common/FollowButton';
import { toggleFollow } from '../services/exploreApi';

interface DesignerProfilePageProps {
  profile: DesignerProfile;
  authToken?: string;
}

export function DesignerProfilePage({ profile, authToken }: DesignerProfilePageProps) {
  const [following, setFollowing] = useState(Boolean(profile.followsMe));

  return (
    <main className="mx-auto min-h-screen max-w-6xl space-y-6 bg-zinc-50 px-4 py-6">
      <section className="rounded-2xl border border-zinc-200 bg-white p-5">
        <div className="flex flex-wrap items-center gap-4">
          <img src={profile.designer.avatarUrl} alt={profile.designer.displayName} className="h-16 w-16 rounded-full object-cover" />
          <div className="flex-1">
            <h1 className="text-xl font-bold text-zinc-900">
              {profile.designer.displayName} {profile.designer.verified ? <span className="text-emerald-600">✓</span> : null}
            </h1>
            <p className="text-sm text-zinc-500">{profile.designer.handle}</p>
            <p className="mt-2 text-xs text-zinc-600">Specialties: {profile.designer.specialties.join(' · ')}</p>
          </div>
          <FollowButton
            initialFollowing={following}
            onToggle={async (next) => {
              const ok = await toggleFollow(authToken, profile.designer.id);
              if (ok) {
                setFollowing(next);
              }
              return ok;
            }}
          />
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
          <div className="rounded-lg bg-zinc-100 p-3">Followers: {profile.designer.followersCount}</div>
          <div className="rounded-lg bg-zinc-100 p-3">Following: {profile.designer.followingCount}</div>
          <div className="rounded-lg bg-zinc-100 p-3">Collaborations: {profile.collaborations.length}</div>
          <div className="rounded-lg bg-zinc-100 p-3">Portfolio: {profile.portfolio.length}</div>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Collaborations</h2>
        {profile.collaborations.length === 0 ? (
          <div className="rounded-xl border border-dashed border-zinc-300 bg-white p-6 text-sm text-zinc-500">No collaborations yet.</div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {profile.collaborations.map((collab) => (
              <article key={collab.id} className="rounded-xl border border-zinc-200 bg-white p-4 text-sm">
                <p className="font-semibold text-zinc-900">{collab.title}</p>
                <p className="text-zinc-600">Role: {collab.role}</p>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Portfolio</h2>
        {profile.portfolio.length === 0 ? (
          <div className="rounded-xl border border-dashed border-zinc-300 bg-white p-6 text-sm text-zinc-500">No items yet.</div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {profile.portfolio.map((item) => (
              <FeedCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
