import Link from 'next/link';

const linkClass =
  'underline decoration-white/30 underline-offset-4 transition-colors hover:decoration-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white';

export default function TrustBanner() {
  return (
    <div className="bg-charcoal py-2 text-[11px] font-normal leading-5 text-white/80 sm:text-xs">
      <p className="container-page flex flex-wrap items-center justify-center gap-x-3 gap-y-0.5 text-center">
        <span>Independent Gear Research for Courier Delivery · Zero Paid Brand Placements</span>
        <span className="flex items-center gap-3">
          <Link href="/how-we-research" className={linkClass}>
            How we research
          </Link>
          <Link href="/affiliate-disclaimer" className={linkClass}>
            Affiliate disclaimer
          </Link>
        </span>
      </p>
    </div>
  );
}
