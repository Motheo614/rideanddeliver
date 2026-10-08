/**
 * lib/seo/schema.ts
 * All JSON-LD builders for Rider Complex.
 *
 * Hard rules (enforced by type system + runtime guards):
 *   - No offers, price, lowPrice, highPrice, priceValidUntil, availability — ever.
 *   - No aggregateRating, ratingCount, reviewCount — ever.
 *   - No affiliate URLs inside JSON-LD.
 *   - Every value must come from author-supplied DB fields or visible page content.
 *   - Images must be own-domain URLs (Cloudinary / ridercomplex.com). Flag Amazon-hosted images.
 *   - ratingValue is ALWAYS toReviewRatingValue(score) — never from the `stars` DB field.
 */

type JsonLd = Record<string, unknown>;

type BreadcrumbItem = {
  name: string;
  url: string;
};

type ArticleSchemaInput = {
  url: string;
  /** Visible H1 text. Truncated to 110 chars if longer (Google guideline). */
  title: string;
  description: string;
  image?: string;
  /** Full ISO-8601 with timezone, e.g. 2026-01-15T09:00:00Z */
  datePublished: string;
  /** Full ISO-8601 with timezone. Falls back to datePublished when no editorial update exists. */
  dateModified?: string;
  category?: string;
  tags?: string[];
  authorName?: string;
  /** Absolute URL to the author page, e.g. https://www.ridercomplex.com/about */
  authorUrl?: string;
};

type ItemListInput = {
  name: string;
  url: string;
};

// price / priceCurrency removed — no live-price pipeline approved.
// Do not add offers, price, lowPrice, highPrice, or priceValidUntil to this type.
type ProductSchemaInput = {
  name: string;
  url: string;
  image?: string;
  description?: string;
};

/**
 * Input for a Product + editorial Review block.
 *
 * Forbidden fields (do not add):
 *   offers, price, priceCurrency, availability, priceValidUntil,
 *   aggregateRating, ratingCount, reviewCount, stars.
 *
 * ratingValue must come from toReviewRatingValue(score) — see below.
 */
type ProductReviewInput = {
  /** Product name — required. Skip the whole block if absent. */
  name: string;
  /** Own-domain image URL — required. Skip the whole block if absent or Amazon-hosted. */
  image: string;
  description?: string;
  /** Visible review excerpt rendered with the product card. */
  reviewBody: string;
  /** Visible brand name (e.g. "Kryptonite"). */
  brand: string;
  /**
   * Editorial rating on the 1-5 scale, produced by toReviewRatingValue(score).
   * Required. Skip the whole block if absent or out of range.
   */
  ratingValue: number;
  /** Visible reviewer byline. Required. */
  authorName: string;
  /** Absolute URL to the author page. Recommended. */
  authorUrl?: string;
  /**
   * ISO-8601 date the review was written/published.
   * Use the post's publishedAt. Required by Google for review snippets.
   */
  reviewDatePublished: string;
};

// ---------------------------------------------------------------------------
// Shared rating helper — single source of truth for both visible stars and JSON-LD
// ---------------------------------------------------------------------------

/**
 * Converts a 0-10 editorial score to a 1-5 review rating value.
 *
 * Rules:
 *   - Input must be a finite number in [0, 10]. Returns null otherwise.
 *   - Output is rounded to 1 decimal place.
 *   - Output is clamped to [1.0, 5.0].
 *
 * Use this for BOTH the visible star display and the JSON-LD ratingValue so
 * they can never diverge.
 *
 * @example toReviewRatingValue(9.2) → 4.6
 * @example toReviewRatingValue(0)   → 1.0  (floor clamp)
 * @example toReviewRatingValue(10)  → 5.0
 * @example toReviewRatingValue(NaN) → null (caller must skip schema)
 */
