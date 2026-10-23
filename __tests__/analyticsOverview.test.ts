import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const mocks = vi.hoisted(() => ({
  getServerSession: vi.fn(),
  connectDB: vi.fn(),
  analyticsFind: vi.fn(),
  postFind: vi.fn(),
  postCount: vi.fn(),
  productFind: vi.fn(),
  productCount: vi.fn(),
  clickCount: vi.fn(),
  clickAggregate: vi.fn(),
  userFind: vi.fn(),
}));

vi.mock('next-auth', () => ({ getServerSession: mocks.getServerSession }));
vi.mock('@/lib/auth/authOptions', () => ({ authOptions: {} }));
vi.mock('@/lib/db/mongoose', () => ({ default: mocks.connectDB }));
vi.mock('@/lib/db/models/Analytics', () => ({
  default: { find: mocks.analyticsFind },
}));
vi.mock('@/lib/db/models/Post', () => ({
  default: { find: mocks.postFind, countDocuments: mocks.postCount },
}));
vi.mock('@/lib/db/models/Product', () => ({
  default: { find: mocks.productFind, countDocuments: mocks.productCount },
}));
vi.mock('@/lib/db/models/OutboundClickLog', () => ({
  default: {
    countDocuments: mocks.clickCount,
    aggregate: mocks.clickAggregate,
  },
}));
vi.mock('@/lib/db/models', () => ({
  User: { findOne: mocks.userFind },
}));

import { GET } from '@/app/api/analytics/overview/route';

function queryChain(value: unknown) {
  const chain = {
    select: () => chain,
    sort: () => chain,
    limit: () => chain,
    lean: async () => value,
  };
  return chain;
}

describe('analytics overview endpoint', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.connectDB.mockResolvedValue(undefined);
    mocks.analyticsFind.mockReturnValue({ lean: async () => [] });
    mocks.postFind.mockReturnValue(queryChain([]));
    mocks.postCount.mockResolvedValue(0);
    mocks.productFind.mockReturnValue(queryChain([]));
    mocks.productCount.mockResolvedValue(0);
    mocks.clickCount.mockResolvedValue(2);
    mocks.clickAggregate.mockResolvedValue([]);
  });

  it('rejects unauthenticated requests before querying MongoDB', async () => {
    mocks.getServerSession.mockResolvedValue(null);
    const response = await GET(new NextRequest('https://ridercomplex.com/api/analytics/overview'));
    expect(response.status).toBe(401);
    expect(mocks.connectDB).not.toHaveBeenCalled();
  });

  it('returns local click metrics when GA4 is unconfigured', async () => {
    const propertyId = process.env.GA4_PROPERTY_ID;
    const credentials = process.env.GOOGLE_APPLICATION_CREDENTIALS;
    delete process.env.GA4_PROPERTY_ID;
    delete process.env.GOOGLE_APPLICATION_CREDENTIALS;
    mocks.getServerSession.mockResolvedValue({ user: { email: 'admin@example.com', role: 'admin' } });
    mocks.userFind.mockResolvedValue({ role: 'admin' });

    try {
      const response = await GET(
        new NextRequest('https://ridercomplex.com/api/analytics/overview?from=2026-06-01&to=2026-06-07')
      );
      expect(response.status).toBe(200);
      await expect(response.json()).resolves.toMatchObject({
        ga4: { configured: false, totals: { sessions: 0, users: 0, pageviews: 0 } },
        outboundClicks: 2,
        topLandingPages: [],
      });
    } finally {
      if (propertyId === undefined) delete process.env.GA4_PROPERTY_ID;
      else process.env.GA4_PROPERTY_ID = propertyId;
      if (credentials === undefined) delete process.env.GOOGLE_APPLICATION_CREDENTIALS;
      else process.env.GOOGLE_APPLICATION_CREDENTIALS = credentials;
    }
  });
});
