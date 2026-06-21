import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';
import connectDB from '@/lib/db/mongoose';
import Product from '@/lib/db/models/Product';
import { User } from '@/lib/db/models';

const toJumpTargetId = (value: string) => {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
};

const toOptionalNumber = (value: unknown, integer = false) => {
  if (value === undefined || value === null || value === '') return undefined;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return undefined;
  return integer ? Math.max(0, Math.round(parsed)) : parsed;
};

const normalizeStringArray = (value: unknown) => {
  if (!Array.isArray(value)) return [] as string[];
  return value
    .map((item) => String(item || '').trim())
    .filter(Boolean);
};

const normalizeSpecs = (value: unknown) => {
  if (!Array.isArray(value)) return [] as Array<{ label: string; value: string }>;
  return value
    .map((item: any) => ({
      label: String(item?.label || '').trim(),
      value: String(item?.value || '').trim(),
    }))
    .filter((item) => item.label && item.value);
};

const normalizeProductPayload = (payload: any) => {
  const productName = String(payload?.productName || '').trim();
  const jumpTargetRaw = String(payload?.jumpTargetId || '').trim();

  return {
    ...payload,
    productName,
    asin: String(payload?.asin || '').trim().toUpperCase(),
    affiliateLink: String(payload?.affiliateLink || '').trim(),
    category: String(payload?.category || '').trim(),
    price: String(payload?.price || '').trim(),
    imageUrl: String(payload?.imageUrl || '').trim(),
    description: String(payload?.description || '').trim(),
    awardLabel: String(payload?.awardLabel || '').trim(),
    score: toOptionalNumber(payload?.score),
    reviewCount: toOptionalNumber(payload?.reviewCount, true),
    stars: toOptionalNumber(payload?.stars),
    pros: normalizeStringArray(payload?.pros),
    cons: normalizeStringArray(payload?.cons),
    specs: normalizeSpecs(payload?.specs),
    editorNote: String(payload?.editorNote || '').trim(),
    jumpTargetId: toJumpTargetId(jumpTargetRaw || productName),
  };
};

/**
 * GET /api/products
 * Fetch products with optional filters
 * Query params: category, includeInactive (admin only), search
 */
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');
    const includeInactive = searchParams.get('includeInactive') === 'true';
    const search = searchParams.get('search');

    // Check if requesting all products (admin feature)
    if (includeInactive) {
      const session = await getServerSession(authOptions);
      if (!session?.user?.email) {
        return NextResponse.json({ products: [] });
      }

      const currentUser = await User.findOne({ email: session.user.email });
      const isAdmin = currentUser?.role === 'admin' || (session.user as any).role === 'admin';
      
      if (!isAdmin) {
        return NextResponse.json({ products: [] });
      }
    }

    // Build query
    const query: any = includeInactive ? {} : { isActive: true };

    if (category) {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { productName: { $regex: search, $options: 'i' } },
        { asin: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const products = await Product.find(query)
      .sort({ clickCount: -1, createdAt: -1 })
      .lean();

    return NextResponse.json({ products });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/products
 * Create a new product (admin only)
 */
export async function POST(request: NextRequest) {
  try {
    // Validate admin session
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    // Check if user is admin
    const currentUser = await User.findOne({ email: session.user.email });
    const isAdmin = currentUser?.role === 'admin' || (session.user as any).role === 'admin';
    
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = normalizeProductPayload(await request.json());

    // Validate required fields
    const { productName, asin, affiliateLink, category } = body;
    if (!productName || !asin || !affiliateLink || !category) {
      return NextResponse.json(
        { error: 'Missing required fields: productName, asin, affiliateLink, category' },
        { status: 400 }
      );
    }

    // Check if ASIN already exists
    const existingProduct = await Product.findOne({ asin: asin.toUpperCase() });
    if (existingProduct) {
      return NextResponse.json(
        { error: 'Product with this ASIN already exists' },
        { status: 409 }
      );
    }

    // Create new product
    const product = new Product(body);
    await product.save();

    return NextResponse.json(
      { product, message: 'Product created successfully' },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating product:', error);

    // Handle duplicate ASIN error
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'Product with this ASIN already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }
}


