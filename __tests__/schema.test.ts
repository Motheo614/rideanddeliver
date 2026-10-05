/**
 * __tests__/schema.test.ts
 * Unit tests for lib/seo/schema.ts builders and lib/dates.ts.
 */

import { describe, it, expect } from 'vitest';
import {
  toReviewRatingValue,
  buildProductReviewSchema,
  buildBlogPostingSchema,
  buildRoundupItemListSchema,
  isAmazonHostedImage,
} from '../lib/seo/schema';
import { getEditorialDates } from '../lib/dates';

// ---------------------------------------------------------------------------
// toReviewRatingValue
// ---------------------------------------------------------------------------

describe('toReviewRatingValue', () => {
  it('converts a mid-range score correctly', () => {
    expect(toReviewRatingValue(9.2)).toBe(4.6);
  });

  it('converts score 0 to the floor clamp of 1.0', () => {
    expect(toReviewRatingValue(0)).toBe(1.0);
  });

  it('converts score 10 to 5.0', () => {
    expect(toReviewRatingValue(10)).toBe(5.0);
  });

  it('rounds to 1 decimal place', () => {
    // 7.3 / 2 = 3.65 → rounds to 3.7
    expect(toReviewRatingValue(7.3)).toBe(3.7);
  });

  it('returns null for NaN', () => {
    expect(toReviewRatingValue(NaN)).toBeNull();
  });

  it('returns null for a string that is not a number', () => {
    expect(toReviewRatingValue('abc')).toBeNull();
  });

  it('returns null for undefined', () => {
    expect(toReviewRatingValue(undefined)).toBeNull();
  });

  it('returns null for a score above 10', () => {
    expect(toReviewRatingValue(11)).toBeNull();
  });

  it('returns null for a negative score', () => {
    expect(toReviewRatingValue(-1)).toBeNull();
  });

  it('clamps a score that would produce > 5 (boundary: exactly 10)', () => {
    expect(toReviewRatingValue(10)).toBeLessThanOrEqual(5);
  });

  it('clamps a score that would produce < 1 (boundary: exactly 0)', () => {
    expect(toReviewRatingValue(0)).toBeGreaterThanOrEqual(1);
  });
});

// ---------------------------------------------------------------------------
// isAmazonHostedImage
// ---------------------------------------------------------------------------