export function toReviewRatingValue(score: unknown): number | null {
  const n = Number(score);
  if (!Number.isFinite(n) || n < 0 || n > 10) return null;
  const raw = n / 2;
  const rounded = Math.round(raw * 10) / 10;
  return Math.max(1.0, Math.min(5.0, rounded));
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/** Returns true when the URL is hosted on an Amazon domain. */
export function isAmazonHostedImage(url: string): boolean {
  return /^https?:\/\/[^/]*\.amazon\.[a-z]+/i.test(url) ||
    /^https?:\/\/[^/]*\.ssl-images-amazon\.com/i.test(url) ||
    /^https?:\/\/[^/]*\.media-amazon\.com/i.test(url);
}

const FALLBACK_SITE_URL = 'http://localhost:3000';
const SITE_NAME = 'Rider Complex';
const ORG_ID = '#organization';
const WEBSITE_ID = '#website';
const DEFAULT_LOGO_PATH = '/Assets/Logo.png';
const AUTHOR_URL_PATH = '/about';

function getSiteUrl() {
  const raw = process.env.NEXT_PUBLIC_SITE_URL || process.env.APP_URL || FALLBACK_SITE_URL;
  return raw.endsWith('/') ? raw.slice(0, -1) : raw;
}

export function toAbsoluteUrl(pathOrUrl: string) {
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  const normalized = pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`;
  return `${getSiteUrl()}${normalized}`;
}

// ---------------------------------------------------------------------------
// Site-level schemas
// ---------------------------------------------------------------------------

export function buildOrganizationSchema(): JsonLd {
  return {
    '@type': 'Organization',
    '@id': toAbsoluteUrl(ORG_ID),
    name: SITE_NAME,
    url: toAbsoluteUrl('/'),
    logo: {
      '@type': 'ImageObject',
      url: toAbsoluteUrl(DEFAULT_LOGO_PATH),
      width: 1200,
      height: 630,
    },
  };
}

export function buildWebSiteSchema(): JsonLd {
  return {
    '@type': 'WebSite',
    '@id': toAbsoluteUrl(WEBSITE_ID),
    url: toAbsoluteUrl('/'),
    name: SITE_NAME,
    publisher: {
      '@id': toAbsoluteUrl(ORG_ID),
    },
  };
}

export function buildSiteGraphSchema(): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@graph': [buildOrganizationSchema(), buildWebSiteSchema()],
  };
}

// ---------------------------------------------------------------------------
// Page-level schemas
// ---------------------------------------------------------------------------

export function buildBreadcrumbSchema(items: BreadcrumbItem[]): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: toAbsoluteUrl(item.url),
    })),
  };
}

export function buildBlogPostingSchema(input: ArticleSchemaInput): JsonLd {
  // Headline must be under 110 characters per Google's guideline.
  const headline = input.title.length > 110 ? input.title.slice(0, 110) : input.title;

  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': toAbsoluteUrl(input.url),
    },
    headline,
    description: input.description,
    image: input.image ? [toAbsoluteUrl(input.image)] : undefined,
    // datePublished and dateModified must be full ISO-8601 with timezone (Z or offset).
    // Never use new Date() or build time here — values come from DB fields only.
    datePublished: input.datePublished,
    dateModified: input.dateModified || input.datePublished,
    articleSection: input.category,
    keywords: input.tags && input.tags.length > 0 ? input.tags.join(', ') : undefined,
    author: {
      '@type': 'Person',
      // Matches the byline in ArticleAuthorBox. Keep in sync if the field becomes per-post.
      name: input.authorName || 'Marcus Webb',
      url: input.authorUrl || toAbsoluteUrl(AUTHOR_URL_PATH),
    },
    publisher: {
      '@type': 'Organization',
      '@id': toAbsoluteUrl(ORG_ID),
      name: SITE_NAME,
      logo: {
        '@type': 'ImageObject',
        url: toAbsoluteUrl(DEFAULT_LOGO_PATH),
      },
    },
  };
}

export function buildCollectionPageSchema(url: string, name: string, description?: string): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    url: toAbsoluteUrl(url),
    name,
    description,
    isPartOf: {
      '@id': toAbsoluteUrl(WEBSITE_ID),
    },
  };
}

export function buildItemListSchema(items: ItemListInput[]): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: toAbsoluteUrl(item.url),
      name: item.name,
    })),
  };
}

// ---------------------------------------------------------------------------
// Product schemas
// ---------------------------------------------------------------------------

/**
 * Bare Product schema (no review, no offers).
 * Never add offers, price, lowPrice, highPrice, priceValidUntil, or availability.
 */
export function buildProductSchema(input: ProductSchemaInput): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: input.name,
    image: input.image ? [toAbsoluteUrl(input.image)] : undefined,
    description: input.description,
  };
}

/**
 * Product + editorial Review.
 *
 * Returns null (emit nothing) when any required field is missing:
 *   - name
 *   - brand
 *   - image (must be present and NOT Amazon-hosted)
 *   - ratingValue (must be in [1, 5])
 *   - reviewBody matching visible page text
 *
 * This prevents partial/invalid markup from reaching Google.
 *
 * Rules:
 *   - ratingValue MUST come from toReviewRatingValue(score) — never from `stars`.
 *   - No aggregateRating, ratingCount, reviewCount, offers, or price — ever.
 *   - reviewBody must match text rendered visibly with the product card.
 *   - review.datePublished = the post's publishedAt ISO string.
 *   - author.url = absolute URL to the author page.
 */
export function buildProductReviewSchema(input: ProductReviewInput): JsonLd | null {
  // Guard: skip entirely if required fields are missing or invalid.
  if (!input.name?.trim()) return null;
  if (!input.brand?.trim()) return null;
  if (!input.image?.trim() || isAmazonHostedImage(input.image)) return null;
  if (!Number.isFinite(input.ratingValue) || input.ratingValue < 1 || input.ratingValue > 5) return null;
  if (!input.reviewBody?.trim()) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: input.name.trim(),
    image: [toAbsoluteUrl(input.image)],
    description: input.description?.trim() || undefined,
    brand: { '@type': 'Brand', name: input.brand.trim() },
    review: {
      '@type': 'Review',
      datePublished: input.reviewDatePublished,
      reviewBody: input.reviewBody.trim(),
      author: {
        '@type': 'Person',
        name: input.authorName,
        url: input.authorUrl || toAbsoluteUrl(AUTHOR_URL_PATH),
      },
      reviewRating: {
        '@type': 'Rating',
        ratingValue: input.ratingValue,
        bestRating: 5,
        worstRating: 1,
      },
    },
  };
}

export function buildArticleSchemaGraph(nodes: JsonLd[]): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@graph': nodes.map(({ ['@context']: _context, ...node }) => node),
  };
}

/**
 * Plain ItemList for roundup/comparison pages (2+ products).
 *
 * Decision (owner-approved): roundups emit name+url only — no nested Product/Review,
 * no stars, no ratings. Google does not award review snippets for multi-product pages
 * so nesting Product+Review inside ItemList adds risk with no benefit.
 *
 * url should point to the on-page anchor (#jumpTargetId) when available, otherwise
 * the post's own canonical URL. Never use affiliate links here.
 */
export function buildRoundupItemListSchema(
  items: Array<{ name: string; url?: string }>
): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      ...(item.url ? { url: toAbsoluteUrl(item.url) } : {}),
    })),
  };
}

// ---------------------------------------------------------------------------
// FAQ schema
// ---------------------------------------------------------------------------

type FaqItemInput = {
  question: string;
  answer: string;
};

/**
 * Only call this with the exact questions/answers rendered visibly on the page (see
 * components/FaqSection.tsx, which is the single source for both the visible markup and this).
 */
export function buildFaqPageSchema(items: FaqItemInput[]): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };
}
