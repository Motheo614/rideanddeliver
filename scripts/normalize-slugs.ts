/**
 * Script to normalize post slugs to URL-safe ASCII hyphen format.
 *
 * Usage:
 * - npx tsx scripts/normalize-slugs.ts --dry-run
 * - npx tsx scripts/normalize-slugs.ts
 */

import mongoose from 'mongoose';
import { normalizeSlug } from '../lib/slug';
import { loadEnvConfig } from '@next/env';

type PostRecord = {
  _id: mongoose.Types.ObjectId;
  slug?: string;
  title?: string;
};

function getFallbackBaseSlug(post: PostRecord): string {
  const titleSlug = normalizeSlug(post.title || '');
  if (titleSlug) return titleSlug;

  const idSuffix = String(post._id).slice(-8).toLowerCase();
  return `post-${idSuffix}`;
}

function buildUniqueSlug(base: string, used: Set<string>): string {
  let candidate = base;
  let suffix = 2;

  while (used.has(candidate)) {
    candidate = `${base}-${suffix}`;
    suffix += 1;
  }

  return candidate;
}

async function normalizeAllSlugs() {
  const dryRun = process.argv.includes('--dry-run');
  loadEnvConfig(process.cwd());

  try {
    const { default: connectDB } = await import('../lib/db/mongoose');
    const { default: Post } = await import('../lib/db/models/Post');

    await connectDB();
    console.log('Connected to MongoDB');

    const posts = await Post.find({}, '_id slug title')
      .sort({ createdAt: 1, _id: 1 })
      .lean<PostRecord[]>();

    console.log(`Found ${posts.length} posts`);

    if (posts.length === 0) {
      console.log('No posts found. Nothing to normalize.');
      process.exit(0);
    }

    const usedFinalSlugs = new Set<string>();
    const updates: Array<{ id: mongoose.Types.ObjectId; oldSlug: string; newSlug: string }> = [];

    for (const post of posts) {
      const currentSlug = (post.slug || '').trim();
      const normalizedCurrent = normalizeSlug(currentSlug);
      const baseSlug = normalizedCurrent || getFallbackBaseSlug(post);
      const uniqueSlug = buildUniqueSlug(baseSlug, usedFinalSlugs);

      usedFinalSlugs.add(uniqueSlug);

      if (uniqueSlug !== currentSlug) {
        updates.push({
          id: post._id,
          oldSlug: currentSlug,
          newSlug: uniqueSlug,
        });
      }
    }

    console.log(`Posts needing slug updates: ${updates.length}`);

    if (updates.length > 0) {
      const previewCount = Math.min(25, updates.length);
      console.log(`Previewing first ${previewCount} change(s):`);
      for (let i = 0; i < previewCount; i += 1) {
        const item = updates[i];
        console.log(`- ${item.oldSlug || '(empty)'} -> ${item.newSlug}`);
      }
      if (updates.length > previewCount) {
        console.log(`...and ${updates.length - previewCount} more`);
      }
    }

    if (dryRun) {
      console.log('Dry-run complete. No database writes were made.');
      process.exit(0);
    }

    if (updates.length === 0) {
      console.log('All slugs are already normalized.');
      process.exit(0);
    }

    const bulkOps = updates.map((item) => ({
      updateOne: {
        filter: { _id: item.id },
        update: { $set: { slug: item.newSlug } },
      },
    }));

    const result = await Post.bulkWrite(bulkOps, { ordered: true });
    console.log(`Updated ${result.modifiedCount} post slug(s).`);
    console.log('Slug normalization completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Error normalizing slugs:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
  }
}

normalizeAllSlugs();
