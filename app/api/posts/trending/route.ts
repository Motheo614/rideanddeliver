import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongoose';
import Post from '@/lib/db/models/Post';
import { transformPost } from '@/lib/categoryMap';

/**
 * GET /api/posts/trending
 * Fetch trending posts
 */
export async function GET() {
  try {
    await connectDB();

    const posts = await Post.find({ 
      status: 'published',
      trending: true 
    })
      .select('title slug excerpt featuredImage category categoryLabel publishedAt readTime tags')
      .sort({ publishedAt: -1 })
      .limit(4)
      .lean();

    // Transform posts to include proper category display names and slugs
    const transformedPosts = posts.map(transformPost);

    return NextResponse.json({ posts: transformedPosts });
  } catch (error) {
    console.error('Error fetching trending posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch trending posts' },
      { status: 500 }
    );
  }
}
