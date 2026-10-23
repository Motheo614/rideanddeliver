import { BetaAnalyticsDataClient } from '@google-analytics/data';
import { getCachedAnalytics, setCachedAnalytics } from '@/lib/analytics/cache';

export interface GA4Analytics {
  configured: boolean;
  error?: string;
  totals: { sessions: number; users: number; pageviews: number };
  dailySources: Array<{
    date: string;
    source: string;
    sessions: number;
    users: number;
    pageviews: number;
  }>;
  landingPages: Array<{
    page: string;
    sessions: number;
    pageviews: number;
  }>;
}

function parseMetric(value?: string | null): number {
  const parsed = Number(value || 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

export async function getGA4Analytics(startDate: string, endDate: string): Promise<GA4Analytics> {
  const empty: GA4Analytics = {
    configured: false,
    totals: { sessions: 0, users: 0, pageviews: 0 },
    dailySources: [],
    landingPages: [],
  };
  const propertyId = process.env.GA4_PROPERTY_ID?.trim();
  if (!propertyId || !process.env.GOOGLE_APPLICATION_CREDENTIALS?.trim()) return empty;

  const metricKey = `ga4:${propertyId}:${startDate}:${endDate}`;
  const cached = await getCachedAnalytics<GA4Analytics>(metricKey);
  if (cached) return cached;

  const client = new BetaAnalyticsDataClient();
  const [totalsResponse, dailyResponse, landingResponse] = await Promise.all([
    client.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate, endDate }],
      metrics: [{ name: 'sessions' }, { name: 'totalUsers' }, { name: 'screenPageViews' }],
    }),
    client.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: 'date' }, { name: 'sessionSource' }],
      metrics: [{ name: 'sessions' }, { name: 'totalUsers' }, { name: 'screenPageViews' }],
      limit: 10000,
    }),
    client.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: 'landingPagePlusQueryString' }],
      metrics: [{ name: 'sessions' }, { name: 'screenPageViews' }],
      limit: 100,
      orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
    }),
  ]);

  const dailySources = (dailyResponse[0].rows || []).map((row) => ({
    date: row.dimensionValues?.[0]?.value || '',
    source: row.dimensionValues?.[1]?.value || '(not set)',
    sessions: parseMetric(row.metricValues?.[0]?.value),
    users: parseMetric(row.metricValues?.[1]?.value),
    pageviews: parseMetric(row.metricValues?.[2]?.value),
  }));
  const landingPages = (landingResponse[0].rows || []).map((row) => ({
    page: row.dimensionValues?.[0]?.value || '(not set)',
    sessions: parseMetric(row.metricValues?.[0]?.value),
    pageviews: parseMetric(row.metricValues?.[1]?.value),
  }));
  const totals = totalsResponse[0].rows?.[0]?.metricValues || [];
  const data: GA4Analytics = {
    configured: true,
    totals: {
      sessions: parseMetric(totals[0]?.value),
      users: parseMetric(totals[1]?.value),
      pageviews: parseMetric(totals[2]?.value),
    },
    dailySources,
    landingPages,
  };

  await setCachedAnalytics(metricKey, data);
  return data;
}
