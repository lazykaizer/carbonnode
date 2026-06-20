/** Express route handler for Carbon Story — weekly AI narrative generation via Gemini with rule-based fallback. */
import { Router } from 'express';
import type { Request, Response } from 'express';
import { getGeminiModel, parseJsonResponse } from '../../shared/geminiClient';
import { CarbonStoryRequestSchema } from '../../../src/schemas';
import { validateSchema } from '../../shared/middleware/validate';
import { z } from 'zod';

const router = Router();

const STORY_PROMPT = `You are a creative climate copywriter. The user has tracked their carbon footprint for a week. 
Write a short, engaging, 2-3 sentence personalized story summarizing their week. 
Assign a weekly footprint rating (excellent, good, average, poor) and offer one practical reduction tip for next week.

Return ONLY a JSON response in this exact format:
{
  "story": "A creative, personal, and engaging 2-3 sentence narrative summarizing their performance.",
  "highlightStat": "A compelling stat highlight to show in bold (e.g., '14kg CO₂ saved', 'Under budget by 35%')",
  "weekRating": "excellent|good|average|poor",
  "nextWeekTip": "One highly actionable, specific suggestion for improvement"
}`;

type WeekData = z.infer<typeof CarbonStoryRequestSchema>;

function getMockResponse(weekData: WeekData) {
  const isGood = weekData.vsIndianAverage !== 'above';
  return {
    story: `This week, you embarked on a low-carbon crusade! By logging ${weekData.actionsLogged} actions and maintaining a 🔥 ${weekData.streakDays}-day streak, your forest is thriving. Your transit decisions have shown a strong commitment to public alternatives.`,
    highlightStat: isGood
      ? `Under budget by ${Math.round(100 - weekData.percentageVsAverage)}%`
      : `${weekData.totalCo2Kg} kg CO₂ logged`,
    weekRating: isGood ? (weekData.percentageVsAverage < 50 ? 'excellent' : 'good') : 'average',
    nextWeekTip: `Your highest emissions came from ${weekData.worstCategory || 'energy'}. Try shutting down appliances at night to lower it further next week!`,
  };
}

router.post('/', validateSchema(CarbonStoryRequestSchema), async (req: Request, res: Response) => {
  const weekData = req.body as WeekData;

  const model = getGeminiModel();
  if (!model) {
    res.json({ ...getMockResponse(weekData), source: 'fallback' });
    return;
  }

  try {
    const prompt = `${STORY_PROMPT}
      
Weekly Statistics:
- Total CO₂: ${weekData.totalCo2Kg} kg
- Versus Indian Average: ${weekData.vsIndianAverage}
- Percentage Versus Average: ${weekData.percentageVsAverage}%
- Best Category: ${weekData.bestCategory}
- Worst Category: ${weekData.worstCategory}
- Daily Streak: ${weekData.streakDays} days
- Logged Activities Count: ${weekData.actionsLogged}
- Top Activity: ${weekData.topActivity}
- Week Number: ${weekData.weekNumber}`;

    const result = await model.generateContent(prompt);
    const parsed = parseJsonResponse<unknown>(result.response.text());
    res.json(parsed);
  } catch {
    res.json({ ...getMockResponse(weekData), source: 'fallback' });
  }
});

export default router;
