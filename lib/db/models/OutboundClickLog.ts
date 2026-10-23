import mongoose, { Document, Schema } from 'mongoose';

export interface IOutboundClickLog extends Document {
  slug: string;
  asin: string;
  destinationUrl: string;
  sourcePage: string;
  trackingId?: string;
  ipHash?: string;
  userAgent?: string;
  utmSource?: string;
  utmMedium?: string;
  createdAt: Date;
}

const OutboundClickLogSchema = new Schema<IOutboundClickLog>(
  {
    slug: { type: String, required: true, trim: true, maxlength: 120 },
    asin: { type: String, required: true, trim: true, uppercase: true, maxlength: 20 },
    destinationUrl: { type: String, required: true, maxlength: 2048 },
    sourcePage: { type: String, default: '', maxlength: 2048 },
    trackingId: { type: String, maxlength: 128 },
    ipHash: { type: String, maxlength: 64 },
    userAgent: { type: String, maxlength: 512 },
    utmSource: { type: String, maxlength: 256 },
    utmMedium: { type: String, maxlength: 256 },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

OutboundClickLogSchema.index({ createdAt: -1 });
OutboundClickLogSchema.index({ sourcePage: 1, asin: 1, createdAt: -1 });

const OutboundClickLog =
  mongoose.models.OutboundClickLog ||
  mongoose.model<IOutboundClickLog>('OutboundClickLog', OutboundClickLogSchema);

export default OutboundClickLog;
