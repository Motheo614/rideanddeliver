import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongoose';
import Post from '@/lib/db/models/Post';
import { transformPost } from '@/lib/categoryMap';

/**
 * GET /api/posts/featured
 * Fetch featured post for hero banner
 */
export async function GET() {
  try {
    await connectDB();

    const post = await Post.findOne({ 
      status: 'published',
      featured: true 
    })
      .select('title slug excerpt featuredImage category categoryLabel publishedAt readTime tags')
      .sort({ publishedAt: -1 })
      .lean();

    if (!post) {
      return NextResponse.json(
        { error: 'No featured post found' },
        { status: 404 }
      );
    }

    // Transform post to include proper category display names and slugs
    const transformedPost = transformPost(post);

    return NextResponse.json({ post: transformedPost });
  } catch (error) {
    console.error('Error fetching featured post:', error);
    return NextResponse.json(
      { error: 'Failed to fetch featured post' },
      { status: 500 }
    );
  }
}
