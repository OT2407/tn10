const itemId = process.argv[3];
if (!itemId) {
  console.log('No item ID provided. Usage: npm run explain -- --item <ID>');
  process.exit(0);
}

// Placeholder explanation (extend later with real data)
console.log({
  itemId,
  explanation: 'No real item data yet. Phase 4 explain placeholder.',
  diversityImpact: 0,
  preferenceImpact: 0
});
