/**
 * Read-only report of Amazon-hosted image URLs on published posts and products.
 *
 * Usage:
 *   npx tsx scripts/report-amazon-images.ts
 */

import 'dotenv/config';
import mongoose from 'mongoose';
import { isAmazonHostedImage } from '../lib/seo/schema';

type ImageHit = {
  source: string;
  url: string;
};

function getPostImageHits(post: Record<string, any>): ImageHit[] {
  const hits: ImageHit[] = [];
  const featuredImage = typeof post.featuredImage === 'string'
    ? post.featuredImage
    : post.featuredImage?.url;

  if (typeof featuredImage === 'string' && isAmazonHostedImage(featuredImage)) {
    hits.push({ source: 'featuredImage', url: featuredImage });
  }

  for (const [index, product] of (post.amazonProducts || []).entries()) {
    const url = String(product?.image || '');
    if (isAmazonHostedImage(url)) {
      hits.push({ source: `amazonProducts[${index}].image`, url });
    }
  }

  const content = String(post.content || '');
  const imageTagPattern = /<img\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/gi;
  let match: RegExpExecArray | null;
  while ((match = imageTagPattern.exec(content)) !== null) {
    const url = match[1];
    if (isAmazonHostedImage(url)) {
      hits.push({ source: 'content img', url });
    }
  }

  return hits;
}

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI is not set');

  await mongoose.connect(uri);

  try {
    const posts = await mongoose.connection
      .collection('posts')
      .find({ status: 'published' })
      .project({ slug: 1, title: 1, featuredImage: 1, amazonProducts: 1, content: 1 })
      .toArray();
    const products = await mongoose.connection
      .collection('products')
      .find({})
      .project({ productName: 1, imageUrl: 1 })
      .toArray();

    console.log(`\n=== Amazon-hosted images in ${posts.length} published posts ===\n`);
    let postHits = 0;
    for (const post of posts) {
      const hits = getPostImageHits(post);
      if (hits.length === 0) continue;
      postHits += hits.length;
      console.log(`Post: ${String(post.title || post.slug || post._id)}`);
      for (const hit of hits) {
        console.log(`  - ${hit.source}: ${hit.url}`);
      }
    }
    if (postHits === 0) console.log('No Amazon-hosted post images found.');

    console.log(`\n=== Amazon-hosted images in ${products.length} products ===\n`);
    let productHits = 0;
    for (const product of products) {
      const url = String(product.imageUrl || '');
      if (!isAmazonHostedImage(url)) continue;
      productHits += 1;
      console.log(`Product: ${String(product.productName || product._id)} — ${url}`);
    }
    if (productHits === 0) console.log('No Amazon-hosted product images found.');
  } finally {
    await mongoose.disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
