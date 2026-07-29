import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { User } from '../models/User.js';
import { Goal } from '../models/Goal.js';
import { DEFAULT_GOALS } from '../utils/defaults.js';

const tokenFor = (user) => jwt.sign({ id: user.id, email: user.email }, env.jwtSecret, { expiresIn: env.jwtExpiresIn });
const publicUser = (user) => ({ id: user.id, email: user.email, createdAt: user.createdAt });

export async function register(req, res) {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });
  if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters long' });
  const normalizedEmail = email.trim().toLowerCase();
  if (await User.exists({ email: normalizedEmail })) return res.status(400).json({ error: 'Email is already registered' });
  const user = await User.create({ email: normalizedEmail, passwordHash: await bcrypt.hash(password, 10) });
  const goals = await Goal.create({ userId: user._id, ...DEFAULT_GOALS });
  res.status(201).json({ token: tokenFor(user), user: publicUser(user), goals });
}

export async function login(req, res) {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });
  const user = await User.findOne({ email: email.trim().toLowerCase() }).select('+passwordHash');
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) return res.status(401).json({ error: 'Invalid email or password' });
  const goals = await Goal.findOneAndUpdate({ userId: user._id }, { $setOnInsert: DEFAULT_GOALS }, { new: true, upsert: true, setDefaultsOnInsert: true });
  res.json({ token: tokenFor(user), user: publicUser(user), goals });
}

export async function me(req, res) {
  const user = await User.findById(req.user.id);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  const goals = await Goal.findOneAndUpdate({ userId: user._id }, { $setOnInsert: DEFAULT_GOALS }, { new: true, upsert: true, setDefaultsOnInsert: true });
  res.json({ user: publicUser(user), goals });
}
