import { FoodLog } from '../models/FoodLog.js';
import { fetchNutritionFromGemini } from '../services/geminiService.js';

const today = () => new Date().toISOString().split('T')[0];
const timeNow = () => new Date().toLocaleTimeString('en-US', { hour12: false }).substring(0, 5);
const scaleNutrition = (nutrition, weight) => ({ calories: Math.round(nutrition.calories * weight / 100), protein: Math.round(nutrition.protein * weight / 100 * 10) / 10, fiber: Math.round(nutrition.fiber * weight / 100 * 10) / 10, vitamins: Math.round(nutrition.vitamins * weight / 100), minerals: Math.round(nutrition.minerals * weight / 100) });

function validInput(body) {
  const foodName = body.foodName?.trim(); const weight = Number(body.weight);
  if (!foodName || !body.weight) return { error: 'Food Name and Weight (grams) are required' };
  if (!Number.isFinite(weight) || weight <= 0) return { error: 'Weight must be a positive number' };
  return { foodName, weight };
}

export async function getFoodLogs(req, res) { res.json(await FoodLog.find({ userId: req.user.id, date: req.query.date || today() }).sort({ createdAt: 1 })); }

export async function createFoodLog(req, res) {
  const input = validInput(req.body); if (input.error) return res.status(400).json({ error: input.error });
  const nutrition = await fetchNutritionFromGemini(input.foodName);
  const log = await FoodLog.create({ userId: req.user.id, foodName: input.foodName, weight: input.weight, ...scaleNutrition(nutrition, input.weight), date: req.body.date || today(), time: req.body.time || timeNow() });
  res.status(201).json(log);
}

export async function updateFoodLog(req, res) {
  const input = validInput(req.body); if (input.error) return res.status(400).json({ error: input.error });
  const existing = await FoodLog.findOne({ _id: req.params.id, userId: req.user.id });
  if (!existing) return res.status(404).json({ error: 'Food log not found' });
  let nutrients;
  if (existing.foodName.toLowerCase() !== input.foodName.toLowerCase()) nutrients = scaleNutrition(await fetchNutritionFromGemini(input.foodName), input.weight);
  else if (existing.weight !== input.weight) nutrients = { calories: Math.round(existing.calories * input.weight / existing.weight), protein: Math.round(existing.protein * input.weight / existing.weight * 10) / 10, fiber: Math.round(existing.fiber * input.weight / existing.weight * 10) / 10, vitamins: Math.round(existing.vitamins * input.weight / existing.weight), minerals: Math.round(existing.minerals * input.weight / existing.weight) };
  const log = await FoodLog.findByIdAndUpdate(existing._id, { $set: { foodName: input.foodName, weight: input.weight, date: req.body.date ?? existing.date, time: req.body.time ?? existing.time, ...nutrients } }, { new: true, runValidators: true });
  res.json(log);
}

export async function deleteFoodLog(req, res) {
  const log = await FoodLog.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
  if (!log) return res.status(404).json({ error: 'Food log not found' });
  res.json({ message: 'Food log deleted successfully' });
}
