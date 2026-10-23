import mongoose from 'mongoose';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

// Read-only MongoDB audit. Usage: npx tsx scripts/report-internal-post-links.ts [output.csv]
for (const envFile of ['.env.local', '.env']) {
  if (existsSync(envFile)) process.loadEnvFile(envFile);
}

const SITE_HOSTS = new Set(['ridercomplex.com', 'www.ridercomplex.com']);
const CATEGORY_SLUGS = new Set([
  'safety-gear',
  'tech-lighting',
  'bike-security',
  'delivery-gear',
  'platform-reviews',
]);
const STATIC_ROOT_PATHS = new Set([
  'about',
  'affiliate-disclaimer',
  'bike-delivery-rider-gear',
  'bike-delivery-tech-and-visibility',
  'bike-security',
  'bike-security-for-delivery-riders',
  'blog',
  'category',
  'contact',
  'delivery-gear',
  'delivery-platform-reviews',
  'delivery-rider-equipment',
  'free-rider-checklist',
  'night-delivery-riding-safety',
  'platform-reviews',
  'privacy-policy',
  'safety-gear',
  'start-here',
  'tech-lighting',
  'terms',
  'tools',
]);
const APPROVED_TARGETS: Record<string, string> = {
  '/axiom-streamliner-dlx/':
    '/delivery-gear/axiom-streamliner-dlx-review-is-this-rack-worth-it-for-delivery-riders',
  '/rockbros-rear-bike-rack/':
    '/delivery-gear/rockbros-rear-bike-rack-review-is-it-worth-it-for-delivery-riders',
  '/topeak-mtx-beamrack/':
    '/delivery-gear/topeak-mtx-beamrack-review-is-this-seatpost-rack-worth-it-for-delivery-riders',
  '/best-bike-cargo-racks-of-2026-for-delivery-riders/':
    '/delivery-gear/best-bike-cargo-racks-of-2026-for-delivery-riders-what-actually-holds-up',
  '/ibera-pakrak-touring-carrier-plus/':
    '/delivery-gear/ibera-pakrak-touring-carrier-plus-review-is-it-worth-it-for-delivery-riders',
};
const OUTPUT_PATH = resolve(process.argv[2] || 'internal-post-links.csv');

type LinkType =
  | 'anchor'
  | 'external'
  | 'hub or static page'
  | 'article-like with no match'
  | 'other';
type LinkStatus = 'verified against DB' | 'not found' | 'not applicable';

interface PostRecord {
  slug?: string;
  category?: string;
  content?: string;
  status?: string;
}

interface LinkRow {
  slug: string;
  oldUrl: string;
  proposedNewUrl: string;
  unmatched: boolean;
  type: LinkType;
  status: LinkStatus;
}

interface PublishedPostTarget {
  slug: string;
  category: string;
}

function decodeHtmlAttribute(value: string) {
  return value
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&#(\d+);/g, (_match, code: string) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_match, code: string) => String.fromCodePoint(Number.parseInt(code, 16)));
}

function isAffiliateUrl(url: URL) {
  const hostname = url.hostname.toLowerCase();
  return (
    hostname === 'amzn.to'
    || hostname.endsWith('.amzn.to')
    || /(^|\.)amazon\./i.test(hostname)
    || (SITE_HOSTS.has(hostname) && /^\/go(?:\/|$)/i.test(url.pathname))
  );
}

function extractHrefValues(content: string) {
  const hrefPattern = /<a\b[^>]*\bhref\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/gi;
  const hrefs: string[] = [];
  let match: RegExpExecArray | null;

  while ((match = hrefPattern.exec(content)) !== null) {
    const href = decodeHtmlAttribute(match[1] ?? match[2] ?? match[3] ?? '').trim();
    if (href) hrefs.push(href);
  }

  return hrefs;
}

function csvEscape(value: string | boolean) {
  return `"${String(value).replace(/"/g, '""')}"`;
}

