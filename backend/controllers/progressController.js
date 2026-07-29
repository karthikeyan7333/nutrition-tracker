import { FoodLog } from '../models/FoodLog.js';
import { WaterLog } from '../models/WaterLog.js';

const dateString = (date) => date.toISOString().split('T')[0];
async function progress(req, days, monthly) {
  const dates = Array.from({ length: days }, (_, index) => { const date = new Date(); date.setDate(date.getDate() - (days - 1 - index)); return dateString(date); });
  const [foodLogs, waterLogs] = await Promise.all([FoodLog.find({ userId: req.user.id, date: { $gte: dates[0], $lte: dates.at(-1) } }), WaterLog.find({ userId: req.user.id, date: { $gte: dates[0], $lte: dates.at(-1) } })]);
  let totalCal = 0; let totalProt = 0; let totalWat = 0;
  const chartData = dates.map((date) => { const foods = foodLogs.filter((log) => log.date === date); const waters = waterLogs.filter((log) => log.date === date); const calories = foods.reduce((sum, log) => sum + log.calories, 0); const protein = foods.reduce((sum, log) => sum + log.protein, 0); const water = waters.reduce((sum, log) => sum + log.amount, 0); totalCal += calories; totalProt += protein; totalWat += water; return { date, label: new Date(date).toLocaleDateString('en-US', monthly ? { month: 'short', day: 'numeric' } : { weekday: 'short' }), calories, protein: Math.round(protein * 10) / 10, water }; });
  return monthly ? { summary: { avgCalories: Math.round(totalCal / days), avgProtein: Math.round(totalProt / days * 10) / 10, avgWater: Math.round(totalWat / days) }, chartData } : chartData;
}
export async function weekly(req, res) { res.json(await progress(req, 7, false)); }
export async function monthly(req, res) { res.json(await progress(req, 30, true)); }
