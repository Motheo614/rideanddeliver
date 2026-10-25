import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import ProductCard from './ProductCard';
import { getTopPicks } from '@/lib/products';

export default async function TopPicksSection({ limit = 8 }: { limit?: number }) {
  const picks = await getTopPicks(limit);
  if (picks.length === 0) return null;

  return (
    <section aria-labelledby="top-picks-heading" className="section-y border-b border-hairline bg-offwhite">
      <div className="container-page reveal">
        <div className="mb-12 max-w-[65ch]">
          <p className="inline-flex items-center gap-2 bg-brand-red py-1.5 pl-4 pr-8 text-xs font-semibold uppercase tracking-[0.14em] text-white [clip-path:polygon(0_0,100%_0,calc(100%-12px)_50%,100%_100%,0_100%)]">
            <span className="h-1.5 w-1.5 rounded-full bg-white" aria-hidden="true" />
            Editors&apos; Choices
          </p>
          <h2 id="top-picks-heading" className="mt-5 text-h2 font-bold text-charcoal">
            Top picks from our most-read lists
          </h2>
          <p className="mt-4 text-body">
            Each is the #1 recommendation in its category roundup. Tap through for the full comparison.
          </p>
          <p className="mt-2 text-small text-body">
            We earn a commission from qualifying purchases at no extra cost to you.{' '}
            <Link
              href="/affiliate-disclaimer"
              className="font-medium text-brand-red underline decoration-brand-red/30 underline-offset-4 transition-colors hover:decoration-brand-red focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-red/40"
            >
              Affiliate disclaimer
            </Link>
          </p>
        </div>

        <ul className="-mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-4 sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-5 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-4">
          {picks.map((pick) => (
            <li key={pick.id} className="w-[80%] shrink-0 snap-start sm:w-auto">
              <ProductCard pick={pick} />
            </li>
          ))}
        </ul>

        <div className="mt-10 flex justify-center">
          <Link
            href="/products"
            className="btn btn-primary"
          >
            View all products
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
