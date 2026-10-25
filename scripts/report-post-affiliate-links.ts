import mongoose from 'mongoose';
import { existsSync } from 'node:fs';
import { resolveAmazonAffiliateUrl } from '../lib/affiliate/amazonLink';

// Read-only audit of affiliate links used in published posts.
// Usage: npx tsx scripts/report-post-affiliate-links.ts
for (const envFile of ['.env.local', '.env']) {
  if (existsSync(envFile)) process.loadEnvFile(envFile);
}

const PLACEHOLDER_ID = /(?:\[\[PRODUCT_BLOCK\|(?:accent|hero)\||data-product-id=["']|productId:\s*)([a-f0-9]{24})/gi;
const AMAZON_HREF = /href=["'](https?:\/\/(?:[a-z0-9-]+\.)*(?:amazon\.[a-z.]+|amzn\.to|a\.co)\/[^"']*)["']/gi;

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI is not set');
  if (!process.env.AMAZON_CREATOR_PARTNER_TAG) throw new Error('AMAZON_CREATOR_PARTNER_TAG is not set');

  await mongoose.connect(uri, { readPreference: 'secondaryPreferred' });
  try {
    const db = mongoose.connection.db!;
    const posts = await db
      .collection('posts')
      .find({ status: 'published' }, { projection: { slug: 1, content: 1, productBlocks: 1 } })
      .toArray();
    const products = await db
      .collection('products')
      .find({}, { projection: { productName: 1, asin: 1, affiliateLink: 1, isActive: 1 } })
      .toArray();
    const productById = new Map(products.map((p) => [String(p._id), p]));

    const stats = {
      publishedPosts: posts.length,
      postsWithProductBlocks: 0,
      productReferences: 0,
      referencesMissingProduct: 0,
      referencesInactiveProduct: 0,
      referencesInvalidLink: 0,
      postsWithAnyBadReference: 0,
      postsWithPastedAmazonLinks: 0,
      pastedAmazonLinks: 0,
      pastedLinksMissingOurTag: 0,
    };
    const problems: string[] = [];
    const pasted: string[] = [];

    for (const post of posts) {
      const content = String(post.content || '');
      const ids = new Set<string>();
      for (const block of post.productBlocks || []) if (block?.productId) ids.add(String(block.productId).toLowerCase());
      for (const match of content.matchAll(PLACEHOLDER_ID)) ids.add(match[1].toLowerCase());

      if (ids.size > 0) stats.postsWithProductBlocks++;
      let postBad = false;
      for (const id of ids) {
        stats.productReferences++;
        const product = productById.get(id);
        if (!product) {
          stats.referencesMissingProduct++;
          postBad = true;
          problems.push(`${post.slug} | ${id} | product not found`);
          continue;
        }
        if (product.isActive === false) {
          stats.referencesInactiveProduct++;
        }
        const result = resolveAmazonAffiliateUrl(product.affiliateLink, product.asin);
        if (!result.url) {
          stats.referencesInvalidLink++;
          postBad = true;
          problems.push(`${post.slug} | ${id} | ${product.productName} | ${result.reason}`);
        }
      }
      if (postBad) stats.postsWithAnyBadReference++;

      const tag = process.env.AMAZON_CREATOR_PARTNER_TAG!;
      const links = [...content.matchAll(AMAZON_HREF)].map((m) => m[1]);
      if (links.length > 0) {
        stats.postsWithPastedAmazonLinks++;
        stats.pastedAmazonLinks += links.length;
        for (const link of links) {
          const missingTag = !/amzn\.to|a\.co/i.test(link) && !link.includes(`tag=${tag}`);
          if (missingTag) stats.pastedLinksMissingOurTag++;
          pasted.push(`${post.slug} | ${link}${missingTag ? ' | MISSING OUR TAG' : ''}`);
        }
      }
    }

    console.log(stats);
    if (problems.length) console.log('\nBad product references:\n' + problems.join('\n'));
    if (pasted.length) console.log('\nPasted Amazon links in post content:\n' + pasted.join('\n'));
  } finally {
    await mongoose.disconnect();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
