import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';

function loadLocalEnv() {
  if (process.env.MONGODB_URI) return;

  const envPath = path.join(process.cwd(), '.env.local');
  if (!fs.existsSync(envPath)) return;

  const content = fs.readFileSync(envPath, 'utf8');
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const eqIndex = line.indexOf('=');
    if (eqIndex <= 0) continue;

    const key = line.slice(0, eqIndex).trim();
    let value = line.slice(eqIndex + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }

    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

loadLocalEnv();

function estimateReadTimeFromHtml(html: string): number {
  const text = (html || '')
    .replace(/&nbsp;/g, ' ')
    .replace(/\u00A0/g, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const words = text ? text.split(' ').length : 0;
  return Math.max(1, Math.ceil(words / 200));
}

async function backfillReadTime() {
  try {
    const { default: connectDB } = await import('../lib/db/mongoose');
    const { default: Post } = await import('../lib/db/models/Post');

    await connectDB();
    console.log('Connected to MongoDB');

    const posts = await Post.find({}, 'title content readTime').lean();
    console.log(`Found ${posts.length} posts`);

    let updated = 0;

    for (const post of posts) {
      const estimated = estimateReadTimeFromHtml((post as any).content || '');
      const current = Number((post as any).readTime || 0);

      if (!Number.isFinite(current) || current <= 0 || current !== estimated) {
        await Post.updateOne({ _id: (post as any)._id }, { $set: { readTime: estimated } });
        updated += 1;
        console.log(`Updated readTime: ${(post as any).title} -> ${estimated} min`);
      }
    }

    console.log(`\nDone. Updated ${updated} of ${posts.length} posts.`);
  } catch (error) {
    console.error('Backfill failed:', error);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

backfillReadTime();
