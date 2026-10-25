import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongoose';
import Post from '@/lib/db/models/Post';
import Product from '@/lib/db/models/Product';
import { CATEGORY_MAP } from '@/lib/categoryMap';

const BEST_OVERALL = /best\s+overall/i;

/**
 * GET /api/products/top-picks?limit=8
 * Returns the #1 (hero block) product of recent published roundups, "Best Overall" first.
 * Product -> post link is derived from Post.productBlocks, so no schema change is required.
 */
export async function GET(request: Request) {
  try {
    await connectDB();
    const limitParam = Number.parseInt(new URL(request.url).searchParams.get('limit') || '8', 10);
    const limit = Math.min(Math.max(Number.isFinite(limitParam) ? limitParam : 8, 1), 12);

    const posts = await Post.find({ status: 'published', 'productBlocks.blockType': 'hero' })
      .select('title slug category productBlocks publishedAt')
      .sort({ publishedAt: -1 })
      .limit(80)
      .lean();

    const heroByPost = posts
      .map((post: any) => {
        const hero = (post.productBlocks || []).find((b: any) => b?.blockType === 'hero');
        return hero?.productId ? { post, productId: String(hero.productId) } : null;
      })
      .filter(Boolean) as Array<{ post: any; productId: string }>;

    const products = await Product.find({
      _id: { $in: heroByPost.map((h) => h.productId) },
      isActive: true,
    })
      .select('productName brand asin affiliateLink imageUrl awardLabel pros specs')
      .lean();
    const productById = new Map(products.map((p: any) => [String(p._id), p]));

    const seen = new Set<string>();
    const items: any[] = [];
    for (const { post, productId } of heroByPost) {
      const product: any = productById.get(productId);
      if (!product || seen.has(productId)) continue;
      if (!product.imageUrl || !product.affiliateLink) continue;
      seen.add(productId);

      const pros: string[] = Array.isArray(product.pros) ? product.pros.filter(Boolean) : [];
      const specs: string[] = Array.isArray(product.specs)
        ? product.specs.map((s: any) => `${s.label}: ${s.value}`)
        : [];

      items.push({
        id: productId,
        name: product.productName,
        brand: product.brand || '',
        asin: product.asin || '',
        imageUrl: product.imageUrl,
        affiliateLink: product.affiliateLink,
        badge: product.awardLabel || '',
        isBestOverall: BEST_OVERALL.test(product.awardLabel || ''),
        features: (pros.length ? pros : specs).slice(0, 2),
        roundup: {
          title: post.title,
          slug: post.slug,
          dbCategorySlug: post.category,
          categoryLabel: CATEGORY_MAP[post.category]?.displayName || 'Gear',
        },
      });
    }

    items.sort((a, b) => Number(b.isBestOverall) - Number(a.isBestOverall));
    return NextResponse.json({ products: items.slice(0, limit) });
  } catch (error) {
    console.error('Error fetching top picks:', error);
    return NextResponse.json({ products: [] }, { status: 500 });
  }
}
