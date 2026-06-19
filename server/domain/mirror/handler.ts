import { Router } from 'express';
import type { Request, Response } from 'express';
import { getGeminiModel, parseJsonResponse } from '../../shared/geminiClient';
import { CarbonMirrorRequestSchema } from '../../../src/schemas';
import { validateSchema } from '../../shared/middleware/validate';

const router = Router();

const MIRROR_PROMPT = `You are a carbon footprint analyst. The user will describe their daily activities in natural language. 
Analyze the activities and estimate the CO₂ emissions for each.

Return ONLY a JSON response in this exact format (no markdown, no explanation outside JSON):
{
  "activities": [
    {
      "name": "Activity name",
      "co2Kg": 0.5,
      "category": "transport|food|energy|shopping|other",
      "suggestion": "A helpful tip to reduce this emission"
    }
  ],
  "totalCo2Kg": 1.5,
  "overallSuggestion": "One key actionable suggestion"
}

Use realistic Indian context estimates. Categories must be one of: transport, food, energy, shopping, other.
If the user mentions vague activities, make reasonable assumptions and note them.`;

function getMockResponse(userInput: string) {
  const activities = [];
  const lowerInput = userInput.toLowerCase();

  if (/\b(car|drive|taxi|cab|drove)\b/i.test(lowerInput)) {
    activities.push({
      name: 'Private Car Ride (10km equiv.)',
      co2Kg: 2.1,
      category: 'transport',
      suggestion: 'Try taking the metro or carpooling next time to cut emissions by up to 80%.',
    });
  }

  if (/\b(metro|bus|train|public)\b/i.test(lowerInput)) {
    activities.push({
      name: 'Public Commute (Metro/Bus)',
      co2Kg: 0.4,
      category: 'transport',
      suggestion: 'Awesome choice! Public transit keeps your travel footprint highly efficient.',
    });
  }

  if (/\b(biryani|chicken|meat|mutton|fish)\b/i.test(lowerInput)) {
    activities.push({
      name: 'Meat Meal (Chicken/Fish/Mutton)',
      co2Kg: 1.8,
      category: 'food',
      suggestion: 'Replacing one chicken meal with paneer or lentils saves about 1.2 kg CO₂.',
    });
  }

  if (/\b(veg|vegetarian|paneer|dal|rice|salad)\b/i.test(lowerInput)) {
    activities.push({
      name: 'Vegetarian Meal',
      co2Kg: 0.6,
      category: 'food',
      suggestion: 'Great job! Eating vegetarian has a significantly smaller agricultural footprint.',
    });
  }

  if (/\b(ac|air con|cooling)\b/i.test(lowerInput)) {
    activities.push({
      name: 'Air Conditioning (4h)',
      co2Kg: 3.2,
      category: 'energy',
      suggestion: 'Keep your AC at 24°C or higher and use a ceiling fan to reduce electricity draw.',
    });
  }

  if (/\b(laptop|computer|work|phone)\b/i.test(lowerInput)) {
    activities.push({
      name: 'Appliance & Device Electricity',
      co2Kg: 0.5,
      category: 'energy',
      suggestion: 'Unplug chargers when not in use to stop phantom power draw.',
    });
  }

  if (/\b(shop|buy|amazon|clothes)\b/i.test(lowerInput)) {
    activities.push({
      name: 'Online purchase/clothing item',
      co2Kg: 4.5,
      category: 'shopping',
      suggestion: 'Buy durable items or look for second-hand/eco-labeled goods when possible.',
    });
  }

  if (activities.length === 0) {
    activities.push({
      name: userInput.length > 40 ? userInput.substring(0, 40) + '...' : userInput,
      co2Kg: 1.1,
      category: 'other',
      suggestion: 'Every small daily choice adds up. Try logging specific items like travel or food.',
    });
  }

  const totalCo2Kg = parseFloat(activities.reduce((sum, a) => sum + a.co2Kg, 0).toFixed(2));

  return {
    activities,
    totalCo2Kg,
    overallSuggestion: totalCo2Kg > 3
      ? 'Your day had moderate emissions. Focus on using fans instead of AC, and opt for public transit.'
      : 'Superb! Your carbon footprint for these logged activities is well below average. Keep it up!',
  };
}

router.post(
  '/',
  validateSchema(CarbonMirrorRequestSchema),
  async (req: Request, res: Response) => {
    const { text } = req.body;
    const model = getGeminiModel();

    if (!model) {
      // Demo Mode — no API key configured
      res.json({ ...getMockResponse(text), source: 'fallback' });
      return;
    }

    try {
      const prompt = `${MIRROR_PROMPT}\n\nUser's day: "${text}"`;
      const result = await model.generateContent(prompt);
      const parsed = parseJsonResponse<unknown>(result.response.text());
      res.json(parsed);
    } catch {
      // Fallback to mock on any Gemini failure
      res.json({ ...getMockResponse(text), source: 'fallback' });
    }
  }
);

export default router;
