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

const LEGACY_BLOCK_MARKER_REGEX = /blockType:\s*(accent|hero)\s*·\s*productId:\s*([a-f0-9]+)/g;
const PLACEHOLDER_REGEX = /<div\b[^>]*\bdata-product-block(?:=(?:"[^"]*"|'[^']*'|[^\s>]+))?[^>]*>/gi;

function replaceLegacyMarkersWithPlaceholders(content: string) {
  return content.replace(LEGACY_BLOCK_MARKER_REGEX, (_match, blockType: string, productId: string) => {
    const normalizedType = String(blockType).toLowerCase() === 'hero' ? 'hero' : 'accent';
    const normalizedId = String(productId || '').toLowerCase();
    return `<div data-product-block data-block-type="${normalizedType}" data-product-id="${normalizedId}"></div>`;
  });
}

function extractProductBlocksFromPlaceholders(content: string) {
  const blocks: Array<{ blockType: 'accent' | 'hero'; productId: mongoose.Types.ObjectId }> = [];
  const html = String(content || '');

  let match: RegExpExecArray | null;
  while ((match = PLACEHOLDER_REGEX.exec(html)) !== null) {
    const blockHtml = match[0];
    const typeMatch = blockHtml.match(/data-block-type=["'](accent|hero)["']/i);
    const idMatch = blockHtml.match(/data-product-id=["']([^"']+)["']/i);

    const blockType = (typeMatch?.[1]?.toLowerCase() === 'hero' ? 'hero' : 'accent') as 'accent' | 'hero';
    const productIdRaw = String(idMatch?.[1] || '').trim();

    if (!mongoose.Types.ObjectId.isValid(productIdRaw)) continue;

    blocks.push({
      blockType,
      productId: new mongoose.Types.ObjectId(productIdRaw),
    });
  }

  return blocks;
}

function normalizeExistingProductBlocks(existingBlocks: any[]) {
  return (existingBlocks || []).map((block) => ({
    blockType: block?.blockType === 'hero' ? 'hero' : 'accent',
    productId: String(block?.productId || ''),
  }));
}

function normalizeNewProductBlocks(newBlocks: Array<{ blockType: 'accent' | 'hero'; productId: mongoose.Types.ObjectId }>) {
  return newBlocks.map((block) => ({
    blockType: block.blockType,
    productId: String(block.productId),
  }));
}

async function runMigration() {
  try {
    const { default: connectDB } = await import('../lib/db/mongoose');
    const { default: Post } = await import('../lib/db/models/Post');

    await connectDB();
    console.log('Connected to MongoDB');

    const posts = await Post.find({}, '_id content productBlocks').lean();
    console.log(`Found ${posts.length} posts`);

    let migratedCount = 0;

    for (const post of posts as any[]) {
      const originalContent = String(post?.content || '');
      const migratedContent = replaceLegacyMarkersWithPlaceholders(originalContent);
      const rebuiltProductBlocks = extractProductBlocksFromPlaceholders(migratedContent);

      const existingBlocksNormalized = normalizeExistingProductBlocks(post?.productBlocks || []);
      const rebuiltBlocksNormalized = normalizeNewProductBlocks(rebuiltProductBlocks);

      const contentChanged = migratedContent !== originalContent;
      const blocksChanged = JSON.stringify(existingBlocksNormalized) !== JSON.stringify(rebuiltBlocksNormalized);

      if (!contentChanged && !blocksChanged) {
        continue;
      }

      await Post.updateOne(
        { _id: post._id },
        {
          $set: {
            content: migratedContent,
            productBlocks: rebuiltProductBlocks,
          },
        }
      );

      migratedCount += 1;
      console.log(`Migrated post: ${String(post._id)}`);
    }

    console.log(`Migration complete. Migrated ${migratedCount} of ${posts.length} posts.`);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

runMigration();
