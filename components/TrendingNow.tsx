import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import SectionHeading from './SectionHeading';
import { getTrendingPosts } from '@/lib/posts';

function formatReadTime(readTime: unknown): string {
  const raw = String(readTime ?? '').trim();
  if (!raw) return '5 MIN READ';
  if (/min\s+read/i.test(raw)) return raw.toUpperCase();

  const minutes = raw.match(/\d+/)?.[0];
  return minutes ? `${minutes} MIN READ` : raw.toUpperCase();
}

export default async function TrendingNow() {
  const trendingPosts = await getTrendingPosts();

  if (trendingPosts.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <SectionHeading title="Trending Now" />
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {trendingPosts.map((post) => (
            <Link key={post.slug} href={`/${post.dbCategorySlug}/${post.slug}`} className="group flex flex-col bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="relative aspect-[4/3] overflow-hidden">
                {post.featuredImage && (typeof post.featuredImage === 'string' ? post.featuredImage : (post.featuredImage as any).url) ? (
                  <Image
                    src={typeof post.featuredImage === 'string' ? post.featuredImage : (post.featuredImage as any).url}
                    alt={post.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-400 text-sm">No Image</span>
                  </div>
                )}
              </div>
              <div className="p-4 flex flex-col gap-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#CC0000]">
                  {post.category}
                </span>
                <h3 className="text-sm md:text-base font-bold text-[#1a1a1a] line-clamp-2 leading-tight group-hover:text-[#CC0000] transition-colors">
                  {post.title}
                </h3>
                <span className="text-[10px] text-gray-400 font-medium">
                  {formatReadTime(post.readTime)}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
