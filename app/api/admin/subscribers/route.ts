import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';
import connectDB from '@/lib/db/mongoose';
import User from '@/lib/db/models/User';
import Subscriber from '@/lib/db/models/Subscriber';
import mongoose from 'mongoose';

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

    if (status === 'pending' || status === 'active' || status === 'unsubscribed') {
      filters.status = status;
    }

    const subscribers = await Subscriber.find(filters)
      .select('email status source isVerified verifiedAt subscribedAt unsubscribedAt createdAt')
      .sort({ subscribedAt: -1 })
      .lean();

    if (format === 'csv') {
      const rows = [
        ['email', 'status', 'isVerified', 'source', 'verifiedAt', 'subscribedAt', 'unsubscribedAt', 'createdAt'].join(','),
        ...subscribers.map((sub) => [
          escapeCsv(sub.email || ''),
          escapeCsv(sub.status || ''),
          escapeCsv(String(Boolean(sub.isVerified))),
          escapeCsv(sub.source || ''),
          escapeCsv(sub.verifiedAt ? new Date(sub.verifiedAt).toISOString() : ''),
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
        isVerified: sub.status === 'active' ? sub.isVerified !== false : Boolean(sub.isVerified),
        _id: sub._id.toString(),
      })),
      total: subscribers.length,
    });
  } catch (error) {
    console.error('Get subscribers error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/subscribers?id=<subscriberId>
 * Admin-only subscriber delete
 */
export async function DELETE(request: NextRequest) {
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
    const subscriberId = (searchParams.get('id') || '').trim();
    let ids: string[] = [];

    if (subscriberId) {
      ids = [subscriberId];
    } else {
      try {
        const body = await request.json();
        if (Array.isArray(body?.ids)) {
          ids = body.ids
            .map((value: unknown) => (typeof value === 'string' ? value.trim() : ''))
            .filter(Boolean);
        }
      } catch {
        ids = [];
      }
    }

    if (ids.length === 0) {
      return NextResponse.json({ error: 'Subscriber id(s) are required' }, { status: 400 });
    }

    const hasInvalidId = ids.some((id) => !mongoose.Types.ObjectId.isValid(id));

    if (hasInvalidId) {
      return NextResponse.json({ error: 'One or more subscriber ids are invalid' }, { status: 400 });
    }

    const result = await Subscriber.deleteMany({ _id: { $in: ids } });

    if (!result.deletedCount) {
      return NextResponse.json({ error: 'Subscriber not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      deletedIds: ids,
      deletedCount: result.deletedCount,
      message: result.deletedCount === 1 ? 'Subscriber deleted successfully' : `${result.deletedCount} subscribers deleted successfully`,
    });
  } catch (error) {
    console.error('Delete subscriber error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
