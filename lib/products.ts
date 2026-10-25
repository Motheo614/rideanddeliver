import { fetchPostsApi, getApiBase } from './posts';
import { buildAffiliateRedirectUrl } from './affiliate/tracking';
import { getPostHref } from './postDisplay';
import { getCategoryInfo } from './categoryMap';
import { DEPARTMENTS } from './departments';

export interface TopPick {
  id: string;
  name: string;
  brand: string;
  imageUrl: string;
  amazonHref: string;
  badge: string;
  badgeDetail?: string;
  features: string[];
  roundupLabel: string;
  roundupHref: string;
  reviewHref: string;
}

const BADGE_MAX = 16;
const FEATURE_MAX = 90;

function trimAtWord(text: string, max: number, ellipsis = true): string {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max + 1);
  const lastSpace = cut.lastIndexOf(' ');
  const base = (lastSpace > max * 0.5 ? cut.slice(0, lastSpace) : clean.slice(0, max)).replace(/[\s,;:.\-–—]+$/, '');
  return ellipsis ? `${base}…` : base;
}

// "Best Overall — Full-Time Rain Rider" -> badge "Best Overall", detail "Full-Time Rain Rider"
export function splitBadge(raw: string): { badge: string; badgeDetail?: string } {
  const [head, ...rest] = raw.split(/\s+[—–-]\s+/);
  const detail = rest.join(' — ').trim() || undefined;
  const short = head.trim();
  if (short.length <= BADGE_MAX) return { badge: short, badgeDetail: detail };
  return { badge: trimAtWord(short, BADGE_MAX, false), badgeDetail: raw };
}

function toTitleCase(text: string): string {
  if (text !== text.toUpperCase() || text.length <= 3) return text;
  return text.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

interface TopPickApiItem {
  id: string;
  name: string;
  brand: string;
  asin: string;
  imageUrl: string;
  affiliateLink: string;
  badge: string;
  features: string[];
  roundup: { title: string; slug: string; dbCategorySlug: string; categoryLabel: string };
}

/**
 * Fetch the #1 product of each recent roundup ("Best Overall" first).
 * Returns [] on any failure so the homepage can omit the section.
 */
export async function getTopPicks(limit = 8): Promise<TopPick[]> {
  try {
    const response = await fetchPostsApi(`${getApiBase()}/api/products/top-picks?limit=${limit}`);
    if (!response.ok) return [];
    const data = await response.json();
    const items: TopPickApiItem[] = Array.isArray(data.products) ? data.products : [];

    return items.map((item) => {
      const reviewHref = getPostHref({
        dbCategorySlug: item.roundup.dbCategorySlug,
        categorySlug: item.roundup.dbCategorySlug,
        slug: item.roundup.slug,
      });
      const hub = DEPARTMENTS.find((d) => d.key === item.roundup.dbCategorySlug)?.href;
      return {
        id: item.id,
        name: item.name,
        brand: toTitleCase(item.brand || ''),
        imageUrl: item.imageUrl,
        amazonHref: buildAffiliateRedirectUrl(item.name, item.asin, '/', item.affiliateLink),
        ...splitBadge(item.badge || 'Top Pick'),
        features: item.features
          .slice(0, 2)
          .map((f) => trimAtWord(f.replace(/[…]+$|\.{3}$/, ''), FEATURE_MAX, false)),
        roundupLabel: getCategoryInfo(item.roundup.dbCategorySlug)?.displayName || item.roundup.categoryLabel,
        roundupHref: hub || reviewHref,
        reviewHref,
      };
    });
  } catch (error) {
    console.error('Error fetching top picks:', error);
    return [];
  }
}
