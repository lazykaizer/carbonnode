/** Express route handler for Receipt Scanner — multimodal image carbon analysis via Gemini Vision with rule-based fallback. */
import { Router } from 'express';
import type { Request, Response } from 'express';
import { getGeminiModel, parseJsonResponse } from '../../shared/geminiClient';
import { ReceiptScannerRequestSchema } from '../../../src/schemas';
import { validateSchema, validateReceiptUpload } from '../../shared/middleware/validate';

const router = Router();

const RECEIPT_PROMPT = `You are analyzing a receipt/bill image (likely from Swiggy, Zomato, or a grocery store in India).
Extract each item, its quantity, and estimate the carbon footprint (CO₂ in kg) for producing/delivering that item.

Return ONLY a JSON response in this exact format:
{
  "items": [
    {
      "name": "Item name",
      "quantity": 1,
      "co2Kg": 0.3
    }
  ],
  "totalCo2Kg": 1.2,
  "storeName": "Store/Restaurant name"
}

Use realistic estimates for Indian food items. Include packaging and delivery carbon costs.
If you cannot read the image clearly, provide your best estimates and note uncertainties.`;

function getMockResponse() {
  return {
    items: [
      { name: 'Chicken Biryani (Double Portion)', quantity: 1, co2Kg: 2.2 },
      { name: 'Paneer Butter Masala', quantity: 1, co2Kg: 1.1 },
      { name: 'Tandoori Roti', quantity: 4, co2Kg: 0.4 },
      { name: 'Plastic Packaging & Delivery Ride', quantity: 1, co2Kg: 0.3 },
    ],
    totalCo2Kg: 4.0,
    storeName: 'Zomato Food Delivery',
  };
}

router.post(
  '/',
  validateSchema(ReceiptScannerRequestSchema),
  validateReceiptUpload,
  async (req: Request, res: Response) => {
    const { image: imageBase64, mimeType } = req.body;

    const model = getGeminiModel();
    if (!model) {
      res.json({ ...getMockResponse(), source: 'fallback' });
      return;
    }

    try {
      const imagePart = {
        inlineData: {
          data: imageBase64,
          mimeType,
        },
      };

      const result = await model.generateContent([RECEIPT_PROMPT, imagePart]);
      const parsed = parseJsonResponse<unknown>(result.response.text());
      res.json(parsed);
    } catch {
      res.json({ ...getMockResponse(), source: 'fallback' });
    }
  },
);

export default router;
