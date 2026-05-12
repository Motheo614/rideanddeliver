import React from 'react';
import Image from 'next/image';
import { ImageIcon } from 'lucide-react';

interface AccentCardProps {
  jumpTargetId?: string;
  productName?: string;
  awardLabel?: string;
  score?: number;
  stars?: number;
  imageUrl?: string;
  affiliateUrl?: string;
  specs?: string[];
  priceText?: string;
}

export default function AccentCard({
  jumpTargetId,
  productName,
  awardLabel,
  score,
  stars,
  imageUrl,
  affiliateUrl,
  specs,
}: AccentCardProps) {
  const safeName = String(productName || 'Product').trim();
  const safeAwardLabel = String(awardLabel || 'Top Pick').trim().toUpperCase();
  const safeScore = Number.isFinite(Number(score)) ? Number(score) : 9.5;
  const safeStars = Math.max(0, Math.min(5, Math.round(Number.isFinite(Number(stars)) ? Number(stars) : 5)));
  const safeSpecs = (Array.isArray(specs) ? specs : [])
    .map((item) => String(item || '').trim())
    .filter(Boolean);
  const href = String(affiliateUrl || '#').trim() || '#';
  const isExternal = /^https?:\/\//i.test(href);

  return (
    <div
      id={jumpTargetId}
      className="my-8 mx-auto w-full max-w-[272px] overflow-hidden rounded-[14px] border border-[#cfcfcf] border-t-4 border-t-[#d62525] bg-[#f6f5f2] md:my-10 scroll-mt-24"
    >
      <div className="w-full bg-[#0c0d10] px-4 py-3">
        <span className="block text-[14px] leading-[1.15] font-extrabold uppercase tracking-[0.01em] text-[#f0f0ef]" style={{ fontFamily: 'Montserrat, "Segoe UI", Tahoma, Geneva, Verdana, sans-serif' }}>
          {safeAwardLabel}
        </span>
      </div>

      <div className="flex min-h-[205px] items-center justify-center bg-[#ffffff] px-5 py-5">
        <div className="relative w-full max-w-[240px]">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={safeName}
              width={240}
              height={180}
              className="mx-auto max-h-[180px] w-auto object-contain"
            />
          ) : (
            <div className="flex h-[180px] items-center justify-center">
              <ImageIcon size={44} className="text-[#9ca3af]" aria-hidden="true" />
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-[#d0d0d0] bg-[#e2e1dc] px-4 py-4">
        <div className="mb-2">
          <h3
            className="text-[17px] font-bold leading-[1.2] text-[#1e1e1d]"
            style={{ fontFamily: 'Montserrat, "Segoe UI", Tahoma, Geneva, Verdana, sans-serif' }}
          >
            {safeName}
          </h3>
        </div>

        <div className="mb-2 flex items-end justify-between gap-2">
          <div className="leading-none" style={{ fontFamily: 'Montserrat, "Segoe UI", Tahoma, Geneva, Verdana, sans-serif' }}>
            <span className="text-[41px] font-extrabold text-[#d62525]">{safeScore.toFixed(1)}</span>
            <span className="ml-1 text-[20px] font-medium text-[#444444]">/10</span>
          </div>
          <div className="mb-[6px] text-[17px] leading-none text-[#d62525]" aria-label={`${safeStars} star rating`}>
            {Array.from({ length: 5 }, (_unused, index) => (
              <span key={`accent-star-${index}`} className={index < safeStars ? 'text-[#d62525]' : 'text-[#a7a7a5]'}>
                ★
              </span>
            ))}
          </div>
        </div>

        {safeSpecs.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {safeSpecs.map((spec) => (
              <span
                key={`${safeName}-${spec}`}
                className="rounded-[6px] border border-[#c9c9c7] bg-[#ecebe6] px-2.5 py-1 text-[11px] font-semibold text-[#575757]"
              >
                {spec}
              </span>
            ))}
          </div>
        )}

        <a
          href={href}
          target={isExternal ? '_blank' : undefined}
          rel={isExternal ? 'noopener noreferrer sponsored' : undefined}
          className="inline-flex w-full items-center justify-center gap-3 rounded-[14px] border border-[#CC0000] bg-[#CC0000] px-4 py-3 text-center text-[14px] font-bold leading-[1.15] text-[#ffffff] transition-colors hover:bg-[#a80000]"
          style={{ fontFamily: 'Montserrat, "Segoe UI", Tahoma, Geneva, Verdana, sans-serif' }}
        >
          <span aria-hidden="true" className="text-[18px] leading-none">↪</span>
          <span>Check Price on Amazon</span>
        </a>
      </div>
    </div>
  );
}
