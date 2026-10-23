import { createHmac } from 'node:crypto';
import { after, NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongoose';
import OutboundClickLog from '@/lib/db/models/OutboundClickLog';
import Product from '@/lib/db/models/Product';

export const runtime = 'nodejs';

const ASIN_PATTERN = /^[A-Z0-9]{10}$/;
const SLUG_PATTERN = /^[a-z0-9][a-z0-9-]{0,119}$/i;
const AMAZON_HOST_PATTERN =
  /^([a-z0-9-]+\.)*amazon\.(com|ca|de|fr|it|es|nl|se|pl|sg|ae|in|sa|com\.mx|com\.br|co\.uk|co\.jp|com\.au|com\.tr)$|^(www\.)?amzn\.(to|eu|in)$/i;

function boundedParam(value: string | null, maxLength: number): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed.slice(0, maxLength) : undefined;
}

function getSafeAmazonUrl(value: string): URL | null {
  try {
    const url = new URL(value);
    if (
      url.protocol !== 'https:'
      || url.username
      || url.password
      || url.toString().length > 2048
      || !AMAZON_HOST_PATTERN.test(url.hostname)
    ) return null;
    return url;
  } catch {
    return null;
  }
}

function getSourcePage(value: string | null): string {
  const page = boundedParam(value, 2048);
  return page?.startsWith('/') && !page.startsWith('//') ? page : '';
}

function hashIp(request: NextRequest): string | undefined {
  const secret = process.env.NEXTAUTH_SECRET;
  const forwardedFor = request.headers.get('x-forwarded-for');
  const ip = forwardedFor?.split(',')[0]?.trim() || request.headers.get('x-real-ip')?.trim();
  if (!secret || !ip) return undefined;
  return createHmac('sha256', secret).update(ip).digest('hex');
}

export async function GET(request: NextRequest, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;
  const asin = request.nextUrl.searchParams.get('asin')?.trim().toUpperCase() || '';
  if (!SLUG_PATTERN.test(slug) || !ASIN_PATTERN.test(asin)) {
    return NextResponse.json({ error: 'A valid link slug and ASIN are required.' }, { status: 400 });
  }

  try {
    await connectDB();
    const product = await Product.findOne({ asin, isActive: true })
      .select('asin affiliateLink')
      .lean();
    if (!product) {
      return NextResponse.json({ error: 'Affiliate product not found.' }, { status: 404 });
    }

    const destination = getSafeAmazonUrl(product.affiliateLink);
    if (!destination) {
      console.error('Refusing affiliate redirect to a non-Amazon URL for ASIN:', asin);
      return NextResponse.json({ error: 'Affiliate destination is not valid.' }, { status: 502 });
    }

    const searchParams = request.nextUrl.searchParams;
    const click = {
      slug,
      asin,
      destinationUrl: destination.toString(),
      sourcePage: getSourcePage(searchParams.get('page')),
      trackingId: boundedParam(searchParams.get('trackingId'), 128),
      ipHash: hashIp(request),
      userAgent: boundedParam(request.headers.get('user-agent'), 512),
      utmSource: boundedParam(searchParams.get('utm_source'), 256),
      utmMedium: boundedParam(searchParams.get('utm_medium'), 256),
    };

    after(async () => {
      try {
        await connectDB();
        await Promise.all([
          OutboundClickLog.create(click),
          Product.updateOne(
            { _id: product._id },
            { $inc: { clickCount: 1 }, $set: { lastClickDate: new Date() } }
          ),
        ]);
      } catch (error) {
        console.error('Failed to persist outbound affiliate click:', error);
      }
    });

    return NextResponse.redirect(destination, {
      status: 302,
      headers: { 'Cache-Control': 'no-store, max-age=0' },
    });
  } catch (error) {
    console.error('Error handling affiliate redirect:', error);
    return NextResponse.json({ error: 'Unable to process affiliate redirect.' }, { status: 500 });
  }
}
