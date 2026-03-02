export const PERSONALIZATION_WEIGHTS = {
  tag: 1.0,
  category: 0.8,
  designer: 1.2,
} as const;

export const ENGAGEMENT_WEIGHTS = {
  likes: 1.0,
  saves: 1.5,
  ageDecayFactor: 0.15,
  windowDays: 7,
} as const;

export const FRESHNESS = {
  halfLifeHours: 72,
} as const;

export const CREATOR_GROWTH = {
  emergingFollowerThreshold: 50,
  emergingItemThreshold: 5,
  emergingBoost: 1.5,
} as const;

export const EXPLORATION = {
  maxNoise: 0.2,
} as const;

export const SNAPSHOT = {
  ttlMinutes: 5,
} as const;
