import { Eye, MousePointer2, Users } from 'lucide-react';

interface TrafficOverviewCardProps {
  sessions: number;
  users: number;
  outboundClicks: number;
  ga4Configured: boolean;
  ga4Error?: boolean;
}

const numberFormat = new Intl.NumberFormat();

export default function TrafficOverviewCard({
  sessions,
  users,
  outboundClicks,
  ga4Configured,
  ga4Error = false,
}: TrafficOverviewCardProps) {
  const metrics = [
    { label: 'Sessions', value: sessions, icon: Eye },
    { label: 'Users', value: users, icon: Users },
    { label: 'Outbound Amazon clicks', value: outboundClicks, icon: MousePointer2 },
  ];

  return (
    <section aria-label="Traffic overview">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xl font-black text-[#1a1a1a]">Traffic overview</h2>
        {(!ga4Configured || ga4Error) && (
          <p className="text-sm text-amber-700" role="status">
            Analytics syncing — configure GA4 credentials to see sessions and users.
          </p>
        )}
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {metrics.map(({ label, value, icon: Icon }) => {
          const unavailable = (!ga4Configured || ga4Error) && label !== 'Outbound Amazon clicks';
          return (
            <article key={label} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-wide text-gray-500">{label}</p>
                <Icon size={18} className="text-[#CC0000]" aria-hidden="true" />
              </div>
              <p className="mt-3 text-3xl font-black text-[#1a1a1a]">
                {unavailable ? '—' : numberFormat.format(value)}
              </p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
