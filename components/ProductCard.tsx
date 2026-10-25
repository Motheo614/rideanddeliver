import React from 'react';
import Link from 'next/link';
import Image from '@/components/CloudinaryImage';
import { Award, Check, ShoppingCart, ArrowRight } from 'lucide-react';
import type { TopPick } from '@/lib/products';

const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#1a1a1a]';

export default function ProductCard({ pick }: { pick: TopPick }) {
  const displayName = pick.brand ? `${pick.brand} ${pick.name}`.trim() : pick.name;
  // Avoid "Brand Brand Product" when the product name already starts with the brand.
  const title = pick.brand && pick.name.toLowerCase().startsWith(pick.brand.toLowerCase()) ? pick.name : displayName;
  const features = pick.features.slice(0, 2);

  return (
    <article
      className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-white/10 bg-[linear-gradient(180deg,#252525,#1a1a1a)] shadow-[0_20px_40px_-24px_rgba(0,0,0,0.55)] transition duration-300 ease-out hover:-translate-y-[3px] hover:border-white/20 hover:shadow-[0_28px_52px_-24px_rgba(0,0,0,0.7)] motion-reduce:transform-none motion-reduce:transition-none"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(260px_160px_at_50%_0%,rgba(204,0,0,0.22),transparent_80%)]"
      />

      <div className="relative m-2.5 mb-0 aspect-[4/3] rounded-2xl bg-[radial-gradient(circle_at_50%_40%,#ffffff,#eceef2)]">
        <div className="absolute inset-0 overflow-hidden rounded-2xl">
          <Image
            src={pick.imageUrl}
            alt={`${title} product photo`}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 80vw"
            className="object-contain p-6 mix-blend-multiply transition-transform duration-300 ease-out group-hover:scale-[1.07] motion-reduce:transform-none motion-reduce:transition-none"
            referrerPolicy="no-referrer"
          />
        </div>
        <Link
          href={pick.roundupHref}
          className={`absolute left-3 top-3 z-10 inline-flex h-[26px] items-center rounded-full bg-charcoal px-2.5 text-xs font-medium text-white transition-colors duration-200 hover:bg-brand-red ${focusRing}`}
        >
          {pick.roundupLabel}
        </Link>
      </div>

      <div className="relative flex flex-1 flex-col px-[22px] pb-[22px] pt-5">
        <div className="flex items-center gap-2.5">
          <span
            title={pick.badgeDetail}
            className="inline-flex h-[26px] shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border border-[rgba(255,120,120,0.28)] bg-[rgba(204,0,0,0.22)] px-2.5 text-xs font-semibold text-[#ffb3b3]"
          >
            <Award size={13} strokeWidth={1.5} aria-hidden="true" />
            {pick.badge}
          </span>
          {pick.brand && <span className="min-w-0 truncate text-[13px] text-white/60">{pick.brand}</span>}
        </div>

        <h3 className="mt-3.5 line-clamp-2 min-h-[48px] font-display text-lg font-bold leading-snug tracking-tight text-white">
          {pick.name}
        </h3>

        <ul className="mt-4 flex min-h-[100px] flex-col gap-2">
          {features.map((feature) => (
            <li key={feature} className="flex gap-2 text-[13.5px] leading-normal text-white/75">
              <Check size={15} strokeWidth={1.5} className="mt-[3px] flex-none text-[#ff6b6b]" aria-hidden="true" />
              <span className="line-clamp-2">{feature}</span>
            </li>
          ))}
        </ul>

        <div className="mt-auto flex flex-col gap-2 pt-[18px]">
          <a
            href={pick.amazonHref}
            target="_blank"
            rel="sponsored nofollow noopener noreferrer"
            aria-label={`View ${title} on Amazon`}
            className={`flex h-11 items-center justify-center gap-2 rounded-xl border border-[#d9901a] bg-gradient-to-b from-[#f9b83e] to-[#f0a020] text-[14.5px] font-semibold text-charcoal shadow-[inset_0_1px_0_rgba(255,255,255,0.5)] transition-colors duration-200 hover:from-[#f5ac2a] hover:to-[#e89412] ${focusRing}`}
          >
            <ShoppingCart size={18} strokeWidth={1.5} aria-hidden="true" />
            View on Amazon
          </a>
          {pick.reviewHref && (
            <Link
              href={pick.reviewHref}
              aria-label={`See details for ${title}`}
              className={`group/link inline-flex h-9 items-center justify-center gap-1.5 rounded-lg text-sm font-semibold text-white/90 transition-colors duration-200 hover:text-white ${focusRing}`}
            >
              See details
              <ArrowRight
                size={15}
                strokeWidth={1.5}
                className="transition-transform duration-200 ease-out group-hover/link:translate-x-[3px] motion-reduce:transform-none"
                aria-hidden="true"
              />
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
