import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/requireAdmin';
import connectDB from '@/lib/db/mongoose';
import OutboundClickLog from '@/lib/db/models/OutboundClickLog';
import Product from '@/lib/db/models/Product';
import { getAnalyticsDateRange } from '@/lib/analytics/dateRange';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const { authenticated } = await requireAdmin();
  if (!authenticated) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { startDate, endDate } = getAnalyticsDateRange(request.nextUrl.searchParams);
    const start = new Date(`${startDate}T00:00:00.000Z`);
    const end = new Date(`${endDate}T23:59:59.999Z`);
    await connectDB();

    const [total, groupedRows] = await Promise.all([
      OutboundClickLog.countDocuments({ createdAt: { $gte: start, $lte: end } }),
      OutboundClickLog.aggregate([
        { $match: { createdAt: { $gte: start, $lte: end } } },
        {
          $group: {
            _id: { sourcePage: '$sourcePage', asin: '$asin' },
            slug: { $first: '$slug' },
            clicks: { $sum: 1 },
          },
        },
        { $sort: { clicks: -1 } },
        { $limit: 1000 },
      ]),
    ]);
    const asins = [...new Set(groupedRows.map((row) => row._id.asin))];
    const products = await Product.find({ asin: { $in: asins } })
      .select('asin productName')
      .lean();
    const productNames = new Map(products.map((product) => [product.asin, product.productName]));
    const rows = groupedRows.map((row) => ({
      sourcePage: row._id.sourcePage || '(unknown page)',
      asin: row._id.asin,
      slug: row.slug,
      productName: productNames.get(row._id.asin) || row._id.asin,
      clicks: row.clicks,
    }));

    const byPostMap = new Map<string, number>();
    const byAsinMap = new Map<string, { productName: string; clicks: number }>();
    for (const row of rows) {
      byPostMap.set(row.sourcePage, (byPostMap.get(row.sourcePage) || 0) + row.clicks);
      const asinEntry = byAsinMap.get(row.asin) || { productName: row.productName, clicks: 0 };
      asinEntry.clicks += row.clicks;
      byAsinMap.set(row.asin, asinEntry);
    }

    return NextResponse.json({
      total,
      rows,
      byPost: [...byPostMap]
        .map(([sourcePage, clicks]) => ({
          post: sourcePage.split('?')[0].split('/').filter(Boolean).pop() || '(unknown page)',
          sourcePage,
          clicks,
        }))
        .sort((a, b) => b.clicks - a.clicks),
      byAsin: [...byAsinMap].map(([asin, data]) => ({ asin, ...data })).sort((a, b) => b.clicks - a.clicks),
      dateRange: { from: startDate, to: endDate },
    });
  } catch (error) {
    console.error('Error fetching outbound click analytics:', error);
    return NextResponse.json({ error: 'Failed to fetch outbound click analytics.' }, { status: 500 });
  }
}
