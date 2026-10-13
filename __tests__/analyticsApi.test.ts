import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const mocks = vi.hoisted(() => ({
  requireAdmin: vi.fn(),
  setCredentials: vi.fn(),
  runReport: vi.fn(),
  searchQuery: vi.fn(),
}));

vi.mock('@/lib/auth/requireAdmin', () => ({
  requireAdmin: mocks.requireAdmin,
}));

vi.mock('googleapis', () => ({
  google: {
    auth: {
      OAuth2: class {
        setCredentials(credentials: unknown) {
          mocks.setCredentials(credentials);
        }
      },
    },
    analyticsdata: vi.fn(() => ({ properties: { runReport: mocks.runReport } })),
    searchconsole: vi.fn(() => ({
      searchanalytics: { query: mocks.searchQuery },
    })),
  },
}));

import { GET } from '@/app/api/analytics/route';

const googleEnvironment = [
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'GOOGLE_REFRESH_TOKEN',
  'GA4_PROPERTY_ID',
  'GSC_SITE_URL',
] as const;

const originalEnvironment = new Map(
  googleEnvironment.map((name) => [name, process.env[name]]),
);

describe('Google analytics API endpoint', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireAdmin.mockResolvedValue({ authenticated: true });
    process.env.GOOGLE_CLIENT_ID = 'test-client-id';
    process.env.GOOGLE_CLIENT_SECRET = 'test-client-secret';
    process.env.GOOGLE_REFRESH_TOKEN = 'test-refresh-token';
    process.env.GA4_PROPERTY_ID = '123456789';
    process.env.GSC_SITE_URL = 'sc-domain:example.com';
  });

  afterEach(() => {
    for (const name of googleEnvironment) {
      const value = originalEnvironment.get(name);
      if (value === undefined) delete process.env[name];
      else process.env[name] = value;
    }
  });

  it('requires an authenticated admin', async () => {
    mocks.requireAdmin.mockResolvedValue({ authenticated: false });

    const response = await GET(new NextRequest('https://example.com/api/analytics'));

    expect(response.status).toBe(401);
    expect(mocks.runReport).not.toHaveBeenCalled();
    expect(mocks.searchQuery).not.toHaveBeenCalled();
  });

  it('returns period totals and daily metrics from GA4 and Search Console', async () => {
    mocks.runReport
      .mockResolvedValueOnce({
        data: {
          rows: [{ metricValues: [{ value: '125' }, { value: '980' }] }],
        },
      })
      .mockResolvedValueOnce({
        data: {
          rows: [{
            dimensionValues: [{ value: '20261010' }],
            metricValues: [{ value: '42' }, { value: '300' }],
          }],
        },
      });
    mocks.searchQuery.mockResolvedValue({
      data: {
        rows: [
          { keys: ['2026-10-10'], clicks: 12, impressions: 240 },
          { keys: ['2026-10-11'], clicks: 8, impressions: 160 },
        ],
      },
    });

    const response = await GET(new NextRequest('https://example.com/api/analytics'));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      ga4: {
        propertyId: '123456789',
        activeUsers: 125,
        pageviews: 980,
        daily: [{ date: '2026-10-10', activeUsers: 42, pageviews: 300 }],
      },
      gsc: {
        siteUrl: 'sc-domain:example.com',
        clicks: 20,
        impressions: 400,
        daily: [
          { date: '2026-10-10', clicks: 12, impressions: 240 },
          { date: '2026-10-11', clicks: 8, impressions: 160 },
        ],
      },
    });
    expect(mocks.setCredentials).toHaveBeenCalledWith({ refresh_token: 'test-refresh-token' });
    expect(mocks.runReport).toHaveBeenCalledTimes(2);
    expect(mocks.runReport).toHaveBeenCalledWith(
      expect.objectContaining({
        property: 'properties/123456789',
        requestBody: expect.objectContaining({
          dateRanges: [{ startDate: '7daysAgo', endDate: 'yesterday' }],
          metrics: [{ name: 'activeUsers' }, { name: 'screenPageViews' }],
        }),
      }),
    );
    expect(mocks.searchQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        siteUrl: 'sc-domain:example.com',
        requestBody: expect.objectContaining({ dimensions: ['date'], rowLimit: 7 }),
      }),
    );
  });

  it('returns a configuration status with which environment variable is missing', async () => {
    delete process.env.GA4_PROPERTY_ID;
    delete process.env.GSC_SITE_URL;

    const response = await GET(new NextRequest('https://example.com/api/analytics'));

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toMatchObject({
      ga4: { error: { message: 'Missing environment variables: GA4_PROPERTY_ID' } },
      gsc: { error: { message: 'Missing environment variables: GSC_SITE_URL' } },
    });
    expect(mocks.runReport).not.toHaveBeenCalled();
    expect(mocks.searchQuery).not.toHaveBeenCalled();
  });

  it('preserves successful provider metrics and returns safe details for a failed provider', async () => {
    mocks.runReport.mockRejectedValue({
      message: 'Google Analytics API request failed',
      code: 403,
      response: {
        status: 403,
        data: {
          error: {
            message: 'The caller does not have permission',
            status: 'PERMISSION_DENIED',
            errors: [{ reason: 'forbidden' }],
          },
        },
      },
    });
    mocks.searchQuery.mockResolvedValue({
      data: { rows: [{ keys: ['2026-10-10'], clicks: 3, impressions: 27 }] },
    });

    const response = await GET(new NextRequest('https://example.com/api/analytics'));
    const body = await response.json();

    expect(response.status).toBe(502);
    expect(body.ga4.error).toMatchObject({
      message: 'The caller does not have permission',
      status: 403,
      code: 403,
      googleStatus: 'PERMISSION_DENIED',
      reasons: ['forbidden'],
    });
    expect(body.gsc).toMatchObject({ clicks: 3, impressions: 27 });
    expect(body).not.toHaveProperty('credentials');
  });
});
