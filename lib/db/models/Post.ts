import mongoose, { Schema, Model, Document } from 'mongoose';
import { generateSlugFromTitle, normalizeSlug } from '@/lib/slug';

function estimateReadTimeFromHtml(html: string): number {
  const text = (html || '')
    .replace(/&nbsp;/g, ' ')
    .replace(/\u00A0/g, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const words = text ? text.split(' ').length : 0;
  return Math.max(1, Math.ceil(words / 200));
}

// TypeScript interface for Post document
export interface IPost extends Document {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage?: {
    url: string;
    alt: string;
  };
  category: 'safety-gear' | 'tech-lighting' | 'bike-security' | 'delivery-gear' | 'platform-reviews';
  categoryLabel?: string;
  tags: string[];
  author?: {
    name: string;
    bio: string;
    avatar: string;
  };
  amazonProducts: Array<{
    productTitle: string;
    asin: string;
    affiliateLink: string;
    price: string;
    image: string;
    description: string;
  }>;
  productBlocks?: Array<{
    blockType: 'accent' | 'hero';
    productId: mongoose.Types.ObjectId;
  }>;
  seoMetadata?: {
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
  };
  cta?: {
    enabled: boolean;
    title?: string;
    description?: string;
    primaryHref?: string;
    primaryLabel?: string;
    secondaryHref?: string;
    secondaryLabel?: string;
  };
  status: 'draft' | 'published' | 'archived';
  publishedAt?: Date;
  views: number;
  readTime?: number;
  featured: boolean;
  trending: boolean;
  editorsPick: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Static methods interface - extends Model which already has all CRUD methods
interface IPostModel extends Model<IPost> {
  findPublished(): Promise<IPost[]>;
}

const PostSchema = new Schema<IPost, IPostModel>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    slug: {
      type: String,
      required: [true, 'Slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    excerpt: {
      type: String,
      required: [true, 'Excerpt is required'],
      maxlength: [800, 'Excerpt cannot exceed 800 characters'],
    },
    content: {
      type: String,
      required: [true, 'Content is required'],
    },
    featuredImage: {
      url: String,
      alt: String,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: {
        values: ['safety-gear', 'tech-lighting', 'bike-security', 'delivery-gear', 'platform-reviews'],
        message: '{VALUE} is not a valid category',
      },
    },
    categoryLabel: {
      type: String,
    },
    tags: {
      type: [String],
      default: [],
    },
    author: {
      name: String,
      bio: String,
      avatar: String,
    },
    amazonProducts: [
      {
        productTitle: String,
        asin: String,
        affiliateLink: String,
        price: String,
        image: String,
        description: String,
      },
    ],
    productBlocks: [
      {
        blockType: {
          type: String,
          enum: ['accent', 'hero'],
          required: true,
        },
        productId: {
          type: Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
      },
    ],
    seoMetadata: {
      metaTitle: String,
      metaDescription: String,
      keywords: [String],
    },
    cta: {
      enabled: {
        type: Boolean,
        default: false,
      },
      title: String,
      description: String,
      primaryHref: String,
      primaryLabel: String,
      secondaryHref: String,
      secondaryLabel: String,
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'draft',
    },
    publishedAt: {
      type: Date,
    },
    views: {
      type: Number,
      default: 0,
    },
    readTime: {
      type: Number,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    trending: {
      type: Boolean,
      default: false,
    },
    editorsPick: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Text index for search functionality
PostSchema.index({ 
  title: 'text', 
  excerpt: 'text', 
  content: 'text', 
  tags: 'text' 
});

// Pre-save hook to auto-generate slug from title if slug is empty
PostSchema.pre('save', function () {
  if (this.slug && (this.isNew || this.isModified('slug'))) {
    this.slug = normalizeSlug(this.slug);
  }

  if (!this.slug && this.title) {
    this.slug = generateSlugFromTitle(this.title);
  }

  // Auto-set publishedAt when status changes to 'published'
  if (this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }

  // Ensure readTime is always a valid positive number.
  // Recalculate when content changes, or when readTime is missing/invalid.
  const hasValidReadTime = typeof this.readTime === 'number' && Number.isFinite(this.readTime) && this.readTime > 0;
  if (this.isModified('content') || !hasValidReadTime) {
    this.readTime = estimateReadTimeFromHtml(this.content || '');
  }
});

// Static method to find all published posts
PostSchema.statics.findPublished = function (): Promise<IPost[]> {
  return this.find({ status: 'published' })
    .sort({ publishedAt: -1 })
    .exec();
};

// Prevent model recompilation in Next.js hot reload
const Post = (mongoose.models.Post as IPostModel) || mongoose.model<IPost, IPostModel>('Post', PostSchema);

export default Post;
