import {
  PERSONALIZATION_WEIGHTS,
  ENGAGEMENT_WEIGHTS,
  FRESHNESS,
  CREATOR_GROWTH,
  EXPLORATION,
} from "./constants";
import { RankingInput, LayerBreakdown } from "./types";

export function computeScore(input: RankingInput): LayerBreakdown {
  const personalizationLayer =
    input.tagWeight * PERSONALIZATION_WEIGHTS.tag +
    input.categoryWeight * PERSONALIZATION_WEIGHTS.category +
    input.designerWeight * PERSONALIZATION_WEIGHTS.designer;

  const qualityDecay = 1 / (1 + input.ageInDays * ENGAGEMENT_WEIGHTS.ageDecayFactor);

  const engagementQualityLayer =
    (input.likes7d * ENGAGEMENT_WEIGHTS.likes +
      input.saves7d * ENGAGEMENT_WEIGHTS.saves) *
    qualityDecay;

  const freshnessLayer = Math.exp(
    -input.ageInHours / FRESHNESS.halfLifeHours
  );

  const creatorGrowthLayer =
    1 / Math.log(2 + Math.max(0, input.followerCount));

  const emergingBoost =
    input.followerCount < CREATOR_GROWTH.emergingFollowerThreshold &&
    input.itemCount < CREATOR_GROWTH.emergingItemThreshold
      ? CREATOR_GROWTH.emergingBoost
      : 0;

  const explorationNoise =
    Math.random() * EXPLORATION.maxNoise;

  const totalScore =
    personalizationLayer +
    engagementQualityLayer +
    freshnessLayer +
    creatorGrowthLayer +
    emergingBoost +
    explorationNoise;

  return {
    personalizationLayer,
    engagementQualityLayer,
    freshnessLayer,
    creatorGrowthLayer,
    emergingBoost,
    explorationNoise,
    totalScore,
  };
}
