import connectDB from '@/lib/db/mongoose';
import AnalyticsCache from '@/lib/db/models/AnalyticsCache';

const CACHE_TTL_MS = 60 * 60 * 1000;

export async function getCachedAnalytics<T>(metricKey: string): Promise<T | null> {
  await connectDB();
  const cached = await AnalyticsCache.findOne({
    metricKey,
    expiresAt: { $gt: new Date() },
  }).lean();

  return cached ? (cached.data as T) : null;
}

export async function setCachedAnalytics<T>(metricKey: string, data: T): Promise<void> {
  await connectDB();
  const fetchedAt = new Date();
  await AnalyticsCache.updateOne(
    { metricKey },
    {
      $set: {
        data,
        fetchedAt,
        expiresAt: new Date(fetchedAt.getTime() + CACHE_TTL_MS),
      },
    },
    { upsert: true }
  );
}
