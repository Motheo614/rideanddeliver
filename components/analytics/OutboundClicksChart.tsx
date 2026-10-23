import type { OutboundClickAnalytics } from '@/lib/analytics-client';

interface OutboundClicksChartProps {
  data: OutboundClickAnalytics | null;
  error?: string | null;
}

function RankedBars({
  title,
  rows,
}: {
  title: string;
  rows: Array<{ label: string; clicks: number }>;
}) {
  const max = Math.max(...rows.map((row) => row.clicks), 1);
  return (
    <div>
      <h3 className="mb-3 text-sm font-bold text-gray-800">{title}</h3>
      {rows.length === 0 ? (
        <p className="text-sm text-gray-500">No outbound clicks yet.</p>
      ) : (
        <ol className="space-y-3">
          {rows.slice(0, 8).map((row, index) => (
            <li key={`${row.label}-${index}`}>
              <div className="mb-1 flex items-center justify-between gap-3 text-sm">
                <span className="truncate text-gray-700">{row.label}</span>
                <span className="shrink-0 font-semibold tabular-nums">{row.clicks.toLocaleString()}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                <div className="h-full rounded-full bg-[#CC0000]" style={{ width: `${(row.clicks / max) * 100}%` }} />
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

export default function OutboundClicksChart({ data, error }: OutboundClicksChartProps) {
  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-lg font-black text-[#1a1a1a]">Outbound affiliate clicks</h2>
      {error ? (
        <p className="mb-4 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800" role="status">{error}</p>
      ) : null}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <RankedBars
          title="Top posts"
          rows={(data?.byPost || []).map((row) => ({ label: row.post, clicks: row.clicks }))}
        />
        <RankedBars
          title="Top ASINs"
          rows={(data?.byAsin || []).map((row) => ({
            label: `${row.productName || row.asin} (${row.asin})`,
            clicks: row.clicks,
          }))}
        />
      </div>
    </section>
  );
}
