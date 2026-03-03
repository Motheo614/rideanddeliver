import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    'Please define the MONGODB_URI environment variable inside .env.local'
  );
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongoose: MongooseCache | undefined;
}

let cached: MongooseCache = global.mongoose || { conn: null, promise: null };

if (!global.mongoose) {
  global.mongoose = cached;
}

async function connectDB(): Promise<typeof mongoose> {
  if (cached.conn) {
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ Using cached MongoDB connection');
    }
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    if (process.env.NODE_ENV === 'development') {
      console.log('🔄 Connecting to MongoDB...');
    }

    cached.promise = mongoose.connect(MONGODB_URI!, opts).then((mongoose) => {
      if (process.env.NODE_ENV === 'development') {
        console.log('✅ MongoDB connected successfully');
      }
      return mongoose;
    }).catch((error) => {
      if (process.env.NODE_ENV === 'development') {
        console.error('❌ MongoDB connection error:', error);
      }
      // Reset the promise so it can be retried
      cached.promise = null;
      throw error;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectDB;
