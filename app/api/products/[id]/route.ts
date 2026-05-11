import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';
import connectDB from '@/lib/db/mongoose';
import Product from '@/lib/db/models/Product';
import { User } from '@/lib/db/models';
import mongoose from 'mongoose';

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

const normalizeUpdatePayload = (payload: any) => {
  const normalized = { ...payload };

  if ('asin' in normalized) {
    normalized.asin = String(normalized.asin || '').trim().toUpperCase();
  }

  if ('productName' in normalized) {
    normalized.productName = String(normalized.productName || '').trim();
  }

  if ('affiliateLink' in normalized) {
    normalized.affiliateLink = String(normalized.affiliateLink || '').trim();
  }

  if ('awardLabel' in normalized) {
    normalized.awardLabel = String(normalized.awardLabel || '').trim();
  }

  if ('editorNote' in normalized) {
    normalized.editorNote = String(normalized.editorNote || '').trim();
  }

  if ('score' in normalized) {
    normalized.score = toOptionalNumber(normalized.score);
  }

  if ('reviewCount' in normalized) {
    normalized.reviewCount = toOptionalNumber(normalized.reviewCount, true);
  }

  if ('stars' in normalized) {
    normalized.stars = toOptionalNumber(normalized.stars);
  }

  if ('pros' in normalized) {
    normalized.pros = normalizeStringArray(normalized.pros);
  }

  if ('cons' in normalized) {
    normalized.cons = normalizeStringArray(normalized.cons);
  }

  if ('specs' in normalized) {
    normalized.specs = normalizeSpecs(normalized.specs);
  }

  if ('jumpTargetId' in normalized || 'productName' in normalized) {
    const jumpTargetRaw = String(normalized.jumpTargetId || '').trim();
    const fallbackName = String(normalized.productName || '').trim();
    normalized.jumpTargetId = toJumpTargetId(jumpTargetRaw || fallbackName);
  }

  return normalized;
};

/**
 * GET /api/products/[id]
 * Fetch a single product by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;

    let product;
    if (mongoose.Types.ObjectId.isValid(id)) {
      product = await Product.findById(id);
    } else {
      // Try to find by ASIN if not a valid MongoDB ID
      product = await Product.findOne({ asin: id.toUpperCase() });
    }

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ product });
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/products/[id]
 * Update a product (admin only)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const body = normalizeUpdatePayload(await request.json());

    // Find and update product
    let product;
    if (mongoose.Types.ObjectId.isValid(id)) {
      product = await Product.findByIdAndUpdate(id, body, {
        new: true,
        runValidators: true,
      });
    } else {
      product = await Product.findOneAndUpdate(
        { asin: id.toUpperCase() },
        body,
        {
          new: true,
          runValidators: true,
        }
      );
    }

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      product,
      message: 'Product updated successfully',
    });
  } catch (error: any) {
    console.error('Error updating product:', error);

    // Handle duplicate ASIN error
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'Product with this ASIN already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/products/[id]
 * Deactivate a product (admin only)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;

    // Set isActive to false instead of deleting
    let product;
    if (mongoose.Types.ObjectId.isValid(id)) {
      product = await Product.findByIdAndUpdate(
        id,
        { isActive: false },
        { new: true }
      );
    } else {
      product = await Product.findOneAndUpdate(
        { asin: id.toUpperCase() },
        { isActive: false },
        { new: true }
      );
    }

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Product deactivated successfully',
      product,
    });
  } catch (error) {
    console.error('Error deactivating product:', error);
    return NextResponse.json(
      { error: 'Failed to deactivate product' },
      { status: 500 }
    );
  }
}
