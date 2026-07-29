import mongoose from 'mongoose';
import { serializeDocument } from '../utils/modelSerialization.js';

const foodLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  foodName: { type: String, required: true, trim: true },
  weight: { type: Number, required: true, min: 0 },
  calories: { type: Number, required: true, min: 0 },
  protein: { type: Number, required: true, min: 0 },
  fiber: { type: Number, required: true, min: 0 },
  vitamins: { type: Number, required: true, min: 0 },
  minerals: { type: Number, required: true, min: 0 },
  date: { type: String, required: true, index: true },
  time: { type: String, required: true },
}, { timestamps: { createdAt: 'createdAt', updatedAt: false }, toJSON: { transform: serializeDocument } });

foodLogSchema.index({ userId: 1, date: 1 });
export const FoodLog = mongoose.model('FoodLog', foodLogSchema);
