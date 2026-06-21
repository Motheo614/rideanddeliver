import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongoose';
import Post from '@/lib/db/models/Post';
import mongoose from 'mongoose';
import { requireAdmin } from '@/lib/auth/requireAdmin';
import { transformPost } from '@/lib/categoryMap';

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

/**
 * GET /api/posts
 * Fetch posts with pagination and filtering
 */
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const category = searchParams.get('category');
    const status = searchParams.get('status') || 'published';
    const sort = searchParams.get('sort') || 'publishedAt';
    const search = searchParams.get('search');

    // Build query
    const query: any = {};

    // Add search functionality
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // For admin requests, allow different status filters
    const { authenticated } = await requireAdmin();
    if (authenticated) {
      // If status is 'all', don't filter by status
      if (status && status !== 'all') {
        query.status = status;
      }
    } else {
      // Non-admin users can only see published posts
      query.status = 'published';
    }

    if (category) {
      query.category = category;
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Build sort object
    const sortObj: any = {};
    if (sort === 'createdAt') {
      sortObj.createdAt = -1;
    } else {
      sortObj.publishedAt = -1;
    }

    // Fetch posts with selected fields only
    const posts = await Post.find(query)
      .select('title slug excerpt featuredImage category categoryLabel publishedAt readTime featured trending editorsPick status views createdAt tags')
      .sort(sortObj)
      .skip(skip)
      .limit(limit)
      .lean();

    // Get total count for pagination
    const total = await Post.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    // Transform posts to include proper category display names and slugs
    const transformedPosts = posts.map((post) => {
      const transformed = transformPost(post as any) as any;
      return {
        ...transformed,
        isEditorsPick: Boolean(transformed.editorsPick),
      };
    });

    return NextResponse.json({
      posts: transformedPosts,
      total,
      page,
      totalPages,
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/posts
 * Create a new post (admin only)
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const { authenticated } = await requireAdmin();
    if (!authenticated) {
      return NextResponse.json(
        { error: 'Unauthorized - Please login as admin' },
        { status: 401 }
      );
    }

    await connectDB();

    const body = await request.json();

    // Validate required fields
    const { title, excerpt, content, category } = body;
    if (!title || !excerpt || !content || !category) {
      return NextResponse.json(
        { error: 'Missing required fields: title, excerpt, content, category' },
        { status: 400 }
      );
    }

    const normalizedContent = String(body.content || '');
    const productBlocks = extractProductBlocksFromContent(normalizedContent);

    // Create new post
    const post = new Post({
      ...body,
      content: normalizedContent,
      productBlocks,
      // Slug will be auto-generated by pre-save hook if not provided
    });

    await post.save();

    return NextResponse.json(
      { post, message: 'Post created successfully' },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating post:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      name: error.name,
    });
    
    // Handle duplicate slug error
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'Post with this slug already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: `Failed to create post: ${error.message}` },
      { status: 500 }
    );
  }
}
