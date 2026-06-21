import mongoose, { Schema, Document } from 'mongoose';

// TypeScript interface for Product document
export interface IProduct extends Document {
  productName: string;
  asin: string;
  affiliateLink: string;
  category: 'helmets' | 'lights' | 'locks' | 'bags' | 'tools' | 'clothing' | 'accessories';
  price?: string;
  imageUrl?: string;
  rating?: number;
  awardLabel?: string;
  score?: number;
  reviewCount?: number;
  stars?: number;
  description?: string;
  pros: string[];
  cons: string[];
  specs?: Array<{
    label: string;
    value: string;
  }>;
  editorNote?: string;
  jumpTargetId?: string;
  specifications: Map<string, string>;
  isActive: boolean;
  clickCount: number;
  commissionRate?: number;
  estimatedEarnings?: number;
  lastClickDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    productName: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    asin: {
      type: String,
      required: [true, 'ASIN is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    affiliateLink: {
      type: String,
      required: [true, 'Affiliate link is required'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: {
        values: ['helmets', 'lights', 'locks', 'bags', 'tools', 'clothing', 'accessories'],
        message: '{VALUE} is not a valid category',
      },
    },
    price: {
      type: String,
      trim: true,
    },
    imageUrl: {
      type: String,
      trim: true,
    },
    rating: {
      type: Number,
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
    },
    awardLabel: {
      type: String,
      trim: true,
    },
    score: {
      type: Number,
      min: [0, 'Score must be at least 0'],
      max: [10, 'Score cannot exceed 10'],
    },
    reviewCount: {
      type: Number,
      min: [0, 'Review count cannot be negative'],
    },
    stars: {
      type: Number,
      min: [1, 'Stars must be at least 1'],
      max: [5, 'Stars cannot exceed 5'],
    },
    description: {
      type: String,
      trim: true,
    },
    pros: {
      type: [String],
      default: [],
    },
    cons: {
      type: [String],
      default: [],
    },
    specs: {
      type: [
        {
          label: {
            type: String,
            trim: true,
          },
          value: {
            type: String,
            trim: true,
          },
        },
      ],
      default: [],
    },
    editorNote: {
      type: String,
      trim: true,
    },
    jumpTargetId: {
      type: String,
      trim: true,
      lowercase: true,
    },
    specifications: {
      type: Map,
      of: String,
      default: new Map(),
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    clickCount: {
      type: Number,
      default: 0,
      min: [0, 'Click count cannot be negative'],
    },
    commissionRate: {
      type: Number,
      min: [0, 'Commission rate cannot be negative'],
      max: [100, 'Commission rate cannot exceed 100'],
      default: 3,
    },
    estimatedEarnings: {
      type: Number,
      default: 0,
      min: [0, 'Estimated earnings cannot be negative'],
    },
    lastClickDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for common queries
ProductSchema.index({ category: 1, isActive: 1 });
ProductSchema.index({ clickCount: -1 });

// Prevent model recompilation in Next.js hot reload
const Product = mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);

export default Product;
