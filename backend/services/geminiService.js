import { GoogleGenAI, Type } from '@google/genai';
import { env } from '../config/env.js';

let aiClient = null;

function getGeminiClient() {
  if (!aiClient) {
    if (!env.geminiApiKey) throw new Error('GEMINI_API_KEY environment variable is required');
    aiClient = new GoogleGenAI({ apiKey: env.geminiApiKey, httpOptions: { headers: { 'User-Agent': 'aistudio-build' } } });
  }
  return aiClient;
}

const fallbackDatabase = {
  'sweet potato': { calories: 86, protein: 1.6, fiber: 3, vitamins: 280, minerals: 12 }, potato: { calories: 77, protein: 2, fiber: 2.2, vitamins: 15, minerals: 8 }, apple: { calories: 52, protein: 0.3, fiber: 2.4, vitamins: 8, minerals: 4 }, banana: { calories: 89, protein: 1.1, fiber: 2.6, vitamins: 12, minerals: 10 }, 'chicken breast': { calories: 165, protein: 31, fiber: 0, vitamins: 5, minerals: 12 }, chicken: { calories: 165, protein: 31, fiber: 0, vitamins: 5, minerals: 12 }, salmon: { calories: 208, protein: 20, fiber: 0, vitamins: 45, minerals: 15 }, egg: { calories: 155, protein: 13, fiber: 0, vitamins: 20, minerals: 12 }, rice: { calories: 130, protein: 2.7, fiber: 0.4, vitamins: 0, minerals: 3 }, oats: { calories: 389, protein: 16.9, fiber: 10.6, vitamins: 5, minerals: 25 }, broccoli: { calories: 34, protein: 2.8, fiber: 2.6, vitamins: 140, minerals: 15 }, spinach: { calories: 23, protein: 2.9, fiber: 2.2, vitamins: 180, minerals: 20 }, milk: { calories: 42, protein: 3.4, fiber: 0, vitamins: 15, minerals: 15 }, almonds: { calories: 579, protein: 21, fiber: 12.5, vitamins: 30, minerals: 40 }, beef: { calories: 250, protein: 26, fiber: 0, vitamins: 8, minerals: 18 }, avocado: { calories: 160, protein: 2, fiber: 7, vitamins: 20, minerals: 15 },
};

export async function fetchNutritionFromGemini(foodName) {
  const normalized = foodName.toLowerCase().trim();
  try {
    const response = await getGeminiClient().models.generateContent({
      model: env.geminiModel,
      contents: `You are a nutrition database API. Analyze the nutritional contents of "${foodName}" per exactly 100 grams. Return the calorie count in kcal, protein in grams, dietary fiber in grams, and representative Daily Value percentages (DV%) for all major vitamins combined and minerals combined.`,
      config: { systemInstruction: 'Always return accurate, realistic USDA-aligned nutrition numbers for 100g of the requested food. Be concise. Only return the structured JSON representation.', responseMimeType: 'application/json', responseSchema: { type: Type.OBJECT, properties: { calories: { type: Type.NUMBER, description: 'Calories in kcal per 100g of this food' }, protein: { type: Type.NUMBER, description: 'Protein in grams per 100g of this food' }, fiber: { type: Type.NUMBER, description: 'Fiber in grams per 100g of this food' }, vitamins: { type: Type.NUMBER, description: 'Estimated combined Daily Value percentage (DV%) of major vitamins (like Vitamin A, C, D, B-complex) in 100g of this food.' }, minerals: { type: Type.NUMBER, description: 'Estimated combined Daily Value percentage (DV%) of major minerals (like Potassium, Calcium, Iron, Magnesium) in 100g of this food.' } }, required: ['calories', 'protein', 'fiber', 'vitamins', 'minerals'] } },
    });
    if (response.text?.trim()) {
      const parsed = JSON.parse(response.text.trim());
      return { calories: Math.max(0, Math.round(parsed.calories ?? 0)), protein: Math.max(0, Math.round((parsed.protein ?? 0) * 10) / 10), fiber: Math.max(0, Math.round((parsed.fiber ?? 0) * 10) / 10), vitamins: Math.max(0, Math.round(parsed.vitamins ?? 0)), minerals: Math.max(0, Math.round(parsed.minerals ?? 0)) };
    }
  } catch (error) { console.warn(`Gemini nutrition lookup failed for "${foodName}". Using fallback/heuristic.`, error); }
  for (const [key, value] of Object.entries(fallbackDatabase)) if (normalized.includes(key)) return value;
  let calories = 100; let protein = 2; let fiber = 1.5; let vitamins = 10; let minerals = 8;
  if (normalized.includes('salad') || normalized.includes('veg') || normalized.includes('fruit') || normalized.includes('berry')) { calories = 45; protein = 1; fiber = 2.5; vitamins = 50; minerals = 12; }
  else if (normalized.includes('meat') || normalized.includes('pork') || normalized.includes('turkey') || normalized.includes('fish') || normalized.includes('steak')) { calories = 200; protein = 24; fiber = 0; vitamins = 10; minerals = 15; }
  else if (normalized.includes('bread') || normalized.includes('pasta') || normalized.includes('grain') || normalized.includes('noodle') || normalized.includes('flour')) { calories = 260; protein = 8; fiber = 2; vitamins = 2; minerals = 5; }
  else if (normalized.includes('cheese') || normalized.includes('butter') || normalized.includes('oil') || normalized.includes('cream')) { calories = 400; protein = 15; fiber = 0; vitamins = 15; minerals = 15; }
  else if (normalized.includes('shake') || normalized.includes('whey') || normalized.includes('powder') || normalized.includes('protein')) { calories = 360; protein = 75; fiber = 1; vitamins = 20; minerals = 20; }
  return { calories, protein, fiber, vitamins, minerals };
}
