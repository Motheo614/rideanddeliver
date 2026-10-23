import mongoose, { Document, Schema } from 'mongoose';

export interface IAnalyticsCache extends Document {
  metricKey: string;
  data: unknown;
  fetchedAt: Date;
  expiresAt: Date;
}

const AnalyticsCacheSchema = new Schema<IAnalyticsCache>(
  {
    metricKey: { type: String, required: true, unique: true, trim: true },
    data: { type: Schema.Types.Mixed, required: true },
    fetchedAt: { type: Date, required: true, default: Date.now },
    expiresAt: { type: Date, required: true },
  },
  { versionKey: false }
);

AnalyticsCacheSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const AnalyticsCache =
  mongoose.models.AnalyticsCache ||
  mongoose.model<IAnalyticsCache>('AnalyticsCache', AnalyticsCacheSchema);

export default AnalyticsCache;
