export interface GSCPerformanceRow {
  query: string;
  page: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export interface OutboundClickAnalytics {
  total: number;
  rows: Array<{
    sourcePage: string;
    asin: string;
    slug: string;
    productName: string;
    clicks: number;
  }>;
  byPost: Array<{ post: string; clicks: number }>;
  byAsin: Array<{ asin: string; productName: string; clicks: number }>;
}

export interface GoogleAnalyticsSummary {
  dateRange: { from: string; to: string };
  ga4: {
    propertyId?: string;
    activeUsers: number;
    pageviews: number;
    daily: Array<{ date: string; activeUsers: number; pageviews: number }>;
    error?: string;
  };
  gsc: {
    siteUrl?: string;
    clicks: number;
    impressions: number;
    daily: Array<{ date: string; clicks: number; impressions: number }>;
    error?: string;
  };
  error?: string;
}

async function fetchAnalyticsJson<T>(endpoint: string): Promise<T> {
  const response = await fetch(endpoint);
  if (!response.ok) {
    throw new Error(`Analytics request failed (${response.status})`);
  }
  return response.json() as Promise<T>;
}

export async function fetchGoogleAnalyticsSummary(): Promise<GoogleAnalyticsSummary> {
  const response = await fetch('/api/analytics', { cache: 'no-store' });
  const result = await response.json();

  if (!response.ok && (!result.ga4 || !result.gsc)) {
    throw new Error(result.error || `Analytics request failed (${response.status})`);
  }

  return result as GoogleAnalyticsSummary;
}

export function fetchGSCPerformance(query: string) {
  return fetchAnalyticsJson<{
    configured: boolean;
    rows: GSCPerformanceRow[];
  }>(`/api/analytics/gsc?${query}`);
}

export function fetchOutboundClickAnalytics(query: string) {
  return fetchAnalyticsJson<OutboundClickAnalytics>(`/api/analytics/clicks?${query}`);
}
