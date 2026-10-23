import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/requireAdmin';
import { getAnalyticsDateRange } from '@/lib/analytics/dateRange';
import { getGSCAnalytics } from '@/lib/analytics/gscService';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const { authenticated } = await requireAdmin();
  if (!authenticated) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { startDate, endDate } = getAnalyticsDateRange(request.nextUrl.searchParams);
    const analytics = await getGSCAnalytics(startDate, endDate);
    return NextResponse.json({ ...analytics, dateRange: { from: startDate, to: endDate } });
  } catch (error) {
    console.error('Error fetching Search Console analytics:', error);
    return NextResponse.json(
      { error: 'Search Console analytics are temporarily unavailable.' },
      { status: 503 }
    );
  }
}
