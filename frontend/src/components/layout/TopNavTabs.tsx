import React from 'react';

const tabs = ['Explore', 'Shop', 'Collections', 'Saved'] as const;

interface TopNavTabsProps {
  activeTab: (typeof tabs)[number];
  onTabSelect: (tab: (typeof tabs)[number]) => void;
}

export function TopNavTabs({ activeTab, onTabSelect }: TopNavTabsProps) {
  return (
    <nav className="sticky top-0 z-20 border-b border-zinc-200 bg-white/90 px-4 py-3 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-2 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              activeTab === tab ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
            }`}
            onClick={() => onTabSelect(tab)}
            type="button"
          >
            {tab}
          </button>
        ))}
      </div>
    </nav>
  );
}
