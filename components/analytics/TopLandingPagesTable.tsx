interface LandingPage {
  page: string;
  sessions: number;
  pageviews: number;
  clicks: number;
  clickThroughRate: number;
}

interface TopLandingPagesTableProps {
  pages: LandingPage[];
  configured: boolean;
}

export default function TopLandingPagesTable({ pages, configured }: TopLandingPagesTableProps) {
  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-lg font-black text-[#1a1a1a]">Top landing pages</h2>
      {!configured ? (
        <p className="py-6 text-center text-sm text-gray-500">Analytics syncing — GA4 is not configured.</p>
      ) : pages.length === 0 ? (
        <p className="py-6 text-center text-sm text-gray-500">No landing-page data for this date range.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="border-b border-gray-200 text-xs uppercase text-gray-500">
              <tr>
                <th className="py-3 pr-4">Page</th>
                <th className="px-3 py-3 text-right">Views</th>
                <th className="px-3 py-3 text-right">Outbound clicks</th>
                <th className="py-3 pl-3 text-right">CTR</th>
              </tr>
            </thead>
            <tbody>
              {pages.map((page, index) => (
                <tr key={`${page.page}-${index}`} className="border-b border-gray-100 last:border-0">
                  <td className="max-w-[260px] truncate py-3 pr-4 font-medium text-gray-900">{page.page}</td>
                  <td className="px-3 py-3 text-right tabular-nums">{page.pageviews.toLocaleString()}</td>
                  <td className="px-3 py-3 text-right tabular-nums">{page.clicks.toLocaleString()}</td>
                  <td className="py-3 pl-3 text-right tabular-nums">{page.clickThroughRate.toFixed(2)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
