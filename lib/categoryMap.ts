/**
 * Category mapping between database enums and frontend display/URLs
 */
import { normalizeSlug } from './slug';

export interface CategoryInfo {
  slug: string;        // Database enum value
  displayName: string; // Human-readable label
  urlSlug: string;     // Category page URL path
}

export const CATEGORY_MAP: Record<string, CategoryInfo> = {
  'safety-gear': {
    slug: 'safety-gear',
    displayName: 'Safety Gear',
    urlSlug: 'safety-gear',
  },
  'tech-lighting': {
    slug: 'tech-lighting',
    displayName: 'Tech & Lighting',
    urlSlug: 'tech-lighting',
  },
  'bike-security': {
    slug: 'bike-security',
    displayName: 'Bike Security',
    urlSlug: 'bike-security',
  },
  'platform-reviews': {
    slug: 'platform-reviews',
    displayName: 'Platform Reviews',
    urlSlug: 'platform-reviews',
  },
  'delivery-gear': {
    slug: 'delivery-gear',
    displayName: 'Delivery Gear',
    urlSlug: 'delivery-gear',
  },
};

/**
 * Get category info from database enum value
 */
export function getCategoryInfo(dbCategory: string): CategoryInfo | null {
  return CATEGORY_MAP[dbCategory] || null;
}

/**
 * Get category info from URL slug
 */
export function getCategoryInfoByUrlSlug(urlSlug: string): CategoryInfo | null {
  return Object.values(CATEGORY_MAP).find(cat => cat.urlSlug === urlSlug) || null;
}

/**
 * Transform a database post to frontend Post format
 */
export function transformPost(dbPost: any): any {
  // Handle both mongoose objects and plain objects
  const plainPost = dbPost.toObject ? dbPost.toObject() : dbPost;
  const categoryValue = plainPost.category || dbPost.category;
  const normalizedSlug = normalizeSlug(plainPost.slug || '');
  
  const categoryInfo = getCategoryInfo(categoryValue);
  
  return {
    ...plainPost,
    slug: normalizedSlug || plainPost.slug,
    category: categoryInfo?.displayName || plainPost.categoryLabel || categoryValue || 'Uncategorized',
    categorySlug: categoryInfo?.urlSlug || categoryValue || '',
    // Database category slug for blog post URLs (e.g., 'safety-gear')
    dbCategorySlug: categoryValue || 'uncategorized',
  };
}
