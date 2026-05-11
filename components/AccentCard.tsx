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
  const safeAwardLabel = String(awardLabel || 'Top Pick').trim();
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
      className="my-8 overflow-hidden rounded-[10px] border border-[#e2e2e2] bg-white md:my-10 scroll-mt-24"
    >
      <div className="flex w-full items-center justify-between bg-[#111111] px-4 py-2">
        <span className="text-[10px] font-extrabold uppercase tracking-[0.08em] text-[#999999]">
          {safeAwardLabel}
        </span>

        <div className="flex items-center gap-2">
          <span className="text-[12px] leading-none text-[#CC0000]" aria-label={`${safeStars} star rating`}>
            {Array.from({ length: 5 }, (_unused, index) => (
              <span key={`accent-star-${index}`} className={index < safeStars ? 'text-[#CC0000]' : 'text-[#5a5a5a]'}>
                ★
              </span>
            ))}
          </span>
          <span className="text-white" style={{ fontFamily: '"Barlow Condensed", system-ui, -apple-system, sans-serif' }}>
            <span className="text-[15px] font-extrabold">{safeScore.toFixed(1)}</span>
            <span className="ml-0.5 text-[11px] text-[#888888]">/10</span>
          </span>
        </div>
      </div>

      <div className="flex">
        <div className="flex h-[138px] w-[120px] shrink-0 items-center justify-center bg-[#f5f5f5] px-2">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={safeName}
              width={96}
              height={96}
              className="max-h-[110px] w-auto object-contain"
            />
          ) : (
            <ImageIcon size={24} className="text-[#9ca3af]" aria-hidden="true" />
          )}
        </div>

        <div className="flex-1 p-4">
          <h3
            className="mb-2 text-[21px] font-extrabold leading-tight text-[#111111]"
            style={{ fontFamily: '"Barlow Condensed", system-ui, -apple-system, sans-serif' }}
          >
            {safeName}
          </h3>

          {safeSpecs.length > 0 && (
            <div className="mb-[14px] flex flex-wrap gap-2">
              {safeSpecs.map((spec) => (
                <span
                  key={`${safeName}-${spec}`}
                  className="rounded-[4px] border border-[#e2e2e2] bg-[#f5f5f5] px-[9px] py-[3px] text-[11px] font-semibold text-[#555555]"
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
            className="inline-flex w-full items-center justify-center gap-2 rounded-[4px] bg-[#CC0000] px-5 py-[10px] text-[12px] font-extrabold uppercase tracking-[0.09em] text-white transition-colors hover:bg-red-700"
            style={{ fontFamily: '"Barlow Condensed", system-ui, -apple-system, sans-serif' }}
          >
            <span aria-hidden="true" className="inline-flex h-[14px] w-[14px] items-center justify-center">
              <svg viewBox="0 0 24 24" width="14" height="14" role="img" aria-label="Amazon">
                <text x="8.5" y="12.5" fill="currentColor" fontSize="12" fontWeight="700" fontFamily="Arial, sans-serif">a</text>
                <path d="M4.5 16.8c3.3 2 7.1 2.1 10.8.2" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </span>
            <span>Check Price on Amazon</span>
          </a>

          <p className="mt-2 text-[10px] text-[#888888]">
            As an Amazon Associate I earn from qualifying purchases.
          </p>
        </div>
      </div>
    </div>
  );
}
