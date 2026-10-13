'use client';

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { Activity, Eye, MousePointer2, Search, Users } from 'lucide-react';
import type { GoogleAnalyticsSummary as GoogleAnalyticsData } from '@/lib/analytics-client';

interface GoogleAnalyticsSummaryProps {
  data: GoogleAnalyticsData | null;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
}

const numberFormat = new Intl.NumberFormat();

function DailyChart({
  data,
  dataKeys,
  colors,
}: {
  data: Array<Record<string, string | number | undefined>>;
  dataKeys: Array<{ key: string; label: string }>;
  colors: string[];
}) {
  if (!data.length) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg bg-zinc-50 text-sm text-zinc-500">
        No daily data available for this period.
      </div>
    );
  }

  return (
    <div className="h-64 w-full" aria-label="Daily analytics chart">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 12, bottom: 4, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4e7" />
          <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: '#71717a', fontSize: 12 }} />
          <YAxis axisLine={false} tickLine={false} tick={{ fill: '#71717a', fontSize: 12 }} />
          <Tooltip
            contentStyle={{ borderRadius: 10, borderColor: '#e4e4e7', boxShadow: '0 8px 24px rgb(0 0 0 / 0.08)' }}
          />
          <Legend />
          {dataKeys.map(({ key, label }, index) => (
            <Line
              key={key}
              type="monotone"
              dataKey={key}
              name={label}
              stroke={colors[index]}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function GoogleAnalyticsSummary({
  data,
  loading,
  error,
  onRetry,
}: GoogleAnalyticsSummaryProps) {
  const providerErrors = [
    data?.ga4.error ? `GA4: ${data.ga4.error}` : null,
    data?.gsc.error ? `Search Console: ${data.gsc.error}` : null,
  ].filter((message): message is string => Boolean(message));
  const alertMessage = error || providerErrors.join(' · ');

  const cards = [
    { label: 'Active Users', source: 'Google Analytics 4', value: data?.ga4.error ? null : data?.ga4.activeUsers, icon: Users },
    { label: 'Pageviews', source: 'Google Analytics 4', value: data?.ga4.error ? null : data?.ga4.pageviews, icon: Eye },
    { label: 'Search Clicks', source: 'Search Console', value: data?.gsc.error ? null : data?.gsc.clicks, icon: MousePointer2 },
    { label: 'Search Impressions', source: 'Search Console', value: data?.gsc.error ? null : data?.gsc.impressions, icon: Search },
  ];

  const trafficRows = (data?.ga4.daily || []).map((row) => ({
    label: /^\d{4}-\d{2}-\d{2}$/.test(row.date) ? format(parseISO(row.date), 'MMM d') : row.date,
    'Active users': row.activeUsers,
    Pageviews: row.pageviews,
  }));
  const searchRows = (data?.gsc.daily || []).map((row) => ({
    label: /^\d{4}-\d{2}-\d{2}$/.test(row.date) ? format(parseISO(row.date), 'MMM d') : row.date,
    Clicks: row.clicks,
    Impressions: row.impressions,
  }));

  return (
    <section aria-label="Google performance" className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-zinc-950">Google performance</h2>
          <p className="mt-1 text-sm text-zinc-500">
            {data
              ? `${data.dateRange.from} – ${data.dateRange.to} · Last 7 complete days`
              : 'GA4 and Search Console · Last 7 complete days'}
          </p>
        </div>
        {data && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-600">
            <Activity size={14} aria-hidden="true" />
            Live report
          </span>
        )}
      </div>

      {alertMessage && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900" role="alert">
          <span>{alertMessage}</span>
          {alertMessage && (
            <button
              type="button"
              onClick={onRetry}
              className="rounded-md border border-amber-300 px-3 py-1.5 text-xs font-semibold hover:bg-amber-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              Retry
            </button>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ label, source, value, icon: Icon }) => (
          <article key={label} className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-zinc-500">{label}</p>
                <p className="mt-1 text-xs text-zinc-400">{source}</p>
              </div>
              <span className="rounded-lg bg-zinc-100 p-2 text-zinc-600">
                <Icon size={18} aria-hidden="true" />
              </span>
            </div>
            {loading ? (
              <div className="mt-5 h-9 w-28 animate-pulse rounded-md bg-zinc-100" aria-label={`Loading ${label}`} />
            ) : (
              <p className="mt-4 text-3xl font-semibold tabular-nums tracking-tight text-zinc-950" aria-live="polite">
                {value == null ? '—' : numberFormat.format(value)}
              </p>
            )}
          </article>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <section className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm" aria-labelledby="traffic-engagement-heading">
          <div className="mb-5">
            <h3 id="traffic-engagement-heading" className="font-semibold text-zinc-950">Traffic engagement</h3>
            <p className="mt-1 text-sm text-zinc-500">Daily active users and pageviews from GA4</p>
          </div>
          {loading ? (
            <div className="flex h-64 items-center justify-center gap-2 text-sm text-zinc-500" role="status">
              <span className="size-4 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-800" />
              Loading traffic data…
            </div>
          ) : data?.ga4.error ? (
            <div className="flex h-64 items-center justify-center rounded-lg bg-zinc-50 px-5 text-center text-sm text-zinc-500">
              GA4 traffic data is unavailable right now.
            </div>
          ) : (
            <DailyChart data={trafficRows} dataKeys={[{ key: 'Active users', label: 'Active users' }, { key: 'Pageviews', label: 'Pageviews' }]} colors={['#18181b', '#71717a']} />
          )}
        </section>

        <section className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm" aria-labelledby="search-visibility-heading">
          <div className="mb-5">
            <h3 id="search-visibility-heading" className="font-semibold text-zinc-950">Search visibility</h3>
            <p className="mt-1 text-sm text-zinc-500">Daily clicks and impressions from Search Console</p>
          </div>
          {loading ? (
            <div className="flex h-64 items-center justify-center gap-2 text-sm text-zinc-500" role="status">
              <span className="size-4 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-800" />
              Loading search data…
            </div>
          ) : data?.gsc.error ? (
            <div className="flex h-64 items-center justify-center rounded-lg bg-zinc-50 px-5 text-center text-sm text-zinc-500">
              Search visibility data is unavailable right now.
            </div>
          ) : (
            <DailyChart data={searchRows} dataKeys={[{ key: 'Clicks', label: 'Clicks' }, { key: 'Impressions', label: 'Impressions' }]} colors={['#18181b', '#a1a1aa']} />
          )}
        </section>
      </div>
    </section>
  );
}
