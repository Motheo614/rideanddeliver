import { generateSlugFromTitle } from '@/lib/slug';

const ASIN_PATTERN = /^[A-Z0-9]{10}$/i;

export function getAsinFromAffiliateUrl(affiliateUrl: string): string | undefined {
  try {
    const url = new URL(affiliateUrl);
    const queryAsin = url.searchParams.get('asin');
    const pathAsin = url.pathname.match(/\/(?:dp|gp\/product)\/([A-Z0-9]{10})(?:\/|$)/i)?.[1];
    const asin = (queryAsin || pathAsin || '').toUpperCase();
    return ASIN_PATTERN.test(asin) ? asin : undefined;
  } catch {
    return undefined;
  }
}

export function buildAffiliateRedirectUrl(
  productName: string,
  asin: string | undefined,
  sourcePage: string,
  fallbackUrl: string
): string {
  const normalizedAsin = String(asin || getAsinFromAffiliateUrl(fallbackUrl) || '').trim().toUpperCase();
  if (!ASIN_PATTERN.test(normalizedAsin)) return fallbackUrl;

  const slug = generateSlugFromTitle(productName).slice(0, 120).replace(/-+$/, '')
    || normalizedAsin.toLowerCase();
  const params = new URLSearchParams({ asin: normalizedAsin });
  if (sourcePage) params.set('page', sourcePage);
  return `/go/${slug}?${params.toString()}`;
}
