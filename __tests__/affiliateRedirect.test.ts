import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { buildAffiliateRedirectUrl, getAsinFromAffiliateUrl } from '@/lib/affiliate/tracking';

const mocks = vi.hoisted(() => ({
  connectDB: vi.fn(),
  findOne: vi.fn(),
  updateOne: vi.fn(),
  createClick: vi.fn(),
  scheduleAfter: vi.fn(),
}));

vi.mock('next/server', async (importOriginal) => {
  const actual = await importOriginal<typeof import('next/server')>();
  return {
    ...actual,
    after: (callback: () => Promise<void>) => mocks.scheduleAfter(callback),
  };
});

vi.mock('@/lib/db/mongoose', () => ({ default: mocks.connectDB }));
vi.mock('@/lib/db/models/Product', () => ({
  default: {
    findOne: mocks.findOne,
    updateOne: mocks.updateOne,
  },
}));
vi.mock('@/lib/db/models/OutboundClickLog', () => ({
  default: { create: mocks.createClick },
}));

import { GET } from '@/app/go/[slug]/route';

describe('affiliate redirect', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.findOne.mockReturnValue({
      select: () => ({
        lean: async () => ({
          _id: 'product-id',
          asin: 'B00EXAMPLE',
          affiliateLink: 'https://www.amazon.com/dp/B00EXAMPLE?tag=existing-tag-20',
        }),
      }),
    });
  });

  it('redirects to the saved Amazon affiliate URL and schedules click logging', async () => {
    const request = new NextRequest(
      'https://ridercomplex.com/go/test-helmet?asin=B00EXAMPLE&page=%2Freview-1&utm_source=newsletter&utm_medium=email&trackingId=click-123',
      { headers: { 'user-agent': 'Vitest' } }
    );

    const response = await GET(request, { params: Promise.resolve({ slug: 'test-helmet' }) });
    expect(response.status).toBe(302);
    expect(response.headers.get('location')).toBe(
      'https://www.amazon.com/dp/B00EXAMPLE?tag=existing-tag-20'
    );
    expect(mocks.scheduleAfter).toHaveBeenCalledOnce();

    const persistClick = mocks.scheduleAfter.mock.calls[0][0] as () => Promise<void>;
    await persistClick();
    expect(mocks.createClick).toHaveBeenCalledWith(expect.objectContaining({
      slug: 'test-helmet',
      asin: 'B00EXAMPLE',
      sourcePage: '/review-1',
      trackingId: 'click-123',
      utmSource: 'newsletter',
      utmMedium: 'email',
      destinationUrl: 'https://www.amazon.com/dp/B00EXAMPLE?tag=existing-tag-20',
    }));
    expect(mocks.updateOne).toHaveBeenCalledOnce();
  });

  it('rejects malformed ASINs without redirecting', async () => {
    const response = await GET(
      new NextRequest('https://ridercomplex.com/go/test-helmet?asin=bad'),
      { params: Promise.resolve({ slug: 'test-helmet' }) }
    );
    expect(response.status).toBe(400);
    expect(mocks.findOne).not.toHaveBeenCalled();
  });

  it('does not redirect to a non-Amazon destination', async () => {
    mocks.findOne.mockReturnValue({
      select: () => ({
        lean: async () => ({ _id: 'product-id', affiliateLink: 'https://attacker.example/' }),
      }),
    });
    const response = await GET(
      new NextRequest('https://ridercomplex.com/go/test-helmet?asin=B00EXAMPLE'),
      { params: Promise.resolve({ slug: 'test-helmet' }) }
    );
    expect(response.status).toBe(502);
    expect(mocks.scheduleAfter).not.toHaveBeenCalled();
  });
});

describe('affiliate redirect URL helper', () => {
  it('builds a first-party link with the post and ASIN', () => {
    expect(buildAffiliateRedirectUrl('Test Helmet', 'B00EXAMPLE', '/review-1', 'https://amazon.com')).toBe(
      '/go/test-helmet?asin=B00EXAMPLE&page=%2Freview-1'
    );
  });

  it('extracts ASINs from standard Amazon product URLs', () => {
    expect(getAsinFromAffiliateUrl('https://www.amazon.com/dp/B00EXAMPLE?tag=example-20')).toBe('B00EXAMPLE');
  });

  it('leaves URLs without a known ASIN unchanged', () => {
    const url = 'https://amzn.to/example';
    expect(buildAffiliateRedirectUrl('Test Helmet', undefined, '/review-1', url)).toBe(url);
  });
});
