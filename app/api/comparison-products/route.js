import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongoose';
import Product from '@/lib/db/models/Product';

// Maps the comparator's hub-label categories to the real stored Product.category
// values (see app/(admin)/admin/products/page.tsx's categoryOptions/normalizeUiCategory
// for the source of truth on this mapping).
const CATEGORY_QUERY = {
  'safety-gear': { category: 'helmets' },
  'tech-lighting': { category: 'lights' },
  'bike-security': { category: 'locks' },
  'delivery-gear': { category: { $in: ['bags', 'tools', 'clothing', 'accessories'] } },
  // No real products are tagged "platform-reviews" — platform reviews are a
  // content category, not an affiliate product category. Always empty.
  'platform-reviews': null,
};

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');

  if (!category || !(category in CATEGORY_QUERY)) {
    return NextResponse.json(
      { error: `category must be one of: ${Object.keys(CATEGORY_QUERY).join(', ')}` },
      { status: 400 }
    );
  }

  const categoryQuery = CATEGORY_QUERY[category];
  if (!categoryQuery) {
    return NextResponse.json({ products: [] });
  }

  await connectDB();

  const products = await Product.find({ ...categoryQuery, isActive: true })
    .sort({ clickCount: -1, createdAt: -1 })
    .lean();

  return NextResponse.json({
    products: products.map((p) => ({
      name: p.productName,
      affiliateUrl: p.affiliateLink || null,
      reviewSummary: p.editorNote || p.description || null,
    })),
  });
}
