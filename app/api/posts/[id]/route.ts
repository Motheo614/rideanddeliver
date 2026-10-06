import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongoose';
import Post from '@/lib/db/models/Post';
import Product from '@/lib/db/models/Product';
import mongoose from 'mongoose';
import { requireAdmin } from '@/lib/auth/requireAdmin';
import { transformPost } from '@/lib/categoryMap';
import { getSlugLookupCandidates } from '@/lib/slug';
import { computeContentHash } from '@/lib/contentHash';
import { decideContentUpdate } from '@/lib/contentUpdateDecision';
import { getClientPostUpdates } from '@/lib/postUpdateFields';

function extractProductBlocksFromContent(content: string) {
  const html = String(content || '')
    .replace(/\[\[PRODUCT_BLOCK\|(accent|hero)\|([a-f0-9]{24})(?:\|[^\]]*)?\]\]/gi, (_match, blockType: string, productId: string) => {
      const normalizedType = String(blockType).toLowerCase() === 'hero' ? 'hero' : 'accent';
      const normalizedId = String(productId || '').toLowerCase();
      return `<div data-product-block="true" data-block-type="${normalizedType}" data-product-id="${normalizedId}"></div>`;
    })
    .replace(/blockType:\s*(accent|hero)\s*(?:\u00B7|\u00C2\u00B7)\s*productId:\s*([a-f0-9]{24})/gi, (_match, blockType: string, productId: string) => {
      const normalizedType = String(blockType).toLowerCase() === 'hero' ? 'hero' : 'accent';
      const normalizedId = String(productId || '').toLowerCase();
      return `<div data-product-block="true" data-block-type="${normalizedType}" data-product-id="${normalizedId}"></div>`;
    });
  const blocks: Array<{ blockType: 'accent' | 'hero'; productId: mongoose.Types.ObjectId }> = [];
  const blockRegex = /<div\b[^>]*\bdata-product-block(?:=(?:"[^"]*"|'[^']*'|[^\s>]+))?[^>]*>/gi;

  let match: RegExpExecArray | null;
  while ((match = blockRegex.exec(html)) !== null) {
    const blockHtml = match[0];
    const typeMatch = blockHtml.match(/data-block-type=["'](accent|hero)["']/i);
    const idMatch = blockHtml.match(/data-product-id=["']([^"']+)["']/i);

    const blockType = (typeMatch?.[1]?.toLowerCase() === 'hero' ? 'hero' : 'accent') as 'accent' | 'hero';
    const productId = String(idMatch?.[1] || '').trim();

    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) continue;
    blocks.push({ blockType, productId: new mongoose.Types.ObjectId(productId) });
  }

  return blocks;
}

async function findPostByIdOrSlug(id: string) {
  if (mongoose.Types.ObjectId.isValid(id)) {
    const byId = await Post.findById(id);
    if (byId) return byId;
  }

  const slugCandidates = getSlugLookupCandidates(id);
  return Post.findOne({ slug: { $in: slugCandidates } });
}

/**
 * GET /api/posts/[id]
 * Fetch a single post by ID or slug and increment views
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;

    const rawMode = request.nextUrl.searchParams.get('raw') === 'true';

    // Try to find by MongoDB _id first, then by slug variants
    const post = await findPostByIdOrSlug(id);

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    // In raw mode (admin editor), return raw DB values and do not increment views.
    if (rawMode) {
      return NextResponse.json({ post });
    }

    // Increment views count for public reads.
    // Use updateOne with $inc so Mongoose's pre-save hook does NOT run and
    // updatedAt is NOT bumped — view counts are not editorial changes.
    await Post.updateOne({ _id: post._id }, { $inc: { views: 1 } });

    // Re-fetch the post after the view increment so the returned document is fresh.
    const freshPost = await findPostByIdOrSlug(id);
    if (!freshPost) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Transform post to include proper category display names and slugs
    const transformedPost = transformPost(freshPost) as any;

    const storedProductBlocks = Array.isArray((freshPost as any).productBlocks)
      ? (freshPost as any).productBlocks
      : extractProductBlocksFromContent(String((transformedPost as any).content || ''));
    let hydratedProductsById: Record<string, any> = {};

    const objectIds = storedProductBlocks
      .map((block: any) => String(block?.productId || '').trim())
      .filter((id: string) => mongoose.Types.ObjectId.isValid(id));

    if (objectIds.length > 0) {
      const products = await Product.find({ _id: { $in: objectIds } })
        .select('productName affiliateLink imageUrl awardLabel score pros cons specs editorNote jumpTargetId description')
        .lean();

      hydratedProductsById = Object.fromEntries(
        products.map((product: any) => [String(product._id).trim().toLowerCase(), product])
      );
    }

    const productBlocksWithData = storedProductBlocks.map((block: any) => {
      const productId = String(block?.productId || '').trim().toLowerCase();
      return {
        blockType: block?.blockType === 'hero' ? 'hero' : 'accent',
        productId,
        product: hydratedProductsById[productId] || null,
      };
    });

    return NextResponse.json({
      post: {
        ...transformedPost,
        isEditorsPick: Boolean((transformedPost as any).editorsPick),
        productBlocks: productBlocksWithData,
      },
    });
  } catch (error) {
    console.error('Error fetching post:', error);
    return NextResponse.json(
      { error: 'Failed to fetch post' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/posts/[id]
 * Update a post (admin only)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const { authenticated } = await requireAdmin();
    if (!authenticated) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const { id } = await params;
    const body = await request.json();

    // Find post first
    const post = await findPostByIdOrSlug(id);

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    // Server-owned dates are excluded from client updates.
    Object.assign(post, getClientPostUpdates(body));

    const normalizedContent = String((post as any).content || '');
    (post as any).content = normalizedContent;
    (post as any).productBlocks = extractProductBlocksFromContent(normalizedContent);

    // Only changes to hash-relevant editorial content and the minor-edit flag
    // determine whether contentUpdatedAt advances.
    const incomingHash = computeContentHash({
      title: (post as any).title,
      content: normalizedContent,
      productBlocks: (post as any).productBlocks,
    });

    const storedHash: string | undefined = (post as any).contentHash;
    const isMinorEdit = Boolean(body.minorEdit);
    const updateDecision = decideContentUpdate({
      storedHash,
      newHash: incomingHash,
      minorEdit: isMinorEdit,
    });

    if (updateDecision !== 'none') {
      (post as any).contentHash = incomingHash;
    }
    if (updateDecision === 'bump') {
      (post as any).contentUpdatedAt = new Date();
    }

    await post.save();

    return NextResponse.json({ 
      post, 
      message: 'Post updated successfully' 
    });
  } catch (error: any) {
    console.error('Error updating post:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      errors: error.errors,
      stack: error.stack?.split('\n').slice(0, 3),
    });

    // Handle duplicate slug error
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'Post with this slug already exists' },
        { status: 409 }
      );
    }

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors || {})
        .map((err: any) => err.message)
        .join(', ');
      return NextResponse.json(
        { error: `Validation failed: ${messages}` },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: `Failed to update post: ${error.message}` },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/posts/[id]
 * Delete or archive a post (admin only)
 * Use ?permanent=true to permanently delete instead of archiving
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const { authenticated } = await requireAdmin();
    if (!authenticated) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const { id } = await params;
    const { searchParams } = request.nextUrl;
    const permanent = searchParams.get('permanent') === 'true';

    let post;

    if (permanent) {
      // Permanently delete the post
      if (mongoose.Types.ObjectId.isValid(id)) {
        post = await Post.findByIdAndDelete(id);
      }

      if (!post) {
        post = await Post.findOneAndDelete({ slug: { $in: getSlugLookupCandidates(id) } });
      }
    } else {
      // Archive the post (soft delete)
      if (mongoose.Types.ObjectId.isValid(id)) {
        post = await Post.findByIdAndUpdate(
          id,
          { status: 'archived' },
          { new: true }
        );
      }

      if (!post) {
        post = await Post.findOneAndUpdate(
          { slug: { $in: getSlugLookupCandidates(id) } },
          { status: 'archived' },
          { new: true }
        );
      }
    }

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    const message = permanent ? 'Post deleted permanently' : 'Post archived successfully';
    
    return NextResponse.json({ 
      message,
      post: permanent ? null : post
    });
  } catch (error) {
    console.error('Error deleting/archiving post:', error);
    return NextResponse.json(
      { error: 'Failed to delete/archive post' },
      { status: 500 }
    );
  }
}
