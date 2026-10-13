'use client';

import { useCallback, useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import AdminTopBar from '@/components/admin/AdminTopBar';
import GoogleAnalyticsSummary from '@/components/analytics/GoogleAnalyticsSummary';
import {
  fetchGoogleAnalyticsSummary,
  type GoogleAnalyticsSummary as GoogleAnalyticsData,
} from '@/lib/analytics-client';

export default function AnalyticsPage() {
  const [data, setData] = useState<GoogleAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await fetchGoogleAnalyticsSummary();
      setData(result);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Unable to load analytics. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAnalytics();
  }, [loadAnalytics]);

  return (
    <>
      <AdminTopBar />
      <main className="min-h-screen bg-zinc-50 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-8">
          <header className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-zinc-500">Performance</p>
              <h1 className="mt-1 text-3xl font-semibold tracking-tight text-zinc-950">Analytics</h1>
              <p className="mt-2 text-sm text-zinc-500">
                GA4 traffic and Google Search visibility for the last 7 complete days.
              </p>
            </div>
            <button
              type="button"
              onClick={loadAnalytics}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 shadow-sm transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} aria-hidden="true" />
              Refresh
            </button>
          </header>

          <GoogleAnalyticsSummary
            data={data}
            loading={loading}
            error={error}
            onRetry={loadAnalytics}
          />
        </div>
      </main>
    </>
  );
}
