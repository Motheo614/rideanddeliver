import mongoose from 'mongoose';
import { existsSync } from 'node:fs';
import { resolveAmazonAffiliateUrl } from '../lib/affiliate/amazonLink';

// Read-only audit of active products' affiliate links. Usage: npx tsx scripts/report-affiliate-links.ts
for (const envFile of ['.env.local', '.env']) {
  if (existsSync(envFile)) process.loadEnvFile(envFile);
}

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI is not set');
  if (!process.env.AMAZON_CREATOR_PARTNER_TAG) throw new Error('AMAZON_CREATOR_PARTNER_TAG is not set');

  await mongoose.connect(uri, { readPreference: 'secondaryPreferred' });
  try {
    const db = mongoose.connection.db!;
    const products = await db
      .collection('products')
      .find({ isActive: true }, { projection: { productName: 1, asin: 1, affiliateLink: 1 } })
      .toArray();

    const posts = await db
      .collection('posts')
      .find({ status: 'published', 'productBlocks.blockType': 'hero' }, { projection: { productBlocks: 1 } })
      .toArray();
    const heroIds = new Set<string>();
    for (const post of posts) {
      for (const block of post.productBlocks || []) {
        if (block?.blockType === 'hero' && block.productId) heroIds.add(String(block.productId));
      }
    }

    const counts = { total: 0, ok: 0, tagAppended: 0, tagReplaced: 0, invalid: 0 };
    const topPick = { total: 0, invalid: 0 };
    const problems: string[] = [];

    for (const product of products) {
      const isTopPick = heroIds.has(String(product._id));
      const raw = typeof product.affiliateLink === 'string' ? product.affiliateLink.trim() : '';
      const result = resolveAmazonAffiliateUrl(raw, product.asin);
      counts.total++;
      if (isTopPick) topPick.total++;

      if (!result.url) {
        counts.invalid++;
        if (isTopPick) topPick.invalid++;
        problems.push(`${product._id} | ${product.productName} | ${result.reason}`);
      } else if (result.replacedTag) {
        counts.tagReplaced++;
      } else if (result.url !== raw && raw) {
        counts.tagAppended++;
      } else {
        counts.ok++;
      }
    }

    console.log('Active products:', counts);
    console.log('Hero products in published posts (Top Picks candidates):', topPick);
    if (problems.length) console.log('Invalid links:\n' + problems.join('\n'));
  } finally {
    await mongoose.disconnect();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
