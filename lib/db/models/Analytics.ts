import mongoose, { Schema, Document } from 'mongoose';

// TypeScript interface for Analytics document
export interface IAnalytics extends Document {
  date: Date;
  pageViews: number;
  uniqueVisitors: number;
  topPosts: Array<{
    slug: string;
    title: string;
    views: number;
  }>;
  topProducts: Array<{
    asin: string;
    productName: string;
    clicks: number;
  }>;
  searchQueries: Array<{
    query: string;
    count: number;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const AnalyticsSchema = new Schema<IAnalytics>(
  {
    date: {
      type: Date,
      required: [true, 'Date is required'],
      unique: true,
    },
    pageViews: {
      type: Number,
      default: 0,
      min: [0, 'Page views cannot be negative'],
    },
    uniqueVisitors: {
      type: Number,
      default: 0,
      min: [0, 'Unique visitors cannot be negative'],
    },
    topPosts: [
      {
        slug: {
          type: String,
          required: true,
        },
        title: {
          type: String,
          required: true,
        },
        views: {
          type: Number,
          default: 0,
        },
      },
    ],
    topProducts: [
      {
        asin: {
          type: String,
          required: true,
        },
        productName: {
          type: String,
          required: true,
        },
        clicks: {
          type: Number,
          default: 0,
        },
      },
    ],
    searchQueries: [
      {
        query: {
          type: String,
          required: true,
        },
        count: {
          type: Number,
          default: 0,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Index for date queries (most common)
AnalyticsSchema.index({ date: -1 });

// Prevent model recompilation in Next.js hot reload
const Analytics = mongoose.models.Analytics || mongoose.model<IAnalytics>('Analytics', AnalyticsSchema);

export default Analytics;