function toCsv(rows: LinkRow[]) {
  const lines = [
    ['slug', 'old_url', 'proposed_new_url', 'unmatched', 'type', 'status'].join(','),
    ...rows.map((row) => [
      csvEscape(row.slug),
      csvEscape(row.oldUrl),
      csvEscape(row.proposedNewUrl),
      csvEscape(row.unmatched),
      csvEscape(row.type),
      csvEscape(row.status),
    ].join(',')),
  ];
  return `${lines.join('\r\n')}\r\n`;
}

function row(
  post: PostRecord,
  rawHref: string,
  proposedNewUrl: string,
  type: LinkType,
  status: LinkStatus
): LinkRow {
  return {
    slug: String(post.slug || ''),
    oldUrl: rawHref,
    proposedNewUrl,
    unmatched: status === 'not found',
    type,
    status,
  };
}

function withPath(rawHref: string, url: URL, pathname: string) {
  if (/^https?:\/\//i.test(rawHref)) {
    url.pathname = pathname;
    return url.toString();
  }
  if (rawHref.startsWith('//')) {
    url.pathname = pathname;
    return `//${url.host}${url.pathname}${url.search}${url.hash}`;
  }
  return `${pathname}${url.search}${url.hash}`;
}

function buildLinkRow(
  post: PostRecord,
  rawHref: string,
  publishedBySlug: Map<string, PublishedPostTarget>
): LinkRow | null {
  if (/\s/.test(rawHref)) return row(post, rawHref, rawHref, 'other', 'not applicable');
  if (/^#/.test(rawHref)) return row(post, rawHref, rawHref, 'anchor', 'not applicable');
  if (/^(?:mailto:|tel:|javascript:|data:)/i.test(rawHref)) {
    return row(post, rawHref, rawHref, 'other', 'not applicable');
  }

  const postCategory = String(post.category || '').trim().toLowerCase();
  const postSlug = String(post.slug || '').trim();
  let url: URL;
  try {
    url = new URL(rawHref, `https://www.ridercomplex.com/${postCategory}/${postSlug}`);
  } catch {
    return row(post, rawHref, rawHref, 'other', 'not applicable');
  }

  if (isAffiliateUrl(url)) return null;
  if (!SITE_HOSTS.has(url.hostname.toLowerCase())) {
    return row(post, rawHref, rawHref, 'external', 'not applicable');
  }

  const originalPath = url.pathname;
  const approvedTarget = APPROVED_TARGETS[originalPath];
  if (approvedTarget) {
    const targetSlug = approvedTarget.split('/').filter(Boolean).at(-1) || '';
    const published = publishedBySlug.get(targetSlug);
    const verified = Boolean(published && `/${published.category}/${published.slug}` === approvedTarget);
    return row(
      post,
      rawHref,
      approvedTarget,
      'article-like with no match',
      verified ? 'verified against DB' : 'not found'
    );
  }

  const pathParts = originalPath.split('/').filter(Boolean);
  if (pathParts[0] === 'category') {
    const category = pathParts[1]?.toLowerCase();
    const linkedSlug = pathParts[2];

    if (category && CATEGORY_SLUGS.has(category) && !linkedSlug) {
      const canonicalPath = `/${category}`;
      return row(
        post,
        rawHref,
        originalPath === canonicalPath ? rawHref : withPath(rawHref, url, canonicalPath),
        'hub or static page',
        'not applicable'
      );
    }
    if (category && CATEGORY_SLUGS.has(category) && linkedSlug) {
      const published = publishedBySlug.get(linkedSlug);
      if (published) {
        const canonicalPath = `/${published.category}/${published.slug}`;
        return row(
          post,
          rawHref,
          originalPath === canonicalPath ? rawHref : withPath(rawHref, url, canonicalPath),
          originalPath === canonicalPath ? 'other' : 'article-like with no match',
          'verified against DB'
        );
      }
      return row(post, rawHref, rawHref, 'article-like with no match', 'not found');
    }
    return row(post, rawHref, rawHref, 'other', 'not found');
  }

  if (pathParts[0] === 'blog' && pathParts[1]) {
    const published = publishedBySlug.get(pathParts[1]);
    if (published) {
      const canonicalPath = `/${published.category}/${published.slug}`;
      return row(
        post,
        rawHref,
        withPath(rawHref, url, canonicalPath),
        'article-like with no match',
        'verified against DB'
      );
    }
    return row(post, rawHref, rawHref, 'article-like with no match', 'not found');
  }

  if (pathParts.length === 1 && pathParts[0]) {
    const path = pathParts[0].toLowerCase();
    if (STATIC_ROOT_PATHS.has(path)) {
      return row(post, rawHref, rawHref, 'hub or static page', 'not applicable');
    }
    const published = publishedBySlug.get(pathParts[0]);
    if (published) {
      const canonicalPath = `/${published.category}/${published.slug}`;
      return row(
        post,
        rawHref,
        withPath(rawHref, url, canonicalPath),
        originalPath === canonicalPath ? 'other' : 'article-like with no match',
        'verified against DB'
      );
    }
    return row(post, rawHref, rawHref, 'article-like with no match', 'not found');
  }

  if (CATEGORY_SLUGS.has(pathParts[0] || '') && pathParts[1]) {
    const published = publishedBySlug.get(pathParts[1]);
    if (published) {
      const canonicalPath = `/${published.category}/${published.slug}`;
      return row(
        post,
        rawHref,
        originalPath === canonicalPath ? rawHref : withPath(rawHref, url, canonicalPath),
        originalPath === canonicalPath ? 'other' : 'article-like with no match',
        'verified against DB'
      );
    }
    return row(post, rawHref, rawHref, 'article-like with no match', 'not found');
  }

  if (pathParts[0] === 'tools' && pathParts[1] === 'gear-comparison') {
    return row(post, rawHref, rawHref, 'hub or static page', 'not applicable');
  }

  return row(post, rawHref, rawHref, 'other', 'not found');
}

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI is not set');

  await mongoose.connect(uri, { readPreference: 'secondaryPreferred' });

  try {
    const posts = await mongoose.connection
      .collection<PostRecord>('posts')
      .find({})
      .project({ _id: 0, slug: 1, category: 1, content: 1, status: 1 })
      .toArray();
    const publishedPosts = posts.filter((post) => post.status === 'published');
    const publishedBySlug = new Map<string, PublishedPostTarget>(
      publishedPosts
        .filter((post) => post.slug && post.category)
        .map((post) => [
          String(post.slug),
          { slug: String(post.slug), category: String(post.category).toLowerCase() },
        ])
    );

    const rows: LinkRow[] = [];
    for (const post of posts) {
      for (const href of extractHrefValues(String(post.content || ''))) {
        const linkRow = buildLinkRow(post, href, publishedBySlug);
        if (linkRow) rows.push(linkRow);
      }
    }

    mkdirSync(dirname(OUTPUT_PATH), { recursive: true });
    writeFileSync(OUTPUT_PATH, toCsv(rows), 'utf8');

    const changed = rows.filter((link) => link.oldUrl !== link.proposedNewUrl);
    const unmatched = rows.filter((link) => link.unmatched);
    const distinctOldUrls = new Set(rows.map((link) => link.oldUrl));
    const affectedPosts = new Set(changed.map((link) => link.slug));
    const countsByType = new Map<LinkType, number>();
    for (const link of unmatched) {
      countsByType.set(link.type, (countsByType.get(link.type) || 0) + 1);
    }

    console.log(`Scanned ${posts.length} posts (${publishedPosts.length} published) directly in MongoDB; no database writes were performed.`);
    console.log(`Included link occurrences: ${rows.length} (${distinctOldUrls.size} distinct old URLs; affiliate links excluded).`);
    console.log(`Proposed URL changes: ${changed.length} across ${affectedPosts.size} posts.`);
    console.log(`Unmatched occurrences: ${unmatched.length}.`);
    for (const [type, count] of countsByType) console.log(`Unmatched "${type}": ${count}.`);
    console.log(`CSV written to: ${OUTPUT_PATH}`);
  } finally {
    await mongoose.disconnect();
  }
}

main().catch((error) => {
  console.error('Failed to create the read-only internal-link report:', error);
  process.exitCode = 1;
});
