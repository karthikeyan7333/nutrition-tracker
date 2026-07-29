import { WaterLog } from '../models/WaterLog.js';
const today = () => new Date().toISOString().split('T')[0];

export async function getWaterLogs(req, res) { res.json(await WaterLog.find({ userId: req.user.id, date: req.query.date || today() }).sort({ createdAt: 1 })); }
export async function createWaterLog(req, res) {
  const amount = Number(req.body.amount);
  if (!req.body.amount) return res.status(400).json({ error: 'Water amount is required' });
  if (!Number.isFinite(amount) || amount <= 0) return res.status(400).json({ error: 'Amount must be a positive number' });
  res.status(201).json(await WaterLog.create({ userId: req.user.id, amount, date: req.body.date || today() }));
}
