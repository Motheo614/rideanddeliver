/**
 * lib/contentHash.ts
 *
 * Produces a stable SHA-256 hash of the editable content fields that should
 * trigger a contentUpdatedAt bump when they change:
 *   - title
 *   - content (HTML body — FAQ items are embedded here, so they are covered)
 *   - productBlocks (blockType + productId pairs only)
 *
 * Explicitly EXCLUDED from the hash (changes to these do NOT bump contentUpdatedAt):
 *   - price, stars, reviewCount — may be Amazon data, not editorial content
 *   - affiliateLink / affiliateUrl — URL rotations are not content edits
 *   - SEO metadata (metaTitle, metaDescription, keywords)
 *   - status, featured, trending, editorsPick flags
 *   - view counts
 *
 * Whitespace-only changes are ignored: content is normalised before hashing
 * so that saving without touching the body does not bump contentUpdatedAt.
 *
 * First-save behaviour (no stored hash):
 *   The PUT handler stores the hash WITHOUT bumping contentUpdatedAt on the
 *   first save of a post that has no stored hash. This backfills existing posts
 *   silently. See app/api/posts/[id]/route.ts for the guard.
 */

import { createHash } from 'crypto';

interface HashableFields {
  title?: string;
  content?: string;
  /** Only blockType and productId are hashed — price/stars/affiliateLink excluded. */
  productBlocks?: Array<{
    blockType: string;
    productId: string | { toString(): string };
    [key: string]: unknown; // other fields are ignored
  }>;
}

function normalizeWhitespace(text: string): string {
  return text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export function computeContentHash(fields: HashableFields): string {
  const title = normalizeWhitespace(String(fields.title || ''));
  const content = normalizeWhitespace(String(fields.content || ''));

  // Only hash blockType + productId. Price, stars, reviewCount, affiliateLink
  // are intentionally excluded so product-data edits don't bump contentUpdatedAt.
  // Sort by productId for stability (reordering blocks doesn't change the hash).
  const blocks = (fields.productBlocks || [])
    .map((b) => `${b.blockType}:${String(b.productId)}`)
    .sort()
    .join('|');

  const payload = `title:${title}\ncontent:${content}\nblocks:${blocks}`;
  return createHash('sha256').update(payload, 'utf8').digest('hex');
}
