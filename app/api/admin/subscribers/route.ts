import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';
import connectDB from '@/lib/db/mongoose';
import User from '@/lib/db/models/User';
import Subscriber from '@/lib/db/models/Subscriber';

function escapeCsv(value: string) {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/**
 * GET /api/admin/subscribers
 * Admin-only subscriber list and CSV export
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const currentUser = await User.findOne({ email: session.user.email });
    const isAdmin = currentUser?.role === 'admin' || (session.user as any).role === 'admin';

    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const format = (searchParams.get('format') || 'json').toLowerCase();
    const query = (searchParams.get('q') || '').trim();
    const status = (searchParams.get('status') || '').trim();

    const filters: Record<string, unknown> = {};

    if (query) {
      filters.email = { $regex: query, $options: 'i' };
    }

    if (status === 'active' || status === 'unsubscribed') {
      filters.status = status;
    }

    const subscribers = await Subscriber.find(filters)
      .select('email status source subscribedAt unsubscribedAt createdAt')
      .sort({ subscribedAt: -1 })
      .lean();

    if (format === 'csv') {
      const rows = [
        ['email', 'status', 'source', 'subscribedAt', 'unsubscribedAt', 'createdAt'].join(','),
        ...subscribers.map((sub) => [
          escapeCsv(sub.email || ''),
          escapeCsv(sub.status || ''),
          escapeCsv(sub.source || ''),
          escapeCsv(sub.subscribedAt ? new Date(sub.subscribedAt).toISOString() : ''),
          escapeCsv(sub.unsubscribedAt ? new Date(sub.unsubscribedAt).toISOString() : ''),
          escapeCsv(sub.createdAt ? new Date(sub.createdAt).toISOString() : ''),
        ].join(',')),
      ];

      const csv = rows.join('\n');

      return new NextResponse(csv, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="subscribers-${new Date().toISOString().slice(0, 10)}.csv"`,
        },
      });
    }

    return NextResponse.json({
      subscribers: subscribers.map((sub) => ({
        ...sub,
        _id: sub._id.toString(),
      })),
      total: subscribers.length,
    });
  } catch (error) {
    console.error('Get subscribers error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
