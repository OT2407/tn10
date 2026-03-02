function loadGetPreference() {
  try {
    // Prefer compiled JS when available (works in plain Node runtime)
    return require('../dist/ranking/preferences').getPreference;
  } catch {
    // Fallback placeholder when dist has not been built yet
    return (userId) => ({
      userId,
      likedTags: {},
      likedCategories: {},
      followedDesigners: {},
    });
  }
}

function loadComputeScore() {
  try {
    return require('../dist/ranking/scoring').computeScore;
  } catch {
    return () => ({
      personalizationLayer: 0,
      preferenceBoost: 0,
      engagementQualityLayer: 0,
      freshnessLayer: 0,
      creatorGrowthLayer: 0,
      emergingBoost: 0,
      explorationNoise: 0,
      diversityPenalty: 0,
      totalScore: 0,
    });
  }
}

async function loadItemFromDb(_itemId) {
  // Future DB hook:
  // - load item + engagement + creator metadata
  // - map to computeScore input fields
  // For now, database may not have compatible explain projection.
  return null;
}

function emptyBreakdown() {
  return {
    personalizationLayer: 0,
    preferenceBoost: 0,
    engagementQualityLayer: 0,
    freshnessLayer: 0,
    creatorGrowthLayer: 0,
    emergingBoost: 0,
    explorationNoise: 0,
    diversityPenalty: 0,
    totalScore: 0,
  };
}

const getPreference = loadGetPreference();
const computeScore = loadComputeScore();

const itemId = process.argv[3];
if (!itemId) {
  console.log('No item ID provided. Usage: npm run explain -- --item <ID>');
  process.exit(0);
}

async function main() {
  const preference = getPreference('demo-user');
  const item = await loadItemFromDb(itemId);

  if (!item) {
    const breakdown = emptyBreakdown();
    console.log({
      itemId,
      explanation: 'Explain response (no item data available).',
      breakdown,
      totalScore: breakdown.totalScore,
      preferences: preference,
    });
    return;
  }

  const breakdown = computeScore({
    userId: 'demo-user',
    tagNames: item.tagNames ?? [],
    category: item.category ?? null,
    designerId: item.designerId ?? null,
    tagWeight: item.tagWeight,
    categoryWeight: item.categoryWeight,
    designerWeight: item.designerWeight,
    likes7d: item.likes7d,
    saves7d: item.saves7d,
    ageInHours: item.ageInHours,
    ageInDays: item.ageInDays,
    followerCount: item.followerCount,
    itemCount: item.itemCount,
  });

  console.log({
    itemId,
    breakdown,
    totalScore: breakdown.totalScore,
    preferences: preference,
  });
}

main().catch((err) => {
  console.error('Explain command failed:', err);
  process.exit(1);
});
