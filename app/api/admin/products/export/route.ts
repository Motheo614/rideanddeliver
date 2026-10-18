import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';
import connectDB from '@/lib/db/mongoose';
import Product from '@/lib/db/models/Product';
import User from '@/lib/db/models/User';

const exportFields = [
  '_id',
  'productName',
  'brand',
  'asin',
  'affiliateLink',
  'category',
  'price',
  'imageUrl',
  'rating',
  'awardLabel',
  'score',
  'reviewCount',
  'stars',
  'specs',
  'editorNote',
  'jumpTargetId',
  'specifications',
  'isActive',
  'clickCount',
  'commissionRate',
  'estimatedEarnings',
  'lastClickDate',
  'createdAt',
  'updatedAt',
] as const;

function toCsvValue(value: unknown): string {
  if (value === undefined || value === null) {
    return '""';
  }

  const serializedValue = value instanceof Date
    ? value.toISOString()
    : value instanceof Map
      ? JSON.stringify(Object.fromEntries(value))
      : typeof value === 'object'
        ? JSON.stringify(value)
        : String(value);

  return `"${serializedValue.replace(/"/g, '""')}"`;
}

export async function GET() {
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

    const products = await Product.find({})
      .select(exportFields.join(' '))
      .sort({ createdAt: -1 })
      .lean();
    const csvRows = [
      exportFields.map(toCsvValue).join(','),
      ...products.map((product) => exportFields
        .map((field) => toCsvValue(product[field as keyof typeof product]))
        .join(',')),
    ];

    return new NextResponse(csvRows.join('\r\n'), {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="products-${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  } catch (error) {
    console.error('Export products error:', error);
    return NextResponse.json({ error: 'Failed to export products' }, { status: 500 });
  }
}
