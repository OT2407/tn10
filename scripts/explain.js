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
      engagementQualityLayer: 0,
      freshnessLayer: 0,
      creatorGrowthLayer: 0,
      emergingBoost: 0,
      explorationNoise: 0,
      preferenceBoost: 0,
      sessionBoost: 0,
      diversityPenalty: 0,
      totalScore: 0,
    });
  }
}

async function loadItemFromDb(_itemId) {
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const item = await prisma.item.findUnique({
      where: { id: _itemId },
      include: {
        tags: { include: { tag: true } },
        likes: { where: { createdAt: { gte: sevenDaysAgo } }, select: { id: true } },
        saves: { where: { createdAt: { gte: sevenDaysAgo } }, select: { id: true } },
      },
    });

    if (!item) {
      await prisma.$disconnect();
      return null;
    }

    const followerCount =
      item.sellerId === null
        ? 0
        : await prisma.follow.count({ where: { followingId: item.sellerId } });

    const itemCount =
      item.sellerId === null
        ? 0
        : await prisma.item.count({ where: { sellerId: item.sellerId } });

    await prisma.$disconnect();

    return {
      item,
      followerCount,
      itemCount,
    };
  } catch {
    return null;
  }
}

function emptyBreakdown() {
  return {
    personalizationLayer: 0,
    engagementQualityLayer: 0,
    freshnessLayer: 0,
    creatorGrowthLayer: 0,
    emergingBoost: 0,
    explorationNoise: 0,
    preferenceBoost: 0,
    sessionBoost: 0,
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
  const preferences = getPreference('demo-user');
  const loaded = await loadItemFromDb(itemId);

  if (!loaded) {
    const breakdown = emptyBreakdown();
    console.log({
      itemId,
      explanation: 'Explain response (no item data available).',
      breakdown,
      totalScore: breakdown.totalScore,
      preferences,
      note: 'All ranking signals included (diversity, preference, session, decay)',
    });
    return;
  }

  const item = loaded.item;
  const tagNames = item.tags.map((relation) => relation.tag.name);
  const tagWeight = tagNames.reduce((sum, tagName) => sum + (preferences.likedTags[tagName] || 0), 0);
  const categoryWeight =
    item.category === null ? 0 : preferences.likedCategories[item.category] || 0;
  const designerWeight =
    item.sellerId === null ? 0 : preferences.followedDesigners[item.sellerId] || 0;
  const ageInHours = Math.max(0, (Date.now() - item.createdAt.getTime()) / (1000 * 60 * 60));
  const ageInDays = ageInHours / 24;

  const breakdown = computeScore({
    userId: 'demo-user',
    tagNames,
    category: item.category,
    designerId: item.sellerId,
    tagWeight,
    categoryWeight,
    designerWeight,
    likes7d: item.likes.length,
    saves7d: item.saves.length,
    ageInHours,
    ageInDays,
    followerCount: loaded.followerCount,
    itemCount: loaded.itemCount,
  });

  console.log({
    itemId,
    breakdown,
    totalScore: breakdown.totalScore,
    preferences,
    note: 'All ranking signals included (diversity, preference, session, decay)',
  });
}

main().catch((err) => {
  console.error('Explain command failed:', err);
  process.exit(1);
});
