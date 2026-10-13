import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { requireAdmin } from '@/lib/auth/requireAdmin';

export const runtime = 'nodejs';

type DailyGA4Metrics = {
  date: string;
  activeUsers: number;
  pageviews: number;
};

type DailyGSCMetrics = {
  date: string;
  clicks: number;
  impressions: number;
};

function parseMetric(value?: string | null): number {
  const parsed = Number(value || 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function gaDateToISO(value?: string | null): string {
  if (!value || !/^\d{8}$/.test(value)) return value || '';
  return `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}`;
}

function getPreviousSevenCompleteDays() {
  const end = new Date();
  end.setUTCDate(end.getUTCDate() - 1);
  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - 6);
  return {
    startDate: start.toISOString().slice(0, 10),
    endDate: end.toISOString().slice(0, 10),
  };
}

function requiredEnvironment(names: string[]): string[] {
  return names.filter((name) => !process.env[name]?.trim());
}

function getOAuthClient() {
  const auth = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID!.trim(),
    process.env.GOOGLE_CLIENT_SECRET!.trim(),
  );
  auth.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN!.trim() });
  return auth;
}

async function getGA4Metrics(auth: ReturnType<typeof getOAuthClient>) {
  const propertyId = process.env.GA4_PROPERTY_ID!.trim();
  const betaDataClient = google.analyticsdata({ version: 'v1beta', auth }).properties;
  const reportRequest = {
    property: `properties/${propertyId}`,
    requestBody: {
      dateRanges: [{ startDate: '7daysAgo', endDate: 'yesterday' }],
      metrics: [{ name: 'activeUsers' }, { name: 'screenPageViews' }],
    },
  };
  const [totalsResponse, dailyResponse] = await Promise.all([
    betaDataClient.runReport(reportRequest),
    betaDataClient.runReport({
      ...reportRequest,
      requestBody: {
        ...reportRequest.requestBody,
        dimensions: [{ name: 'date' }],
      },
    }),
  ]);

  const totals = totalsResponse.data.rows?.[0]?.metricValues || [];
  const daily: DailyGA4Metrics[] = (dailyResponse.data.rows || []).map((row) => ({
    date: gaDateToISO(row.dimensionValues?.[0]?.value),
    activeUsers: parseMetric(row.metricValues?.[0]?.value),
    pageviews: parseMetric(row.metricValues?.[1]?.value),
  }));

  return {
    propertyId,
    activeUsers: parseMetric(totals[0]?.value),
    pageviews: parseMetric(totals[1]?.value),
    daily,
  };
}

async function getGSCMetrics(
  auth: ReturnType<typeof getOAuthClient>,
  startDate: string,
  endDate: string,
) {
  const siteUrl = process.env.GSC_SITE_URL!.trim();
  const searchConsole = google.searchconsole({ version: 'v1', auth });
  const response = await searchConsole.searchanalytics.query({
    siteUrl,
    requestBody: {
      startDate,
      endDate,
      dimensions: ['date'],
      rowLimit: 7,
    },
  });

  const daily: DailyGSCMetrics[] = (response.data.rows || []).map((row) => ({
    date: row.keys?.[0] || '',
    clicks: Number(row.clicks || 0),
    impressions: Number(row.impressions || 0),
  }));

  return {
    siteUrl,
    clicks: daily.reduce((total, row) => total + row.clicks, 0),
    impressions: daily.reduce((total, row) => total + row.impressions, 0),
    daily,
  };
}

function errorMessage(reason: unknown): string {
  return reason instanceof Error ? reason.message : String(reason);
}

export async function GET(_request: NextRequest) {
  let authenticated: boolean;
  try {
    ({ authenticated } = await requireAdmin());
  } catch (error) {
    console.error('Failed to authenticate analytics API request:', error);
    return NextResponse.json({ error: 'Unable to verify admin access.' }, { status: 500 });
  }
  if (!authenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const oauthVariables = ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'GOOGLE_REFRESH_TOKEN'];
  const missingOAuthVariables = requiredEnvironment(oauthVariables);
  const missingGA4Variables = [
    ...missingOAuthVariables,
    ...requiredEnvironment(['GA4_PROPERTY_ID']),
  ];
  const missingGSCVariables = [
    ...missingOAuthVariables,
    ...requiredEnvironment(['GSC_SITE_URL']),
  ];
  const { startDate, endDate } = getPreviousSevenCompleteDays();

  let auth: ReturnType<typeof getOAuthClient> | undefined;
  if (missingOAuthVariables.length === 0) {
    try {
      auth = getOAuthClient();
    } catch (error) {
      console.error('Failed to initialize Google OAuth for analytics:', error);
      return NextResponse.json(
        { error: 'Unable to initialize Google OAuth credentials.' },
        { status: 500 },
      );
    }
  }

  const ga4Request = missingGA4Variables.length > 0
    ? Promise.reject(new Error(`Missing environment variables: ${missingGA4Variables.join(', ')}`))
    : getGA4Metrics(auth!);
  const gscRequest = missingGSCVariables.length > 0
    ? Promise.reject(new Error(`Missing environment variables: ${missingGSCVariables.join(', ')}`))
    : getGSCMetrics(auth!, startDate, endDate);
  const [ga4Result, gscResult] = await Promise.allSettled([ga4Request, gscRequest]);

  if (ga4Result.status === 'rejected') {
    const log = missingGA4Variables.length > 0 ? console.warn : console.error;
    log('Failed to fetch GA4 analytics:', ga4Result.reason);
  }
  if (gscResult.status === 'rejected') {
    const log = missingGSCVariables.length > 0 ? console.warn : console.error;
    log('Failed to fetch Search Console analytics:', gscResult.reason);
  }

  const ga4Error = ga4Result.status === 'rejected' ? errorMessage(ga4Result.reason) : undefined;
  const gscError = gscResult.status === 'rejected' ? errorMessage(gscResult.reason) : undefined;
  const configuredFailure =
    (ga4Error && missingGA4Variables.length > 0)
    || (gscError && missingGSCVariables.length > 0);
  const failed = ga4Error || gscError;

  return NextResponse.json(
    {
      dateRange: { from: startDate, to: endDate },
      ga4: ga4Result.status === 'fulfilled'
        ? ga4Result.value
        : { activeUsers: 0, pageviews: 0, daily: [], error: ga4Error },
      gsc: gscResult.status === 'fulfilled'
        ? gscResult.value
        : { clicks: 0, impressions: 0, daily: [], error: gscError },
      ...(failed ? { error: 'One or more analytics providers could not be reached.' } : {}),
    },
    { status: configuredFailure ? 503 : failed ? 502 : 200 },
  );
}
