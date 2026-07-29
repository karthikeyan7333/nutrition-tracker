import mongoose from 'mongoose';
import { serializeDocument } from '../utils/modelSerialization.js';

const waterLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  amount: { type: Number, required: true, min: 0 },
  date: { type: String, required: true, index: true },
}, { timestamps: { createdAt: 'createdAt', updatedAt: false }, toJSON: { transform: serializeDocument } });

waterLogSchema.index({ userId: 1, date: 1 });
export const WaterLog = mongoose.model('WaterLog', waterLogSchema);
