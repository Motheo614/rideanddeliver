import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongoose';
import Analytics from '@/lib/db/models/Analytics';
import Post from '@/lib/db/models/Post';

/**
 * POST /api/analytics/track
 * Track pageviews and searches client-side
 */
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { slug, type, query } = body;

    if (!type || !['pageview', 'search'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid tracking type. Must be "pageview" or "search"' },
        { status: 400 }
      );
    }

    // Get or create today's analytics document
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let analytics = await Analytics.findOne({ date: today });

    if (!analytics) {
      analytics = new Analytics({
        date: today,
        pageViews: 0,
        uniqueVisitors: 0,
        topPosts: [],
        topProducts: [],
        searchQueries: [],
      });
    }

    if (type === 'pageview') {
      if (!slug) {
        return NextResponse.json(
          { error: 'Slug is required for pageview tracking' },
          { status: 400 }
        );
      }

      // Increment global pageviews count
      analytics.pageViews = (analytics.pageViews || 0) + 1;

      // Find and increment post views
      const post = await Post.findOne({ slug });
      
      if (post) {
        post.views = (post.views || 0) + 1;
        await post.save();

        // Update topPosts in analytics
        const postIndex = analytics.topPosts.findIndex(
          (p: { slug: string; title: string; views: number }) => p.slug === slug
        );

        if (postIndex > -1) {
          analytics.topPosts[postIndex].views += 1;
        } else {
          analytics.topPosts.push({
            slug: post.slug,
            title: post.title,
            views: 1,
          });
        }

        // Sort and keep top 10 posts
        analytics.topPosts.sort((a: { slug: string; title: string; views: number }, b: { slug: string; title: string; views: number }) => b.views - a.views);
        analytics.topPosts = analytics.topPosts.slice(0, 10);
      }

      await analytics.save();

      return NextResponse.json({ 
        success: true, 
        type: 'pageview',
        views: post?.views || 0 
      });
    }

    if (type === 'search') {
      if (!query || query.trim() === '') {
        return NextResponse.json(
          { error: 'Query is required for search tracking' },
          { status: 400 }
        );
      }

      // Update or add search query
      const queryIndex = analytics.searchQueries.findIndex(
        (sq: { query: string; count: number }) => sq.query.toLowerCase() === query.toLowerCase()
      );

      if (queryIndex > -1) {
        analytics.searchQueries[queryIndex].count += 1;
      } else {
        analytics.searchQueries.push({
          query: query.trim(),
          count: 1,
        });
      }

      // Sort and keep top 20 search queries
      analytics.searchQueries.sort((a: { query: string; count: number }, b: { query: string; count: number }) => b.count - a.count);
      analytics.searchQueries = analytics.searchQueries.slice(0, 20);

      await analytics.save();

      return NextResponse.json({ 
        success: true, 
        type: 'search',
        query: query.trim() 
      });
    }

    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error tracking analytics:', error);
    return NextResponse.json(
      { error: 'Failed to track event' },
      { status: 500 }
    );
  }
}
