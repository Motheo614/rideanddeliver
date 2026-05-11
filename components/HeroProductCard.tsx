import React from 'react';
import { Award } from 'lucide-react';

interface HeroProductMetric {
  label: string;
  score: number;
}

interface HeroProductRetailer {
  name: string;
  url: string;
}

interface HeroProductCardProps {
  productName: string;
  description: string;
  year: number | string;
  author: string;
  overallScore: number;
  metrics: HeroProductMetric[];
  specs: string[];
  pros: string[];
  cons: string[];
  editorNote: string;
  amazonUrl: string;
  reviewUrl: string;
  otherRetailers: HeroProductRetailer[];
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
  description,
  year,
  author,
  overallScore,
  metrics,
  specs,
  pros,
  cons,
  editorNote,
  amazonUrl,
  reviewUrl,
  otherRetailers,
  imageUrl,
}: HeroProductCardProps) {
  const displayedMetrics = metrics.slice(0, 3);

  return (
    <section className="w-full border-2 border-[#CC0000] rounded-[10px] bg-white overflow-hidden">
      <div className="bg-[#111111] px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <span className="inline-block bg-[#CC0000] text-white text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded">
          #1 Pick {year}
        </span>
        <span className="text-xs text-gray-400">Reviewed by {author}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2">
        <div className="p-6">
          <h2
            className="text-[#111111] text-[32px] leading-[1.1]"
            style={{ fontFamily: '"Barlow Condensed", system-ui, -apple-system, sans-serif', fontWeight: 900 }}
          >
            {productName}
          </h2>

          <p className="mt-3 text-[14px] leading-6 text-gray-600">{description}</p>

          <div className="mt-5 bg-[#f4f4f4] rounded-md p-4">
            <div className="grid grid-cols-[auto_1fr] gap-4 items-start">
              <div
                className="text-[#CC0000] text-[40px] leading-none"
                style={{ fontFamily: '"Barlow Condensed", system-ui, -apple-system, sans-serif', fontWeight: 900 }}
              >
                {formatOverallScore(overallScore)}
              </div>

              <div className="space-y-3 pt-1">
                {displayedMetrics.map((metric) => (
                  <div key={metric.label}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-semibold text-gray-600 uppercase tracking-wide">
                        {metric.label}
                      </span>
                      <span className="text-[11px] font-semibold text-gray-500">
                        {Math.max(0, Math.min(10, metric.score))}/10
                      </span>
                    </div>
                    <div className="w-full h-1 bg-[#e8e8e8] rounded-full overflow-hidden">
                      <div
                        className="h-1 bg-[#CC0000]"
                        style={{ width: `${toBarPercent(metric.score)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {specs.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-2">
              {specs.map((spec) => (
                <span
                  key={spec}
                  className="inline-flex items-center px-2.5 py-1 text-[11px] font-semibold text-gray-700 bg-gray-100 border border-gray-200 rounded"
                >
                  {spec}
                </span>
              ))}
            </div>
          )}

          <div className="mt-6 grid grid-cols-2 gap-3">
            <a
              href={amazonUrl}
              target={isExternalUrl(amazonUrl) ? '_blank' : undefined}
              rel={isExternalUrl(amazonUrl) ? 'noopener noreferrer sponsored' : undefined}
              className="inline-flex items-center justify-center bg-[#CC0000] text-white text-xs font-bold uppercase tracking-wide px-3 py-3 rounded hover:bg-red-700 transition-colors"
            >
              BUY ON AMAZON
            </a>
            <a
              href={reviewUrl}
              target={isExternalUrl(reviewUrl) ? '_blank' : undefined}
              rel={isExternalUrl(reviewUrl) ? 'noopener noreferrer' : undefined}
              className="inline-flex items-center justify-center border border-[#111111] text-[#111111] text-xs font-bold uppercase tracking-wide px-3 py-3 rounded hover:bg-gray-50 transition-colors"
            >
              READ FULL REVIEW
            </a>
          </div>

          {otherRetailers.length > 0 && (
            <p className="mt-3 text-xs text-gray-500">
              Also available at{' '}
              {otherRetailers.map((retailer, index) => (
                <React.Fragment key={`${retailer.name}-${retailer.url}`}>
                  <a
                    href={retailer.url}
                    target={isExternalUrl(retailer.url) ? '_blank' : undefined}
                    rel={isExternalUrl(retailer.url) ? 'noopener noreferrer sponsored' : undefined}
                    className="hover:text-gray-700 underline"
                  >
                    {retailer.name}
                  </a>
                  {index < otherRetailers.length - 1 ? ' · ' : ''}
                </React.Fragment>
              ))}
            </p>
          )}
        </div>

        <div className="p-6 border-t md:border-t-0 md:border-l border-gray-200">
          <div className="bg-[#f4f4f4] rounded-md min-h-[220px] flex items-center justify-center overflow-hidden">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={productName}
                className="max-h-[260px] w-auto object-contain"
              />
            ) : (
              <div className="text-sm text-gray-400">No image available</div>
            )}
          </div>

          <div className="mt-5 border border-gray-200 rounded-md overflow-hidden">
            <div className="bg-[#111111] text-white text-xs font-bold uppercase tracking-wide px-3 py-2">
              Quick Verdict
            </div>
            <div className="p-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="text-[11px] font-bold uppercase text-gray-600 mb-2">Pros</div>
                <ul className="space-y-1.5">
                  {pros.map((item) => (
                    <li key={item} className="text-[12px] text-gray-700 leading-5">
                      <span className="text-[#CC0000] font-bold mr-1">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <div className="text-[11px] font-bold uppercase text-gray-600 mb-2">Cons</div>
                <ul className="space-y-1.5">
                  {cons.map((item) => (
                    <li key={item} className="text-[12px] text-gray-700 leading-5">
                      <span className="text-gray-500 font-bold mr-1">✗</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-4 bg-[#fff8f8] border border-[#f5c0c0] rounded-md p-3">
            <div className="flex items-start gap-2">
              <Award size={16} className="text-[#CC0000] mt-0.5" />
              <p className="text-[12px] italic leading-5 text-[#7f1d1d]">{editorNote}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
