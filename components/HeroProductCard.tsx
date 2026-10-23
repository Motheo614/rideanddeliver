import React from 'react';
import { Check, ImageIcon, Minus } from 'lucide-react';
import { getCloudinaryImageUrl } from '@/lib/utils';
import { buildAffiliateRedirectUrl } from '@/lib/affiliate/tracking';

interface HeroProductCardProps {
  productName: string;
  brand?: string;
  description?: string;
  year: number | string;
  awardLabel?: string;
  specs: string[];
  pros: string[];
  cons: string[];
  affiliateUrl: string;
  asin?: string;
  sourcePage?: string;
  jumpTargetId?: string;
  imageUrl?: string;
  // priceText removed — no live-price pipeline approved. Do not re-add.
}

const isExternalUrl = (url: string) => /^https?:\/\//i.test(url);

export default function HeroProductCard({
  productName,
  brand,
  description,
  year,
  awardLabel,
  specs,
  pros,
  cons,
  affiliateUrl,
  asin,
  sourcePage = '',
  jumpTargetId,
  imageUrl,
}: HeroProductCardProps) {
  const displayedSpecs = specs.slice(0, 10);
  const displayedPros = pros.slice(0, 5);
  const displayedCons = cons.slice(0, 5);
  const rawAffiliateUrl = String(affiliateUrl || '#').trim() || '#';
  const safeAffiliateUrl = buildAffiliateRedirectUrl(productName, asin, sourcePage, rawAffiliateUrl);
  const safeAwardLabel = String(awardLabel || 'Best Overall').trim().toUpperCase();

  return (
    <section
      data-product-card="true"
      id={jumpTargetId}
      className="w-full overflow-hidden rounded-[10px] border-2 border-[#CC0000] bg-white"
    >
      <div className="flex items-center justify-between bg-[#111111] px-[18px] py-[9px]">
        <div className="flex items-center gap-2">
          <span className="text-[11px] uppercase text-[#666666]">{safeAwardLabel}</span>
        </div>
      </div>

      <div className="grid" style={{ gridTemplateColumns: '1fr 200px' }}>
        <div className="p-5">
          <h2
            className="mb-2 text-[26px] leading-[1.1] text-[#111111]"
            style={{ fontFamily: '"Barlow Condensed", system-ui, -apple-system, sans-serif', fontWeight: 900 }}
          >
            {productName}
          </h2>
          {brand && <p className="mb-2 text-sm text-gray-600">Brand: {brand}</p>}

          {displayedSpecs.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-[6px]">
              {displayedSpecs.map((spec) => (
                <span
                  key={spec}
                  className="rounded-[4px] border border-[#e2e2e2] bg-[#f5f5f5] px-[9px] py-[3px] text-[11px] font-semibold text-[#555555]"
                >
                  {spec}
                </span>
              ))}
            </div>
          )}

          <a
            href={safeAffiliateUrl}
            target={isExternalUrl(safeAffiliateUrl) ? '_blank' : undefined}
            rel={isExternalUrl(safeAffiliateUrl) ? 'noopener noreferrer sponsored' : undefined}
            className="inline-flex w-full items-center justify-center gap-2 rounded-[4px] bg-[#CC0000] px-6 py-3 text-[13px] font-extrabold uppercase text-white transition-colors hover:bg-red-700"
            style={{ fontFamily: '"Barlow Condensed", system-ui, -apple-system, sans-serif' }}
          >
            <span>Buy on Amazon</span>
          </a>
        </div>

        <div className="self-stretch border-l border-[#e2e2e2] bg-white">
          <div className="relative h-full w-full overflow-hidden">
            {imageUrl ? (
              <img
                src={getCloudinaryImageUrl(imageUrl)}
                alt={productName}
                className="absolute inset-0 block h-full w-full box-border object-contain object-center p-4"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <ImageIcon size={80} className="text-[#b8b8b8]" aria-hidden="true" />
              </div>
            )}
          </div>
        </div>
      </div>

      {(displayedPros.length > 0 || displayedCons.length > 0) && (
        <div className="border-t border-[#e2e2e2] px-5 py-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {displayedPros.length > 0 && <div>
            <div className="mb-2 text-[10px] font-extrabold uppercase text-[#CC0000]">Pros</div>
            <ul className="flex flex-col gap-[5px]">
              {displayedPros.map((item) => (
                <li key={`pro-${item}`} className="flex items-start gap-[5px] text-[12px] text-[#444444]">
                  <Check size={12} className="mt-[2px] shrink-0 text-[#CC0000]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>}

          {displayedCons.length > 0 && <div>
            <div className="mb-2 text-[10px] font-extrabold uppercase text-[#888888]">Cons</div>
            <ul className="flex flex-col gap-[5px]">
              {displayedCons.map((item) => (
                <li key={`con-${item}`} className="flex items-start gap-[5px] text-[12px] text-[#888888]">
                  <Minus size={12} className="mt-[2px] shrink-0 text-[#888888]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>}
        </div>
        </div>
      )}
    </section>
  );
}
