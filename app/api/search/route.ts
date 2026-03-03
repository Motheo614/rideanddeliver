import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongoose';
import Post from '@/lib/db/models/Post';
import Analytics from '@/lib/db/models/Analytics';

/**
 * GET /api/search
 * Search posts using MongoDB text search
 */
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');
    const category = searchParams.get('category');

    // Return empty array if no search query
    if (!query || query.trim() === '') {
      return NextResponse.json({ 
        results: [],
        query: '',
        count: 0 
      });
    }

    // Build search query
    const searchQuery: any = {
      status: 'published',
      $text: { $search: query },
    };

    // Add optional category filter
    if (category) {
      searchQuery.category = category;
    }

    // Execute search with text score sorting
    const results = await Post.find(searchQuery, {
      score: { $meta: 'textScore' },
    })
      .select('title slug excerpt category categoryLabel featuredImage')
      .sort({ score: { $meta: 'textScore' } })
      .limit(10)
      .lean();

    // Log search query to Analytics
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      let analytics = await Analytics.findOne({ date: today });

      if (!analytics) {
        // Create new analytics document for today
        analytics = new Analytics({
          date: today,
          pageViews: 0,
          uniqueVisitors: 0,
          searchQueries: [],
        });
      }

      // Update or add search query to searchQueries array
      const queryIndex = analytics.searchQueries.findIndex(
        (sq: { query: string; count: number }) => sq.query.toLowerCase() === query.toLowerCase()
      );

      if (queryIndex > -1) {
        // Increment count for existing query
        analytics.searchQueries[queryIndex].count += 1;
      } else {
        // Add new search query
        analytics.searchQueries.push({
          query: query.trim(),
          count: 1,
        });
      }

      // Sort search queries by count (descending) and keep top 20
      analytics.searchQueries.sort((a: { query: string; count: number }, b: { query: string; count: number }) => b.count - a.count);
      analytics.searchQueries = analytics.searchQueries.slice(0, 20);

      await analytics.save();
    } catch (analyticsError) {
      // Log error but don't fail the search request
      console.error('Error logging search query to analytics:', analyticsError);
    }

    return NextResponse.json({
      results,
      query: query.trim(),
      count: results.length,
    });
  } catch (error) {
    console.error('Error executing search:', error);
    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500 }
    );
  }
}
