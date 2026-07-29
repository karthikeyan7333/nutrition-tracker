import mongoose from 'mongoose';
import { serializeDocument } from '../utils/modelSerialization.js';

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
  passwordHash: { type: String, required: true, select: false },
}, { timestamps: { createdAt: 'createdAt', updatedAt: false }, toJSON: { transform: serializeDocument } });

export const User = mongoose.model('User', userSchema);
