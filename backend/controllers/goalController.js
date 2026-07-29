import { Goal } from '../models/Goal.js';
import { DEFAULT_GOALS } from '../utils/defaults.js';

export async function getGoals(req, res) {
  const goals = await Goal.findOneAndUpdate({ userId: req.user.id }, { $setOnInsert: DEFAULT_GOALS }, { new: true, upsert: true, setDefaultsOnInsert: true });
  res.json(goals);
}

export async function updateGoals(req, res) {
  const fields = ['calories', 'protein', 'fiber', 'water', 'vitamins', 'minerals'];
  const update = {};
  for (const field of fields) {
    if (req.body[field] !== undefined) {
      const value = Number(req.body[field]);
      if (!Number.isFinite(value) || value <= 0) return res.status(400).json({ error: `${field} must be a positive number` });
      update[field] = value;
    }
  }
  const goals = await Goal.findOneAndUpdate({ userId: req.user.id }, { $set: update, $setOnInsert: DEFAULT_GOALS }, { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true });
  res.json(goals);
}
