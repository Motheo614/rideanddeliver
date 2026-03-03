import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';
import connectDB from '@/lib/db/mongoose';
import Analytics from '@/lib/db/models/Analytics';
import Post from '@/lib/db/models/Post';
import Product from '@/lib/db/models/Product';
import { User } from '@/lib/db/models';

/**
 * GET /api/analytics/overview
 * Get analytics overview for admin dashboard
 * Query params: from (ISO date), to (ISO date), days (number)
 */
export async function GET(request: NextRequest) {
  try {
    // Validate admin session
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    // Check if user is admin
    const currentUser = await User.findOne({ email: session.user.email });
    const isAdmin = currentUser?.role === 'admin' || (session.user as any).role === 'admin';
    
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse date range from query params
    const searchParams = request.nextUrl.searchParams;
    const fromParam = searchParams.get('from');
    const toParam = searchParams.get('to');
    const daysParam = searchParams.get('days');

    let startDate: Date;
    let endDate: Date = new Date();
    endDate.setHours(23, 59, 59, 999);

    if (fromParam && toParam) {
      // Use provided date range
      startDate = new Date(fromParam);
      endDate = new Date(toParam);
      endDate.setHours(23, 59, 59, 999);
    } else if (daysParam) {
      // Use days param (e.g., last 7 days, 30 days)
      const days = parseInt(daysParam);
      startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      startDate.setHours(0, 0, 0, 0);
    } else {
      // Default to last 30 days
      startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
      startDate.setHours(0, 0, 0, 0);
    }

    // Get analytics data for date range
    const analyticsData = await Analytics.find({
      date: { $gte: startDate, $lte: endDate },
    }).lean();

    // Aggregate totals
    const totalPageViews = analyticsData.reduce(
      (sum, day) => sum + (day.pageViews || 0),
      0
    );
    const totalUniqueVisitors = analyticsData.reduce(
      (sum, day) => sum + (day.uniqueVisitors || 0),
      0
    );

    // Get top 5 posts by views
    const topPosts = await Post.find({ status: 'published' })
      .select('title slug views featuredImage category')
      .sort({ views: -1 })
      .limit(5)
      .lean();

    // Get top 5 products by clicks
    const topProducts = await Product.find({ isActive: true })
      .select('productName asin clickCount price imageUrl category')
      .sort({ clickCount: -1 })
      .limit(5)
      .lean();

    // Calculate start of current month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    // Count posts published this month
    const postsPublishedThisMonth = await Post.countDocuments({
      status: 'published',
      publishedAt: { $gte: startOfMonth },
    });

    // Count draft posts
    const draftPostsCount = await Post.countDocuments({
      status: 'draft',
    });

    // Count total published posts
    const totalPublishedPosts = await Post.countDocuments({
      status: 'published',
    });

    // Count total active products
    const totalActiveProducts = await Product.countDocuments({
      isActive: true,
    });

    return NextResponse.json({
      overview: {
        totalPageViews,
        totalUniqueVisitors,
        postsPublishedThisMonth,
        draftPostsCount,
        totalPublishedPosts,
        totalActiveProducts,
      },
      topPosts,
      topProducts,
      dateRange: {
        from: startDate.toISOString(),
        to: endDate.toISOString(),
      },
    });
  } catch (error) {
    console.error('Error fetching analytics overview:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics overview' },
      { status: 500 }
    );
  }
}
