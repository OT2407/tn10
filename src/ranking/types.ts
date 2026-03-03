export interface RankingInput {
  userId: string;
  tagNames: string[];
  category: string | null;
  designerId: string | null;
  tagWeight: number;
  categoryWeight: number;
  designerWeight: number;
  likes7d: number;
  saves7d: number;
  ageInHours: number;
  ageInDays: number;
  followerCount: number;
  itemCount: number;
}

export interface LayerBreakdown {
  personalizationLayer: number;
  preferenceBoost: number;
  sessionBoost: number;
  engagementQualityLayer: number;
  freshnessLayer: number;
  creatorGrowthLayer: number;
  emergingBoost: number;
  explorationNoise: number;
  diversityPenalty?: number;
  totalScore: number;
}
