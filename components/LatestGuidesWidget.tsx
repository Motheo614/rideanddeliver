import React from 'react';
import Link from 'next/link';
import { getLatestPosts } from '@/lib/posts';
import { formatReadTime, getPostHref } from '@/lib/postDisplay';

export default async function LatestGuidesWidget() {
  const latestPosts = await getLatestPosts(4);
  if (latestPosts.length === 0) return null;

  return (
    <section
      aria-labelledby="latest-guides-heading"
      className="rounded-2xl border border-hairline bg-white p-6 shadow-xs"
    >
      <h3 id="latest-guides-heading" className="mb-2 text-h4 font-semibold text-charcoal">
        Latest Guides
      </h3>
      <ol className="divide-y divide-hairline">
        {latestPosts.map((post, i) => (
          <li key={post.slug}>
            <Link
              href={getPostHref(post)}
              className="group flex gap-3 rounded-lg py-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-red/40"
            >
              <span
                aria-hidden="true"
                className="w-5 shrink-0 pt-0.5 font-display text-sm font-semibold tabular-nums text-brand-red"
              >
                {String(i + 1).padStart(2, '0')}
              </span>
              <span className="min-w-0">
                <span className="block text-small font-medium leading-snug text-charcoal transition-colors duration-200 group-hover:text-brand-red">
                  {post.title}
                </span>
                <span className="mt-1 block text-xs text-body">
                  {post.category} · {formatReadTime(post.readTime)}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}
