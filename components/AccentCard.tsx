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
}: AccentCardProps) {
  const safeName = String(productName || 'Product').trim();
  const safeAwardLabel = String(awardLabel || 'Top Pick').trim().toUpperCase();
  const safeScore = Number.isFinite(Number(score)) ? Number(score) : 9.5;
  const safeStars = Math.max(0, Math.min(5, Math.round(Number.isFinite(Number(stars)) ? Number(stars) : 5)));
  const href = String(affiliateUrl || '#').trim() || '#';
  const isExternal = /^https?:\/\//i.test(href);

  return (
    <div
      id={jumpTargetId}
      className="my-8 mx-auto w-full max-w-[268px] overflow-hidden rounded-[16px] border-[4px] border-dashed border-[#d40000] bg-[#ffffff] md:my-10 scroll-mt-24"
    >
      <div className="flex min-h-[168px] items-center justify-center border-b border-[#dfdfdf] bg-[#ffffff] px-4 py-4">
        <div className="relative w-full max-w-[190px]">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={safeName}
              width={190}
              height={160}
              className="mx-auto max-h-[160px] w-auto object-contain"
            />
          ) : (
            <div className="flex h-[160px] items-center justify-center">
              <ImageIcon size={38} className="text-[#9ca3af]" aria-hidden="true" />
            </div>
          )}
        </div>
      </div>

      <div className="bg-[#ffffff] px-3.5 py-3.5">
        <div className="mb-2">
          <span
            className="inline-flex rounded-[5px] border border-[#d40000] px-2.5 py-1 text-[10px] font-bold leading-none tracking-[0.06em] text-[#d40000]"
            style={{ fontFamily: 'Montserrat, "Segoe UI", Tahoma, Geneva, Verdana, sans-serif' }}
          >
            {safeAwardLabel}
          </span>
        </div>

        <div className="mb-3">
          <h3
            className="text-[14px] font-bold leading-[1.2] text-[#1f1f1f]"
            style={{ fontFamily: 'Montserrat, "Segoe UI", Tahoma, Geneva, Verdana, sans-serif' }}
          >
            {safeName}
          </h3>
        </div>

        <div className="mb-3 flex items-end justify-between gap-2">
          <div className="leading-none" style={{ fontFamily: 'Montserrat, "Segoe UI", Tahoma, Geneva, Verdana, sans-serif' }}>
            <span className="text-[42px] font-extrabold text-[#d40000]">{safeScore.toFixed(1)}</span>
            <span className="ml-1 text-[15px] font-semibold text-[#9a9a9a]">/10</span>
          </div>
          <div className="mb-[5px] text-[17px] leading-none" aria-label={`${safeStars} star rating`}>
            {Array.from({ length: 5 }, (_unused, index) => (
              <span key={`accent-star-${index}`} className={index < safeStars ? 'text-[#d40000]' : 'text-[#b9b9b9]'}>
                ★
              </span>
            ))}
          </div>
        </div>

        <a
          href={href}
          target={isExternal ? '_blank' : undefined}
          rel={isExternal ? 'noopener noreferrer sponsored' : undefined}
          className="inline-flex w-full items-center justify-center rounded-[14px] border border-[#b7b7b7] bg-[#f6f6f5] px-3.5 py-2.5 text-center text-[12px] font-extrabold leading-[1.15] tracking-[0.04em] text-[#1f1f1f] transition-colors hover:bg-[#efefee]"
          style={{ fontFamily: 'Montserrat, "Segoe UI", Tahoma, Geneva, Verdana, sans-serif' }}
        >
          <span>BUY ON AMAZON</span>
        </a>
      </div>
    </div>
  );
}
