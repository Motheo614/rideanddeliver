import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongoose';
import Post from '@/lib/db/models/Post';
import mongoose from 'mongoose';
import { requireAdmin } from '@/lib/auth/requireAdmin';
import { transformPost } from '@/lib/categoryMap';

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

    // Try to find by MongoDB _id first, then by slug
    let post;
    if (mongoose.Types.ObjectId.isValid(id)) {
      post = await Post.findById(id);
    }
    
    if (!post) {
      post = await Post.findOne({ slug: id });
    }

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

    // Increment views count for public reads
    post.views = (post.views || 0) + 1;
    await post.save();

    // Transform post to include proper category display names and slugs
    const transformedPost = transformPost(post);

    return NextResponse.json({ post: transformedPost });
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
    let post;
    if (mongoose.Types.ObjectId.isValid(id)) {
      post = await Post.findById(id);
    } else {
      post = await Post.findOne({ slug: id });
    }

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    // Update post fields selectively to avoid validation issues
    const allowedFields: (keyof typeof body)[] = [
      'title', 'slug', 'excerpt', 'content', 'featuredImage',
      'category', 'categoryLabel', 'tags', 'author', 'amazonProducts',
      'seoMetadata', 'status', 'publishedAt', 'readTime',
      'featured', 'trending', 'editorsPick'
    ];

    allowedFields.forEach(field => {
      if (field in body) {
        (post as any)[field] = body[field];
      }
    });

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
      } else {
        post = await Post.findOneAndDelete({ slug: id });
      }
    } else {
      // Archive the post (soft delete)
      if (mongoose.Types.ObjectId.isValid(id)) {
        post = await Post.findByIdAndUpdate(
          id,
          { status: 'archived' },
          { new: true }
        );
      } else {
        post = await Post.findOneAndUpdate(
          { slug: id },
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
