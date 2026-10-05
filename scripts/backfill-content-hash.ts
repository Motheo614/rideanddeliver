/**
 * scripts/backfill-content-hash.ts
 *
 * Backfills contentHash for all published posts that don't have one yet.
 * Does NOT touch contentUpdatedAt, updatedAt, or any other date field.
 *
 * Usage:
 *   Dry run (default):  npx tsx scripts/backfill-content-hash.ts
 *   Apply:              npx tsx scripts/backfill-content-hash.ts --apply
 */

import 'dotenv/config';
import mongoose from 'mongoose';
import { computeContentHash } from '../lib/contentHash';

const DRY_RUN = !process.argv.includes('--apply');

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI is not set');

  await mongoose.connect(uri);
  console.log(`Connected. DRY_RUN=${DRY_RUN}`);

  // Use a raw collection query so we don't trigger Mongoose pre-save hooks.
  const collection = mongoose.connection.collection('posts');

  const posts = await collection
    .find({ contentHash: { $exists: false } })
    .project({ _id: 1, title: 1, content: 1, productBlocks: 1 })
    .toArray();

  console.log(`Found ${posts.length} posts without contentHash.`);

  let updated = 0;
  for (const post of posts) {
    const hash = computeContentHash({
      title: String(post.title || ''),
      content: String(post.content || ''),
      productBlocks: Array.isArray(post.productBlocks)
        ? post.productBlocks.map((b: any) => ({
            blockType: String(b.blockType || 'accent'),
            productId: String(b.productId || ''),
          }))
        : [],
    });

    if (DRY_RUN) {
      console.log(`  [dry] ${post._id} → ${hash.slice(0, 12)}…`);
    } else {
      await collection.updateOne(
        { _id: post._id },
        { $set: { contentHash: hash } }
        // No $set on updatedAt — we use the raw driver to bypass Mongoose timestamps.
      );
      console.log(`  [set] ${post._id} → ${hash.slice(0, 12)}…`);
      updated++;
    }
  }

  if (DRY_RUN) {
    console.log(`\nDry run complete. ${posts.length} posts would be updated.`);
    console.log('Run with --apply to write changes.');
  } else {
    console.log(`\nDone. Updated ${updated} posts.`);
  }

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
