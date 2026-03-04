import React from 'react';
import type { LayerBreakdown } from '../types/domain';

interface RankingDebugOverlayProps {
  breakdown: LayerBreakdown;
  visible: boolean;
}

type ContributionRow = {
  key: string;
  label: string;
  value: number;
};

export function RankingDebugOverlay({ breakdown, visible }: RankingDebugOverlayProps) {
  if (!visible) {
    return null;
  }

  const rows: ContributionRow[] = [
    { key: 'personalizationLayer', label: 'personalizationLayer', value: breakdown.personalizationLayer },
    { key: 'engagementQualityLayer', label: 'engagementQualityLayer', value: breakdown.engagementQualityLayer },
    { key: 'freshnessLayer', label: 'freshnessLayer', value: breakdown.freshnessLayer },
    { key: 'creatorGrowthLayer', label: 'creatorGrowthLayer', value: breakdown.creatorGrowthLayer },
    { key: 'emergingBoost', label: 'emergingBoost', value: breakdown.emergingBoost },
    { key: 'explorationNoise', label: 'explorationNoise', value: breakdown.explorationNoise },
    { key: 'preferenceBoost', label: 'preferenceBoost', value: breakdown.preferenceBoost },
    { key: 'sessionBoost', label: 'sessionBoost', value: breakdown.sessionBoost },
    {
      key: 'diversityPenalty',
      label: 'diversityPenalty',
      value: breakdown.diversityPenalty ?? 0,
    },
  ];

  const topContributor = rows.reduce((best, row) =>
    Math.abs(row.value) > Math.abs(best.value) ? row : best
  );

  return (
    <details className="rounded-xl bg-black/80 p-3 text-xs text-white">
      <summary className="cursor-pointer select-none font-medium">
        Ranking Debug · Total: <span className="text-emerald-300">{breakdown.totalScore.toFixed(4)}</span>
      </summary>
      <div className="mt-2 space-y-1">
        {rows.map((row) => {
          const isTop = row.key === topContributor.key;
          return (
            <div key={row.key} className="flex items-center justify-between">
              <span className={isTop ? 'text-emerald-300' : 'text-white'}>{row.label}</span>
              <span className={isTop ? 'text-emerald-300' : 'text-zinc-200'}>{row.value.toFixed(4)}</span>
            </div>
          );
        })}
      </div>
    </details>
  );
}
