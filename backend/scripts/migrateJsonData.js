import fs from 'node:fs/promises';
import path from 'node:path';
import mongoose from 'mongoose';
import { fileURLToPath } from 'node:url';
import { connectDatabase } from '../config/database.js';
import { User } from '../models/User.js';
import { Goal } from '../models/Goal.js';
import { FoodLog } from '../models/FoodLog.js';
import { WaterLog } from '../models/WaterLog.js';

const directory = path.dirname(fileURLToPath(import.meta.url));
const legacyFile = path.resolve(directory, '../../data/db.json');

try {
  await connectDatabase();
  const legacy = JSON.parse(await fs.readFile(legacyFile, 'utf8'));
  const userIds = new Map();
  for (const legacyUser of legacy.users || []) {
    let user = await User.findOne({ email: legacyUser.email.toLowerCase() }).select('+passwordHash');
    if (!user) user = await User.create({ email: legacyUser.email.toLowerCase(), passwordHash: legacyUser.passwordHash, createdAt: legacyUser.createdAt });
    userIds.set(legacyUser.id, user._id);
  }
  for (const item of legacy.goals || []) {
    const userId = userIds.get(item.userId); if (!userId) continue;
    await Goal.findOneAndUpdate({ userId }, { $set: { calories: item.calories, protein: item.protein, fiber: item.fiber, water: item.water, vitamins: item.vitamins, minerals: item.minerals, updatedAt: item.updatedAt } }, { upsert: true, new: true });
  }
  for (const item of legacy.foodLogs || []) {
    const userId = userIds.get(item.userId); if (!userId) continue;
    await FoodLog.updateOne({ userId, foodName: item.foodName, createdAt: item.createdAt }, { $setOnInsert: { userId, foodName: item.foodName, weight: item.weight, calories: item.calories, protein: item.protein, fiber: item.fiber, vitamins: item.vitamins, minerals: item.minerals, date: item.date, time: item.time, createdAt: item.createdAt } }, { upsert: true });
  }
  for (const item of legacy.waterLogs || []) {
    const userId = userIds.get(item.userId); if (!userId) continue;
    await WaterLog.updateOne({ userId, amount: item.amount, createdAt: item.createdAt }, { $setOnInsert: { userId, amount: item.amount, date: item.date, createdAt: item.createdAt } }, { upsert: true });
  }
  console.log('Legacy JSON data migration completed successfully.');
} finally {
  await mongoose.disconnect();
}
