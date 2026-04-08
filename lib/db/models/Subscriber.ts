import mongoose, { Schema, Document } from 'mongoose';

export interface ISubscriber extends Document {
  email: string;
  status: 'pending' | 'active' | 'unsubscribed';
  source: string;
  isVerified: boolean;
  verificationTokenHash?: string;
  verificationTokenExpiresAt?: Date;
  verifiedAt?: Date;
  subscribedAt: Date;
  unsubscribedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const SubscriberSchema = new Schema<ISubscriber>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending', 'active', 'unsubscribed'],
      default: 'pending',
    },
    source: {
      type: String,
      default: 'website',
      trim: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationTokenHash: {
      type: String,
      trim: true,
    },
    verificationTokenExpiresAt: {
      type: Date,
    },
    verifiedAt: {
      type: Date,
    },
    subscribedAt: {
      type: Date,
      default: Date.now,
    },
    unsubscribedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Subscriber || mongoose.model<ISubscriber>('Subscriber', SubscriberSchema);
