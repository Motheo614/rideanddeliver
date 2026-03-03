import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getLatestPosts } from '@/lib/posts';

export default async function LatestGuidesWidget() {
  const latestPosts = await getLatestPosts(3);

  return (
    <div className="bg-white border border-gray-100 p-8 rounded-xl shadow-sm">
      <h3 className="text-xl font-bold text-[#1a1a1a] mb-6">Latest Guides</h3>
      
      <div className="flex flex-col gap-6">
        {latestPosts.map((post) => (
          <Link key={post.slug} href={`/blog/${post.slug}/`} className="group flex gap-4">
            <div className="relative w-20 h-20 flex-shrink-0 rounded overflow-hidden">
              {post.featuredImage && (typeof post.featuredImage === 'string' ? post.featuredImage : (post.featuredImage as any).url) ? (
                <Image
                  src={typeof post.featuredImage === 'string' ? post.featuredImage : (post.featuredImage as any).url}
                  alt={post.title}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-300"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-400 text-xs">No Image</span>
                </div>
              )}
            </div>
            <div className="flex flex-col justify-center">
              <h4 className="text-sm font-bold text-[#1a1a1a] group-hover:text-[#CC0000] transition-colors line-clamp-2 leading-snug mb-1">
                {post.title}
              </h4>
              <span className="text-[10px] text-gray-400 font-medium uppercase">
                {post.readTime}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
