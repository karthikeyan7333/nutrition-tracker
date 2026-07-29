import mongoose from 'mongoose';
import { setServers } from 'node:dns';
import { env } from './env.js';

export async function connectDatabase() {
  try {
    await mongoose.connect(env.mongoUri);
  } catch (error) {
    const isSrvDnsRefusal = env.mongoUri.startsWith('mongodb+srv://') && error?.code === 'ECONNREFUSED';
    if (!isSrvDnsRefusal) throw error;

    // Some local DNS resolvers refuse SRV records even though Atlas is reachable.
    // Retry only that case with public DNS; production environments continue using their normal resolver.
    console.warn('Local DNS refused the MongoDB Atlas SRV lookup; retrying with public DNS.');
    setServers(['8.8.8.8', '1.1.1.1']);
    await mongoose.connect(env.mongoUri);
  }
  console.log('Connected to MongoDB.');
}
