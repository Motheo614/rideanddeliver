import React from 'react';
import Link from 'next/link';
import { Clock, ArrowRight, BookOpenCheck } from 'lucide-react';
import type { Post } from '@/lib/types';
import { formatDateAbsolute } from '@/lib/utils';
import { formatReadTime, getPostHref } from '@/lib/postDisplay';

export default function FeaturedGuideSpotlight({ post }: { post: Post }) {
  return (
    <section aria-labelledby="spotlight-heading" className="section-y border-b border-hairline bg-white">
      <div className="container-page reveal">
        <article className="grid overflow-hidden rounded-2xl border border-hairline bg-white shadow-sm lg:min-h-[360px] lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
          <div className="flex flex-col justify-between gap-8 bg-charcoal p-8 text-white md:p-10">
            <div>
              <BookOpenCheck className="h-8 w-8 text-brand-red-light" aria-hidden="true" />
              <p className="mt-4 text-xs font-bold uppercase tracking-widest text-brand-red-light">
                Featured Guide
              </p>
              <p className="mt-4 inline-block rounded-full bg-brand-red px-3 py-1 text-xs font-bold uppercase tracking-widest text-white">
                {post.category}
              </p>
            </div>
            <dl className="space-y-2 text-sm text-gray-300">
              <div>
                <dt className="sr-only">Published</dt>
                <dd>{formatDateAbsolute(post.publishedAt)}</dd>
              </div>
              <div>
                <dt className="sr-only">Read time</dt>
                <dd className="inline-flex items-center gap-1.5">
                  <Clock className="h-4 w-4" aria-hidden="true" />
                  {formatReadTime(post.readTime)}
                </dd>
              </div>
            </dl>
          </div>

          <div className="flex flex-col justify-center p-8 md:p-12">
            <h2 id="spotlight-heading" className="text-h2 font-bold text-charcoal">
              {post.title}
            </h2>
            <p className="mt-4 line-clamp-4 text-base leading-relaxed text-body md:text-lg">{post.excerpt}</p>
            <div className="mt-8">
              <Link
                href={getPostHref(post)}
                className="btn btn-primary"
              >
                Read Full In-Depth Review
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}
