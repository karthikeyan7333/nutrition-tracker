import mongoose from 'mongoose';
import { serializeDocument } from '../utils/modelSerialization.js';
import { DEFAULT_GOALS } from '../utils/defaults.js';

const goalSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
  ...Object.fromEntries(Object.entries(DEFAULT_GOALS).map(([key, value]) => [key, { type: Number, required: true, default: value, min: 0 }])),
}, { timestamps: { createdAt: false, updatedAt: 'updatedAt' }, toJSON: { transform: serializeDocument } });

export const Goal = mongoose.model('Goal', goalSchema);
