import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Post } from '@/lib/types';
import { formatDate } from '@/lib/utils';

interface HeroBannerProps {
  post: Post;
}

export default function HeroBanner({ post }: HeroBannerProps) {
  return (
    <section className="relative w-full h-[320px] md:h-[500px] overflow-hidden">
      {post.featuredImage && (typeof post.featuredImage === 'string' ? post.featuredImage : (post.featuredImage as any).url) ? (
        <Image
          src={typeof post.featuredImage === 'string' ? post.featuredImage : (post.featuredImage as any).url}
          alt={post.title}
          fill
          priority
          className="object-cover"
          referrerPolicy="no-referrer"
        />
      ) : (
        <div className="w-full h-full bg-gray-800" />
      )}
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent"></div>
      
      <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-12 lg:p-20 max-w-4xl">
        <div className="flex items-center gap-3 mb-4">
          <span className="bg-white text-black text-[10px] md:text-xs font-bold uppercase px-3 py-1 rounded-full">
            {post.category}
          </span>
          <span className="text-gray-300 text-[10px] md:text-xs">
            {formatDate(post.publishedAt)}
          </span>
        </div>

        <h1 className="text-2xl md:text-5xl font-black text-white mb-4 leading-tight">
          {post.title}
        </h1>

        <p className="text-white/90 text-sm md:text-lg font-medium mb-8 line-clamp-2 max-w-2xl">
          {post.excerpt}
        </p>

        <div className="flex items-center gap-6">
          <Link
            href={`/${post.dbCategorySlug}/${post.slug}`}
            className="border-2 border-white text-white px-8 py-3 font-bold uppercase tracking-wider hover:bg-white hover:text-black transition-all duration-300"
          >
            Read Review
          </Link>
          <span className="text-gray-300 text-xs md:text-sm font-medium">
            {post.readTime}
          </span>
        </div>
      </div>
    </section>
  );
}
