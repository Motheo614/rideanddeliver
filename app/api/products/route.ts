import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';
import connectDB from '@/lib/db/mongoose';
import Product from '@/lib/db/models/Product';
import { User } from '@/lib/db/models';

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

    const body = await request.json();

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
