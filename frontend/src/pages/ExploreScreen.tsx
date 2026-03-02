import React, { useState } from 'react';
import { TopNavTabs } from '../components/layout/TopNavTabs';
import { FeedPage } from '../components/feed/FeedPage';
import { feedItems, tags } from '../mocks/data';
import { DesignerProfilePage } from './DesignerProfilePage';
import { sampleDesignerProfile } from '../mocks/data';

export function ExploreScreen() {
  const [tab, setTab] = useState<'Explore' | 'Shop' | 'Collections' | 'Saved'>('Explore');
  const [openDesigner, setOpenDesigner] = useState(false);

  if (openDesigner) {
    return <DesignerProfilePage profile={sampleDesignerProfile} />;
  }

  return (
    <main className="min-h-screen bg-zinc-50">
      <TopNavTabs activeTab={tab} onTabSelect={setTab} />
      <FeedPage
        items={feedItems}
        tags={tags}
        followingDesignerIds={['usr_nora']}
        onOpenDesigner={() => setOpenDesigner(true)}
      />
    </main>
  );
}
