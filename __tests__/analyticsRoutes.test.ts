import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const mocks = vi.hoisted(() => ({
  requireAdmin: vi.fn(),
  countDocuments: vi.fn(),
  aggregate: vi.fn(),
  find: vi.fn(),
}));

vi.mock('@/lib/auth/requireAdmin', () => ({ requireAdmin: mocks.requireAdmin }));
vi.mock('@/lib/db/mongoose', () => ({ default: vi.fn() }));
vi.mock('@/lib/db/models/OutboundClickLog', () => ({
  default: {
    countDocuments: mocks.countDocuments,
    aggregate: mocks.aggregate,
  },
}));
vi.mock('@/lib/db/models/Product', () => ({
  default: { find: mocks.find },
}));

import { GET as getGsc } from '@/app/api/analytics/gsc/route';
import { GET as getClicks } from '@/app/api/analytics/clicks/route';

describe('analytics endpoints', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireAdmin.mockResolvedValue({ authenticated: true });
  });

  it('returns an explicit unconfigured state for Search Console', async () => {
    const property = process.env.GSC_SITE_URL;
    const credentials = process.env.GOOGLE_APPLICATION_CREDENTIALS;
    delete process.env.GSC_SITE_URL;
    delete process.env.GOOGLE_APPLICATION_CREDENTIALS;

    try {
      const response = await getGsc(new NextRequest('https://ridercomplex.com/api/analytics/gsc?days=7'));
      expect(response.status).toBe(200);
      await expect(response.json()).resolves.toMatchObject({ configured: false, rows: [] });
    } finally {
      if (property === undefined) delete process.env.GSC_SITE_URL;
      else process.env.GSC_SITE_URL = property;
      if (credentials === undefined) delete process.env.GOOGLE_APPLICATION_CREDENTIALS;
      else process.env.GOOGLE_APPLICATION_CREDENTIALS = credentials;
    }
  });

  it('requires an admin session for outbound click reports', async () => {
    mocks.requireAdmin.mockResolvedValue({ authenticated: false });
    const response = await getClicks(new NextRequest('https://ridercomplex.com/api/analytics/clicks'));
    expect(response.status).toBe(401);
    expect(mocks.countDocuments).not.toHaveBeenCalled();
    expect(mocks.aggregate).not.toHaveBeenCalled();
  });

  it('groups click reports by referring page and ASIN', async () => {
    mocks.countDocuments.mockResolvedValue(3);
    mocks.aggregate.mockResolvedValue([
      { _id: { sourcePage: '/review-1', asin: 'B00EXAMPLE' }, slug: 'test-helmet', clicks: 3 },
    ]);
    mocks.find.mockReturnValue({
      select: () => ({
        lean: async () => [{ asin: 'B00EXAMPLE', productName: 'Test Helmet' }],
      }),
    });

    const response = await getClicks(new NextRequest('https://ridercomplex.com/api/analytics/clicks?days=7'));
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      total: 3,
      byPost: [{ post: 'review-1', sourcePage: '/review-1', clicks: 3 }],
      byAsin: [{ asin: 'B00EXAMPLE', productName: 'Test Helmet', clicks: 3 }],
    });
  });
});
