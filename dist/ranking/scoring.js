"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeScore = computeScore;
const constants_1 = require("./constants");
function computeScore(input) {
    const personalizationLayer = input.tagWeight * constants_1.PERSONALIZATION_WEIGHTS.tag +
        input.categoryWeight * constants_1.PERSONALIZATION_WEIGHTS.category +
        input.designerWeight * constants_1.PERSONALIZATION_WEIGHTS.designer;
    const qualityDecay = 1 / (1 + input.ageInDays * constants_1.ENGAGEMENT_WEIGHTS.ageDecayFactor);
    const engagementQualityLayer = (input.likes7d * constants_1.ENGAGEMENT_WEIGHTS.likes +
        input.saves7d * constants_1.ENGAGEMENT_WEIGHTS.saves) *
        qualityDecay;
    const freshnessLayer = Math.exp(-input.ageInHours / constants_1.FRESHNESS.halfLifeHours);
    const creatorGrowthLayer = 1 / Math.log(2 + Math.max(0, input.followerCount));
    const emergingBoost = input.followerCount < constants_1.CREATOR_GROWTH.emergingFollowerThreshold &&
        input.itemCount < constants_1.CREATOR_GROWTH.emergingItemThreshold
        ? constants_1.CREATOR_GROWTH.emergingBoost
        : 0;
    const explorationNoise = Math.random() * constants_1.EXPLORATION.maxNoise;
    const baseScore = personalizationLayer +
        engagementQualityLayer +
        freshnessLayer +
        creatorGrowthLayer +
        emergingBoost +
        explorationNoise;
    // Diversity soft penalty (session-level applied by caller)
    return {
        personalizationLayer,
        engagementQualityLayer,
        freshnessLayer,
        creatorGrowthLayer,
        emergingBoost,
        explorationNoise,
        totalScore: baseScore,
    };
}
//# sourceMappingURL=scoring.js.map