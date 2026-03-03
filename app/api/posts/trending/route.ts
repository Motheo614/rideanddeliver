import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongoose';
import Post from '@/lib/db/models/Post';

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
      .select('title slug excerpt featuredImage category categoryLabel publishedAt readTime')
      .sort({ publishedAt: -1 })
      .limit(4)
      .lean();

    return NextResponse.json({ posts });
  } catch (error) {
    console.error('Error fetching trending posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch trending posts' },
      { status: 500 }
    );
  }
}
