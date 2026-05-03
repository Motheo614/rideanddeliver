import { ShoppingCart, ExternalLink } from 'lucide-react';

interface ArticleBottomCtaProps {
  title: string;
  description: string;
  primaryHref: string;
  primaryLabel: string;
  secondaryHref?: string;
  secondaryLabel?: string;
}

export default function ArticleBottomCta({
  title,
  description,
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
}: ArticleBottomCtaProps) {
  return (
    <section className="mt-10 rounded-xl border border-amber-200 bg-gradient-to-r from-amber-50 to-white p-4 sm:p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0">
          <h3 className="text-xl font-extrabold text-gray-900 sm:text-2xl">{title}</h3>
          <p className="mt-1 text-sm text-gray-700 sm:text-base">{description}</p>
        </div>

        <div className="flex w-full flex-col gap-2 sm:flex-row sm:justify-end md:w-auto">
          <a
            href={primaryHref}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#CC0000] px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-[#AA0000]"
          >
            <ShoppingCart size={16} />
            {primaryLabel}
          </a>

          {secondaryHref && secondaryLabel && (
            <a
              href={secondaryHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-5 py-3 text-sm font-bold text-gray-800 transition-colors hover:bg-gray-50"
            >
              {secondaryLabel}
              <ExternalLink size={14} />
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
