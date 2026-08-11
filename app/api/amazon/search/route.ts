import { NextRequest, NextResponse } from 'next/server';
import { searchItems } from '@/lib/amazonApi';

interface AmazonApiError {
  status?: number;
  body?: { message?: string; Errors?: Array<{ Message?: string }> };
}

/**
 * GET /api/amazon/search?q=keywords&index=All&count=10
 * Searches Amazon products via the Creators API.
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const keywords = searchParams.get('q');
  const searchIndex = searchParams.get('index') ?? undefined;
  const itemCountParam = searchParams.get('count');
  const itemCount = itemCountParam ? Number(itemCountParam) : undefined;

  if (!keywords || !keywords.trim()) {
    return NextResponse.json({ error: 'Missing required query param "q"' }, { status: 400 });
  }

  try {
    const response = await searchItems(keywords, { searchIndex, itemCount });
    const items = response?.searchResult?.items ?? [];

    if (items.length === 0) {
      return NextResponse.json({ items: [], count: 0 });
    }

    return NextResponse.json({ items, count: items.length });
  } catch (error) {
    const err = error as AmazonApiError;

    if (err?.status === 401 || err?.status === 403) {
      console.error('Amazon Creators API auth error:', err);
      return NextResponse.json({ error: 'Amazon API credentials are invalid or unauthorized' }, { status: 502 });
    }

    if (err?.status === 429) {
      console.error('Amazon Creators API throttled:', err);
      return NextResponse.json({ error: 'Amazon API rate limit exceeded, try again shortly' }, { status: 429 });
    }

    if ((error as Error)?.message?.includes('credentials')) {
      console.error('Amazon Creators API misconfigured:', (error as Error).message);
      return NextResponse.json({ error: 'Amazon API is not configured' }, { status: 500 });
    }

    console.error('Error calling Amazon Creators API searchItems:', err?.body ?? error);
    return NextResponse.json({ error: 'Failed to search Amazon products' }, { status: 500 });
  }
}
