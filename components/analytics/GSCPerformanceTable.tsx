import type { GSCPerformanceRow } from '@/lib/analytics-client';

interface GSCPerformanceTableProps {
  rows: GSCPerformanceRow[];
  configured: boolean;
  error?: string | null;
}

export default function GSCPerformanceTable({ rows, configured, error }: GSCPerformanceTableProps) {
  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-black text-[#1a1a1a]">Search performance</h2>
        <span className="text-xs font-medium text-gray-500">Google Search Console</span>
      </div>
      {error ? (
        <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800" role="status">{error}</p>
      ) : !configured ? (
        <p className="py-6 text-center text-sm text-gray-500">Analytics syncing — configure Search Console credentials.</p>
      ) : rows.length === 0 ? (
        <p className="py-6 text-center text-sm text-gray-500">No query data for this date range.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-gray-200 text-xs uppercase text-gray-500">
              <tr>
                <th className="py-3 pr-4">Query</th>
                <th className="px-3 py-3">Page</th>
                <th className="px-3 py-3 text-right">Clicks</th>
                <th className="px-3 py-3 text-right">Impressions</th>
                <th className="px-3 py-3 text-right">CTR</th>
                <th className="py-3 pl-3 text-right">Position</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={`${row.query}-${row.page}-${index}`} className="border-b border-gray-100 last:border-0">
                  <td className="max-w-[220px] truncate py-3 pr-4 font-medium text-gray-900">{row.query}</td>
                  <td className="max-w-[220px] truncate px-3 py-3 text-gray-600">{row.page}</td>
                  <td className="px-3 py-3 text-right tabular-nums">{row.clicks.toLocaleString()}</td>
                  <td className="px-3 py-3 text-right tabular-nums">{row.impressions.toLocaleString()}</td>
                  <td className="px-3 py-3 text-right tabular-nums">{(row.ctr * 100).toFixed(2)}%</td>
                  <td className="py-3 pl-3 text-right tabular-nums">{row.position.toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
