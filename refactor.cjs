const fs = require('fs');
const path = require('path');

const files = [
  'src/__tests__/unit/carbonCalculator.test.ts',
  'src/__tests__/unit/stores.test.ts',
  'src/components/carbon-budget/AddEntryForm.tsx',
  'src/components/carbon-mirror/CarbonMirrorCard.tsx',
  'src/components/dashboard/CarbonTimeline.tsx',
  'src/hooks/useDailyTimeline.ts',
  'src/hooks/useReceiptScanner.ts',
  'src/hooks/useWeeklyStats.ts',
  'src/pages/CarbonSubtitlesPage.tsx',
  'src/stores/carbonStore.ts',
  'src/components/carbon-budget/CarbonBudgetSummary.tsx',
  'src/components/gamification/StoryHistory.tsx',
  'src/utils/formatters.ts',
  'server/domain/mirror/handler.ts',
  'server/domain/receipt/handler.ts',
  'server/domain/story/handler.ts',
  'server/domain/subtitles/handler.ts'
];

files.forEach(f => {
  const p = path.join(process.cwd(), f);
  if (fs.existsSync(p)) {
    let content = fs.readFileSync(p, 'utf8');
    
    content = content.replace(/\bdescription:/g, 'activityName:');
    content = content.replace(/\bentry\.description\b/g, 'entry.activityName');
    
    content = content.replace(/\bcreatedAt:/g, 'date:');
    content = content.replace(/\bentry\.createdAt\b/g, 'entry.date');
    content = content.replace(/'id' \| 'createdAt'/g, "'id' | 'date'");
    
    content = content.replace(/source:\s*'budget'/g, "source: 'manual'");

    if(f.includes('stores.test.ts') || f.includes('carbonCalculator.test.ts')) {
      content = content.replace(/'createdAt'/g, "'date'");
      content = content.replace(/'description'/g, "'activityName'");
    }

    fs.writeFileSync(p, content, 'utf8');
  }
});
console.log('Done refactoring property names.');
