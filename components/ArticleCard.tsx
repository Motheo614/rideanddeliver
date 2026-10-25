import React from 'react';
import Link from 'next/link';
import { ArrowRight, Clock } from 'lucide-react';
import type { Post } from '@/lib/types';
import { formatDateAbsolute } from '@/lib/utils';
import { formatReadTime, getPostHref } from '@/lib/postDisplay';

export default function ArticleCard({ post }: { post: Post }) {
  return (
    <article className="group relative mb-4 overflow-hidden rounded-2xl border border-hairline bg-white p-6 shadow-xs transition-all duration-200 ease-out last:mb-0 hover:border-black/10 hover:shadow-md focus-within:shadow-md md:p-8">
      <span
        aria-hidden="true"
        className="absolute inset-y-0 left-0 w-[3px] bg-brand-red opacity-0 transition-opacity duration-200 ease-out group-hover:opacity-100 group-focus-within:opacity-100"
      />
      <p className="eyebrow">{post.category}</p>
      <h3 className="mt-3 text-[1.25rem] font-semibold leading-snug text-charcoal md:text-[1.375rem]">
        {post.title}
      </h3>
      <p className="mt-3 line-clamp-2 text-body text-body">{post.excerpt}</p>
      <div className="mt-5 flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
        <p className="flex flex-wrap items-center gap-x-3 text-[13px] text-body">
          <time dateTime={new Date(post.publishedAt).toISOString()}>{formatDateAbsolute(post.publishedAt)}</time>
          <span aria-hidden="true" className="h-3 w-px bg-black/15" />
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
            {formatReadTime(post.readTime)}
          </span>
        </p>
        <Link
          href={getPostHref(post)}
          className="inline-flex items-center gap-1.5 rounded-sm text-small font-medium text-brand-red after:absolute after:inset-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-red/40"
        >
          Read Buying Guide
          <span className="sr-only">: {post.title}</span>
          <ArrowRight className="h-4 w-4 transition-transform duration-200 ease-out group-hover:translate-x-1" strokeWidth={1.5} aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}
