import React from 'react';
import Image from '@/components/CloudinaryImage';
import { ImageIcon } from 'lucide-react';
import { buildAffiliateRedirectUrl } from '@/lib/affiliate/tracking';

interface AccentCardProps {
  jumpTargetId?: string;
  productName?: string;
  brand?: string;
  description?: string;
  awardLabel?: string;
  imageUrl?: string;
  affiliateUrl?: string;
  specs?: string[];
  asin?: string;
  sourcePage?: string;
  // priceText removed — no live-price pipeline approved. Do not re-add.
}

export default function AccentCard({
  jumpTargetId,
  productName,
  brand,
  description,
  awardLabel,
  imageUrl,
  affiliateUrl,
  asin,
  sourcePage = '',
}: AccentCardProps) {
  const safeName = String(productName || 'Product').trim();
  const safeAwardLabel = String(awardLabel || 'Top Pick').trim().toUpperCase();
  const rawHref = String(affiliateUrl || '#').trim() || '#';
  const href = buildAffiliateRedirectUrl(safeName, asin, sourcePage, rawHref);
  const isExternal = /^https?:\/\//i.test(href);

  return (
    <div
      data-product-card="true"
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

        {brand && <p className="mb-2 text-xs text-gray-600">Brand: {brand}</p>}

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
