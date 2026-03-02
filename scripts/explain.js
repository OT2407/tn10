const { computeScore } = require('../src/ranking/scoring');
const { getPreference } = require('../src/ranking/preferences');

const itemId = process.argv[3];
if (!itemId) {
  console.log('No item ID provided. Usage: npm run explain -- --item <ID>');
  process.exit(0);
}

// In real system, load item from DB.
// Since DB is empty, return structured placeholder + preference view.
const preference = getPreference('demo-user');

const breakdown = {
  personalizationLayer: 0,
  engagementQualityLayer: 0,
  freshnessLayer: 0,
  creatorGrowthLayer: 0,
  emergingBoost: 0,
  explorationNoise: 0,
  diversityPenalty: 0,
  totalScore: 0
};

console.log({
  itemId,
  explanation: 'Explain response (no item data available).',
  breakdown,
  preferences: preference
});
