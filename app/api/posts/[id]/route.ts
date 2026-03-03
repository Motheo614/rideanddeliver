import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongoose';
import Post from '@/lib/db/models/Post';
import mongoose from 'mongoose';
import { requireAdmin } from '@/lib/auth/requireAdmin';

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

    // Increment views count
    post.views = (post.views || 0) + 1;
    await post.save();

    return NextResponse.json({ post });
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

    // Update post fields and save (this triggers pre-save hooks)
    Object.assign(post, body);
    await post.save();

    return NextResponse.json({ 
      post, 
      message: 'Post updated successfully' 
    });
  } catch (error: any) {
    console.error('Error updating post:', error);

    // Handle duplicate slug error
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'Post with this slug already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update post' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/posts/[id]
 * Archive a post (admin only)
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

    // Set status to 'archived' instead of deleting
    let post;
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

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      message: 'Post archived successfully',
      post 
    });
  } catch (error) {
    console.error('Error archiving post:', error);
    return NextResponse.json(
      { error: 'Failed to archive post' },
      { status: 500 }
    );
  }
}
