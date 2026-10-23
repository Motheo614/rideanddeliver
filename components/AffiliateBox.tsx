import React from 'react';
import Image from '@/components/CloudinaryImage';
import { buildAffiliateRedirectUrl } from '@/lib/affiliate/tracking';

interface AffiliateBoxProps {
  productName?: string;
  affiliateUrl?: string;
  image?: string;
  awardLabel?: string;
  score?: number;
  stars?: number;
  // Backward-compatible aliases for existing usages.
  name?: string;
  url?: string;
  asin?: string;
  sourcePage?: string;
}

export default function AffiliateBox({
  productName,
  affiliateUrl,
  image,
  awardLabel,
  name,
  url,
  asin,
  sourcePage = '',
}: AffiliateBoxProps) {
  const resolvedName = (productName || name || '').trim();
  const rawUrl = (affiliateUrl || url || '').trim();
  const resolvedUrl = buildAffiliateRedirectUrl(resolvedName, asin, sourcePage, rawUrl);
  const isExternal = /^https?:\/\//i.test(resolvedUrl);
  const hasMetaLayout = Boolean(awardLabel || image);

  if (!hasMetaLayout) {
    return (
      <div className="my-12 p-8 bg-gray-50 border border-gray-200 rounded-2xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-[#1a1a1a] mb-2">{resolvedName}</h3>
          </div>

          <a
            href={resolvedUrl}
            target={isExternal ? '_blank' : undefined}
            rel={isExternal ? 'noopener noreferrer nofollow sponsored' : undefined}
            className="bg-[#CC0000] text-white px-8 py-4 rounded-lg font-bold uppercase tracking-wider hover:bg-red-700 transition-all shadow-lg shadow-red-900/20 text-center whitespace-nowrap"
          >
            Check Price on Amazon -&gt;
          </a>
        </div>

        <p className="mt-6 text-[10px] text-gray-400 italic text-center">
          As an Amazon Associate I earn from qualifying purchases.
        </p>
      </div>
    );
  }

  return (
    <div className="my-10 bg-white border border-[#e2e2e2] border-l-[5px] border-l-[#CC0000] rounded-r-lg overflow-hidden">
      <div className="px-5 py-5 sm:px-6 sm:py-6">
        <div className="inline-block bg-[#CC0000] text-white text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded">
          {awardLabel}
        </div>

        <div className="mt-4 bg-[#f4f4f4] rounded-md h-40 flex items-center justify-center p-3">
          {image ? (
            <Image
              src={image}
              alt={resolvedName}
              width={320}
              height={160}
              className="max-h-40 w-auto object-contain"
            />
          ) : (
            <span className="text-sm text-gray-400">No image available</span>
          )}
        </div>

        <h3
          className="mt-4 text-[20px] leading-tight text-[#111111] underline"
          style={{ fontFamily: '"Barlow Condensed", system-ui, -apple-system, sans-serif', fontWeight: 800 }}
        >
          {resolvedName}
        </h3>

        <a
          href={resolvedUrl}
          target={isExternal ? '_blank' : undefined}
          rel={isExternal ? 'noopener noreferrer nofollow sponsored' : undefined}
          className="mt-4 block w-full text-center bg-[#CC0000] text-white rounded-md py-3.5 uppercase hover:bg-red-700 transition-colors"
          style={{ fontFamily: '"Barlow Condensed", system-ui, -apple-system, sans-serif', fontWeight: 800, letterSpacing: '0.03em' }}
        >
          BUY OPTIONS ▾
        </a>

        <a
          href="#top"
          className="mt-2 block text-center text-xs text-gray-500 hover:text-gray-700 transition-colors"
        >
          Jump to review ↓
        </a>
      </div>
    </div>
  );
}