describe('isAmazonHostedImage', () => {
  it('detects images.amazon.com', () => {
    expect(isAmazonHostedImage('https://images.amazon.com/foo.jpg')).toBe(true);
  });

  it('detects ssl-images-amazon.com', () => {
    expect(isAmazonHostedImage('https://m.media-amazon.com/images/I/foo.jpg')).toBe(true);
  });

  it('does not flag Cloudinary URLs', () => {
    expect(isAmazonHostedImage('https://res.cloudinary.com/ridercomplex/image/upload/foo.jpg')).toBe(false);
  });

  it('does not flag own-domain URLs', () => {
    expect(isAmazonHostedImage('https://www.ridercomplex.com/Assets/Logo.png')).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// buildProductReviewSchema
// ---------------------------------------------------------------------------

const VALID_INPUT = {
  name: 'Kryptonite New York Lock',
  image: 'https://res.cloudinary.com/ridercomplex/image/upload/kryptonite.jpg',
  description: 'Heavy-duty U-lock for urban delivery riders.',
  brand: 'Kryptonite',
  ratingValue: 4.6,
  authorName: 'Marcus Webb',
  authorUrl: 'https://www.ridercomplex.com/about',
  reviewDatePublished: '2026-01-15T09:00:00Z',
  pros: ['Extremely secure', 'Weather resistant'],
  cons: ['Heavy'],
};

describe('buildProductReviewSchema — complete product', () => {
  const result = buildProductReviewSchema(VALID_INPUT) as Record<string, any>;

  it('returns a non-null object', () => {
    expect(result).not.toBeNull();
  });

  it('has @type Product', () => {
    expect(result['@type']).toBe('Product');
  });

  it('has the correct name', () => {
    expect(result.name).toBe('Kryptonite New York Lock');
  });

  it('has a brand block', () => {
    expect(result.brand).toEqual({ '@type': 'Brand', name: 'Kryptonite' });
  });

  it('has a review with correct ratingValue', () => {
    expect((result.review as any).reviewRating.ratingValue).toBe(4.6);
  });

  it('has bestRating 5 and worstRating 1', () => {
    expect((result.review as any).reviewRating.bestRating).toBe(5);
    expect((result.review as any).reviewRating.worstRating).toBe(1);
  });

  it('has author name and url', () => {
    expect((result.review as any).author.name).toBe('Marcus Webb');
    expect((result.review as any).author.url).toBe('https://www.ridercomplex.com/about');
  });

  it('has reviewDatePublished', () => {
    expect((result.review as any).datePublished).toBe('2026-01-15T09:00:00Z');
  });

  it('has positiveNotes when pros+cons >= 2', () => {
    expect((result.review as any).positiveNotes).toBeDefined();
  });

  it('has negativeNotes when pros+cons >= 2', () => {
    expect((result.review as any).negativeNotes).toBeDefined();
  });

  // Forbidden keys
  it('does NOT contain offers', () => {
    expect(result).not.toHaveProperty('offers');
  });

  it('does NOT contain price', () => {
    expect(result).not.toHaveProperty('price');
  });

  it('does NOT contain aggregateRating', () => {
    expect(result).not.toHaveProperty('aggregateRating');
  });

  it('does NOT contain ratingCount', () => {
    expect(result).not.toHaveProperty('ratingCount');
  });

  it('does NOT contain reviewCount', () => {
    expect(result).not.toHaveProperty('reviewCount');
  });
});

describe('buildProductReviewSchema — missing image → returns null', () => {
  it('returns null when image is empty string', () => {
    expect(buildProductReviewSchema({ ...VALID_INPUT, image: '' })).toBeNull();
  });

  it('returns null when image is Amazon-hosted', () => {
    expect(
      buildProductReviewSchema({
        ...VALID_INPUT,
        image: 'https://m.media-amazon.com/images/I/foo.jpg',
      })
    ).toBeNull();
  });
});

describe('buildProductReviewSchema — missing name → returns null', () => {
  it('returns null when name is empty string', () => {
    expect(buildProductReviewSchema({ ...VALID_INPUT, name: '' })).toBeNull();
  });
});

describe('buildProductReviewSchema — missing/invalid score → returns null', () => {
  it('returns null when ratingValue is 0 (below 1 floor)', () => {
    // 0 is below the valid 1-5 range
    expect(buildProductReviewSchema({ ...VALID_INPUT, ratingValue: 0 })).toBeNull();
  });

  it('returns null when ratingValue is NaN', () => {
    expect(buildProductReviewSchema({ ...VALID_INPUT, ratingValue: NaN })).toBeNull();
  });

  it('returns null when ratingValue is 6 (above 5 ceiling)', () => {
    expect(buildProductReviewSchema({ ...VALID_INPUT, ratingValue: 6 })).toBeNull();
  });
});

describe('buildProductReviewSchema — special characters in name', () => {
  it('preserves special characters in name', () => {
    const result = buildProductReviewSchema({
      ...VALID_INPUT,
      name: 'Rider\'s "Best" Lock & Chain — 2026',
    }) as Record<string, any>;
    expect(result).not.toBeNull();
    expect(result.name).toBe('Rider\'s "Best" Lock & Chain — 2026');
  });
});

describe('buildProductReviewSchema — no pros/cons → no notes', () => {
  it('omits positiveNotes and negativeNotes when combined count < 2', () => {
    const result = buildProductReviewSchema({
      ...VALID_INPUT,
      pros: ['One pro'],
      cons: [],
    }) as Record<string, any>;
    expect(result).not.toBeNull();
    expect((result.review as any).positiveNotes).toBeUndefined();
    expect((result.review as any).negativeNotes).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// buildBlogPostingSchema
// ---------------------------------------------------------------------------

describe('buildBlogPostingSchema', () => {
  const input = {
    url: '/safety-gear/best-helmets',
    title: 'Best Helmets for Delivery Riders in 2026',
    description: 'Our top picks for MIPS helmets tested on real delivery shifts.',
    image: 'https://res.cloudinary.com/ridercomplex/image/upload/helmets.jpg',
    datePublished: '2026-01-15T09:00:00Z',
    dateModified: '2026-03-10T14:30:00Z',
    category: 'safety-gear',
    tags: ['helmets', 'safety'],
    authorName: 'Marcus Webb',
    authorUrl: 'https://www.ridercomplex.com/about',
  };

  const result = buildBlogPostingSchema(input) as Record<string, any>;

  it('has @type BlogPosting', () => {
    expect(result['@type']).toBe('BlogPosting');
  });

  it('has headline matching title (under 110 chars)', () => {
    expect(result.headline).toBe(input.title);
    expect((result.headline as string).length).toBeLessThanOrEqual(110);
  });

  it('truncates headline to 110 chars when title is too long', () => {
    const longTitle = 'A'.repeat(120);
    const r = buildBlogPostingSchema({ ...input, title: longTitle }) as Record<string, any>;
    expect((r.headline as string).length).toBe(110);
  });

  it('has datePublished in ISO format', () => {
    expect(result.datePublished).toBe('2026-01-15T09:00:00Z');
  });

  it('has dateModified in ISO format', () => {
    expect(result.dateModified).toBe('2026-03-10T14:30:00Z');
  });

  it('falls back dateModified to datePublished when not provided', () => {
    const r = buildBlogPostingSchema({ ...input, dateModified: undefined }) as Record<string, any>;
    expect(r.dateModified).toBe(input.datePublished);
  });

  it('has author name and url', () => {
    expect((result.author as any).name).toBe('Marcus Webb');
    expect((result.author as any).url).toBe('https://www.ridercomplex.com/about');
  });

  it('has publisher with @type Organization', () => {
    expect((result.publisher as any)['@type']).toBe('Organization');
  });

  it('has mainEntityOfPage with canonical URL', () => {
    expect((result.mainEntityOfPage as any)['@type']).toBe('WebPage');
  });

  it('does NOT contain offers', () => {
    expect(result).not.toHaveProperty('offers');
  });

  it('does NOT contain aggregateRating', () => {
    expect(result).not.toHaveProperty('aggregateRating');
  });
});

// ---------------------------------------------------------------------------
// getEditorialDates
// ---------------------------------------------------------------------------

describe('getEditorialDates — unedited post (no contentUpdatedAt)', () => {
  const pub = '2025-06-01T08:00:00.000Z';

  it('dateModified equals datePublished', () => {
    const { dateModified, datePublished } = getEditorialDates(pub, null);
    expect(dateModified).toBe(datePublished);
  });

  it('showUpdatedLabel is false', () => {
    expect(getEditorialDates(pub, null).showUpdatedLabel).toBe(false);
  });

  it('datePublished is the ISO string of publishedAt', () => {
    expect(getEditorialDates(pub, null).datePublished).toBe(pub);
  });
});

describe('getEditorialDates — edit 3 hours after publish (< 24 h)', () => {
  const pub = '2025-06-01T08:00:00.000Z';
  const upd = '2025-06-01T11:00:00.000Z'; // 3 h later

  it('dateModified equals datePublished (not the edit date)', () => {
    const { dateModified, datePublished } = getEditorialDates(pub, upd);
    expect(dateModified).toBe(datePublished);
  });

  it('showUpdatedLabel is false', () => {
    expect(getEditorialDates(pub, upd).showUpdatedLabel).toBe(false);
  });
});

describe('getEditorialDates — edit 3 days after publish (> 24 h)', () => {
  const pub = '2025-06-01T08:00:00.000Z';
  const upd = '2025-06-04T08:00:00.000Z'; // 3 days later

  it('dateModified equals contentUpdatedAt', () => {
    expect(getEditorialDates(pub, upd).dateModified).toBe(upd);
  });

  it('showUpdatedLabel is true', () => {
    expect(getEditorialDates(pub, upd).showUpdatedLabel).toBe(true);
  });

  it('datePublished is unchanged', () => {
    expect(getEditorialDates(pub, upd).datePublished).toBe(pub);
  });
});

describe('getEditorialDates — exactly 24 h (boundary, not > 24 h)', () => {
  const pub = '2025-06-01T08:00:00.000Z';
  const upd = '2025-06-02T08:00:00.000Z'; // exactly 24 h

  it('dateModified equals datePublished (boundary is exclusive)', () => {
    const { dateModified, datePublished } = getEditorialDates(pub, upd);
    expect(dateModified).toBe(datePublished);
  });
});

describe('getEditorialDates — invalid/missing publishedAt', () => {
  it('falls back to epoch when publishedAt is null', () => {
    const { datePublished } = getEditorialDates(null, null);
    expect(datePublished).toBe('1970-01-01T00:00:00.000Z');
  });
});

// ---------------------------------------------------------------------------
// buildRoundupItemListSchema — optional url
// ---------------------------------------------------------------------------

describe('buildRoundupItemListSchema — url is optional', () => {
  it('includes url when jumpTargetId is present', () => {
    const result = buildRoundupItemListSchema([
      { name: 'Product A', url: '/safety-gear/helmets#product-a' },
    ]) as Record<string, any>;
    expect(result.itemListElement[0].url).toContain('product-a');
  });

  it('omits url when not provided', () => {
    const result = buildRoundupItemListSchema([
      { name: 'Product B' },
    ]) as Record<string, any>;
    expect(result.itemListElement[0].url).toBeUndefined();
  });

  it('5 products where 4 have null schemas — ItemList has 5 entries, no Product type', () => {
    // Simulate: 5 products, only 1 has a valid Cloudinary image (others are Amazon-hosted)
    // The page logic uses uniqueReviewedProducts.length > 1 → always ItemList
    const items = [
      { name: 'Helmet A', url: '/cat/post#a' },
      { name: 'Helmet B' },
      { name: 'Helmet C' },
      { name: 'Helmet D' },
      { name: 'Helmet E' },
    ];
    const result = buildRoundupItemListSchema(items) as Record<string, any>;
    expect(result['@type']).toBe('ItemList');
    expect(result.itemListElement).toHaveLength(5);
    // No nested Product type anywhere
    const str = JSON.stringify(result);
    expect(str).not.toContain('"Product"');
    expect(str).not.toContain('"review"');
    expect(str).not.toContain('"ratingValue"');
  });
});
