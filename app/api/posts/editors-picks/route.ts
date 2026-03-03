import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongoose';
import Post from '@/lib/db/models/Post';

/**
 * GET /api/posts/editors-picks
 * Fetch editor's pick posts
 */
export async function GET() {
  try {
    await connectDB();

    const posts = await Post.find({ 
      status: 'published',
      editorsPick: true 
    })
      .select('title slug excerpt featuredImage category categoryLabel publishedAt readTime')
      .sort({ publishedAt: -1 })
      .limit(5)
      .lean();

    return NextResponse.json({ posts });
  } catch (error) {
    console.error('Error fetching editor\'s picks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch editor\'s picks' },
      { status: 500 }
    );
  }
}
