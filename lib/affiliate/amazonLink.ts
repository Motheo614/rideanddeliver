const ASIN_PATTERN = /^[A-Z0-9]{10}$/;
const AMAZON_STORE_HOST = /^([a-z0-9-]+\.)*amazon\.com$/i;
const AMAZON_SHORT_HOSTS = new Set(['amzn.to', 'www.amzn.to', 'a.co', 'www.a.co']);
const MAX_URL_LENGTH = 2048;

export type AmazonLinkResult =
  | { url: string; reason?: undefined; replacedTag?: boolean }
  | { url: null; reason: string };

export function getAssociateTag(): string {
  return (process.env.AMAZON_CREATOR_PARTNER_TAG || '').trim();
}

/**
 * Validates a stored affiliate link and guarantees it carries our Associates tag.
 * Returns url: null (never a placeholder) when the link cannot be trusted.
 */
export function resolveAmazonAffiliateUrl(
  rawLink: unknown,
  asin?: unknown,
  tag: string = getAssociateTag()
): AmazonLinkResult {
  const link = typeof rawLink === 'string' ? rawLink.trim() : '';
  const normalizedAsin = typeof asin === 'string' ? asin.trim().toUpperCase() : '';

  if (!link) {
    if (!ASIN_PATTERN.test(normalizedAsin)) return { url: null, reason: 'no affiliate link or valid ASIN' };
    if (!tag) return { url: null, reason: 'Associates tag is not configured' };
    return { url: `https://www.amazon.com/dp/${normalizedAsin}?tag=${encodeURIComponent(tag)}` };
  }

  let url: URL;
  try {
    url = new URL(link);
  } catch {
    return { url: null, reason: 'link is not a valid URL' };
  }

  if (url.protocol !== 'https:') return { url: null, reason: 'link is not https' };
  if (url.username || url.password) return { url: null, reason: 'link contains credentials' };
  if (url.toString().length > MAX_URL_LENGTH) return { url: null, reason: 'link is too long' };

  const host = url.hostname.toLowerCase();
  if (AMAZON_SHORT_HOSTS.has(host)) return { url: url.toString() };
  if (!AMAZON_STORE_HOST.test(host)) return { url: null, reason: `host is not an Amazon domain: ${host}` };
  if (!tag) return { url: null, reason: 'Associates tag is not configured' };

  const existingTag = url.searchParams.get('tag');
  if (existingTag === tag) return { url: url.toString() };

  url.searchParams.set('tag', tag);
  return { url: url.toString(), replacedTag: existingTag !== null };
}
