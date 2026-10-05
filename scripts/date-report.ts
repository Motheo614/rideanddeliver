/**
 * scripts/date-report.ts
 *
 * Read-only report of posts with suspicious contentUpdatedAt values.
 * Prints counts and slugs for three categories:
 *   1. contentUpdatedAt is null / missing
 *   2. contentUpdatedAt is earlier than publishedAt
 *   3. contentUpdatedAt is in the future
 *
 * Usage:
 *   npx tsx scripts/date-report.ts
 */

import 'dotenv/config';
import mongoose from 'mongoose';

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI is not set');

  await mongoose.connect(uri);
  const collection = mongoose.connection.collection('posts');
  const now = new Date();

  const posts = await collection
    .find({ status: 'published' })
    .project({ _id: 0, slug: 1, publishedAt: 1, contentUpdatedAt: 1 })
    .toArray();

  const nullDate: string[] = [];
  const beforePublished: string[] = [];
  const inFuture: string[] = [];

  for (const post of posts) {
    const slug = String(post.slug || post._id);
    const pub = post.publishedAt ? new Date(post.publishedAt) : null;
    const upd = post.contentUpdatedAt ? new Date(post.contentUpdatedAt) : null;

    if (!upd) {
      nullDate.push(slug);
      continue;
    }
    if (pub && upd < pub) {
      beforePublished.push(slug);
    }
    if (upd > now) {
      inFuture.push(slug);
    }
  }

  console.log(`\n=== Date Report (${posts.length} published posts) ===\n`);

  console.log(`1. contentUpdatedAt is null/missing: ${nullDate.length}`);
  nullDate.forEach((s) => console.log(`   - ${s}`));

  console.log(`\n2. contentUpdatedAt earlier than publishedAt: ${beforePublished.length}`);
  beforePublished.forEach((s) => console.log(`   - ${s}`));

  console.log(`\n3. contentUpdatedAt in the future: ${inFuture.length}`);
  inFuture.forEach((s) => console.log(`   - ${s}`));

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
