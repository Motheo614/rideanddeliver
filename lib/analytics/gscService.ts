import { google } from 'googleapis';
import { getCachedAnalytics, setCachedAnalytics } from '@/lib/analytics/cache';

export interface GSCPerformanceRow {
  query: string;
  page: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export interface GSCAnalytics {
  configured: boolean;
  rows: GSCPerformanceRow[];
}

export async function getGSCAnalytics(startDate: string, endDate: string): Promise<GSCAnalytics> {
  const siteUrl = process.env.GSC_SITE_URL?.trim();
  if (!siteUrl || !process.env.GOOGLE_APPLICATION_CREDENTIALS?.trim()) {
    return { configured: false, rows: [] };
  }

  const metricKey = `gsc:${siteUrl}:${startDate}:${endDate}`;
  const cached = await getCachedAnalytics<GSCAnalytics>(metricKey);
  if (cached) return cached;

  const auth = new google.auth.GoogleAuth({
    scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
  });
  const searchConsole = google.searchconsole({ version: 'v1', auth });
  const response = await searchConsole.searchanalytics.query({
    siteUrl,
    requestBody: {
      startDate,
      endDate,
      dimensions: ['query', 'page'],
      rowLimit: 25000,
    },
  });

  const rows = (response.data.rows || []).map((row) => ({
    query: row.keys?.[0] || '',
    page: row.keys?.[1] || '',
    clicks: Number(row.clicks || 0),
    impressions: Number(row.impressions || 0),
    ctr: Number(row.ctr || 0),
    position: Number(row.position || 0),
  }));
  const data = { configured: true, rows };
  await setCachedAnalytics(metricKey, data);
  return data;
}
