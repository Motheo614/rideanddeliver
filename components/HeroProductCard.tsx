import React from 'react';
import { Check, ImageIcon, Minus } from 'lucide-react';

interface HeroProductMetric {
  label: string;
  score: number;
}

interface HeroProductCardProps {
  productName: string;
  year: number | string;
  awardLabel?: string;
  overallScore: number;
  stars: number;
  metrics: HeroProductMetric[];
  specs: string[];
  pros: string[];
  cons: string[];
  affiliateUrl: string;
  jumpTargetId?: string;
  imageUrl?: string;
}

const toBarPercent = (score: number) => {
  if (!Number.isFinite(score)) return 0;
  const normalized = score <= 10 ? score * 10 : score;
  return Math.max(0, Math.min(100, normalized));
};

const formatOverallScore = (score: number) => {
  if (!Number.isFinite(score)) return '0.0';
  const rounded = Math.round(score * 10) / 10;
  return Number.isInteger(rounded) ? `${rounded}.0` : String(rounded);
};

const isExternalUrl = (url: string) => /^https?:\/\//i.test(url);

export default function HeroProductCard({
  productName,
  year,
  awardLabel,
  overallScore,
  stars,
  metrics,
  specs,
  pros,
  cons,
  affiliateUrl,
  jumpTargetId,
  imageUrl,
}: HeroProductCardProps) {
  const displayedMetrics = metrics.slice(0, 6);
  const displayedSpecs = specs.slice(0, 10);
  const displayedPros = pros.slice(0, 5);
  const displayedCons = cons.slice(0, 5);
  const normalizedStars = Math.max(0, Math.min(5, Math.round(Number.isFinite(Number(stars)) ? Number(stars) : 5)));
  const safeAffiliateUrl = String(affiliateUrl || '#').trim() || '#';
  const safeAwardLabel = String(awardLabel || 'Best Overall').trim().toUpperCase();

  return (
    <section
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

          <div className="mb-[14px] flex items-center gap-[10px]">
            <span
              className="text-[30px] leading-none text-[#CC0000]"
              style={{ fontFamily: '"Barlow Condensed", system-ui, -apple-system, sans-serif', fontWeight: 900 }}
            >
              {formatOverallScore(overallScore)}
            </span>
            <div className="flex flex-col">
              <span className="text-[13px] leading-none text-[#CC0000]" aria-label={`${normalizedStars} star rating`}>
                {Array.from({ length: 5 }, (_unused, index) => (
                  <span key={`hero-star-${index}`} className={index < normalizedStars ? 'text-[#CC0000]' : 'text-[#d2d2d2]'}>
                    ★
                  </span>
                ))}
              </span>
              <span className="mt-1 text-[11px] text-[#888888]">Out of 10</span>
            </div>
          </div>

          <div className="mb-[14px] space-y-2 text-[12px]">
            {displayedMetrics.map((metric) => {
              const scoreValue = Math.max(0, Math.min(10, Number(metric.score) || 0));

              return (
                <div key={metric.label}>
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-[11px] uppercase tracking-[0.04em] text-[#888888]">
                      {metric.label}
                    </span>
                    <span className="font-bold text-[#111111]">{scoreValue.toFixed(1)}</span>
                  </div>
                  <div className="h-1 overflow-hidden rounded-[2px] bg-[#eeeeee]">
                    <div
                      className="h-1 rounded-[2px] bg-[#CC0000]"
                      style={{ width: `${toBarPercent(scoreValue)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

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
            <span aria-hidden="true" className="inline-flex h-[14px] w-[14px] items-center justify-center">
              <svg viewBox="0 0 24 24" width="14" height="14" role="img" aria-label="Amazon">
                <text x="8.5" y="12.5" fill="currentColor" fontSize="12" fontWeight="700" fontFamily="Arial, sans-serif">a</text>
                <path d="M4.5 16.8c3.3 2 7.1 2.1 10.8.2" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </span>
            <span>Buy on Amazon</span>
          </a>
        </div>

        <div className="self-stretch border-l border-[#e2e2e2] bg-white">
          <div className="relative h-full w-full overflow-hidden">
            {imageUrl ? (
              <img
                src={imageUrl}
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

      <div className="border-t border-[#e2e2e2] px-5 py-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="mb-2 text-[10px] font-extrabold uppercase text-[#CC0000]">Pros</div>
            <ul className="flex flex-col gap-[5px]">
              {displayedPros.map((item) => (
                <li key={`pro-${item}`} className="flex items-start gap-[5px] text-[12px] text-[#444444]">
                  <Check size={12} className="mt-[2px] shrink-0 text-[#CC0000]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="mb-2 text-[10px] font-extrabold uppercase text-[#888888]">Cons</div>
            <ul className="flex flex-col gap-[5px]">
              {displayedCons.map((item) => (
                <li key={`con-${item}`} className="flex items-start gap-[5px] text-[12px] text-[#888888]">
                  <Minus size={12} className="mt-[2px] shrink-0 text-[#888888]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
