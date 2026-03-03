import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';
import connectDB from '@/lib/db/mongoose';
import Analytics from '@/lib/db/models/Analytics';
import { User } from '@/lib/db/models';

/**
 * GET /api/analytics/pageviews
 * Get daily pageviews for charts
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
      // Use days param
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

    // Fetch analytics data for the period
    const analyticsData = await Analytics.find({
      date: { $gte: startDate, $lte: endDate },
    })
      .select('date pageViews uniqueVisitors')
      .sort({ date: 1 })
      .lean();

    // Create a map for quick lookup
    const analyticsMap = new Map();
    analyticsData.forEach((entry) => {
      const dateStr = entry.date.toISOString().split('T')[0];
      analyticsMap.set(dateStr, {
        pageViews: entry.pageViews || 0,
        uniqueVisitors: entry.uniqueVisitors || 0,
      });
    });

    // Calculate number of days in range
    const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

    // Generate array with all dates, filling missing ones with 0
    const dailyData = [];
    for (let i = 0; i <= daysDiff; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];

      const data = analyticsMap.get(dateStr) || {
        pageViews: 0,
        uniqueVisitors: 0,
      };

      dailyData.push({
        date: dateStr,
        views: data.pageViews,
        visitors: data.uniqueVisitors,
      });
    }

    return NextResponse.json({
      data: dailyData,
      total: dailyData.reduce((sum, day) => sum + day.views, 0),
      dateRange: {
        from: startDate.toISOString(),
        to: endDate.toISOString(),
      },
    });
  } catch (error) {
    console.error('Error fetching pageviews data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pageviews data' },
      { status: 500 }
    );
  }
}
